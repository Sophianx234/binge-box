import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/store';
import { logWatchProgress, getSpecificProgress } from '@/api/services';

export default function MoviePlayerScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token) as string;
  
  // 1. Grab parameters
  const { 
    type = 'movie', 
    id,             // Used for WebView (e.g., "tt1234567")
    tmdbId,         // Used for the database (e.g., "550")
    season,         
    episode,        
    dub = '0',      
    chapter,
    title,          
    posterPath,     
    runtime         
  } = useLocalSearchParams();

  const baseUrl = process.env.EXPO_PUBLIC_PLAYER_URL;

  // --- SAFE DB ID ---
  const dbId = Number(tmdbId || id);

  // --- PROGRESS TRACKING STATE ---
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const latestSecondsRef = useRef(0); // Holds the exact second they leave

  // 1. FETCH PREVIOUS PROGRESS ON MOUNT
  useEffect(() => {
    if (!dbId || !token || isNaN(dbId)) return;

    const fetchPreviousProgress = async () => {
      try {
        const progress = await getSpecificProgress(
          token, 
          dbId, 
          season ? Number(season) : undefined, 
          episode ? Number(episode) : undefined
        );
        if (progress?.stoppedAtSeconds) {
          setElapsedSeconds(progress.stoppedAtSeconds);
          latestSecondsRef.current = progress.stoppedAtSeconds;
        }
      } catch (error) {
        console.log("No previous progress found.");
      }
    };

    fetchPreviousProgress();
  }, [dbId, season, episode, token]);

  // 2. THE TICKER (Counts silently while screen is open)
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newTime = prev + 1;
        latestSecondsRef.current = newTime; // Keep the ref perfectly in sync
        return newTime;
      });
    }, 1000); 

    return () => clearInterval(timer);
  }, []);

  // 3. THE UNMOUNT SYNC (Fires ONLY when leaving the player)
  useEffect(() => {
    // The empty return function acts as a "componentWillUnmount" lifecycle hook
    return () => {
      const finalSeconds = latestSecondsRef.current;
      
      // Only save if they actually watched something and the params are valid
      if (finalSeconds > 0 && dbId && !isNaN(dbId) && title) {
        console.log(`User left player. Saving progress: ${finalSeconds}s`);
        
        logWatchProgress(token, {
          tmdbId: dbId,
          mediaType: type as string,
          title: title as string,
          posterPath: posterPath as string || null,
          seasonNumber: season ? Number(season) : undefined,
          episodeNumber: episode ? Number(episode) : undefined,
          stoppedAtSeconds: finalSeconds,
          totalDurationSeconds: runtime ? Number(runtime) * 60 : undefined,
        }).catch(err => console.error("Failed to sync final progress:", err));
      }
    };
    // Notice we removed elapsedSeconds from this array!
    // These params don't change while watching, so this effect runs exactly once.
  }, [dbId, title, type, posterPath, season, episode, runtime, token]);


  // --- URL BUILDER ---
  let videoUrl = '';
  if (type === 'tv') {
    videoUrl = season && episode ? `${baseUrl}/tv/${id}/${season}/${episode}` : `${baseUrl}/tv/${id}`;
  } else if (type === 'anime') {
    videoUrl = `${baseUrl}/anime/${id}/${episode}/${dub}`;
  } else if (type === 'manga') {
    videoUrl = `${baseUrl}/manga/${id}/${chapter}`;
  } else {
    videoUrl = `${baseUrl}/movie/${id}`;
  }

  // Safety Check
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
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={28} color="#FFFFFF" onPress={() => router.back()} />
      </View>

      <View style={styles.playerContainer}>
        <WebView
          source={{ uri: videoUrl }}
          style={styles.webview}
          allowsFullscreenVideo={true} 
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator size="large" color="#00E5FF" style={styles.loader} />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { padding: 16, zIndex: 10, position: 'absolute', top: 40, left: 10 },
  playerContainer: { flex: 1, backgroundColor: '#000000', marginTop: 80 },
  webview: { flex: 1, backgroundColor: '#000000' },
  loader: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -18 }, { translateY: -18 }] },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#8899B6', marginTop: 10, fontSize: 16 }
});