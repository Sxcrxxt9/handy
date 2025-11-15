import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../navigations/navigator";
import Header from "../../../assets/constants/header";
import style from "../../../assets/style";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { apiFetch } from "../../utils/apiClient";
import { ensurePushTokenSynced } from "../../utils/notifications";

type LoginDisableScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "LoginDisable"
>;

type ProfileResponse = {
  user: {
    type: string;
  } & Record<string, any>;
};

export default function LoginDisable() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginDisableScreenProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const emailContainerRef = useRef<View>(null);
  const passwordContainerRef = useRef<View>(null);
  const contentRef = useRef<View>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Alert", "Please enter your email and password");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Alert", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await signInWithEmailAndPassword(auth, normalizedEmail, password);

      const data = await apiFetch<ProfileResponse>("/auth/me");

      if (data.user?.type !== "disabled") {
        Alert.alert("Alert", "This account is not registered as disabled");
        return;
      }

      await ensurePushTokenSynced();
      await AsyncStorage.setItem("currentUser", JSON.stringify(data.user));
      navigation.replace("MainDisable");
    } catch (error: any) {
      if (error.code === "auth/invalid-credential" || error.code === "auth/invalid-email") {
        Alert.alert("Alert", "Invalid email or password");
      } else if (error.code === "auth/user-disabled") {
        Alert.alert("Alert", "This user account has been disabled");
      } else if (error.code === "auth/user-not-found") {
        Alert.alert("User Not Found", "Please register before logging in");
      } else {
        Alert.alert("Error", error.message || "Unable to log in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("RegisterDisable" as never);
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotDisable" as never);
  };

  const handleInputFocus = (containerRef: React.RefObject<View | null>) => {
    setTimeout(() => {
      if (containerRef.current && contentRef.current && scrollViewRef.current) {
        containerRef.current.measureLayout(
          contentRef.current,
          (x, y, width, height) => {
            const scrollOffset = y - 150;
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, scrollOffset),
              animated: true,
            });
          },
          () => {
            // Fallback: scroll down a bit
            scrollViewRef.current?.scrollTo({
              y: 150,
              animated: true,
            });
          }
        );
      }
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <Header title="Login" />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Login" as never)}>
        <MaterialIcons name="arrow-back-ios" size={24} color="#000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        bounces={false}
      >
        <View ref={contentRef} style={styles.content}>
          <Text style={styles.title}>Welcome to Handy</Text>
          <Text style={styles.subtitle}>Login to continue</Text>

          <View 
            ref={emailContainerRef}
            style={styles.inputContainer}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="#777"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => handleInputFocus(emailContainerRef)}
            />
          </View>

          <View 
            ref={passwordContainerRef}
            style={styles.inputContainer}
          >
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color="#777"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => handleInputFocus(passwordContainerRef)}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.linkText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 120,
    paddingBottom: 100,
    minHeight: "100%",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: style.color.mainColor2,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 8,
    width: "100%",
    elevation: 2,
  },
  icon: {
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#333",
  },
  loginButton: {
    backgroundColor: style.color.mainColor2,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    elevation: 3,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    width: "100%",
  },
  linkText: {
    color: style.color.mainColor2,
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    position: "absolute",
    top: 40,
    left: 15,
    zIndex: 10,
    marginTop: 90,
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    color: "#000",
  },
});