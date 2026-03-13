import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaList } from '@/api/services';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// 1. The Brains: Determine the time and return the perfect title and TMDB genre endpoint!
const getDynamicContext = () => {
  const hour = new Date().getHours();
  const day = new Date().getDay(); // 0 is Sunday, 5 is Friday

  // Friday Evening (From 4 PM onwards)
  if (day === 5 && hour >= 16) {
    return { title: 'Friday Night Action', icon: 'flame', endpoint: '/discover/movie?with_genres=28' };
  } 
  // Weekend
  if (day === 0 || day === 6) {
    return { title: 'Weekend Binge', icon: 'cafe', endpoint: '/trending/tv/week' };
  } 
  // Late Night (10 PM to 4 AM)
  if (hour >= 22 || hour < 4) {
    return { title: 'Late Night Mysteries', icon: 'moon', endpoint: '/discover/movie?with_genres=9648' }; 
  } 
  // Morning (6 AM to 12 PM)
  if (hour >= 6 && hour < 12) {
    return { title: 'Morning Laughs', icon: 'partly-sunny', endpoint: '/discover/movie?with_genres=35' }; 
  }
  
  // Default / Afternoon
  return { title: 'Afternoon Escapes', icon: 'compass', endpoint: '/discover/movie?with_genres=12' }; 
};

const TimeContextRow = () => {
  const router = useRouter();
  const [context, setContext] = useState(getDynamicContext());

  // Re-check the time when the component mounts just to be safe
  useEffect(() => {
    setContext(getDynamicContext());
  }, []);

  const { data: movies, isLoading } = useQuery({
    queryKey: ['timeContext', context.title],
    queryFn: () => fetchMediaList(context.endpoint),
  });

  if (isLoading) return <ActivityIndicator color="#00E5FF" className="my-6" />;
  if (!movies || movies.length === 0) return null;

  return (
    <View className="mt-8 mb-4">
      {/* Dynamic Header with an Icon! */}
      <View className="flex-row items-center px-5 mb-4">
        <Ionicons name={context.icon as any} size={22} color="#00E5FF" />
        <Text className="text-white text-xl font-bold ml-2">{context.title}</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        // Grab 10 movies for this row
        data={movies.slice(0, 10)} 
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable 
            onPress={() => router.push({ pathname: '/movies/[id]', params: { id: item.id, type: item.media_type || 'movie' } })}
            className="w-32 h-48"
          >
            <View className="w-full h-full rounded-lg overflow-hidden bg-surface border border-[#1A2235]">
              <Image 
                source={{ 
                  uri: item.poster_path 
                    ? `https://image.tmdb.org/t/p/w300${item.poster_path}` 
                    : 'https://via.placeholder.com/300x450?text=No+Poster'
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

export default TimeContextRow;