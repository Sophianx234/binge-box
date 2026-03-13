import React, { useRef, useState, useCallback } from 'react';
import { View, Animated, RefreshControl, Pressable, ActivityIndicator, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaList } from '@/api/services';

import Logo from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import MovieRow from '@/components/MovieList'; 
import HeroBillboard from '@/components/HeroBillboard';
import TopTenRow from '@/components/TopTenRow';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import StudioHubs from '@/components/StudioHubs';
import ComingSoonRow from '@/components/ComingSoonRow';
import BecauseYouWatchedRow from '@/components/BecauseYouWatchedRow';
import GenreList from '@/components/GenreList'; 
import MyListRow from '@/components/MyListRow';
import TimeContextRow from '@/components/TimeContextRow';
import ShortsRow from '@/components/ShortsRow';
import SplashLoader from '@/components/SplashLoader';
import TrendingStarsRow from '@/components/TrendingStarRow';
import LiveChannelsRow from '@/components/LiveChannelRow';

export default function Home() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150], 
    outputRange: [1, 0], 
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -50], 
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95], 
    extrapolate: 'clamp',
  });

  const { data: trending = [], isLoading, refetch } = useQuery({
    queryKey: ['trendingAllDay'],
    queryFn: () => fetchMediaList('/trending/all/day'),
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch(); 
    } catch (error) {
      console.log("Error refreshing:", error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    }
  }, [refetch]);

  const handleLogoTap = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    onRefresh();
  };

  if (isLoading) {
    return <SplashLoader />;
  }

  return (
    <View className="flex-1 bg-background">
      
      {/* THE FLOATING HEADER */}
      <Animated.View 
        pointerEvents="box-none" 
        className="absolute top-0 left-0 right-0 z-50 pb-2"
        style={{ 
          paddingTop: Math.max(insets.top, 10),
          opacity: headerOpacity,
          transform: [
            { translateY: headerTranslateY },
            { scale: headerScale }
          ]
        }}
      >
        <Pressable 
          onPress={handleLogoTap} 
          className="active:opacity-70"
        >
          <Logo />
        </Pressable>
        
        <SearchBar />
      </Animated.View>

      {/* --- THE NEW FIX: THE FLOATING UPDATE PILL --- */}
      {/* This will appear perfectly in the center, just below the search bar when refreshing */}
      {/* --- THE FIX: X-STYLE TOP FLOATING PILL --- */}
      {refreshing && (
        <View 
          // z-[60] ensures it hovers OVER your z-50 floating header
          className="absolute left-0 right-0 z-[60] items-center" 
          // Sits right at the very top of the screen (just under the notch/status bar)
          style={{ top: Math.max(insets.top, 10) + 5 }} 
        >
          {/* Made the background slightly darker so it pops perfectly over the header */}
          <View className="bg-[#1A2235] border border-[#00E5FF]/50 px-5 py-2.5 rounded-full flex-row items-center shadow-2xl">
            <ActivityIndicator size="small" color="#00E5FF" />
            <Text className="text-white ml-3 font-bold text-xs uppercase tracking-widest">
              Updating...
            </Text>
          </View>
        </View>
      )}

      <Animated.ScrollView 
        ref={scrollViewRef} 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true } 
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="transparent" // We hide the buggy native spinner entirely!
            colors={['transparent']} 
            progressBackgroundColor="transparent"
          />
        }
      >
        
        <View className="pb-6"> 
          {trending.length > 0 && (
            <View>
              <HeroBillboard movies={trending.slice(0, 5)} />
            </View>
          )}

          <View className="mt-6 mb-2">
            <GenreList />
          </View>
          
          <MyListRow movies={trending.slice(4, 9)} />
          <TimeContextRow/>
          
          <View className="flex-col gap-y-4">
            {trending.length > 1 && <ContinueWatchingRow data={trending.slice(1, 6)} />}
            {trending.length > 0 && <TopTenRow data={trending} />}
            <StudioHubs />
            <TrendingStarsRow />
            <ShortsRow />
            <LiveChannelsRow />
            <ComingSoonRow />
            
            {trending.length > 2 && (
              <BecauseYouWatchedRow 
                movieId={trending[2].id} 
                movieTitle={trending[2].title || trending[2].name} 
              />
            )}
          </View>
        </View>

        <MovieRow title="Trending This Week" endpointPath="/trending/all/week" />
        <MovieRow title="Popular Movies" endpointPath="/movie/popular" defaultMediaType="movie" />
        <MovieRow title="Popular TV Shows" endpointPath="/tv/popular" defaultMediaType="tv" />
        <MovieRow title="Top Rated Movies" endpointPath="/movie/top_rated" defaultMediaType="movie" />
        
      </Animated.ScrollView>
    </View>
  );
}