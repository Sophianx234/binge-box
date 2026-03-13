import { View, Text, Image, Pressable, Dimensions } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const HeroBillboard = ({ movie }: { movie: any }) => {
  const router = useRouter();
  if (!movie) return null;

  return (
    <View className="w-full aspect-[4/5] relative">
      <Image 
        source={{ uri: `https://image.tmdb.org/t/p/original${movie.poster_path}` }}
        className="w-full h-full"
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
        className="absolute inset-0 justify-end px-5 pb-8"
      >
        <Text className="text-white text-4xl font-extrabold text-center mb-2" numberOfLines={2}>{movie.title || movie.name}</Text>
        <View className="flex-row justify-center items-center gap-4 mb-6">
          <Text className="text-[#8899B6] text-sm">Action</Text>
          <View className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
          <Text className="text-[#8899B6] text-sm">Sci-Fi</Text>
          <View className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
          <Text className="text-[#8899B6] text-sm">Epic</Text>
        </View>

        <View className="flex-row gap-3">
          <Pressable 
            onPress={() => router.push({ pathname: '/movies/[id]', params: { id: movie.id, type: movie.media_type || 'movie' } })}
            className="flex-1 bg-white flex-row items-center justify-center py-3 rounded-lg"
          >
            <Ionicons name="play" size={20} color="black" />
            <Text className="font-bold text-black ml-2">Play</Text>
          </Pressable>
          <Pressable className="flex-1 bg-surface/80 flex-row items-center justify-center py-3 rounded-lg border border-[#1A2235]">
            <Ionicons name="add" size={24} color="white" />
            <Text className="font-bold text-white ml-2">My List</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
};

export default HeroBillboard;