import { View, Text, Image, ScrollView, ActivityIndicator, Pressable, useWindowDimensions, Modal, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { fetchMovieDetails, saveMovie, toggleFavorite, rateMovie, markAsDownloaded, getMyLibrary, getFavoriteMovies } from '@/api/services'; 
import { Ionicons } from '@expo/vector-icons';
import { useMovieStore, useAuthStore } from '@/store/store'; 
import YoutubePlayer from 'react-native-youtube-iframe';
import Svg, { Circle } from 'react-native-svg';

// --- CUSTOM SVG PROGRESS RING COMPONENT ---
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
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions(); 
  const queryClient = useQueryClient();

  const token = useAuthStore((state) => state.token) as string;

  const [playing, setPlaying] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  // --- ZUSTAND: DOWNLOADS ONLY (Deleted Ghost Variables!) ---
  const downloadedMovies = useMovieStore((state) => state.downloadedMovies);
  const addDownload = useMovieStore((state) => state.addDownload);
  const toggleDownloadStatusStore = useMovieStore((state) => state.toggleDownloadStatusStore);
  const updateDownloadProgress = useMovieStore((state) => state.updateDownloadProgress);

  // --- REACT QUERY: SERVER STATE FETCHES ---
  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieDetails(id as string),
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

  const currentDownload = downloadedMovies.find(m => m.id === movie?.id);

  // --- REACT QUERY MUTATIONS ---
  const saveMutation = useMutation({
    mutationFn: (movieData: any) => {
      if (!token) throw new Error("Please log in to save movies.");
      return saveMovie(token, movieData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLibrary'] }),
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to save movie.")
  });

  const favoriteMutation = useMutation({
    mutationFn: (moviePayload: { tmdbId: number, title: string, posterPath: string | null }) => { 
      if (!token) throw new Error("Please log in to favorite movies.");
      return toggleFavorite(token, moviePayload); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteMovies'] });
      queryClient.invalidateQueries({ queryKey: ['myLibrary'] });
    },
    onError: (error: any) => Alert.alert("Oops", error.message || "Something went wrong.")
  });

  const rateMutation = useMutation({
    mutationFn: (payload: { movieData: any, rating: number }) => { 
      if (!token) throw new Error("Please log in to rate movies.");
      return rateMovie(token, payload.movieData, payload.rating); 
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLibrary'] }),
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to save rating.")
  });

  const downloadMutation = useMutation({
    mutationFn: (quality: string) => {
      if (!token) throw new Error("Please log in to download.");
      return markAsDownloaded(token, {
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLibrary'] }),
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to sync download.")
  });

  // --- HANDLERS ---
  const handleSave = () => {
    if (!movie) return;
    saveMutation.mutate({
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
    });
  };

  const handleFavoriteToggle = () => {
    if (!movie) return;
    favoriteMutation.mutate({
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path
    }); 
  };

  const handleRateMovie = (star: number) => {
    if (!movie) return;
    setUserRating(star); // Instantly update UI locally
    setShowRateModal(false); 
    rateMutation.mutate({
      movieData: {
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path
      },
      rating: star
    });
  };

  const handleDownloadSelection = (quality: string) => {
    setShowDownloadModal(false);
    addDownload({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      size: quality.includes('1080p') ? '2.4 GB' : quality.includes('720p') ? '1.2 GB' : '500 MB',
      duration: movie.runtime ? `${movie.runtime}m` : '2h 0m',
      progress: 0,
      status: 'downloading'
    });

    downloadMutation.mutate(quality);

    let mockProgress = 0;
    const interval = setInterval(() => {
      mockProgress += 5;
      updateDownloadProgress(movie.id, mockProgress);
      if (mockProgress >= 100) clearInterval(interval);
    }, 500); 
  };

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') setPlaying(false);
  }, []);

  // --- RENDER CHECKS ---
  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  if (isError || !movie) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-primaryText">Failed to load movie details.</Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-surface p-3 rounded-lg">
          <Text className="text-accent">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // --- DYNAMIC STATE CALCULATORS (Crash-Proofed) ---
  // Safely checks if it is an array before calling .some()
  const isSaved = Array.isArray(libraryData) && libraryData.some((m: any) => m.tmdbId === movie.id && m.inWatchlist);
  const isFavorite = Array.isArray(favoriteData) && favoriteData.some((m: any) => m.tmdbId === movie.id);
  
  // Calculate Rating: Use local state if recently clicked, otherwise pull from Database!
  const dbRating = Array.isArray(libraryData) ? libraryData.find((m: any) => m.tmdbId === movie.id)?.rating : null;
  const displayRating = userRating || dbRating;

  const trailer = movie?.videos?.results?.find((vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube');

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION */}
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
              {/* FIXED: Prevented undefined URI crash by using a fallback URL */}
              <Image 
                source={{ uri: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster' }}
                className="w-full h-full bg-surface"
                resizeMode="cover"
              />
              <Pressable onPress={() => router.back()} className="absolute top-12 left-5 bg-black/50 p-2 rounded-full">
                <Ionicons name="chevron-back" size={28} color="#F8F9FA" />
              </Pressable>
              
              <Pressable onPress={handleSave} className="absolute top-12 right-5 bg-black/50 p-2 rounded-full">
                {/* ADDED: Spinner while saving */}
                {saveMutation.isPending ? (
                  <ActivityIndicator size="small" color="#00E5FF" />
                ) : (
                  <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={26} color={isSaved ? "#00E5FF" : "#F8F9FA"} />
                )}
              </Pressable>
            </View>
          )}
        </View>

        {/* DETAILS SECTION */}
        <View className="flex-1 px-5 pt-6 pb-12">
          <Text className="text-primaryText text-3xl font-bold mb-2">{movie.title}</Text>

          {/* GENRE PILLS */}
          {movie.genres && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {movie.genres.map((genre: any) => (
                <View key={genre.id} className="bg-surface px-3 py-1.5 rounded-full border border-[#1A2235]">
                  <Text className="text-[#8899B6] text-xs font-bold tracking-wider">{genre.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Metadata Row */}
          <View className="flex-row items-center mb-6">
            <Ionicons name="star" size={18} color="#00E5FF" />
            <Text className="text-accent font-bold text-base ml-1 mr-4">
              {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}
            </Text>
            <Ionicons name="calendar-outline" size={16} color="#8899B6" />
            <Text className="text-[#8899B6] text-sm ml-1 mr-4">
              {movie.release_date ? movie.release_date.split('-')[0] : 'TBA'}
            </Text>
            <Ionicons name="time-outline" size={16} color="#8899B6" />
            <Text className="text-[#8899B6] text-sm ml-1">
              {movie.runtime ? `${movie.runtime} min` : 'N/A'}
            </Text>
          </View>

          {/* PRIMARY ACTION BUTTONS */}
          <View className="flex-row gap-4 mb-6">
            <Pressable 
              onPress={() => setPlaying(!playing)}
              disabled={!trailer}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl ${
                !trailer ? 'bg-surface opacity-50' : playing ? 'bg-red-600' : 'bg-[#00E5FF]'
              }`}
            >
              <Ionicons name={playing ? "close" : "play"} size={20} color={playing ? "#FFFFFF" : "#000000"} />
              <Text className={`font-bold text-base ml-2 ${playing ? "text-white" : "text-black"}`}>
                {!trailer ? 'No Trailer' : playing ? 'Close Trailer' : 'Play Trailer'}
              </Text>
            </Pressable>
            
            <Pressable onPress={handleSave} className="bg-surface flex-row items-center justify-center py-3.5 px-6 rounded-xl border border-[#1A2235]">
              {/* ADDED: Loading spinner to the big button too */}
              {saveMutation.isPending ? (
                 <ActivityIndicator size="small" color="#00E5FF" />
              ) : (
                <>
                  <Ionicons name={isSaved ? "checkmark" : "add"} size={22} color={isSaved ? "#00E5FF" : "#F8F9FA"} />
                  <Text className={`font-bold text-base ml-2 ${isSaved ? "text-[#00E5FF]" : "text-primaryText"}`}>
                    {isSaved ? "Saved" : "My List"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* SECONDARY ACTION ICONS */}
          <View className="flex-row justify-around py-4 mb-6 border-t border-b border-[#1A2235]">
            
            {/* DYNAMIC DOWNLOAD BUTTON */}
            {!currentDownload ? (
              <Pressable onPress={() => setShowDownloadModal(true)} className="items-center w-20">
                <View className="h-10 justify-center">
                  <Ionicons name="download-outline" size={26} color="#F8F9FA" />
                </View>
                <Text className="text-[#8899B6] text-xs mt-1.5 font-medium">Download</Text>
              </Pressable>
            ) : currentDownload.status === 'completed' ? (
              <View className="items-center w-20">
                 <View className="h-10 justify-center">
                    <Ionicons name="checkmark-circle" size={26} color="#00E5FF" />
                 </View>
                 <Text className="text-[#00E5FF] text-xs mt-1.5 font-bold">Downloaded</Text>
              </View>
            ) : (
              <Pressable onPress={() => toggleDownloadStatusStore(movie.id)} className="items-center w-20">
                 <DownloadProgressRing progress={currentDownload.progress} status={currentDownload.status} />
                 <Text className={`text-xs mt-1.5 font-bold ${currentDownload.status === 'paused' ? 'text-[#8899B6]' : 'text-[#00E5FF]'}`}>
                   {currentDownload.status === 'paused' ? 'Resume' : 'Downloading'}
                 </Text>
              </Pressable>
            )}

            <Pressable onPress={handleFavoriteToggle} className="items-center w-20">
              <View className="h-10 justify-center">
                {/* ADDED: Loading spinner for the heart icon */}
                {favoriteMutation.isPending ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={26} color={isFavorite ? "#EF4444" : "#F8F9FA"} />
                )}
              </View>
              <Text className="text-[#8899B6] text-xs mt-1.5 font-medium">Favorite</Text>
            </Pressable>

            <Pressable onPress={() => setShowRateModal(true)} className="items-center w-20">
              <View className="h-10 justify-center">
                <Ionicons name={displayRating ? "star" : "star-outline"} size={26} color={displayRating ? "#00E5FF" : "#F8F9FA"} />
              </View>
              <Text className="text-[#8899B6] text-xs mt-1.5 font-medium">
                {displayRating ? `${displayRating} Stars` : 'Rate'}
              </Text>
            </Pressable>
          </View>

          <Text className="text-primaryText text-xl font-bold mb-2">Synopsis</Text>
          <Text className="text-primaryText opacity-80 text-base leading-6">
            {movie.overview || "No synopsis available for this title."}
          </Text>

          {/* USER REVIEWS */}
          <View className="mt-8 border-t border-[#1A2235] pt-8">
            <Text className="text-primaryText text-xl font-bold mb-4">User Reviews</Text>
            {movie.reviews && movie.reviews.results.length > 0 ? (
              movie.reviews.results.slice(0, 5).map((review: any) => (
                <View key={review.id} className="bg-surface p-5 rounded-2xl mb-4 border border-[#1A2235]">
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 bg-[#1A2235] rounded-full items-center justify-center mr-3">
                      <Text className="text-[#00E5FF] font-bold text-lg">{review.author.charAt(0).toUpperCase()}</Text>
                    </View>
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
                  <Text className="text-[#8899B6] text-sm leading-6" numberOfLines={4}>{review.content}</Text>
                </View>
              ))
            ) : (
              <View className="bg-surface p-6 rounded-2xl items-center border border-[#1A2235]">
                <Ionicons name="chatbubble-ellipses-outline" size={32} color="#8899B6" className="mb-2" />
                <Text className="text-[#8899B6] text-center">No reviews yet. Be the first to share your thoughts!</Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* --- MODAL 1: DOWNLOAD QUALITY SELECTION --- */}
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

      {/* --- MODAL 2: RATE MOVIE --- */}
      <Modal visible={showRateModal} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/80 px-5">
          <View className="bg-surface w-full rounded-3xl p-8 border border-[#1A2235] items-center">
            <Text className="text-white text-2xl font-bold mb-2">Rate this movie</Text>
            <Text className="text-[#8899B6] text-center mb-8">What did you think of {movie.title}?</Text>
            <View className="flex-row gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable 
                  key={star} 
                  onPress={() => handleRateMovie(star)}
                  className="p-1"
                >
                  <Ionicons name={displayRating && displayRating >= star ? "star" : "star-outline"} size={40} color="#00E5FF" />
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setShowRateModal(false)} className="w-full bg-[#1A2235] py-4 rounded-xl items-center">
              <Text className="text-white font-bold text-base">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
}