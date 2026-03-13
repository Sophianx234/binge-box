import React, { useRef } from 'react';
import { View, ActivityIndicator, Animated } from 'react-native';
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
import TrendingStarsRow from '@/components/TrendingStarRow';
import MyListRow from '@/components/MyListRow';
import TimeContextRow from '@/components/TimeContextRow';
import ShortsRow from '@/components/ShortsRow';
import LiveChannelsRow from '@/components/LiveChannelRow';

export default function Home() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // 1. The entire header fades out completely
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150], 
    outputRange: [1, 0], // Fades from 100% visible to 0% (invisible)
    extrapolate: 'clamp',
  });

  // 2. The entire header slides up and off the screen
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -50], // Slides UP by 50 pixels
    extrapolate: 'clamp',
  });

  // 3. The entire header shrinks slightly as it disappears
  const headerScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95], 
    extrapolate: 'clamp',
  });

  const { data: trending = [], isLoading } = useQuery({
    queryKey: ['trendingAllDay'],
    queryFn: () => fetchMediaList('/trending/all/day'),
  });

  return (
    <View className="flex-1 bg-background">
      
      {/* --- THE FLOATING HEADER --- */}
      {/* We apply the animations to this main wrapper so EVERYTHING disappears */}
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
        <Logo />
        <SearchBar />
      </Animated.View>

      {/* --- THE MAIN SCROLL CONTENT --- */}
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true } 
        )}
        scrollEventThrottle={16} 
      >
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#00E5FF" className="mt-40 mb-20" />
        ) : (
          <View className="pb-6"> 
            
            {/* HERO BILLBOARD */}
            {trending.length > 0 && (
              <View>
                <HeroBillboard movies={trending.slice(0, 5)} />
              </View>
            )}

            {/* GENRE LIST */}
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
        )}

        <MovieRow title="Trending This Week" endpointPath="/trending/all/week" />
        <MovieRow title="Popular Movies" endpointPath="/movie/popular" defaultMediaType="movie" />
        <MovieRow title="Popular TV Shows" endpointPath="/tv/popular" defaultMediaType="tv" />
        <MovieRow title="Top Rated Movies" endpointPath="/movie/top_rated" defaultMediaType="movie" />
        
      </Animated.ScrollView>
    </View>
  );
}