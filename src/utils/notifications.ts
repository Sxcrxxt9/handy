import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '../config/notifications';
import { apiFetch, ApiError } from './apiClient';

const TOKEN_STORAGE_KEY = '@handy/expoPushToken';

export const ensurePushTokenSynced = async (): Promise<string | null> => {
  const token = await registerForPushNotificationsAsync();

  if (!token) {
    return null;
  }

  const cachedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (cachedToken === token) {
    return token;
  }

  try {
    await apiFetch('/notifications/token', {
      method: 'POST',
      body: JSON.stringify({
        token,
        platform: Platform.OS,
      }),
    });

    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return token;
    }

    console.warn('[notifications] Failed to sync push token', error);
    throw error;
  }

  return token;
};

export const clearCachedPushToken = async () => {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
};

