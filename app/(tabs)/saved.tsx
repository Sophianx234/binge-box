import { View, Text, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

// 1. Import your API functions and Auth Store
import { getMyLibrary, getFavoriteMovies } from '@/api/services';
import { useAuthStore } from '@/store/store';

export default function SavedScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  
  const [activeTab, setActiveTab] = useState<'saved' | 'favorites'>('saved');

  // 2. Fetch all user interactions (Watchlist)
  const { data: libraryData = [], isLoading: isLoadingLibrary } = useQuery({
    queryKey: ['myLibrary'],
    queryFn: () => getMyLibrary(token as string),
    enabled: !!token, // Only run if the user is logged in
  });

  // 3. Fetch explicit favorites
  const { data: favoriteMovies = [], isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['favoriteMovies'],
    queryFn: () => getFavoriteMovies(token as string),
    enabled: !!token,
  });

  // Since getMyLibrary returns ALL interactions (ratings, downloads, etc.), 
  // we filter it to only show items actually saved to the watchlist!
  const savedMovies = libraryData.filter((movie: any) => movie.inWatchlist);

  // 4. Dynamically decide which list (and loading state) to show
  const displayedMovies = activeTab === 'saved' ? savedMovies : favoriteMovies;
  const isLoading = activeTab === 'saved' ? isLoadingLibrary : isLoadingFavorites;

  return (
    <SafeAreaView className="bg-background flex-1">
      <View className="flex-1 px-5 pt-6">
        
        {/* --- HEADER --- */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-primaryText text-3xl font-bold">My Library</Text>
        </View>

        {/* --- CUSTOM PILL TABS --- */}
        <View className="flex-row bg-[#1A2235] p-1 rounded-xl mb-6">
          <Pressable 
            onPress={() => setActiveTab('saved')}
            className={`flex-1 flex-row justify-center py-3 rounded-lg items-center ${activeTab === 'saved' ? 'bg-[#00E5FF]' : 'bg-transparent'}`}
          >
            <Text className={`font-bold ${activeTab === 'saved' ? 'text-black' : 'text-[#8899B6]'}`}>
              My List ({savedMovies.length})
            </Text>
          </Pressable>
          
          <Pressable 
            onPress={() => setActiveTab('favorites')}
            className={`flex-1 flex-row justify-center py-3 rounded-lg items-center ${activeTab === 'favorites' ? 'bg-[#00E5FF]' : 'bg-transparent'}`}
          >
            <Text className={`font-bold ${activeTab === 'favorites' ? 'text-black' : 'text-[#8899B6]'}`}>
              Favorites ({favoriteMovies.length})
            </Text>
          </Pressable>
        </View>

        {/* --- LOADING / LIST / EMPTY STATE --- */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#00E5FF" />
          </View>
        ) : (
          <FlatList
            data={displayedMovies}
            // CHANGED: Use tmdbId since it comes from our Prisma database
            keyExtractor={(item) => item.tmdbId.toString()}
            showsVerticalScrollIndicator={false}
            numColumns={3}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
            
            // The Empty State dynamically changes based on the tab!
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center mt-32">
                <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6 border border-[#1A2235]">
                  <Ionicons 
                    name={activeTab === 'saved' ? "bookmark-outline" : "heart-outline"} 
                    size={48} 
                    color="#00E5FF" 
                  />
                </View>
                <Text className="text-primaryText text-xl font-bold mb-2">
                  {activeTab === 'saved' ? 'Your list is empty' : 'No favorites yet'}
                </Text>
                <Text className="text-[#8899B6] text-center px-4 mb-8 leading-6">
                  {activeTab === 'saved' 
                    ? 'Save shows and movies to keep track of what you want to watch next.' 
                    : 'Tap the heart icon on any movie to add it to your favorites.'}
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
                // CHANGED: Use tmdbId for navigation
                onPress={() => router.push(`/movies/${item.tmdbId}`)}
                className="flex-1 flex-col max-w-[31%]" 
              >
                <View className="relative">
                  <Image 
                    // CHANGED: Use posterPath instead of poster_path
                    source={{ uri: item.posterPath ? `https://image.tmdb.org/t/p/w200${item.posterPath}` : undefined }}
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
        )}
      </View>
    </SafeAreaView>
  );
}