import React, { useState } from 'react';
// 1. FIXED: Added missing ActivityIndicator, Pressable, and FlatList imports
import { View, Text, ScrollView, ActivityIndicator, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetchGenres, fetchMediaByGenre } from '@/api/services';
import MovieCard from './MovieCard'; // Make sure this path points to your MovieCard!

const GenreList = () => {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  // Fetch the list of Movie Genres for the top bar
  const { data: genres = [], isLoading: genresLoading } = useQuery({
    queryKey: ['genres', 'movie'],
    queryFn: () => fetchGenres('movie'),
  });

  // Fetch movies specifically for the selected genre
  const { data: genreMovies = [], isLoading: genreMoviesLoading } = useQuery({
    queryKey: ['genreMovies', selectedGenre],
    queryFn: () => fetchMediaByGenre(selectedGenre as number, 'movie'),
    enabled: selectedGenre !== null, // Only run this if a genre is actually clicked!
  });

  return (
    <View className="   ">
      
      {/* HEADER */}
      

      {/* GENRE FILTER BAR */}
      <View className="">
        {genresLoading ? (
          <ActivityIndicator color="#00E5FF" />
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 20,paddingTop:-40, gap: 10 }}
          >
            <Pressable 
              onPress={() => setSelectedGenre(null)}
              className={`px-5 py-2 rounded-full border ${selectedGenre === null ? 'bg-[#00E5FF] border-[#00E5FF]' : 'bg-surface border-[#1A2235]'}`}
            >
              <Text className={`font-bold ${selectedGenre === null ? 'text-black' : 'text-primaryText'}`}>All</Text>
            </Pressable>

            {genres.map((genre: any) => (
              <Pressable 
                key={genre.id}
                onPress={() => setSelectedGenre(genre.id)}
                className={`px-5 py-2 rounded-full border ${selectedGenre === genre.id ? 'bg-[#00E5FF] border-[#00E5FF]' : 'bg-surface border-[#1A2235]'}`}
              >
                <Text className={`font-bold ${selectedGenre === genre.id ? 'text-black' : 'text-primaryText'}`}>
                  {genre.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )} 
      </View> 
      {/* 2. FIXED: Properly closed the ternary operator and the View container */}

      {/* 3. FIXED: Actually render the grid of movies when a genre is selected! */}
      {selectedGenre !== null ? (
        <View className="flex-1 px-5">
          {genreMoviesLoading ? (
             <ActivityIndicator size="large" color="#00E5FF" className="mt-10" />
          ) : (
            <FlatList 
              data={genreMovies}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={{ gap: 12 }} 
              contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
              renderItem={({ item }) => (
                 <View className="flex-1 max-w-[31%]">
                   <MovieCard {...item} media_type="movie" />
                 </View>
              )}
            />
          )}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
           <Text className="text-[#8899B6]">Select a genre above or add your MovieRows here!</Text>
        </View>
      )}

    </View>
  );
};

export default GenreList;