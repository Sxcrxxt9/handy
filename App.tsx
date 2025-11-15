import { useEffect, useRef } from "react";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
import AppNavigator from "./src/navigations/navigator";
import { ensurePushTokenSynced } from "./src/utils/notifications";
import { getNotificationListener, getNotificationResponseListener } from "./src/config/notifications";
import { RootStackParamList } from "./src/navigations/navigator";

export default function App() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    ensurePushTokenSynced().catch((error) => {
      console.warn("Failed to register push notifications", error);
    });

    notificationListener.current = getNotificationListener((notification) => {
      const data = notification.request.content.data;
      
      // Handle case accepted notification
      if (data?.type === 'case_accepted') {
        Alert.alert(
          'มีอาสาสมัครรับเคสของคุณ',
          notification.request.content.body || 'มีอาสาสมัครรับเคสของคุณแล้ว กรุณารอการช่วยเหลือ',
          [
            {
              text: 'ดูรายละเอียด',
              onPress: () => {
                if (navigationRef.current?.isReady()) {
                  navigationRef.current.navigate('MyReports' as never);
                }
              },
            },
            { text: 'ตกลง', style: 'default' },
          ]
        );
      }
    });

    responseListener.current = getNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      
      if (data?.type === 'case_accepted') {
        if (navigationRef.current?.isReady()) {
          navigationRef.current.navigate('MyReports' as never);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
}

