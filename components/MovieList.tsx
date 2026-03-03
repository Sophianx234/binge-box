import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMovies } from '@/api/services';
import MovieCard from './MovieCard';

export interface Movie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

// 1. Define the exact props this component needs to function
interface MovieRowProps {
  title: string;
  endpointParam: string; 
}

// 2. Accept the props into the component
const MovieRow = ({ title, endpointParam }: MovieRowProps) => {
  
  const { data: movies, isLoading, isError } = useQuery({
    // 3. CRITICAL: Make the queryKey dynamic so TanStack caches each row separately!
    // If you leave this hardcoded as ['movies'], every row will show the exact same movies.
    queryKey: ['movies', endpointParam], 
    
    // 4. Pass the dynamic parameter to your fetch service
    queryFn: () => fetchMovies(endpointParam),
  });

  return (
    <View className='pt-6'>
      
      {/* 5. Inject the dynamic title prop */}
      <View className=" mb-3">
        <Text className="text-primaryText text-xl font-bold">{title}</Text>
      </View>

      {/* 6. A premium touch: Show a loading spinner inside the row area while fetching */}
      {isLoading ? (
        <View className="h-[180px] justify-center items-center">
          <ActivityIndicator color="#00E5FF" />
        </View>
      ) : isError ? (
        <View className="h-[180px] justify-center items-center px-5">
          <Text className="text-[#8899B6]">Failed to load movies.</Text>
        </View>
      ) : (
        <FlatList 
          data={movies} 
          horizontal={true} 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 0, gap: 16 }}
          renderItem={({item}: {item: Movie}) => <MovieCard {...item} />} 
          keyExtractor={(item: Movie) => item.id.toString()}
        />
      )}
      
    </View>
  )
}

export default MovieRow;