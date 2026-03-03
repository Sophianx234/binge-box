import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Movie } from './MovieList';

const MovieCard = (props: Movie) => {
  const router = useRouter();
  
  return (
    // 1. Swapped flex-1 for w-[120px]. This guarantees every poster in the row is exactly 120 pixels wide!
    <TouchableOpacity className="w-[120px]" onPress={() => router.push(`/movies/${props.id}`)}> 
      <Image 
        source={{ 
          uri: props.poster_path 
            ? `https://image.tmdb.org/t/p/w500${props.poster_path}` 
            : undefined 
        }} 
        // 2. Aspect ratio ensures the height perfectly calculates itself based on the 120px width
        className="w-full aspect-[2/3] bg-surface rounded-xl mb-2" 
        resizeMode="cover"
      />
      <Text className="text-primaryText font-bold text-sm" numberOfLines={1}>
        {props.title}
      </Text>
      <Text className="text-accent text-xs">
        {props.release_date?.split('-')[0]} 
      </Text>
    </TouchableOpacity>
  );
}

export default MovieCard;






/* import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { use } from 'react';
import { Movie } from './MovieList'; // (See architecture note below)
import { useRouter } from 'expo-router';

const MovieCard = (props: Movie) => {
  const router = useRouter();
  return (
    // Added some padding/margin to space out the grid
    <TouchableOpacity className="flex-1 m-2" onPress={() => router.push(`/movies/${props.id}`)}> 
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
        {props.release_date?.split('-')[0]} {/* Just shows the Year! 
      }
        */
      // </Text>
    // </TouchableOpacity>
/*   );
}
 */
// export default MovieCard; */