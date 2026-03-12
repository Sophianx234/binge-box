import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MoviePlayerScreen() {
  const router = useRouter();
  
  // The Vidsrc URL you found (IMDB ID: tt17048514)
  const videoUrl = 'https://vidsrc.icu/embed/movie/tt17048514';

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
          allowsFullscreenVideo={true} // Crucial so they can rotate their phone!
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
    backgroundColor: '#000000', // Pitch black for the theater experience
  },
  header: {
    padding: 16,
    zIndex: 10, // Keeps the back button above the video
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }], // Center it
  }
});