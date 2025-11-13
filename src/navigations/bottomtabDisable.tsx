import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
        tabBarStyle: { backgroundColor: style.color.mainColor2 },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#c8e6c9"
      }}
    >
      <Tab.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="phone" color={color} size={size} />
          ),
          title: "ติดต่อ"
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-heart" color={color} size={size} />
          ),
          title: "หน้าหลัก"
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
          title: "โปรไฟล์"
        }}
      />
    </Tab.Navigator>
  );
}