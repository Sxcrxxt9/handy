import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View, Text } from "react-native";
import style from "../../assets/style/index";

import HomeScreen from "../screens/disabled/mainScreen";
import ContactScreen from "../screens/disabled/contactScreen";
import ProfileScreen from "../screens/disabled/profileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabsDisable() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: style.color.mainColor2,
          borderTopLeftRadius: 25,
          borderTopRightRadius:25,
          height: 70,
          paddingBottom: 8,
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 5,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#dcedc8"
      }}
    >
      <Tab.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="phone" color={color} size={28} />
          ),
          title: "Contact"
        }}
      />

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-heart" color={color} size={28} />
          ),
          title: "Home"
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={28} />
          ),
          title: "Profile"
        }}
      />
    </Tab.Navigator>
  );
}
