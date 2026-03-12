import { View, Text, Pressable } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import GenreList from './GenreList';

const SearchBar = () => {
  const router = useRouter();
  
  return (
    <View className="bg-background pt-2">
      {/* 1. SEARCH PILL */}
      <Pressable 
        onPress={() => router.push('/search')}
        className="flex-row items-center mx-5 bg-surface rounded-full px-6 py-4 mb-4 border border-[#1A2235]"
      >
        <Ionicons name="search" size={20} color="#00E5FF" />
        <Text className="flex-1 ml-3 text-[#8899B6] text-base">
          Search movies, shows...
        </Text>
      </Pressable>

      {/* 2. GENRE LIST (Now sits directly underneath) */}
      <GenreList />
    </View>
  );
}

export default SearchBar;