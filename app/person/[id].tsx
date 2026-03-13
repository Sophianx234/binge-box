import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchPersonDetails, fetchPersonCredits } from '@/api/services';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/store';

const { height } = Dimensions.get('window');

export default function PersonProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 1. PULL THE TOKEN FROM ZUSTAND
  // Using a selector (state => state.token) prevents unnecessary re-renders!
  const token = useAuthStore((state) => state.token);

  // 2. PASS THE TOKEN TO YOUR QUERIES
  const { data: person, isLoading: bioLoading } = useQuery({
    // Add token to the queryKey so it refetches if the user logs in/out
    queryKey: ['personDetails', id, token], 
    queryFn: () => fetchPersonDetails(id as string),
  });

  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ['personCredits', id, token],
    queryFn: () => fetchPersonCredits(id as string),
  });

  if (bioLoading || creditsLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  // If there is no token yet, or no person data, just return null or a fallback
  if (!person) return null;

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1" bounces={false}>
        
        {/* --- 1. THE PROFILE PORTRAIT --- */}
        <View style={{ height: height * 0.55 }} className="w-full relative bg-[#09090B]">
          <Image
            source={{ 
              uri: person.profile_path 
                ? `https://image.tmdb.org/t/p/original${person.profile_path}`
                : 'https://via.placeholder.com/500x750?text=No+Photo'
            }}
            className="w-full h-full absolute inset-0"
            resizeMode="cover"
          />
          
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            className="absolute top-0 inset-x-0 h-32"
          />

          <LinearGradient
            colors={['transparent', 'rgba(9,9,11,0.8)', '#09090B']}
            className="absolute bottom-0 inset-x-0 h-48"
          />

          {/* Back Button */}
          <Pressable 
            onPress={() => router.back()}
            style={{ top: Math.max(insets.top, 10) + 10 }}
            className="absolute left-5 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 items-center justify-center z-50"
          >
            <Ionicons name="chevron-back" size={24} color="white" className="mr-0.5" />
          </Pressable>
        </View>

        {/* --- 2. BIOGRAPHY SECTION --- */}
        <View className="-mt-20 px-5 z-10">
          <Text className="text-white text-4xl font-black tracking-tighter mb-1">
            {person.name}
          </Text>
          
          <Text className="text-[#00E5FF] font-bold text-sm uppercase tracking-widest mb-6">
            {person.known_for_department} • {person.place_of_birth || 'Unknown'}
          </Text>

          <Text className="text-white text-lg font-bold mb-3">Biography</Text>
          <Text className="text-[#8899B6] leading-6 text-[15px] mb-8">
            {person.biography ? person.biography : `We don't have a biography for ${person.name} yet.`}
          </Text>
        </View>

        {/* --- 3. FILMOGRAPHY (Their Movies) --- */}
        {credits && credits.length > 0 && (
          <View className="pb-12">
            <Text className="text-white text-xl font-bold px-5 mb-4">Known For</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              data={credits.sort((a: any, b: any) => b.popularity - a.popularity).slice(0, 15)}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item }) => (
                <Pressable 
                  onPress={() => router.push({ pathname: '/movies/[id]', params: { id: item.id, type: item.media_type || 'movie' } })}
                  className="w-28 h-40 rounded-lg overflow-hidden border border-[#1A2235] bg-surface"
                >
                  <Image 
                    source={{ 
                      uri: item.poster_path 
                        ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                        : 'https://via.placeholder.com/300x450?text=No+Poster'
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </Pressable>
              )}
            />
          </View>
        )}

      </ScrollView>
    </View>
  );
}