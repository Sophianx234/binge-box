import { View, Text, Pressable } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const SearchBar = () => {
  const router = useRouter();
  
  return (
    // 1. We swap View for Pressable so the whole pill acts as a button
    <Pressable 
      onPress={() => router.push('/search')}
      className="flex-row items-center justify-center bg-surface rounded-full px-6 py-4"
    >
      <Ionicons name="search" size={20} color="#00E5FF" className="mr-2 text-accent" />
      
      {/* 2. We swap TextInput for standard Text. No keyboard flash! */}
      <Text className="flex-1 text-[#8899B6] text-base">
        Search movies...
      </Text>
    </Pressable>
  );
}

export default SearchBar;