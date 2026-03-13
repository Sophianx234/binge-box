import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaList } from '@/api/services'; 
import { useRouter } from 'expo-router';

const TrendingStarsRow = () => {
  const router = useRouter();

  const { data: stars, isLoading } = useQuery({
    queryKey: ['trendingStars'],
    // TMDB's specific endpoint for trending actors/directors!
    queryFn: () => fetchMediaList('/trending/person/week'),
  });

  if (isLoading) return <ActivityIndicator color="#00E5FF" className="my-6" />;
  if (!stars || stars.length === 0) return null;

  return (
    <View className="mt-6 mb-4">
      <Text className="text-white text-xl font-bold px-5 mb-4">Trending Stars</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
        data={stars.slice(0, 12)} // Grab the top 12 stars
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable 
            // Made the clickable area slightly wider to accommodate the slant
            className="items-center w-24"
            onPress={() => console.log('Tapped on star:', item.name)}
          >
            {/* THE SLANTED CONTAINER */}
            <View 
              // Removed rounded-full, made it rectangular (w-20 h-28), and slightly rounded the corners
              className="w-20 h-28 overflow-hidden border border-[#1A2235] bg-surface mb-3 rounded-lg"
              // 1. Skew the container to the left to create the / / shape
              style={{ transform: [{ skewX: '-15deg' }] }}
            >
              <Image 
                source={{ 
                  uri: item.profile_path 
                    ? `https://image.tmdb.org/t/p/w200${item.profile_path}` 
                    : 'https://via.placeholder.com/200x200?text=?' 
                }}
                className="w-full h-full opacity-90"
                resizeMode="cover"
                // 2. Reverse-skew the image so the face isn't distorted!
                // 3. Scale it to 1.2 so the image stretches enough to cover the empty slanted corners
                style={{ transform: [{ skewX: '15deg' }, { scale: 1.2 }] }}
              />
            </View>
            
            {/* ACTOR NAME */}
            <Text 
              className="text-primaryText font-bold text-xs text-center" 
              numberOfLines={2}
            >
              {item.name}
            </Text>
            
            {/* KNOWN FOR */}
            <Text className="text-[#8899B6] text-[10px] text-center mt-0.5" numberOfLines={1}>
              {item.known_for_department}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export default TrendingStarsRow;