import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaList } from '@/api/services';
import { useRouter } from 'expo-router';

// We pass the ID to fetch the data, and the Title to display in the header!
interface Props {
  movieId: number;
  movieTitle: string;
}

const BecauseYouWatchedRow = ({ movieId, movieTitle }: Props) => {
  const router = useRouter();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', movieId],
    // TMDB's algorithm endpoint for finding similar content!
    queryFn: () => fetchMediaList(`/movie/${movieId}/recommendations`),
    enabled: !!movieId, // Only run the fetch if we actually pass an ID
  });

  if (isLoading) return <ActivityIndicator color="#00E5FF" className="my-6" />;
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <View className="mt-8 mb-4">
      {/* PERSONALIZED HEADER */}
      <Text className="text-white text-xl font-bold px-5 mb-4">
        Because you watched <Text className="text-[#00E5FF]">{movieTitle}</Text>
      </Text>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        data={recommendations.slice(0, 10)} 
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable 
            onPress={() => router.push({ pathname: '/movies/[id]', params: { id: item.id, type: 'movie' } })}
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

export default BecauseYouWatchedRow;