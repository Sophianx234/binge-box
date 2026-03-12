import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaList } from '@/api/services'; // <-- Import the new function!
import MovieCard from './MovieCard';

// 1. Updated interface to match your MovieCard (includes TV properties)
export interface Movie {
  id: number;
  title?: string;
  name?: string; 
  release_date?: string;
  first_air_date?: string; 
  poster_path: string | null;
  media_type?: 'movie' | 'tv'; 
}

// 2. Added defaultMediaType so the row knows what to pass to the cards
interface MovieRowProps {
  title: string;
  endpointPath: string; 
  defaultMediaType?: 'movie' | 'tv'; 
}

const MovieRow = ({ title, endpointPath, defaultMediaType = 'movie' }: MovieRowProps) => {
  
  const { data: movies, isLoading, isError } = useQuery({
    // 3. Cache based on the exact path (e.g., ['mediaList', '/movie/popular'])
    queryKey: ['mediaList', endpointPath], 
    queryFn: () => fetchMediaList(endpointPath),
  });

  return (
    <View className='pt-6'>
      
      <View className="mb-3 px-5">
        <Text className="text-primaryText text-xl font-bold">{title}</Text>
      </View>

      {isLoading ? (
        <View className="h-[180px] justify-center items-center">
          <ActivityIndicator color="#00E5FF" />
        </View>
      ) : isError ? (
        <View className="h-[180px] justify-center items-center px-5">
          <Text className="text-[#8899B6]">Failed to load {title.toLowerCase()}.</Text>
        </View>
      ) : (
        <FlatList 
          data={movies} 
          horizontal={true} 
          showsHorizontalScrollIndicator={false} 
          // Added contentContainerStyle padding so the first card aligns with the title
          contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          renderItem={({item}: {item: Movie}) => (
            <MovieCard 
              {...item} 
              // 4. CRITICAL: Force the media type if TMDB forgets to include it
              media_type={item.media_type || defaultMediaType} 
            />
          )} 
          keyExtractor={(item: Movie) => item.id.toString()}
        />
      )}
      
    </View>
  )
}

export default MovieRow;