import { View, Text, Image, ScrollView, ActivityIndicator, Pressable, useWindowDimensions } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchMovieDetails } from '@/api/services';
import { Ionicons } from '@expo/vector-icons';
import { useMovieStore } from '@/store/store';
// 1. Import the YouTube Player
import YoutubePlayer from 'react-native-youtube-iframe';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // 2. We need the screen width to make the video perfectly responsive
  const { width } = useWindowDimensions(); 

  // 3. State to track if the user wants to watch the trailer
  const [playing, setPlaying] = useState(false);

  const savedMovies = useMovieStore((state) => state.savedMovies);
  const toggleSaveMovie = useMovieStore((state) => state.toggleSaveMovie);

  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieDetails(id),
  });

  // Automatically pause the video if it finishes
  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

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

  const handleSave = () => {
    toggleSaveMovie({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
    });
  };

  // Find the official YouTube trailer
  const trailer = movie?.videos?.results?.find(
    (vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube'
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION: Swaps between Image and Video Player */}
        <View className="w-full bg-black">
          {playing && trailer ? (
            // The Video Player (Rendered perfectly in 16:9 aspect ratio)
            <View className="mt-12 w-full justify-center items-center bg-black">
              <YoutubePlayer
                height={width * (9 / 16)}
                width={width}
                play={playing}
                videoId={trailer.key}
                onChangeState={onStateChange}
                initialPlayerParams={{
                  preventFullScreen: false, // Allows users to rotate their phone for full screen!
                  modestbranding: true,
                }}
              />
            </View>
          ) : (
            // The Original Poster
            <View className="relative w-full aspect-[4/5]">
              <Image 
                source={{ 
                  uri: movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                    : undefined 
                }}
                className="w-full h-full bg-surface"
                resizeMode="cover"
              />
              
              <Pressable 
                onPress={() => router.back()} 
                className="absolute top-12 left-5 bg-black/50 p-2 rounded-full"
              >
                <Ionicons name="chevron-back" size={28} color="#F8F9FA" />
              </Pressable>

              <Pressable 
                onPress={handleSave} 
                className="absolute top-12 right-5 bg-black/50 p-2 rounded-full"
              >
                <Ionicons 
                  name={isSaved ? "bookmark" : "bookmark-outline"} 
                  size={26} 
                  color={isSaved ? "#00E5FF" : "#F8F9FA"} 
                />
              </Pressable>
            </View>
          )}
        </View>

        {/* DETAILS SECTION */}
        <View className="flex-1 px-5 pt-6 pb-12">
          
          <Text className="text-primaryText text-3xl font-bold mb-2">
            {movie.title}
          </Text>

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

          {/* ACTION BUTTONS ROW */}
          <View className="flex-row gap-4 mb-8">
            {/* 4. Play/Close Trailer Button */}
            <Pressable 
              onPress={() => setPlaying(!playing)}
              disabled={!trailer}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl ${
                !trailer ? 'bg-surface opacity-50' : playing ? 'bg-red-600' : 'bg-[#00E5FF]'
              }`}
            >
              <Ionicons 
                name={playing ? "close" : "play"} 
                size={20} 
                color={playing ? "#FFFFFF" : "#000000"} 
              />
              <Text className={`font-bold text-base ml-2 ${playing ? "text-white" : "text-black"}`}>
                {!trailer ? 'No Trailer' : playing ? 'Close Trailer' : 'Play Trailer'}
              </Text>
            </Pressable>
            
            <Pressable 
              onPress={handleSave} 
              className="bg-surface flex-row items-center justify-center py-3.5 px-6 rounded-xl border border-[#1A2235]"
            >
              <Ionicons 
                name={isSaved ? "checkmark" : "add"} 
                size={22} 
                color={isSaved ? "#00E5FF" : "#F8F9FA"} 
              />
              <Text className={`font-bold text-base ml-2 ${isSaved ? "text-[#00E5FF]" : "text-primaryText"}`}>
                {isSaved ? "Saved" : "My List"}
              </Text>
            </Pressable>
          </View>

          <Text className="text-primaryText text-xl font-bold mb-2">
            Synopsis
          </Text>
          <Text className="text-primaryText opacity-80 text-base leading-6">
            {movie.overview || "No synopsis available for this title."}
          </Text>

        </View>
      </ScrollView>
    </View>
  );
}