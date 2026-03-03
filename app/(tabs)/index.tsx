import Logo from '@/components/Logo';
import MovieRow from '@/components/MovieList';
import MovieList from '@/components/MovieList';
import SearchBar from '@/components/SearchBar';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      {/* 1. Logo stays at the top */}
      <Logo />

      {/* 2. SearchBar sits right below the logo (added a little margin bottom to space it out) */}
      <View className="mb-4">
        <SearchBar />
      </View>

      {/* 3. MovieList is a direct child and has flex-1 inside its own code, 
             so it will perfectly fill the rest of the screen! */}
      <ScrollView showsVerticalScrollIndicator={false} className=" flex-1 ">
        <MovieRow title="Popular Movies" endpointParam="popular" />
        <MovieRow title="Top Rated Movies" endpointParam="top" />
        <MovieRow title="Upcoming Movies" endpointParam="upcoming" />
        {/* Row 1: The Heavy Hitters */}
        <MovieRow title="Trending Today" endpointParam="/trending" />
        
        {/* Row 2: Fresh Content */}
        <MovieRow title="Horror" endpointParam="evil" />
        
        {/* Row 3: Critics Choice */}
        <MovieRow title="Top Rated of All Time" endpointParam="avengers" />

        {/* Row 4: Anticipated */}
        <MovieRow title="Coming Soon" endpointParam="city" />

        {/* Row 5: Genre - Action (ID: 28) */}
        <MovieRow title="Adrenaline Rush" endpointParam="anime" />

        {/* Row 6: Genre - Comedy (ID: 35) */}
        <MovieRow title="Laugh Out Loud" endpointParam="full" />

        {/* Row 7: Genre - Horror (ID: 27) */}
        <MovieRow title="Don't Watch Alone" endpointParam="african" />

        {/* Row 8: Genre - Sci-Fi (ID: 878) */}
        <MovieRow title="Space & Sci-Fi" endpointParam="civil" />

        {/* Row 9: Genre - Animation (ID: 16) */}
        <MovieRow title="Animated Favorites" endpointParam="money" />

        {/* Row 10: Trending Weekly */}
        <MovieRow title="Best of the Week" endpointParam="heist" />

        {/* Extra Padding for Bottom Tabs */}
        <View className="h-28" />
      </ScrollView>
    </SafeAreaView>
  );
}
