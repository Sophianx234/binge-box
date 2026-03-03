import { View, Text, TextInput, FlatList, ActivityIndicator, Pressable, Image, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import React, { useState } from 'react'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchMovies } from '@/api/services'; 
import { useDebounce } from '@/hooks/debounce';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ['searchMovies', debouncedQuery],
    queryFn: () => fetchMovies(debouncedQuery),
    enabled: debouncedQuery.length > 0, 
  });

  return (
    <SafeAreaView className="bg-background flex-1">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 px-5">

          {/* --- HEADER & SEARCH BAR --- */}
          <View className="flex-row items-center pt-2 mb-6">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={28} color="#F8F9FA" />
            </Pressable>

            <View className="flex-1 flex-row items-center bg-surface rounded-full px-6 py-4">
              <Ionicons name="search" size={20} color="#00E5FF" className="mr-2" />
              
              <TextInput 
                className="flex-1 text-primaryText text-base"
                placeholder="Search movies..."
                placeholderTextColor="#8899B6"
                selectionColor="#00E5FF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true} 
              />

              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} className="p-1">
                  <Ionicons name="close-circle" size={20} color="#8899B6" />
                </Pressable>
              )}
            </View>
          </View>

          {/* --- SEARCH RESULTS AREA --- */}
          <View className="flex-1">
            
            {isLoading && debouncedQuery.length > 0 && (
              <ActivityIndicator size="large" color="#00E5FF" className="mt-10" />
            )}

            {isError && (
              <Text className="text-primaryText text-center mt-10">
                Oops! Something went wrong searching.
              </Text>
            )}

            {debouncedQuery.length === 0 && (
              <View className="flex-1 justify-center items-center opacity-50 pb-20">
                <Ionicons name="film-outline" size={64} color="#8899B6" className="mb-4" />
                <Text className="text-[#8899B6] text-lg font-bold">Find your next favorite movie</Text>
              </View>
            )}

            {!isLoading && !isError && debouncedQuery.length > 0 && (
              <FlatList 
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                
                // 1. THE MAGIC PROP: Turns the list into a grid
                numColumns={3}
                // Important: adding columnWrapperStyle is necessary to space the columns out!
                columnWrapperStyle={{ gap: 12 }} 
                contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
                
                // 2. We moved the header *inside* a full-width View so it doesn't mess up the columns
                ListHeaderComponent={
                  <View className="w-full mb-2">
                    <Text className="text-primaryText text-lg font-bold">
                      Search results for <Text className='text-accent'>"{debouncedQuery}"</Text>
                    </Text>
                  </View>
                }
                
                ListEmptyComponent={
                  <Text className="text-[#8899B6] text-center mt-6 w-full">
                    No movies found.
                  </Text>
                }
                
                renderItem={({ item }) => (
                  // 3. Grid Item Layout: Takes up exactly 1 fraction of the space, stacked vertically
                  <TouchableOpacity 
                    onPress={() => router.push(`/movies/${item.id}`)}
                    className="flex-1 flex-col max-w-[31%]" // max-w ensures the last row doesn't stretch weirdly if there are only 1 or 2 movies left
                  >
                    <Image 
                      source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : undefined }}
                      // aspect-[2/3] ensures the poster is perfectly proportioned before it even loads
                      className="w-full aspect-[2/3] bg-surface rounded-lg mb-2"
                      resizeMode="cover"
                    />
                    
                    {/* Centered, single-line title */}
                    <Text className="text-primaryText font-bold text-xs text-center" numberOfLines={1}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}