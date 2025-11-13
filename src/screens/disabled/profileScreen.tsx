import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import style from "../../../assets/style"

type RootStackParamList = {
  Login: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await AsyncStorage.getItem('currentUser');
      console.log('Profile - Loading user data:', currentUser ? 'Found' : 'Not found');
      
      if (currentUser) {
        const user = JSON.parse(currentUser);
        console.log('Profile - User data:', user);
        setUserData({
          firstName: user.name || '',
          lastName: user.surname || '',
          studentId: user.id || '',
          email: user.email || '',
          phone: user.tel || '',
          type: user.type || 'disabled'
        });
      } else {
        console.log('Profile - No currentUser found, checking registeredUsers...');
        // ลองหา user จาก registeredUsers ถ้ายังไม่ได้ login
        const registeredUsers = await AsyncStorage.getItem('registeredUsers');
        if (registeredUsers) {
          const users = JSON.parse(registeredUsers);
          const lastUser = users[users.length - 1]; // ใช้ user ล่าสุด
          if (lastUser && lastUser.type === 'disabled') {
            console.log('Profile - Using last registered user:', lastUser);
            // เก็บเป็น currentUser ชั่วคราว
            await AsyncStorage.setItem('currentUser', JSON.stringify(lastUser));
            setUserData({
              firstName: lastUser.name || '',
              lastName: lastUser.surname || '',
              studentId: lastUser.id || '',
              email: lastUser.email || '',
              phone: lastUser.tel || '',
              type: lastUser.type || 'disabled'
            });
            setLoading(false);
            return;
          }
        }
        // ถ้าไม่มีข้อมูล user ให้กลับไปหน้า login
        // navigation.navigate('Login' as never);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const handleLogout = () => {
    Alert.alert(
      "ออกจากระบบ",
      "คุณต้องการออกจากระบบใช่หรือไม่?",
      [
        {
          text: "ยกเลิก",
          style: "cancel"
        },
        {
          text: "ออกจากระบบ",
          onPress: async () => {
            try {
              // ล้างข้อมูลการล็อกอิน
              await AsyncStorage.removeItem('currentUser');
              // นำทางไปหน้า Login
              navigation.navigate('Login' as never);
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert("แก้ไขโปรไฟล์", "ฟังก์ชันนี้จะเปิดให้ใช้งานในอนาคต");
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={style.color.mainColor2} />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[styles.container, styles.loadingContainer]}>
          <Text style={styles.loadingText}>ไม่พบข้อมูลผู้ใช้</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>โปรไฟล์</Text>
        </View>

        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Ionicons name="person" size={60} color={style.color.mainColor2} />
              </View>
              <TouchableOpacity 
                style={styles.editImageButton}
                onPress={handleEditProfile}
              >
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={styles.profileRole}>ผู้พิการ</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth, styles.rightMargin]}>
                <Text style={styles.label}>ชื่อ</Text>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>{userData.firstName}</Text>
                </View>
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>นามสกุล</Text>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>{userData.lastName}</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>User ID</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{userData.studentId || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>อีเมล</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{userData.email}</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>เบอร์โทรศัพท์</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{userData.phone}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#E53935" />
              <Text style={styles.logoutText}>ออกจากระบบ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa", 
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: style.color.mainColor2,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: style.color.mainColor2,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: "#666",
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  rightMargin: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  actionSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 8,
    backgroundColor: "#FFEBEE",
  },
  logoutText: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});