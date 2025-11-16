import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import style from "../../../assets/style";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { apiFetch } from "../../utils/apiClient";

type RootStackParamList = {
  Login: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type ProfileData = {
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  phone: string;
  type: string;
};

type ProfileResponse = {
  user: {
    name?: string;
    surname?: string;
    email?: string;
    tel?: string;
    type?: string;
    id?: string;
  };
};

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
      loadProfileImage();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const loadProfileImage = async () => {
    try {
      const currentFirebaseUser = auth.currentUser;
      if (currentFirebaseUser) {
        const imageUri = await AsyncStorage.getItem(`profileImage_${currentFirebaseUser.uid}`);
        if (imageUri) {
          setProfileImage(imageUri);
        }
      }
    } catch (error) {
      console.error("Error loading profile image:", error);
    }
  };

  const mapUserData = (user: any): ProfileData => ({
    firstName: user?.name || "",
    lastName: user?.surname || "",
    studentId: user?.id || "",
    email: user?.email || "",
    phone: user?.tel || "",
    type: user?.type || "disabled",
  });

  const loadUserData = async () => {
    setLoading(true);
    try {
      const currentFirebaseUser = auth.currentUser;

      if (!currentFirebaseUser) {
        await AsyncStorage.removeItem("currentUser");
        navigation.navigate("Login" as never);
        return;
      }

      const cachedUser = await AsyncStorage.getItem("currentUser");
      if (cachedUser) {
        setUserData(mapUserData(JSON.parse(cachedUser)));
      }

      const data = await apiFetch<ProfileResponse>("/auth/me");

      if (!data.user) {
        throw new Error("User data not found");
      }

      const formattedUser = mapUserData(data.user);
      setUserData(formattedUser);
      await AsyncStorage.setItem("currentUser", JSON.stringify(data.user));
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Unable to load data");
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
      "Logout",
      "Do you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await signOut(auth);
              await AsyncStorage.removeItem("currentUser");
              navigation.navigate("Login" as never);
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert("Error", "Unable to log out");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "This feature will be available in the future");
  };

  const requestImagePickerPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Image Access Permission Required",
          "Please grant image access permission to upload profile picture"
        );
        return false;
      }
    }
    return true;
  };

  const handlePickImage = async () => {
    try {
      const hasPermission = await requestImagePickerPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadProfileImage(imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Unable to select image");
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      setUploading(true);
      const currentFirebaseUser = auth.currentUser;
      
      if (!currentFirebaseUser) {
        Alert.alert("Error", "Please log in again");
        return;
      }

      // Store image in AsyncStorage for display (if there's a backend endpoint, can upload here)
      await AsyncStorage.setItem(`profileImage_${currentFirebaseUser.uid}`, imageUri);
      setProfileImage(imageUri);

      Alert.alert("Success", "Profile picture uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Unable to upload image");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={style.color.mainColor2} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[styles.container, styles.loadingContainer]}>
          <Text style={styles.loadingText}>User data not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
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
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImageContent} />
                ) : (
                  <Ionicons name="person" size={60} color={style.color.mainColor2} />
                )}
              </View>
              <TouchableOpacity
                style={styles.editImageButton}
                onPress={handlePickImage}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={styles.profileRole}>Disabled</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth, styles.rightMargin]}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>{userData.firstName}</Text>
                </View>
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Last Name</Text>
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
              <Text style={styles.label}>Email</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{userData.email}</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{userData.phone}</Text>
              </View>
            </View>
          </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#E53935" />
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          
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
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: style.color.mainColor2,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: style.color.mainColor2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  profileImageContent: {
    width: "100%",
    height: "100%",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: style.color.mainColor2,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  profileRole: {
    fontSize: 17,
    color: style.color.subColor2,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 12,
  },
  inputContainer: {
    marginBottom: 18,
  },
  halfWidth: {
    flex: 1,
  },
  rightMargin: {
    marginRight: 0,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  infoBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 18,
  },
  infoText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "400",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#fee2e2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: "#E53935",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 17,
    color: "#6b7280",
    fontWeight: "500",
  },
});

