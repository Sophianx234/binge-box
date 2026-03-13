import { View, Text, Pressable } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const SearchBar = () => {
  const router = useRouter();
  
  return (
    <View className="pt-2 w-full bg-transparent">
      <Pressable 
        onPress={() => router.push('/search')}
        // Adjusted padding (py-3) to make it slightly more compact and premium
        className="flex-row items-center bg-black/50 rounded-full mx-5 px-5 py-3 mb-2 border border-white/10"
      >
        <Ionicons name="search" size={18} color="#00E5FF" />
        <Text className="flex-1 ml-3 text-white/70 text-sm font-medium tracking-wide">
          Search movies, shows...
        </Text>
      </Pressable>
    </View>
  );
}

export default SearchBar;