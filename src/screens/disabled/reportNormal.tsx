import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import style from "../../../assets/style";
import { apiFetch } from "../../utils/apiClient";

 type RootStackParamList = {
  MainDisable: undefined;
};

type ReportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainDisable'>;

type CreateReportResponse = {
  report: {
    id: string;
  };
};

const { width, height } = Dimensions.get("window");

export default function ReportScreen() {
  const navigation = useNavigation<ReportScreenNavigationProp>();
  const [details, setDetails] = useState<string>("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>("Finding location...");
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const mapHeight = useState(new Animated.Value(height * 0.4))[0];

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationLabel("Location access denied");
          setLoadingLocation(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        const [geo] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (geo) {
          const label = [
            geo.name,
            geo.street,
            geo.district,
            geo.region,
            geo.city,
          ]
            .filter(Boolean)
            .join(" ") || "Current location";
          setLocationLabel(label);
        } else {
          setLocationLabel("Current location");
        }
      } catch (error) {
        console.warn("Location error", error);
        setLocationLabel("Unable to determine location");
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
        Animated.timing(mapHeight, {
          toValue: height * 0.2,
          duration: 350,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
        Animated.timing(mapHeight, {
          toValue: height * 0.4,
          duration: 350,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [mapHeight]);

  const handleReport = async () => {
    if (!details.trim()) {
      Alert.alert("Alert", "Please enter details");
      return;
    }

    if (!coords) {
      Alert.alert("Location Not Ready", "Current location not found. Please try again");
      return;
    }

    Alert.alert(
      "Confirm Report",
      "Do you want to submit this report?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Submit",
          onPress: async () => {
            try {
              setSubmitting(true);
              await apiFetch<CreateReportResponse>("/reports", {
                method: "POST",
                body: JSON.stringify({
                  type: "normal",
                  details: details.trim(),
                  location: locationLabel,
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                }),
              });

              Alert.alert(
                "Success",
                "Report submitted successfully",
                [
                  {
                    text: "OK",
                    onPress: () => navigation.replace('MainDisable')
                  }
                ]
              );
              setDetails("");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Unable to submit report");
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Report Incident</Text>
          </View>

          <View style={styles.content}>
            <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
              {coords ? (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  region={{
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                    }}
                    title={locationLabel}
                    description="Your location"
                  >
                    <View style={styles.markerContainer}>
                      <Ionicons name="location" size={40} color="#E53935" />
                    </View>
                  </Marker>
                </MapView>
              ) : (
                <View style={styles.mapPlaceholder}>
                  <ActivityIndicator size="large" color={style.color.mainColor2} />
                  <Text style={styles.mapPlaceholderText}>
                    {loadingLocation ? "Finding location..." : "Location not found"}
                  </Text>
                </View>
              )}
              <View style={styles.mapOverlay}>
                <Ionicons name="location" size={20} color="#E53935" />
                <Text style={styles.mapOverlayText} numberOfLines={1}>
                  {loadingLocation ? "Finding location..." : locationLabel}
                </Text>
              </View>
            </Animated.View>

            <ScrollView
              style={styles.formContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Type</Text>
                <TextInput
                  style={styles.detailsInput2}
                  multiline
                  numberOfLines={1}
                  value="General Report"
                  editable={false}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details *</Text>
                <TextInput
                  style={styles.detailsInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Please enter incident details..."
                  value={details}
                  onChangeText={setDetails}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.reportButton, submitting && styles.reportButtonDisabled]}
                onPress={handleReport}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="alert-circle" size={24} color="#fff" />
                    <Text style={styles.reportButtonText}>Submit Report</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  },
  mapContainer: {
    position: "relative",
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  mapOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    gap: 8,
  },
  mapOverlayText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "#f8f9fa",
  },
  detailsInput2: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 50,
    textAlignVertical: "top",
    backgroundColor: "#f8f9fa",
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: style.color.mainColor2,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  reportButtonDisabled: {
    opacity: 0.6,
  },
  reportButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});