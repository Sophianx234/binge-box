import { View, Text, FlatList, Pressable, Image } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

// We will use your existing Movie interface
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export default function SavedScreen() {
  const router = useRouter();
  
  // MOCK DATA: Toggle this to an empty array [] to see the beautiful empty state!
  const [savedMovies, setSavedMovies] = useState<Movie[]>([
    { id: 278, title: 'The Shawshank Redemption', poster_path: '/9cqNxxWXNDjPj11Vqr84nZcQ5jQ.jpg', release_date: '1994-09-23' },
    { id: 238, title: 'The Godfather', poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', release_date: '1972-03-14' },
    { id: 155, title: 'The Dark Knight', poster_path: '/qJ2tW6WMOTnwQSBiPO514lK4QcU.jpg', release_date: '2008-07-16' },
    { id: 129, title: 'Spirited Away', poster_path: '/39wmItIWsg5sZMyRUHLkBgYtzHc.jpg', release_date: '2001-07-20' },
  ]);

  return (
    <SafeAreaView className="bg-background flex-1">
      <View className="flex-1 px-5 pt-6">
        
        {/* --- HEADER --- */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-primaryText text-3xl font-bold">My List</Text>
          <View className="bg-surface px-3 py-1 rounded-full">
            <Text className="text-accent font-bold">{savedMovies.length} items</Text>
          </View>
        </View>

        {/* --- LIST / EMPTY STATE --- */}
        <FlatList
          data={savedMovies}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          
          // Reusing your perfect 3-column grid layout
          numColumns={3}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
          
          // The Empty State Component
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-32">
              <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6 border border-[#1A2235]">
                <Ionicons name="bookmark-outline" size={48} color="#00E5FF" />
              </View>
              <Text className="text-primaryText text-xl font-bold mb-2">Your list is empty</Text>
              <Text className="text-[#8899B6] text-center px-4 mb-8 leading-6">
                Save shows and movies to keep track of what you want to watch next.
              </Text>
              
              {/* Call to Action Button */}
              <Pressable 
                onPress={() => router.push('/search')}
                className="bg-[#00E5FF] px-8 py-4 rounded-full flex-row items-center"
              >
                <Ionicons name="search" size={20} color="#000000" className="mr-2" />
                <Text className="text-black font-bold text-base">Explore Movies</Text>
              </Pressable>
            </View>
          }

          // The Grid Cards
          renderItem={({ item }) => (
            <Pressable 
              onPress={() => router.push(`/movies/${item.id}`)}
              className="flex-1 flex-col max-w-[31%]" 
            >
              <View className="relative">
                <Image 
                  source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : undefined }}
                  className="w-full aspect-[2/3] bg-surface rounded-xl mb-2"
                  resizeMode="cover"
                />
                {/* A subtle gradient or icon overlay could go here to indicate it's saved */}
              </View>
              
              <Text className="text-primaryText font-bold text-xs text-center" numberOfLines={1}>
                {item.title}
              </Text>
            </Pressable>
          )}
        />

      </View>
    </SafeAreaView>
  );
}