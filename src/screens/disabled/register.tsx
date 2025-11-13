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

type RegisterDisableScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "RegisterDisable"
>;

export default function RegisterDisable() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tel, setTel] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<RegisterDisableScreenProp>();

  const handleRegister = async () => {
    // Validation
    if (!name.trim() || !surname.trim() || !email.trim() || !password.trim() || !tel.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (password.length < 6) {
      Alert.alert("แจ้งเตือน", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    setLoading(true);

    try {
      // ตรวจสอบว่ามี email นี้อยู่แล้วหรือยัง
      const registeredUsers = await AsyncStorage.getItem('registeredUsers');
      const users = registeredUsers ? JSON.parse(registeredUsers) : [];
      
      const existingUser = users.find((u: any) => 
        u.email === email.trim().toLowerCase()
      );

      if (existingUser) {
        Alert.alert("แจ้งเตือน", "อีเมลนี้ถูกใช้งานแล้ว");
        setLoading(false);
        return;
      }

      // เก็บข้อมูล user ใหม่ (mock registration - ใน production จะใช้ Firebase Auth)
      const newUser = {
        id: Date.now().toString(),
        email: email.trim().toLowerCase(),
        password: password, // ใน production จะไม่เก็บ password แบบนี้
        name: name.trim(),
        surname: surname.trim(),
        tel: tel.trim(),
        type: 'disabled',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem('registeredUsers', JSON.stringify(users));

      // TODO: Implement Firebase Auth registration
      // 1. Create user with Firebase Auth
      // 2. Call backend API to register user profile
      
      Alert.alert(
        "สำเร็จ",
        "สมัครสมาชิกเรียบร้อยแล้ว",
        [
          {
            text: "ตกลง",
            onPress: () => navigation.navigate("LoginDisable" as never)
          }
        ]
      );
    } catch (error: any) {
      Alert.alert("เกิดข้อผิดพลาด", error.message || "ไม่สามารถสมัครสมาชิกได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="สมัครสมาชิก" />
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>สมัครสมาชิก</Text>
        <Text style={styles.subtitle}>กรุณากรอกข้อมูลเพื่อสมัครสมาชิก</Text>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons 
            name="account-outline" 
            size={22} 
            color="#777" 
            style={styles.icon} 
          />
          <TextInput
            style={styles.input}
            placeholder="ชื่อ"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons 
            name="account-outline" 
            size={22} 
            color="#777" 
            style={styles.icon} 
          />
          <TextInput
            style={styles.input}
            placeholder="นามสกุล"
            placeholderTextColor="#aaa"
            value={surname}
            onChangeText={setSurname}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons 
            name="email-outline" 
            size={22} 
            color="#777" 
            style={styles.icon} 
          />
          <TextInput
            style={styles.input}
            placeholder="อีเมล"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons 
            name="phone-outline" 
            size={22} 
            color="#777" 
            style={styles.icon} 
          />
          <TextInput
            style={styles.input}
            placeholder="เบอร์โทรศัพท์"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            value={tel}
            onChangeText={setTel}
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
            placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
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
              <Text style={styles.registerText}>สมัครสมาชิก</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>มีบัญชีอยู่แล้ว? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("LoginDisable" as never)}>
            <Text style={styles.loginLink}>เข้าสู่ระบบ</Text>
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
  registerButton: {
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
    marginTop: 90
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    color: "#000",
  },
});

