import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyLibrary } from '@/api/services';
import { useAuthStore } from '@/store/store';

const MyListRow = () => {
  const router = useRouter();
  
  // 1. Get the token
  const token = useAuthStore((state) => state.token) as string;

  // 2. Fetch the library data
  const { data: libraryData = [], isLoading } = useQuery({
    queryKey: ['myLibrary'],
    queryFn: () => getMyLibrary(token),
    enabled: !!token,
  });

  // 3. Filter only the items that are actually in the watchlist
  const myWatchlist = Array.isArray(libraryData) 
    ? libraryData.filter((m: any) => m.inWatchlist) 
    : [];

  return (
    <View className="mt-8 mb-2">
      
      {/* HEADER WITH "SEE ALL" BUTTON */}
      <View className="flex-row justify-between items-center px-5 mb-4">
        <Text className="text-white text-xl font-bold">My List</Text>
        
        {/* Update this route to whatever your main list screen is named (e.g., '/library' or '/mylist') */}
        <Pressable 
          onPress={() => router.push('/(tabs)/saved')} 
          className="flex-row items-center"
        >
          <Text className="text-[#00E5FF] font-bold text-sm mr-1">See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#00E5FF" />
        </Pressable>
      </View>
      
      {isLoading ? (
        <View className="h-40 items-center justify-center">
          <ActivityIndicator size="large" color="#00E5FF" />
        </View>
      ) : myWatchlist.length === 0 ? (
        
        /* EMPTY STATE */
        <View className="mx-5 py-8 px-4 rounded-2xl border-2 border-dashed border-[#1A2235] bg-surface/30 items-center justify-center">
          <View className="w-16 h-16 rounded-full bg-[#1A2235] items-center justify-center mb-4">
            <Ionicons name="bookmark" size={28} color="#8899B6" />
          </View>
          <Text className="text-white font-bold text-lg mb-2">Your list is looking empty</Text>
          <Text className="text-[#8899B6] text-sm text-center mb-6 px-4 leading-5">
            Save shows and movies here so you never lose track of what you want to watch next.
          </Text>
          
          <Pressable 
            onPress={() => router.push('/search')}
            className="px-6 bg-accent py-3 rounded-xl flex-row items-center shadow-lg"
          >
            <Ionicons name="search" size={18} color="black" />
            <Text className="text-black font-bold text-sm ml-2">Find something to watch</Text>
          </Pressable>
        </View>

      ) : (

        /* POPULATED LIST */
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          data={myWatchlist} 
          keyExtractor={(item) => item.tmdbId?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <Pressable 
              // Assuming your backend saves media_type. If not, you might need to default to 'movie'
              onPress={() => router.push({ pathname: '/movies/[id]', params: { id: item.tmdbId, type: item.mediaType || 'movie' } })}
              className="w-28 h-40"
            >
              <View className="w-full h-full rounded-lg overflow-hidden bg-surface border border-[#1A2235]">
                <Image 
                  source={{ uri: item.posterPath ? `https://image.tmdb.org/t/p/w300${item.posterPath}` : 'https://via.placeholder.com/300x450?text=No+Image' }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </Pressable>
          )}
        />
        
      )}
    </View>
  );
};

export default MyListRow;