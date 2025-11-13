import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../navigations/navigator";
import Header from "../../../assets/constants/header";
import style from "../../../assets/style";

type LoginDisableScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "LoginDisable"
>;

export default function LoginDisable() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginDisableScreenProp>()
  

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    if (password.length < 6) {
      Alert.alert("แจ้งเตือน", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      // ตรวจสอบว่ามี user register แล้วหรือยัง (mock validation)
      const registeredUsers = await AsyncStorage.getItem('registeredUsers');
      const users = registeredUsers ? JSON.parse(registeredUsers) : [];
      
      const user = users.find((u: any) => 
        u.email === email.trim().toLowerCase() && 
        u.type === 'disabled'
      );

      if (!user) {
        Alert.alert(
          "ไม่พบผู้ใช้",
          "กรุณาสมัครสมาชิกก่อนเข้าสู่ระบบ",
          [
            {
              text: "สมัครสมาชิก",
              onPress: () => navigation.navigate("RegisterDisable" as never)
            },
            {
              text: "ยกเลิก",
              style: "cancel"
            }
          ]
        );
        setLoading(false);
        return;
      }

      // ตรวจสอบ password (ใน production จะใช้ Firebase Auth)
      if (user.password !== password) {
        Alert.alert("แจ้งเตือน", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      // เก็บข้อมูล user ที่ login
      await AsyncStorage.setItem('currentUser', JSON.stringify({
        ...user,
        loggedIn: true
      }));

      // TODO: Implement Firebase Auth login
      navigation.replace("MainDisable");
    } catch (error: any) {
      Alert.alert("เกิดข้อผิดพลาด", error.message || "ไม่สามารถเข้าสู่ระบบได้");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    console.log("Register pressed");
    navigation.navigate("RegisterDisable" as never);
  };

  const handleForgotPassword = () => {
    console.log("Forgot password pressed");
    navigation.navigate("ForgotDisable" as never);
  };

  return (
    <View style={styles.container}>
    <Header title="Login" />

    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Login" as never)}>
        <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
        <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>

    <View style={styles.content}>
        <Text style={styles.title}>Welcome to Handy</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

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

    
    <View style={styles.inputContainer}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5", 
  },
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
    left: 10,
    zIndex: 10,
    marginTop: 90
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    color: "#000",
  },
});