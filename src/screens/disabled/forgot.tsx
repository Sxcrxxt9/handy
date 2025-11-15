import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {MaterialCommunityIcons,MaterialIcons} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigations/navigator";
import Header from "../../../assets/constants/header";
import style from "../../../assets/style";
import { auth } from "../../config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

type ForgotDisableScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "ForgotDisable"
>;

export default function ForgotDisable() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<ForgotDisableScreenProp>();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Alert", "Please enter your email");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Alert", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      Alert.alert(
        "Success",
        "We have sent a password reset link to your email",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      Alert.alert(
        "Error",
        error.message || "Unable to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
    >
      <Header title="forgotpassword" />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Login" as never)}>
        <MaterialIcons name="arrow-back-ios" size={24} color="#000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
        Please enter your email address
        </Text>

        <View style={styles.inputContainer}>
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
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleForgotPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {/* <MaterialCommunityIcons name="email-send" size={24} color="#fff" /> */}
              <MaterialCommunityIcons name="email-arrow-right" size={24} color="#fff" />
              <Text style={styles.buttonText}>send</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Remember your password? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("LoginDisable" as never)}
          >
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
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
    textAlign: "center",
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
  icon: { marginRight: 5 },
  input: { flex: 1, height: 45, fontSize: 16, color: "#333" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: style.color.mainColor2,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loginContainer: { flexDirection: "row", marginTop: 20 },
  loginText: { fontSize: 14, color: "#555" },
  loginLink: {
    fontSize: 14,
    color: style.color.mainColor2,
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
    color: "#000" },
});