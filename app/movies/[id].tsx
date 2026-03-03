import { View, Text, Image, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchMovieDetails } from '@/api/services';
import { Ionicons } from '@expo/vector-icons';

export default function MovieDetailScreen() {
  // 1. Grab the dynamic ID from the URL (e.g., /movie/12345)
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // 2. Fetch the specific movie data
  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieDetails(id),
  });

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

  return (
    // MAIN WRAPPER: flex-1 ensures it fills the physical screen
    <View className="flex-1 bg-background">
      
      {/* 3. The ScrollView allows the content inside to scroll if it gets too long */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* HERO IMAGE SECTION */}
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
          
          {/* Back Button (Overlays the image using absolute positioning) */}
          <Pressable 
            onPress={() => router.back()} 
            className="absolute top-12 left-5 bg-black/50 p-2 rounded-full"
          >
            <Ionicons name="chevron-back" size={28} color="#F8F9FA" />
          </Pressable>
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