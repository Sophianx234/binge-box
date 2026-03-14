import { View, Text, Image, ScrollView, ActivityIndicator, Pressable, useWindowDimensions, Modal, Alert, TextInput } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { fetchMovieDetails, saveMovie, toggleFavorite, rateMovie, markAsDownloaded, getMyLibrary, getFavoriteMovies, fetchSimilar } from '@/api/services';
import { Ionicons } from '@expo/vector-icons';
import { useMovieStore, useAuthStore } from '@/store/store'; 
import YoutubePlayer from 'react-native-youtube-iframe';
import Svg, { Circle } from 'react-native-svg';

const DownloadProgressRing = ({ progress, status }: { progress: number, status: string }) => {
  const radius = 14;
  const strokeWidth = 2.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const color = status === 'paused' ? '#8899B6' : '#00E5FF';

  return (
    <View className="relative items-center justify-center w-10 h-10">
      <Svg height="40" width="40" viewBox="0 0 40 40" style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx="20" cy="20" r={radius} stroke="#1A2235" strokeWidth={strokeWidth} fill="transparent" />
        <Circle 
          cx="20" cy="20" r={radius} 
          stroke={color} strokeWidth={strokeWidth} fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
        />
      </Svg>
      <View className="absolute">
        <Ionicons name={status === 'downloading' ? 'pause' : 'play'} size={14} color="#F8F9FA" />
      </View>
    </View>
  );
};

