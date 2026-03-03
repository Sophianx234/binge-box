import { View, Text, Image } from 'react-native';
import React from 'react';
import { Movie } from './MovieList'; // (See architecture note below)

const MovieCard = (props: Movie) => {
  return (
    // Added some padding/margin to space out the grid
    <View className="flex-1 m-2"> 
      <Image 
        source={{ 
          uri: props.poster_path 
            ? `https://image.tmdb.org/t/p/w500${props.poster_path}` 
            : undefined 
        }} 
        // Replaced size-full with a responsive width and a fixed aspect ratio!
        // Added bg-surface so you see a nice dark box while the image loads
        className="w-full aspect-[2/3] bg-surface rounded-lg mb-2" 
        resizeMode="cover"
      />
      <Text className="text-primaryText font-bold" numberOfLines={1}>
        {props.title}
      </Text>
      <Text className="text-accent text-xs">
        {props.release_date?.split('-')[0]} {/* Just shows the Year! */}
      </Text>
    </View>
  );
}

export default MovieCard;