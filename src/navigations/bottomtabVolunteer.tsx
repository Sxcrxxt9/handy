import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import style from "../../assets/style/index";
import HomeScreen from "../screens/volunteer/mainScreen";
import ContactScreen from "../screens/volunteer/contactScreen";
import ProfileScreen from "../screens/volunteer/profileScreen";

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
          backgroundColor: style.color.mainColor1,
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
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="phone" color={color} size={size} />
          ),
          title: "Contact"
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-heart" color={color} size={size} />
          ),
          title: "Home"
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
          title: "Profile"
        }}
      />
    </Tab.Navigator>
  );
}