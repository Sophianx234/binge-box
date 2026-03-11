import { View, Text, Image, ScrollView, ActivityIndicator, Pressable, useWindowDimensions, Modal, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <-- Imported React Query tools
import { fetchMovieDetails, saveMovie, toggleFavorite, rateMovie, markAsDownloaded } from '@/api/services'; // <-- Imported API functions
import { Ionicons } from '@expo/vector-icons';
import { useMovieStore, useAuthStore } from '@/store/store'; // <-- Imported both stores
import YoutubePlayer from 'react-native-youtube-iframe';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions(); 
  const queryClient = useQueryClient();

  // 1. Grab the secure token from Zustand
  const token = useAuthStore((state) => state.token);

  const [playing, setPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  const savedMovies = useMovieStore((state) => state.savedMovies);
  const toggleSaveMovie = useMovieStore((state) => state.toggleSaveMovie);

  // --- FETCH MOVIE DATA ---
  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieDetails(id as string),
  });

  // --- REACT QUERY MUTATIONS ---

  // A. Save Movie
  const saveMutation = useMutation({
    mutationFn: (movieData: any) => {
      if (!token) throw new Error("Please log in to save movies.");
      return saveMovie(token, movieData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLibrary'] });
    },
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to save movie.")
  });

  // B. Toggle Favorite
  const favoriteMutation = useMutation({
    mutationFn: (tmdbId: number) => {
      if (!token) throw new Error("Please log in to favorite movies.");
      return toggleFavorite(token, tmdbId);
    },
    onSuccess: (data) => setIsFavorite(data.isFavorite),
    onError: (error: any) => Alert.alert("Oops", error.message || "Something went wrong.")
  });

  // C. Rate Movie
  const rateMutation = useMutation({
    mutationFn: (rating: number) => {
      if (!token) throw new Error("Please log in to rate movies.");
      return rateMovie(token, movie.id, rating);
    },
    onSuccess: (_, rating) => {
      setUserRating(rating);
      setShowRateModal(false);
    },
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to save rating.")
  });

  // D. Download Movie
  const downloadMutation = useMutation({
    mutationFn: (quality: string) => {
      if (!token) throw new Error("Please log in to download.");
      return markAsDownloaded(token, {
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
      });
    },
    onSuccess: (_, quality) => {
      Alert.alert("Download Started", `${movie.title} is downloading in ${quality}. Check your Downloads tab.`);
    },
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to sync download.")
  });

  // --- HANDLERS ---

  const handleSave = () => {
    if (!movie || saveMutation.isPending) return;

    // 1. Optimistic UI update (feels instant to the user)
    toggleSaveMovie({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
    });

    // 2. Background database sync
    saveMutation.mutate({
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
    });
  };

  const handleDownloadSelection = (quality: string) => {
    setShowDownloadModal(false);
    downloadMutation.mutate(quality);
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

  const isSaved = savedMovies.some((savedMovie: any) => savedMovie.id === movie.id);
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
              <Image 
                source={{ uri: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined }}
                className="w-full h-full bg-surface"
                resizeMode="cover"
              />
              <Pressable onPress={() => router.back()} className="absolute top-12 left-5 bg-black/50 p-2 rounded-full">
                <Ionicons name="chevron-back" size={28} color="#F8F9FA" />
              </Pressable>
              
              {/* SAVE BUTTON */}
              <Pressable 
                onPress={handleSave} 
                disabled={saveMutation.isPending}
                className="absolute top-12 right-5 bg-black/50 p-2 rounded-full"
              >
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
            
            <Pressable onPress={handleSave} disabled={saveMutation.isPending} className="bg-surface flex-row items-center justify-center py-3.5 px-6 rounded-xl border border-[#1A2235]">
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
            
            <Pressable onPress={() => setShowDownloadModal(true)} disabled={downloadMutation.isPending} className="items-center">
              {downloadMutation.isPending ? <ActivityIndicator size="small" color="#F8F9FA" /> : <Ionicons name="download-outline" size={26} color="#F8F9FA" />}
              <Text className="text-[#8899B6] text-xs mt-1.5 font-medium">Download</Text>
            </Pressable>

            <Pressable onPress={() => favoriteMutation.mutate(movie.id)} disabled={favoriteMutation.isPending} className="items-center">
              {favoriteMutation.isPending ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={26} color={isFavorite ? "#EF4444" : "#F8F9FA"} />
              )}
              <Text className="text-[#8899B6] text-xs mt-1.5 font-medium">Favorite</Text>
            </Pressable>

            <Pressable onPress={() => setShowRateModal(true)} disabled={rateMutation.isPending} className="items-center">
              {rateMutation.isPending ? (
                <ActivityIndicator size="small" color="#00E5FF" />
              ) : (
                <Ionicons name={userRating ? "star" : "star-outline"} size={26} color={userRating ? "#00E5FF" : "#F8F9FA"} />
              )}
              <Text className="text-[#8899B6] text-xs mt-1.5 font-medium">
                {userRating ? `${userRating} Stars` : 'Rate'}
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
                  onPress={() => rateMutation.mutate(star)}
                  className="p-1"
                >
                  <Ionicons name={userRating && userRating >= star ? "star" : "star-outline"} size={40} color="#00E5FF" />
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