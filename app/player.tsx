import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MoviePlayerScreen() {
  const router = useRouter();
  
  // 1. Grab all possible parameters passed from your app
  const { 
    type = 'movie', // Defaults to movie if not provided
    id,             // IMDB (tt...), TMDB, or Anilist ID
    season,         // For TV shows
    episode,        // For TV shows or Anime
    dub = '0',      // For Anime (0 = sub, 1 = dub)
    chapter         // For Manga
  } = useLocalSearchParams();

  const baseUrl = process.env.EXPO_PUBLIC_PLAYER_URL

  // 3. The Dynamic URL Builder based on Vidsrc's documentation
  let videoUrl = '';

  if (type === 'tv') {
    // TV Route: /embed/tv/{id}/{season}/{episode}
    videoUrl = season && episode 
      ? `${baseUrl}/tv/${id}/${season}/${episode}` 
      : `${baseUrl}/tv/${id}`;
  } 
  else if (type === 'anime') {
    // Anime Route: /embed/anime/{id}/{episode}/{dub}
    videoUrl = `${baseUrl}/anime/${id}/${episode}/${dub}`;
  } 
  else if (type === 'manga') {
    // Manga Route: /embed/manga/{id}/{chapter}
    videoUrl = `${baseUrl}/manga/${id}/${chapter}`;
  } 
  else {
    // Default Movie Route: /embed/movie/{id}
    videoUrl = `${baseUrl}/movie/${id}`;
  }

  // Safety Check: If no ID was passed, don't try to load an invalid URL
  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" onPress={() => router.back()} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>No media ID provided.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <Ionicons 
          name="chevron-back" 
          size={28} 
          color="#FFFFFF" 
          onPress={() => router.back()} 
        />
      </View>

      {/* The Web Player */}
      <View style={styles.playerContainer}>
        <WebView
          source={{ uri: videoUrl }}
          style={styles.webview}
          allowsFullscreenVideo={true} 
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator 
              size="large" 
              color="#00E5FF" 
              style={styles.loader} 
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', 
  },
  header: {
    padding: 16,
    zIndex: 10,
    position: 'absolute', // Makes the back button float over the video
    top: 40,
    left: 10,
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    marginTop: 80, // Gives space for the absolute header
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#8899B6',
    marginTop: 10,
    fontSize: 16,
  }
});