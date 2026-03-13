import { View, Dimensions } from 'react-native';
import React from 'react';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.55; 

const HomeSkeleton = () => {
  return (
    <View className="flex-1 bg-background pb-11">
      
      {/* 1. HERO BILLBOARD SKELETON */}
      {/* Simulates the 70% height image and the text/buttons at the bottom */}
      <View style={{ width, height: HERO_HEIGHT  }} className="bg-[#09090B] justify-end pb-12 px-6">
        {/* Title Placeholder */}
        <View className="w-3/4 h-12 bg-[#1A2235] rounded-xl self-center mb-6 animate-pulse" />
        
        {/* Subtitle/Overview Placeholders */}
        <View className="w-full h-4 bg-[#1A2235] rounded-full mb-3 animate-pulse" />
        <View className="w-5/6 h-4 bg-[#1A2235] rounded-full self-center mb-8 animate-pulse" />
        
        {/* Button Placeholders */}
        <View className="flex-row gap-4">
          <View className="flex-1 h-12 bg-[#1A2235] rounded-xl animate-pulse" />
          <View className="flex-1 h-12 bg-[#1A2235] rounded-xl animate-pulse" />
        </View>
      </View>

      {/* 2. GENRE PILLS SKELETON */}
      <View className="mt-6 mb-2 px-5 flex-row gap-3 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="w-24 h-10 rounded-full bg-[#1A2235] animate-pulse" />
        ))}
      </View>

      {/* 3. STANDARD POSTER ROW SKELETONS */}
      {/* We draw two fake rows to fill up the rest of the screen */}
      {[1, 2].map((row) => (
        <View key={row} className="mt-8">
          {/* Row Title Placeholder */}
          <View className="w-40 h-6 bg-[#1A2235] rounded-full ml-5 mb-4 animate-pulse" />
          
          {/* Row Posters Placeholder */}
          <View className="flex-row px-5 gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((col) => (
              <View key={col} className="w-28 h-40 bg-[#1A2235] rounded-lg animate-pulse" />
            ))}
          </View>
        </View>
      ))}
      
    </View>
  );
};

export default HomeSkeleton;