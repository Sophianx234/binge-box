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
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10, gap: 10 }}
          >
            {/* The "All" Button */}
            <Pressable 
              onPress={() => setSelectedGenre(null)}
              className={`px-5 py-2 rounded-full border ${
                selectedGenre === null 
                  ? 'bg-[#00E5FF] border-[#00E5FF]' 
                  : 'bg-surface/50 border-white/10' // Softer dark aesthetic
              }`}
            >
              <Text className={`font-bold ${selectedGenre === null ? 'text-black' : 'text-white/70'}`}>
                All
              </Text>
            </Pressable>

            {/* Dynamic Genre Buttons */}
            {genres.map((genre: any) => (
              <Pressable 
                key={genre.id}
                onPress={() => setSelectedGenre(genre.id)}
                className={`px-5 py-2 rounded-full border ${
                  selectedGenre === genre.id 
                    ? 'bg-[#00E5FF] border-[#00E5FF]' 
                    : 'bg-surface/50 border-white/10' // Softer dark aesthetic
                }`}
              >
                <Text className={`font-bold ${selectedGenre === genre.id ? 'text-black' : 'text-white/70'}`}>
                  {genre.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )} 
      </View> 

      {/* RESULTS GRID (Only shows if a genre is selected) */}
      {selectedGenre !== null && (
        <View className="px-5 mt-4">
          {genreMoviesLoading ? (
             <ActivityIndicator size="large" color="#00E5FF" className="mt-10 mb-20" />
          ) : (
            <FlatList 
              data={genreMovies.slice(0, 12)} // Limiting to 12 so it doesn't make the page infinitely long!
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              scrollEnabled={false} 
              columnWrapperStyle={{ gap: 12 }} 
              contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
              renderItem={({ item }) => (
                 <View className="flex-1">
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