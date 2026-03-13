import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchGenres, fetchMediaByGenre } from '@/api/services';
import MovieCard from './MovieCard'; 

const GenreList = () => {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  const { data: genres = [], isLoading: genresLoading } = useQuery({
    queryKey: ['genres', 'movie'],
    queryFn: () => fetchGenres('movie'),
  });

  const { data: genreMovies = [], isLoading: genreMoviesLoading } = useQuery({
    queryKey: ['genreMovies', selectedGenre],
    queryFn: () => fetchMediaByGenre(selectedGenre as number, 'movie'),
    enabled: selectedGenre !== null,
  });

  return (
    <View>
      {/* GENRE FILTER BAR */}
      <View className="mb-2">
        {genresLoading ? (
          <ActivityIndicator color="#00E5FF" />
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            // FIXED: Removed negative paddingTop. Added actual padding for alignment.
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10, gap: 10 }}
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

      {/* RESULTS GRID (Only shows if a genre is selected) */}
      {selectedGenre !== null && (
        <View className="px-5">
          {genreMoviesLoading ? (
             <ActivityIndicator size="large" color="#00E5FF" className="mt-10" />
          ) : (
            <FlatList 
              data={genreMovies}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              scrollEnabled={false} // Since this is inside a ScrollView on the Home page
              columnWrapperStyle={{ gap: 12 }} 
              contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
              renderItem={({ item }) => (
                 <View className="flex-1  ">
                   <MovieCard {...item} media_type="movie" />
                 </View>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default GenreList;