export default function MovieDetailScreen() {
  const { id, type = 'movie' } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions(); 
  const queryClient = useQueryClient();

  const token = useAuthStore((state) => state.token) as string;
  const isVidsrcMode = process.env.EXPO_PUBLIC_APP_MODE?.includes('v') || false;

  const [playing, setPlaying] = useState(false);
  
  // --- REVIEW STATE ---
  const [userRating, setUserRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  
  // --- MODAL STATE ---
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false); // NEW: To show the list of reviews

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const downloadedMovies = useMovieStore((state) => state.downloadedMovies);
  const addDownload = useMovieStore((state) => state.addDownload);
  const toggleDownloadStatusStore = useMovieStore((state) => state.toggleDownloadStatusStore);
  const updateDownloadProgress = useMovieStore((state) => state.updateDownloadProgress);

  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['media', type, id],
    queryFn: () => fetchMovieDetails(id as string, type as string), 
  });

  const { data: similarMovies = [], isLoading: similarLoading } = useQuery({
    queryKey: ['similarMedia', type, id],
    queryFn: () => fetchSimilar(id as string, type as 'movie'|'tv'),
    enabled: !!id,
  });

  const { data: libraryData = [] } = useQuery({
    queryKey: ['myLibrary'],
    queryFn: () => getMyLibrary(token),
    enabled: !!token,
  });

  const { data: favoriteData = [] } = useQuery({
    queryKey: ['favoriteMovies'],
    queryFn: () => getFavoriteMovies(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (type === 'tv' && movie?.seasons?.length > 0) {
      const validSeasons = movie.seasons.filter((s: any) => s.season_number > 0);
      if (validSeasons.length > 0) setSelectedSeason(validSeasons[0].season_number);
    }
  }, [movie, type]);

  const currentDownload = downloadedMovies.find(m => m.id === movie?.id);

  const saveMutation = useMutation({
    mutationFn: (movieData: any) => saveMovie(token, movieData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLibrary'] }),
  });

  const favoriteMutation = useMutation({
    mutationFn: (moviePayload: any) => toggleFavorite(token, moviePayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteMovies'] });
      queryClient.invalidateQueries({ queryKey: ['myLibrary'] });
    },
  });

  const rateMutation = useMutation({
    mutationFn: (payload: any) => rateMovie(token, payload.movieData, payload.rating),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLibrary'] }),
  });

  const downloadMutation = useMutation({
    mutationFn: (quality: string) => markAsDownloaded(token, {
      tmdbId: movie.id,
      title: movie.title || movie.name,
      posterPath: movie.poster_path,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLibrary'] }),
  });

  const handleSave = () => {
    if (!movie) return;
    saveMutation.mutate({ tmdbId: movie.id, title: movie.title || movie.name, posterPath: movie.poster_path });
  };

  const handleFavoriteToggle = () => {
    if (!movie) return;
    favoriteMutation.mutate({ tmdbId: movie.id, title: movie.title || movie.name, posterPath: movie.poster_path }); 
  };

  // --- NEW: REVIEW SUBMISSION LOGIC ---
  const handleStarClick = (star: number) => {
    setUserRating(star);
  };

  const handleSubmitReview = () => {
    if (!userRating) {
      Alert.alert("Hold up!", "Please select a star rating first.");
      return;
    }
    
    // In a real app, your backend handles the reviewText. 
    // We pass it to the mutation here.
    rateMutation.mutate({
      movieData: { tmdbId: movie.id, title: movie.title || movie.name, posterPath: movie.poster_path },
      rating: userRating,
      review: reviewText 
    });

    setShowRateModal(false);
    setReviewText('');
    Alert.alert("Success", "Your review has been posted!");
  };

  const handleDownloadSelection = (quality: string) => {
    setShowDownloadModal(false);
    addDownload({
      id: movie.id,
      title: movie.title || movie.name,
      poster_path: movie.poster_path,
      size: quality.includes('1080p') ? '2.4 GB' : quality.includes('720p') ? '1.2 GB' : '500 MB',
      duration: 'Downloading...',
      progress: 0,
      status: 'downloading'
    });
    downloadMutation.mutate(quality);
  };

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') setPlaying(false);
  }, []);

  const handlePlayMovieAction = () => {
    const mediaId = movie?.imdb_id || movie?.id; // Keep this for Vidsrc
    if (!mediaId) return;

    const playParams: any = { 
      type: type, 
      id: mediaId,               // Vidsrc uses this (might be "tt1234")
      tmdbId: movie.id,          // <-- NEW: Your backend strictly uses this (e.g., 550)
      title: movie.title || movie.name,
      posterPath: movie.poster_path,
      runtime: movie.runtime || movie.episode_run_time?.[0] || 0
    };
    
    if (type === 'tv') {
      playParams.season = selectedSeason;
      playParams.episode = selectedEpisode;
    }

    router.push({ pathname: '/player', params: playParams });
  };

  if (isLoading) return <View className="flex-1 bg-background justify-center items-center"><ActivityIndicator size="large" color="#00E5FF" /></View>;
  if (isError || !movie) return <View className="flex-1 bg-background justify-center items-center"><Text className="text-primaryText">Failed to load details. Make sure type is correctly passed.</Text></View>;

  const isSaved = Array.isArray(libraryData) && libraryData.some((m: any) => m.tmdbId === movie.id && m.inWatchlist);
  const isFavorite = Array.isArray(favoriteData) && favoriteData.some((m: any) => m.tmdbId === movie.id);
  const dbRating = Array.isArray(libraryData) ? libraryData.find((m: any) => m.tmdbId === movie.id)?.rating : null;
  const displayRating = userRating || dbRating;
  const trailer = movie?.videos?.results?.find((vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube');

  const displayTitle = movie.title || movie.name;
  const displayDate = (movie.release_date || movie.first_air_date || 'TBA').split('-')[0];
  const displayRuntime = movie.runtime 
    ? `${movie.runtime} min` 
    : movie.episode_run_time?.[0] 
      ? `${movie.episode_run_time[0]} min/ep` 
      : 'N/A';

  const validSeasons = movie.seasons?.filter((s: any) => s.season_number > 0) || [];
  const currentSeasonData = validSeasons.find((s: any) => s.season_number === selectedSeason);
  const episodeCount = currentSeasonData?.episode_count || 0;

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        <View className="w-full bg-black">
          {playing && trailer ? (
            <View className="mt-12 w-full justify-center items-center bg-black">
              <YoutubePlayer
                height={width * (9 / 16)}
                width={width}
                play={playing}
                videoId={trailer.key}
                onChangeState={onStateChange}
                initialPlayerParams={{ preventFullScreen: false, modestbranding: true }}
              />
            </View>
          ) : (
            <View className="relative w-full aspect-[4/5]">
              <Image 
                source={{ uri: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster' }}
                className="w-full h-full bg-surface"
                resizeMode="cover"
              />
              <Pressable onPress={() => router.back()} className="absolute top-12 left-5 bg-black/50 p-2 rounded-full">
                <Ionicons name="chevron-back" size={28} color="#F8F9FA" />
              </Pressable>
              <Pressable onPress={handleSave} className="absolute top-12 right-5 bg-black/50 p-2 rounded-full">
                {saveMutation.isPending ? <ActivityIndicator size="small" color="#00E5FF" /> : <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={26} color={isSaved ? "#00E5FF" : "#F8F9FA"} />}
              </Pressable>
            </View>
          )}
        </View>

        <View className="flex-1 px-5 pt-6 pb-12">
          <Text className="text-primaryText text-3xl font-bold mb-2">{displayTitle}</Text>

          {movie.genres && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {movie.genres.map((genre: any) => (
                <View key={genre.id} className="bg-surface px-3 py-1.5 rounded-full border border-[#1A2235]">
                  <Text className="text-[#8899B6] text-xs font-bold tracking-wider">{genre.name}</Text>
                </View>
              ))}
            </View>
          )}

          <View className="flex-row items-center mb-6">
            <Ionicons name="star" size={18} color="#00E5FF" />
            <Text className="text-accent font-bold text-base ml-1 mr-4">{movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</Text>
            <Ionicons name="calendar-outline" size={16} color="#8899B6" />
            <Text className="text-[#8899B6] text-sm ml-1 mr-4">{displayDate}</Text>
            <Ionicons name="time-outline" size={16} color="#8899B6" />
            <Text className="text-[#8899B6] text-sm ml-1">{displayRuntime}</Text>
          </View>

          {type === 'tv' && validSeasons.length > 0 && (
            <View className="mb-6 bg-surface p-4 rounded-2xl border border-[#1A2235]">
              <Text className="text-primaryText font-bold text-base mb-3">Select Season</Text>
              
              <View className="flex-row flex-wrap mb-2">
                {validSeasons.map((season: any) => (
                  <Pressable 
                    key={season.id} 
                    onPress={() => {
                      setSelectedSeason(season.season_number);
                      setSelectedEpisode(1); 
                    }}
                    className={`mr-2 mb-2 px-4 py-2 rounded-lg border ${selectedSeason === season.season_number ? 'bg-[#00E5FF]/20 border-[#00E5FF]' : 'bg-[#1A2235] border-transparent'}`}
                  >
                    <Text className={`font-bold ${selectedSeason === season.season_number ? 'text-[#00E5FF]' : 'text-[#8899B6]'}`}>
                      Season {season.season_number}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="text-primaryText font-bold text-base mb-3 mt-2">Select Episode</Text>
              
              <View className="flex-row flex-wrap">
                {Array.from({ length: episodeCount }).map((_, i) => {
                  const epNum = i + 1;
                  return (
                    <Pressable 
                      key={epNum} 
                      onPress={() => setSelectedEpisode(epNum)}
                      className={`mr-2 mb-2 w-12 h-12 items-center justify-center rounded-lg border ${selectedEpisode === epNum ? 'bg-[#00E5FF]/20 border-[#00E5FF]' : 'bg-[#1A2235] border-transparent'}`}
                    >
                      <Text className={`font-bold ${selectedEpisode === epNum ? 'text-[#00E5FF]' : 'text-[#8899B6]'}`}>
                        {epNum}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {isVidsrcMode && (
            <Pressable 
              onPress={handlePlayMovieAction}
              disabled={!movie?.imdb_id && !movie?.id}
              className={`w-full flex-row items-center justify-center py-4 mb-4 rounded-xl shadow-lg ${
                (!movie?.imdb_id && !movie?.id) ? 'bg-surface opacity-50' : 'bg-[#00E5FF]'
              }`}
            >
              <Ionicons name="play" size={22} color="#000000" />
              <Text className="font-bold text-lg ml-2 text-black">
                {type === 'tv' ? `Play S${selectedSeason} E${selectedEpisode}` : 'Play Movie'}
              </Text>
            </Pressable>
          )}

          <View className="flex-row gap-4 mb-6">
            <Pressable 
              onPress={() => setPlaying(!playing)}
              disabled={!trailer}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl ${
                !trailer ? 'bg-surface opacity-50' : playing ? 'bg-red-600' : isVidsrcMode ? 'bg-surface border border-[#1A2235]' : 'bg-[#00E5FF]'
              }`}
            >
              <Ionicons name={playing ? "close" : "play"} size={20} color={playing ? "#FFFFFF" : isVidsrcMode ? "#00E5FF" : "#000000"} />
              <Text className={`font-bold text-base ml-2 ${playing ? "text-white" : isVidsrcMode ? "text-[#00E5FF]" : "text-black"}`}>
                {!trailer ? 'No Trailer' : playing ? 'Close Trailer' : 'Trailer'}
              </Text>
            </Pressable>
            
            <Pressable onPress={handleSave} className="flex-1 bg-surface flex-row items-center justify-center py-3.5 rounded-xl border border-[#1A2235]">
              {saveMutation.isPending ? <ActivityIndicator size="small" color="#00E5FF" /> : (
                <>
                  <Ionicons name={isSaved ? "checkmark" : "add"} size={22} color={isSaved ? "#00E5FF" : "#F8F9FA"} />
                  <Text className={`font-bold text-base ml-2 ${isSaved ? "text-[#00E5FF]" : "text-primaryText"}`}>{isSaved ? "Saved" : "My List"}</Text>
                </>
              )}
            </Pressable>
          </View>

          <View className="flex-row justify-around py-4 mb-6 border-t border-b border-[#1A2235]">
            {!currentDownload ? (
              <Pressable onPress={() => setShowDownloadModal(true)} className="items-center w-20">
                <View className="h-10 justify-center"><Ionicons name="download-outline" size={26} color="#F8F9FA" /></View>
                <Text className="text-[#8899B6] text-xs mt-1.5 font-medium">Download</Text>
              </Pressable>
            ) : currentDownload.status === 'completed' ? (
              <View className="items-center w-20">
                 <View className="h-10 justify-center"><Ionicons name="checkmark-circle" size={26} color="#00E5FF" /></View>
                 <Text className="text-[#00E5FF] text-xs mt-1.5 font-bold">Downloaded</Text>
              </View>
            ) : (
              <Pressable onPress={() => toggleDownloadStatusStore(movie.id)} className="items-center w-20">
                 <DownloadProgressRing progress={currentDownload.progress} status={currentDownload.status} />
                 <Text className={`text-xs mt-1.5 font-bold ${currentDownload.status === 'paused' ? 'text-[#8899B6]' : 'text-[#00E5FF]'}`}>{currentDownload.status === 'paused' ? 'Resume' : 'Downloading'}</Text>
              </Pressable>
            )}

            <Pressable onPress={handleFavoriteToggle} className="items-center w-20">
              <View className="h-10 justify-center">
                {favoriteMutation.isPending ? <ActivityIndicator size="small" color="#EF4444" /> : <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={26} color={isFavorite ? "#EF4444" : "#F8F9FA"} />}
              </View>
              <Text className="text-[#8899B6] text-xs mt-1.5 font-medium">Favorite</Text>
            </Pressable>

            {/* This opens the Write a Review modal */}
            <Pressable onPress={() => setShowRateModal(true)} className="items-center w-20">
              <View className="h-10 justify-center">
                <Ionicons name={displayRating ? "star" : "star-outline"} size={26} color={displayRating ? "#00E5FF" : "#F8F9FA"} />
              </View>
              <Text className="text-[#8899B6] text-xs mt-1.5 font-medium">{displayRating ? `${displayRating} Stars` : 'Rate'}</Text>
            </Pressable>

            {/* NEW: Button to READ Reviews */}
            {movie.reviews && movie.reviews.results.length > 0 && (
               <Pressable onPress={() => setShowReviewsModal(true)} className="items-center w-20">
                 <View className="h-10 justify-center">
                   <Ionicons name="chatbubbles-outline" size={26} color="#F8F9FA" />
                 </View>
                 <Text className="text-[#8899B6] text-xs mt-1.5 font-medium">Reviews</Text>
               </Pressable>
            )}
          </View>

          <Text className="text-primaryText text-xl font-bold mb-2">Synopsis</Text>
          <Text className="text-primaryText opacity-80 text-base leading-6">{movie.overview || "No synopsis available for this title."}</Text>

          <View className="mt-8 border-t border-[#1A2235] pt-8">
            <Text className="text-primaryText text-xl font-bold mb-4">You Might Also Like</Text>
            {similarLoading ? <ActivityIndicator color="#00E5FF" /> : similarMovies && similarMovies.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
                {similarMovies.slice(0, 10).map((similar: any) => (
                  <Pressable key={similar.id} className="mr-4 w-32" onPress={() => router.push({ pathname: '/movies/[id]', params: { id: similar.id, type } })}>
                    <Image source={{ uri: similar.poster_path ? `https://image.tmdb.org/t/p/w500${similar.poster_path}` : 'https://via.placeholder.com/150x225?text=No+Poster' }} className="w-32 h-48 rounded-xl bg-surface mb-2" resizeMode="cover" />
                    <Text className="text-primaryText font-bold text-sm" numberOfLines={1}>{similar.title || similar.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : <Text className="text-[#8899B6]">No similar media found.</Text>}
          </View>

        </View>
      </ScrollView>

      {/* --- MODAL 1: DOWNLOAD --- */}
      <Modal visible={showDownloadModal} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/80 px-5">
          <View className="bg-surface w-full rounded-3xl p-6 border border-[#1A2235]">
            <Text className="text-white text-xl font-bold mb-4">Download Quality</Text>
            {[
              { label: 'High (1080p)', size: '2.4 GB' },
              { label: 'Standard (720p)', size: '1.2 GB' },
              { label: 'Data Saver (480p)', size: '500 MB' }
            ].map((option, index) => (
              <Pressable 
                key={index} 
                onPress={() => handleDownloadSelection(option.label)} 
                className="flex-row justify-between items-center py-4 border-b border-[#1A2235]"
              >
                <Text className="text-primaryText text-base font-medium">{option.label}</Text>
                <Text className="text-[#8899B6] text-sm">{option.size}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setShowDownloadModal(false)} className="mt-6 bg-[#1A2235] p-4 rounded-xl items-center">
              <Text className="text-white font-bold text-base">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: RATE & REVIEW --- */}
      <Modal visible={showRateModal} transparent={true} animationType="slide">
        <View className="flex-1 justify-end bg-black/80">
          <View className="bg-surface w-full rounded-t-3xl p-8 border-t border-[#1A2235]">
            
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-bold">Write a Review</Text>
              <Pressable onPress={() => setShowRateModal(false)}>
                <Ionicons name="close-circle" size={28} color="#8899B6" />
              </Pressable>
            </View>

            <Text className="text-[#8899B6] mb-4">What did you think of {displayTitle}?</Text>
            
            <View className="flex-row justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => handleStarClick(star)} className="p-1">
                  <Ionicons name={userRating && userRating >= star ? "star" : "star-outline"} size={44} color="#00E5FF" />
                </Pressable>
              ))}
            </View>

            <View className="bg-background rounded-xl border border-[#1A2235] p-4 mb-6">
              <TextInput
                className="text-primaryText text-base min-h-[100px]"
                placeholder="Write your thoughts here..."
                placeholderTextColor="#8899B6"
                multiline={true}
                textAlignVertical="top"
                value={reviewText}
                onChangeText={setReviewText}
                selectionColor="#00E5FF"
              />
            </View>

            <Pressable 
              onPress={handleSubmitReview} 
              disabled={rateMutation.isPending}
              className={`w-full py-4 rounded-xl items-center flex-row justify-center ${rateMutation.isPending ? 'bg-surface' : 'bg-[#00E5FF]'}`}
            >
              {rateMutation.isPending ? <ActivityIndicator size="small" color="#00E5FF" /> : (
                <>
                  <Ionicons name="send" size={20} color="#000000" />
                  <Text className="text-black font-bold text-lg ml-2">Post Review</Text>
                </>
              )}
            </Pressable>
            
          </View>
        </View>
      </Modal>

      {/* --- MODAL 3: READ REVIEWS --- */}
      <Modal visible={showReviewsModal} transparent={true} animationType="slide">
        <View className="flex-1 justify-end bg-black/80">
          <View className="bg-surface w-full h-[80%] rounded-t-3xl p-6 border-t border-[#1A2235]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-bold">User Reviews</Text>
              <Pressable onPress={() => setShowReviewsModal(false)}>
                <Ionicons name="close-circle" size={28} color="#8899B6" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
  {movie?.reviews?.results?.map((review: any) => (
    <View key={review.id} className="bg-background p-5 rounded-2xl mb-4 border border-[#1A2235]">
      <View className="flex-row items-center mb-3">
        
        {/* DYNAMIC AVATAR: Shows image if it exists, otherwise falls back to initial */}
        {review.author_details?.avatar_path ? (
          <Image 
            source={{ 
              uri: review.author_details.avatar_path.startsWith('/http') 
                ? review.author_details.avatar_path.substring(1) 
                : `https://image.tmdb.org/t/p/w200${review.author_details.avatar_path}` 
            }} 
            className="w-10 h-10 rounded-full mr-3 bg-surface"
            resizeMode="cover"
          />
        ) : (
          <View className="w-10 h-10 bg-[#1A2235] rounded-full items-center justify-center mr-3">
            <Text className="text-[#00E5FF] font-bold text-lg">
              {review.author ? review.author.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-primaryText font-bold text-base">{review.author}</Text>
          {review.author_details?.rating && (
            <View className="flex-row items-center mt-0.5">
              <Ionicons name="star" size={12} color="#00E5FF" />
              <Text className="text-[#8899B6] text-xs ml-1 font-bold">{review.author_details.rating} / 10</Text>
            </View>
          )}
        </View>
      </View>
      <Text className="text-[#8899B6] text-sm leading-6">{review.content}</Text>
    </View>
  ))}
</ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}