import { View, Text, FlatList, Image, Pressable } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ContinueWatchingRow = ({ data }: { data: any[] }) => {
  const router = useRouter();

  if (!data || data.length === 0) return null;

  return (
    <View className="mt-8 mb-2">
      <Text className="text-white text-xl font-bold px-5 mb-4">Continue Watching</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
        data={data.slice(0, 5)} 
        renderItem={({ item }) => (
          <Pressable 
            onPress={() => router.push({ pathname: '/movies/[id]', params: { id: item.id, type: item.media_type || 'movie' } })}
            className="w-64"
          >
            <View className="relative w-full aspect-video bg-surface rounded-lg overflow-hidden mb-3 border border-[#1A2235]">
              <Image 
                source={{ uri: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}` }}
                className="w-full h-full opacity-70"
                resizeMode="cover"
              />
              <View className="absolute inset-0 items-center justify-center">
                <View className="bg-black/60 p-3 rounded-full border border-white/20">
                  <Ionicons name="play" size={24} color="#00E5FF" />
                </View>
              </View>
              <View className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A2235]">
                <View className="h-full bg-[#00E5FF]" style={{ width: `${Math.floor(Math.random() * 50) + 25}%` }} />
              </View>
            </View>
            <Text className="text-primaryText font-bold text-sm" numberOfLines={1}>{item.title || item.name}</Text>
            <Text className="text-[#8899B6] text-xs mt-0.5">{item.media_type === 'tv' ? 'S1: E4 "The Ghost"' : '1h 24m remaining'}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export default ContinueWatchingRow;