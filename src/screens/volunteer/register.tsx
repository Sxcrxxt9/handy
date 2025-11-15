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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../config/firebase";
import { apiFetch } from "../../utils/apiClient";

type RegisterVolunteerScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "RegisterVolunteer"
>;

type RegisterResponse = {
  user: {
    name?: string;
    surname?: string;
    email: string;
    tel?: string;
    type: string;
    points?: number;
    id?: string;
  };
};

export default function RegisterVolunteer() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tel, setTel] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<RegisterVolunteerScreenProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const nameContainerRef = useRef<View>(null);
  const surnameContainerRef = useRef<View>(null);
  const emailContainerRef = useRef<View>(null);
  const telContainerRef = useRef<View>(null);
  const passwordContainerRef = useRef<View>(null);

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

  const handleRegister = async () => {
    if (!name.trim() || !surname.trim() || !email.trim() || !password.trim() || !tel.trim()) {
      Alert.alert("Alert", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Alert", "Password must be at least 6 characters");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Alert", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, {
        displayName: `${name.trim()} ${surname.trim()}`.trim(),
      });

      const data = await apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          type: "volunteer",
          name: name.trim(),
          surname: surname.trim(),
          tel: tel.trim(),
        }),
      });

      await AsyncStorage.setItem("currentUser", JSON.stringify(data.user));

      Alert.alert(
        "Success",
        "Registration completed successfully",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("LoginVolunteer" as never),
          },
        ]
      );
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Alert", "This email is already in use");
      } else {
        Alert.alert("Error", error.message || "Unable to register");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <Header title="Register" />
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
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subtitle}>Please fill in the information to register</Text>

          <View 
            ref={nameContainerRef}
            style={styles.inputContainer}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={22}
              color="#777"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
              onFocus={() => handleInputFocus(nameContainerRef)}
            />
          </View>

          <View 
            ref={surnameContainerRef}
            style={styles.inputContainer}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={22}
              color="#777"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#aaa"
              value={surname}
              onChangeText={setSurname}
              onFocus={() => handleInputFocus(surnameContainerRef)}
            />
          </View>

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
            ref={telContainerRef}
            style={styles.inputContainer}
          >
            <MaterialCommunityIcons
              name="phone-outline"
              size={22}
              color="#777"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              value={tel}
              onChangeText={setTel}
              onFocus={() => handleInputFocus(telContainerRef)}
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
              placeholder="Password (at least 6 characters)"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => handleInputFocus(passwordContainerRef)}
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="account-plus" size={24} color="#fff" />
                <Text style={styles.registerText}>Register</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("LoginVolunteer" as never)}>
              <Text style={styles.loginLink}>Log In</Text>
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
    color: style.color.mainColor1,
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
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: style.color.mainColor1,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    elevation: 3,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: "#555",
  },
  loginLink: {
    fontSize: 14,
    color: style.color.mainColor1,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 10,
    marginTop: 90,
  },
  backText: { 
    fontSize: 16, 
    marginLeft: 5, 
    color: "#000" 
  },
});

