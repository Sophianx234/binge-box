import { View, Text, FlatList,   } from 'react-native'
import React from 'react'
import { fetchMovies } from '@/api/services';
import { useQuery } from '@tanstack/react-query';
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
const MovieList = () => {
  const { data: movies, isLoading, isError, error } = useQuery({
    queryKey: ['movies'], 
    queryFn: () => fetchMovies(),
  });
  

  return (
    <View className='pt-3 h-full'>
    <View>
      <Text className="text-primaryText text-2xl font-bold mb-2">Trending Movies</Text>
    </View>
      <FlatList data={movies} numColumns={3} renderItem={({item}: {item: Movie}) => <MovieCard {...item} />} keyExtractor={(item:Movie)=>item.id.toString()}/>
      
    </View>
  )
}

export default MovieList