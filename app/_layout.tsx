import '../global.css';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/store'; // <-- Added Auth Store

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

// 1. Keep the splash screen visible while fonts load AND auth checks
SplashScreen.preventAutoHideAsync();

// 2. Initialize React Query OUTSIDE the component so it doesn't reset on re-renders
const queryClient = new QueryClient();

export default function RootLayout() {
  const { token, checkTokenAtStartup } = useAuthStore();
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();

  // 3. Load the fonts
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

  // 4. Check Secure Storage for the Token
  useEffect(() => {
    const initAuth = async () => {
      await checkTokenAtStartup();
      setIsAuthReady(true);
    };
    initAuth();
  }, []);

  // 5. The "Bouncer" Logic (Route Protection)// 5. The "Bouncer" Logic (Route Protection)
  useEffect(() => {
    // Don't route anyone until BOTH fonts and auth are ready
    if (!isAuthReady || (!fontsLoaded && !error)) return;

    // Expo Router makes this easy: if they are anywhere inside the (auth) folder, segments[0] is '(auth)'
    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      // No token and NOT in the auth group? Kick them to the sign-in screen
      router.replace('/(auth)/signin');
    } else if (token && inAuthGroup) {
      // Already have a token but trying to view auth screens? Send them into the main app
      router.replace('/(tabs)');
    }
  }, [token, isAuthReady, fontsLoaded, segments]);

  // 6. Hide the splash screen ONLY when everything is ready
  useEffect(() => {
    if ((fontsLoaded || error) && isAuthReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error, isAuthReady]);

  // 7. Render nothing until we are fully ready
  if (!isAuthReady || (!fontsLoaded && !error)) {
    return null;
  }

  // 8. Render your app with all wrappers intact
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack screenOptions={{headerShown:false}}>
            {/* Main App Routes */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="movies" options={{ headerShown: false }} />
            
            {/* Auth Routes */}
            <Stack.Screen name="(auth)/signin" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="(auth)/signup" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false, animation: 'fade' }} />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}