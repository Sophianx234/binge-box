import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';

export function useStartupPermissions() {
  useEffect(() => {
    async function requestPermissions() {
      try {
        // 1. Request Notification Permissions
        const notifResponse = await Notifications.getPermissionsAsync();
        
        // ONLY ask if we are allowed to ask (undetermined or canAskAgain)
        if (notifResponse.status !== 'granted' && notifResponse.canAskAgain) {
          await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
            },
          });
        }

        // 2. Request Media Library Permissions
        if (Platform.OS !== 'web') {
          const mediaResponse = await MediaLibrary.getPermissionsAsync();
          
          if (mediaResponse.status !== 'granted' && mediaResponse.canAskAgain) {
            await MediaLibrary.requestPermissionsAsync();
          }
        }
      } catch (error) {
        console.warn("Failed to request permissions on startup:", error);
        // The app will continue loading safely even if permissions fail!
      }
    }

    requestPermissions();
  }, []);
}

// Set up background notification handling behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // <-- ADDED: Fixes the TypeScript Error
    shouldShowList: true,   // <-- ADDED: Fixes the TypeScript Error
  }),
});