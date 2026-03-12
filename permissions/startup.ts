import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';

export function useStartupPermissions() {
  useEffect(() => {
    async function requestPermissions() {
      // 1. Request Notification Permissions
      const { status: existingNotifStatus } = await Notifications.getPermissionsAsync();
      
      // If 'undetermined', it means the user has never been asked before
      if (existingNotifStatus !== 'granted') {
        await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
      }

      // 2. Request Media Library Permissions (For Avatars / Saving Images)
      if (Platform.OS !== 'web') {
        const { status: existingMediaStatus } = await MediaLibrary.getPermissionsAsync();
        
        if (existingMediaStatus !== 'granted') {
          await MediaLibrary.requestPermissionsAsync();
        }
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
  }),
});