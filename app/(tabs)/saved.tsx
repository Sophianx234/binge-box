import { View, Text, FlatList, Pressable, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

// 1. Import your Zustand store
import { useMovieStore } from '@/store/store'; 

export default function SavedScreen() {
  const router = useRouter();
  
  // 2. MAGIC: Pull the real saved movies directly from local storage via Zustand!
  const savedMovies = useMovieStore((state) => state.savedMovies);

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
          
          numColumns={3}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
          
          // The Empty State Component (will automatically show if savedMovies is empty)
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-32">
              <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6 border border-[#1A2235]">
                <Ionicons name="bookmark-outline" size={48} color="#00E5FF" />
              </View>
              <Text className="text-primaryText text-xl font-bold mb-2">Your list is empty</Text>
              <Text className="text-[#8899B6] text-center px-4 mb-8 leading-6">
                Save shows and movies to keep track of what you want to watch next.
              </Text>
              
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