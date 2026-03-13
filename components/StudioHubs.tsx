import { View, Pressable, Image, ScrollView, Text } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const hubs = [
  // --- WESTERN MAJORS ---
  { 
    id: 213, 
    name: 'NETFLIX', 
    color1: '#E50914', color2: '#8E050C',
    logo: 'https://image.tmdb.org/t/p/w300/wwemzKWzjKYJFfCeiB57q3r4Bcm.png',
    tint: true, fontStyle: { fontWeight: '900', letterSpacing: 2, fontSize: 18 } as any
  },
  { 
    id: 49, 
    name: 'HBO', 
    color1: '#5A2E85', color2: '#32194B',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/512px-HBO_logo.svg.png',
    tint: true, fontStyle: { fontWeight: 'bold', letterSpacing: 4, fontSize: 22 } as any
  },
  { 
    id: 2739, 
    name: 'DISNEY+', 
    color1: '#006E99', color2: '#00364C',
    logo: 'https://res.cloudinary.com/dtytb8qrc/image/upload/v1773403280/disney_cd9gtb.png',
    tint: true, fontStyle: { fontWeight: '600', fontStyle: 'italic', letterSpacing: 1, fontSize: 20 } as any
  },
  { 
    id: 420, 
    name: 'MARVEL', 
    color1: '#ED1D24', color2: '#7A0E12',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Marvel_Logo.svg/512px-Marvel_Logo.svg.png', 
    tint: false, fontStyle: { fontWeight: '900', letterSpacing: -1, fontSize: 20 } as any
  },
  { 
    id: 97, 
    name: 'DC', 
    color1: '#0476F2', color2: '#002554',
    logo: '', // No logo provided, will trigger our beautiful text fallback!
    tint: true, fontStyle: { fontWeight: '900', letterSpacing: 3, fontSize: 26 } as any
  },
  { 
    id: 1024, 
    name: 'PRIME', 
    color1: '#00A8E1', color2: '#004771',
    logo: '', 
    tint: true, fontStyle: { fontWeight: 'bold', letterSpacing: 2, fontSize: 20 } as any
  },
  { 
    id: 4, name: 'PARAMOUNT', color1: '#0064B0', color2: '#002244', logo: '', 
    tint: true, fontStyle: { fontWeight: '600', fontStyle: 'italic', letterSpacing: 1, fontSize: 12 } as any
  },
  { 
    id: 3, name: 'PIXAR', color1: '#4B9CD3', color2: '#13294B', logo: '', 
    tint: true, fontStyle: { fontWeight: '600', letterSpacing: 5, fontSize: 18 } as any
  },

  // --- ANIME MAJORS ---
  { 
    id: 111, 
    name: 'CRUNCHYROLL', 
    color1: '#F47521', color2: '#B85010', // Iconic Crunchyroll Orange
    logo: '', 
    tint: true, fontStyle: { fontWeight: '900', letterSpacing: 0, fontSize: 10 } as any
  },
  { 
    id: 103, 
    name: 'STUDIO GHIBLI', 
    color1: '#84BEEA', color2: '#286295', // Serene Ghibli Sky Blue
    logo: '', 
    tint: true, fontStyle: { fontWeight: '500', letterSpacing: 1, fontSize: 13, textAlign: 'center' } as any
  },
  { 
    id: 569, 
    name: 'MAPPA', 
    color1: '#222222', color2: '#000000', // Sleek Mappa Black/Gray
    logo: '', 
    tint: true, fontStyle: { fontWeight: '900', letterSpacing: 4, fontSize: 20 } as any
  },
];

const HubTile = ({ hub }: { hub: any }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Pressable className="w-32 h-20 rounded-xl overflow-hidden border border-[#1A2235]">
      <LinearGradient
        colors={[hub.color2, hub.color1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
      >
        {hub.logo && !imageError ? (
          <Image 
            source={{ uri: hub.logo }}
            resizeMode="contain"
            style={{ 
              width: '70%', 
              height: '50%', 
              tintColor: hub.tint ? '#FFFFFF' : undefined 
            }} 
            onError={() => setImageError(true)}
          />
        ) : (
          <Text 
            className="text-white shadow-lg text-center px-2" 
            style={hub.fontStyle || { fontWeight: 'bold', fontSize: 16 }}
          >
            {hub.name}
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  );
};

const StudioHubs = () => {
  return (
    <View className="mt-8 mb-4">
      <Text className="text-white text-xl font-bold px-5 mb-4">Explore by Studio</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {hubs.map((hub) => (
          <HubTile key={hub.id} hub={hub} />
        ))}
      </ScrollView>
    </View>
  );
};

export default StudioHubs;