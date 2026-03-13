import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaList } from '@/api/services';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ComingSoonRow = () => {
  const router = useRouter();

  const { data: upcoming, isLoading } = useQuery({
    queryKey: ['upcomingMovies'],
    // TMDB's specific endpoint for unreleased movies!
    queryFn: () => fetchMediaList('/movie/upcoming'),
  });

  if (isLoading) return <ActivityIndicator color="#00E5FF" className="my-6" />;
  if (!upcoming || upcoming.length === 0) return null;

  // Helper to turn "2026-05-14" into "May 14"
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Coming Soon';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View className="mt-8 mb-4">
      <Text className="text-white text-xl font-bold px-5 mb-4">Coming Soon</Text>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
        data={upcoming.slice(0, 8)} // Show top 8 upcoming movies
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable 
            onPress={() => router.push({ pathname: '/movies/[id]', params: { id: item.id, type: 'movie' } })}
            className="w-64"
          >
            {/* 1. LANDSCAPE BACKDROP */}
            <View className="relative w-full aspect-video bg-surface rounded-xl overflow-hidden mb-3 border border-[#1A2235]">
              <Image 
                source={{ 
                  uri: item.backdrop_path || item.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}` 
                    : 'https://via.placeholder.com/500x281?text=No+Image'
                }}
                className="w-full h-full opacity-80"
                resizeMode="cover"
              />
              
              {/* 2. DATE BADGE OVERLAY */}
              <View className="absolute top-2 right-2 bg-black/80 px-3 py-1.5 rounded-full border border-white/10">
                <Text className="text-white font-bold text-xs uppercase tracking-wider">
                  {formatDate(item.release_date)}
                </Text>
              </View>
            </View>

            {/* 3. INFO ROW (Title + Bell Icon) */}
            <View className="flex-row justify-between items-start pr-1">
              <View className="flex-1 pr-3">
                <Text className="text-primaryText font-bold text-base" numberOfLines={1}>
                  {item.title}
                </Text>
                {/* Short teaser description */}
                <Text className="text-[#8899B6] text-xs mt-1" numberOfLines={2}>
                  {item.overview || "Plot details are currently under wraps."}
                </Text>
              </View>
              
              {/* 4. REMIND ME BUTTON */}
              <Pressable 
                onPress={() => console.log('Reminder set for:', item.title)}
                className="items-center justify-center p-2"
              >
                <Ionicons name="notifications-outline" size={22} color="#00E5FF" />
              </Pressable>
            </View>

          </Pressable>
        )}
      />
    </View>
  );
};

export default ComingSoonRow;