import { View } from 'react-native';
import React from 'react';
import Logo from './Logo'; 

const SplashLoader = () => {
  return (
    // Pure flex-1 with your dark background. Perfectly centered.
    <View className="flex-1 bg-background items-center justify-center">
      
      {/* The glowing animation */}
      <View className="animate-pulse scale-125">
        <Logo />
      </View>
      
    </View>
  );
};

export default SplashLoader;