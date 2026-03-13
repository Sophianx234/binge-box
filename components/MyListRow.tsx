import { View, Text, FlatList, Image, Pressable } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const MyListRow = ({ movies = [] }: { movies?: any[] }) => {
  const router = useRouter();

  return (
    <View className="mt-8 mb-2">
      <Text className="text-white text-xl font-bold px-5 mb-4">My List</Text>
      
      {movies.length === 0 ? (
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
            className=" px-6 bg-accent py-3 rounded-xl flex-row items-center shadow-lg"
          >
            <Ionicons name="search" size={18} color="black" />
            <Text className="text-black  font-bold text-sm ml-2">Find something to watch</Text>
          </Pressable>
        </View>

      ) : (

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          data={movies} 
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable 
              onPress={() => router.push({ pathname: '/movies/[id]', params: { id: item.id, type: item.media_type || 'movie' } })}
              className="w-28 h-40"
            >
              <View className="w-full h-full rounded-lg overflow-hidden bg-surface border border-[#1A2235]">
                <Image 
                  source={{ uri: `https://image.tmdb.org/t/p/w300${item.poster_path}` }}
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