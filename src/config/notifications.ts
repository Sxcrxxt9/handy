import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getProjectId = () => {
  const expoConfig = Constants?.expoConfig ?? (Constants as any)?.manifest;
  const easProjectId =
    expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
    null;

  if (!easProjectId) {
    console.warn(
      '[notifications] Unable to resolve EAS projectId. ' +
        'Ensure it is defined in app.json extra.eas.projectId'
    );
  }

  return easProjectId;
};

const configureAndroidChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: 'default',
    enableVibrate: true,
    enableLights: true,
  });
};

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  try {
    if (!Device.isDevice) {
      console.warn('[notifications] Push notifications are not supported on simulators');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[notifications] Push notification permissions not granted');
      return null;
    }

    await configureAndroidChannel();

    const projectId = getProjectId();
    const pushToken = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    return pushToken.data;
  } catch (error) {
    console.error('[notifications] Failed to register for push notifications', error);
    return null;
  }
};

export const getNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => Notifications.addNotificationResponseReceivedListener(callback);

export const getNotificationListener = (
  callback: (event: Notifications.Notification) => void
) => Notifications.addNotificationReceivedListener(callback);

