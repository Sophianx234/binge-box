import { Tabs } from 'expo-router';
import IonIcons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        
        // --- MIDNIGHT STREAMER STYLING ---
        tabBarStyle: { 
          backgroundColor: '#172036', // Surface color: Deep Blue-Gray
          borderTopWidth: 1, 
          borderTopColor: '#2A3654', // A slightly lighter border to separate it from the deep navy background
          height: 65, 
          margin: 10,
          marginBottom: 32,
          position: 'absolute',
          borderRadius:52,
          paddingBottom: 10,
          paddingTop: 10,
          
        },
        tabBarShowLabel:false,
        tabBarActiveTintColor: '#00E5FF', // Accent color: Neon Cyan for the selected tab
        tabBarInactiveTintColor: '#8899B6', // Muted blue-gray for unselected tabs
        
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <IonIcons name="home-outline" color={color} size={size + 2} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <IonIcons name="search-outline" color={color} size={size + 2} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size }) => <IonIcons name="bookmark-outline" color={color} size={size + 2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <IonIcons name="person-outline" color={color} size={size + 2} />,
        }}
      />
    </Tabs>
  );
}