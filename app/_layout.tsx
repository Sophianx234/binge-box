import '../global.css';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import all 14 fonts
import { ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import { Barlow_400Regular } from '@expo-google-fonts/barlow';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { CaveatBrush_400Regular } from '@expo-google-fonts/caveat-brush';
import { ConcertOne_400Regular } from '@expo-google-fonts/concert-one';
import { GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import { Inter_400Regular } from '@expo-google-fonts/inter';
import { Lato_400Regular } from '@expo-google-fonts/lato';
import { Lobster_400Regular } from '@expo-google-fonts/lobster';
import { Orbitron_400Regular } from '@expo-google-fonts/orbitron';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Parisienne_400Regular } from '@expo-google-fonts/parisienne';
import { RubikMonoOne_400Regular } from '@expo-google-fonts/rubik-mono-one';
import { Sacramento_400Regular } from '@expo-google-fonts/sacramento';

// 1. Keep the splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient();
  // 2. Load the fonts
  const [fontsLoaded, error] = useFonts({
    ArchivoBlack_400Regular,
    Barlow_400Regular,
    BebasNeue_400Regular,
    CaveatBrush_400Regular,
    ConcertOne_400Regular,
    GreatVibes_400Regular,
    Inter_400Regular,
    Lato_400Regular,
    Lobster_400Regular,
    Orbitron_400Regular,
    Pacifico_400Regular,
    Parisienne_400Regular,
    RubikMonoOne_400Regular,
    Sacramento_400Regular,
  });

  // 3. Hide the splash screen once fonts are ready
  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  // 4. Return null to keep the splash screen up if not loaded
  if (!fontsLoaded && !error) {
    return null;
  }

  // 5. Render your app with all wrappers intact
  return (
    <QueryClientProvider client={queryClient}>

    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
    </QueryClientProvider>
  );
}