import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

// 1. UPDATED INTERFACE: Added TV properties so TypeScript is happy!
export interface Movie {
  id: number;
  title?: string;
  name?: string; // TV Shows use this instead of title
  release_date?: string;
  first_air_date?: string; // TV Shows use this instead of release_date
  poster_path: string | null;
  media_type?: 'movie' | 'tv'; // Returned by multi-search
  adult?: boolean;
  backdrop_path?: string | null;
  genre_ids?: number[];
  original_language?: string;
  original_title?: string;
  overview?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
}

const MovieCard = (props: Movie) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      className="w-[120px]" 
      onPress={() => {
        // You nailed this logic perfectly!
        const mediaType = props.media_type || (props.first_air_date ? 'tv' : 'movie');

        router.push({
          pathname: '/movies/[id]', // (Ensure your detail file is actually located at app/movies/[id].tsx!)
          params: { 
            id: props.id, 
            type: mediaType 
          }
        });
      }}
    > 
      <Image 
        source={{ 
          uri: props.poster_path 
            ? `https://image.tmdb.org/t/p/w500${props.poster_path}` 
            : undefined 
        }} 
        className="w-full aspect-[2/3] bg-surface rounded-xl mb-2" 
        resizeMode="cover"
      />
      
      {/* 2. DYNAMIC TEXT: Now renders 'name' if 'title' is missing! */}
      <Text className="text-primaryText font-bold text-sm" numberOfLines={1}>
        {props.title || props.name}
      </Text>
      
      {/* DYNAMIC DATE: Now renders 'first_air_date' if 'release_date' is missing! */}
      <Text className="text-accent text-xs">
        {(props.release_date || props.first_air_date)?.split('-')[0]} 
      </Text>
    </TouchableOpacity>
  );
}

export default MovieCard;