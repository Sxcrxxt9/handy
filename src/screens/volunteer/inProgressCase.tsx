import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  BackHandler,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigations/navigator";
import { apiFetch } from "../../utils/apiClient";
import style from "../../../assets/style";

type InProgressCaseScreenProps = NativeStackScreenProps<RootStackParamList, 'InProgressCase'>;

type Report = {
  id: string;
  type: "normal" | "sos";
  details: string;
  location: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  latitude?: number;
  longitude?: number;
  userId?: string;
  createdAt?: any;
};

type DisabledUser = {
  name?: string;
  surname?: string;
  tel?: string;
};

type ReportResponse = {
  report: Report;
  disabledUser?: DisabledUser;
};

export default function InProgressCaseScreen({ route, navigation }: InProgressCaseScreenProps) {
  const { reportId } = route.params;
  const [report, setReport] = useState<Report | null>(null);
  const [disabledUser, setDisabledUser] = useState<DisabledUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [mapRegion, setMapRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  const fetchUserLocation = useCallback(async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoadingLocation(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(coords);
    } catch (error) {
      console.warn("Location error", error);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      const response = await apiFetch<ReportResponse>(`/reports/${reportId}`);
      setReport(response.report);
      setDisabledUser(response.disabledUser || null);


      // If case is completed, navigate back to MainVolunteer
      if (response.report.status === "completed") {
        Alert.alert(
          "Case Completed",
          "The user has confirmed that this case is completed. You have received your points.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("MainVolunteer"),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to load case data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [reportId, navigation]);

  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);

  useEffect(() => {
    // Recalculate map region only on initial load when both userLocation and report are available
    if (!mapRegion && userLocation && report && report.latitude && report.longitude) {
      const locations = [userLocation, { latitude: report.latitude, longitude: report.longitude }];
      const minLat = Math.min(...locations.map(l => l.latitude));
      const maxLat = Math.max(...locations.map(l => l.latitude));
      const minLng = Math.min(...locations.map(l => l.longitude));
      const maxLng = Math.max(...locations.map(l => l.longitude));

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const latDelta = Math.max(maxLat - minLat, 0.01) * 1.5;
      const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.5;

      setMapRegion({
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      });
    }
    // Otherwise, markers will update automatically without re-rendering the map
  }, [userLocation, report, mapRegion]);

  useFocusEffect(
    useCallback(() => {
      fetchUserLocation();
      fetchReport();

      // Prevent back button press
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        Alert.alert(
          "Alert",
          "You are currently helping with this case. Please wait for the user to confirm completion.",
          [{ text: "OK" }]
        );
        return true; // Prevent leaving the page
      });

      // Auto refresh every 5 seconds
      const interval = setInterval(() => {
        fetchUserLocation();
        fetchReport();
      }, 5000);

      return () => {
        backHandler.remove();
        clearInterval(interval);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportId])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchUserLocation(), fetchReport()]);
    } catch (error) {
      console.warn("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !report) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={style.color.mainColor1} />
          <Text style={styles.loadingText}>Loading case data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.loadingText}>Case data not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isSOS = report.type === "sos";
  const isCompleted = report.status === "completed";

  // Calculate distance between your location and incident location (meters)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000; // Earth radius (meters)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Check if locations overlap (less than 50 meters)
  const areLocationsOverlapping =
    userLocation &&
    report.latitude &&
    report.longitude &&
    calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      report.latitude,
      report.longitude
    ) < 50;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Going to Help</Text>
          <Text style={styles.headerSubtitle}>
            {isCompleted ? "Case Completed" : "Waiting for user confirmation"}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isCompleted ? "#10B981" + "22" : "#3B82F6" + "22" }]}>
          <Ionicons
            name={isCompleted ? "checkmark-circle" : "hourglass-outline"}
            size={20}
            color={isCompleted ? "#10B981" : "#3B82F6"}
          />
          <Text style={[styles.statusText, { color: isCompleted ? "#10B981" : "#3B82F6" }]}>
            {isCompleted ? "Completed" : "In Progress"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!isCompleted && (
          <View style={styles.noticeCard}>
            <Ionicons name="information-circle" size={24} color="#F59E0B" />
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>Helping</Text>
              <Text style={styles.noticeSubtitle}>
                Please go to the specified location and help the user. When finished, the user will confirm in the system.
              </Text>
            </View>
          </View>
        )}

        {report.latitude && report.longitude ? (
          <View style={styles.mapCard}>
            <Text style={styles.mapTitle}>Location</Text>
            
            {/* Your location */}
            {userLocation && (
              <View style={styles.locationCard}>
                <View style={styles.locationCardHeader}>
                  <Ionicons name="person" size={20} color="#3B82F6" />
                  <Text style={styles.locationCardTitle}>Your Location</Text>
                </View>
                <View style={styles.locationCardBody}>
                  <Text style={styles.locationCardText}>Your current location</Text>
                </View>
              </View>
            )}

            {/* Map */}
            <MapView
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={mapRegion || {
                latitude: report.latitude,
                longitude: report.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={false}
              showsMyLocationButton={false}
              onRegionChangeComplete={(region) => {
                // Prevent unnecessary region updates during refresh
                if (!mapRegion) {
                  setMapRegion(region);
                }
              }}
            >
              {/* User location marker - Show behind if locations overlap */}
              {userLocation && (
                <Marker
                  coordinate={userLocation}
                  title="Your Location"
                  description="You are here"
                  zIndex={areLocationsOverlapping ? 1 : 2}
                >
                  <View style={styles.userMarkerContainer}>
                    <Ionicons name="person" size={32} color="#3B82F6" />
                  </View>
                </Marker>
              )}

              {/* Case location marker - Show in front if locations overlap */}
              <Marker
                coordinate={{
                  latitude: report.latitude,
                  longitude: report.longitude,
                }}
                title={report.location}
                description={report.details}
                zIndex={areLocationsOverlapping ? 2 : 1}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.caseMarkerContainer}>
                  <Ionicons name="location" size={40} color="#E53935" />
                </View>
              </Marker>
            </MapView>

            {/* Case location */}
            {/* <View style={styles.locationCard}>
              <View style={styles.locationCardHeader}>
                <Ionicons name="location" size={20} color="#E53935" />
                <Text style={[styles.locationCardTitle, { color: "#E53935" }]}>Incident Location</Text>
              </View>
              <View style={styles.locationCardBody}>
                <Text style={styles.locationInfoText}>{report.location || "Location not specified"}</Text>
              </View>
            </View> */}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: (isSOS ? "#EF4444" : style.color.mainColor1) + "22" }]}>
              <Ionicons
                name={isSOS ? "warning" : "alert-circle"}
                size={20}
                color={isSOS ? "#EF4444" : style.color.mainColor1}
              />
              <Text style={[styles.typeText, { color: isSOS ? "#EF4444" : style.color.mainColor1 }]}>
                {isSOS ? "Emergency" : "General"}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            {/* Incident location address */}
            {report.location && (
              <View style={styles.locationInfoRow}>
                <Ionicons name="location" size={20} color="#E53935" />
                <View style={styles.locationInfoContent}>
                  <Text style={styles.locationInfoLabel}>Incident Location Address</Text>
                  <Text style={styles.locationInfoValue}>{report.location}</Text>
                </View>
              </View>
            )}

            <Text style={styles.detailsLabel}>Details</Text>
            <Text style={styles.detailsText}>{report.details}</Text>
          </View>
        </View>

        {disabledUser && (
          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Ionicons name="person-circle" size={24} color={style.color.mainColor1} />
              <Text style={styles.contactTitle}>Reporter Contact Information</Text>
            </View>
            <View style={styles.contactBody}>
              <View style={styles.contactRow}>
                <Ionicons name="person" size={20} color="#6B7280" />
                <Text style={styles.contactLabel}>Name:</Text>
                <Text style={styles.contactValue}>
                  {disabledUser.name} {disabledUser.surname}
                </Text>
              </View>
              {disabledUser.tel && (
                <View style={styles.contactRow}>
                  <Ionicons name="call" size={20} color="#6B7280" />
                  <Text style={styles.contactLabel}>Phone:</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        const phoneUrl = `tel:${disabledUser.tel}`;
                        const canOpen = await Linking.canOpenURL(phoneUrl);
                        if (canOpen) {
                          await Linking.openURL(phoneUrl);
                        } else {
                          Alert.alert("Alert", "Unable to open phone app");
                        }
                      } catch (error) {
                        Alert.alert("Error", "Unable to open phone app");
                      }
                    }}
                  >
                    <Text style={[styles.contactValue, styles.phoneLink]}>
                      {disabledUser.tel}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedCard}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text style={styles.completedTitle}>Case Completed</Text>
            <Text style={styles.completedSubtitle}>
              The user has confirmed that this case is completed. You have received your points.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("MainVolunteer")}
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: style.color.subColor1,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 5,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 17,
    color: "#6b7280",
    fontWeight: "500",
  },
  noticeCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FEF3C7",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F59E0B",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  noticeSubtitle: {
    fontSize: 14,
    color: "#D97706",
    lineHeight: 20,
    fontWeight: "500",
  },
  card: {
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
  cardHeader: {
    marginBottom: 20,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    alignSelf: "flex-start",
  },
  typeText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  cardBody: {
    marginTop: 8,
  },
  locationInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  locationInfoContent: {
    flex: 1,
  },
  locationInfoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E53935",
    marginBottom: 4,
  },
  locationInfoValue: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
    lineHeight: 22,
  },
  detailsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 16,
    color: "#1F2937",
    lineHeight: 24,
  },
  mapCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  map: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  userMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  caseMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  locationCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locationCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  locationCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  locationCardBody: {
    paddingLeft: 28,
  },
  locationCardText: {
    fontSize: 14,
    color: "#6B7280",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  locationInfoText: {
    fontSize: 15,
    color: "#4B5563",
    flex: 1,
    fontWeight: "500",
  },
  completedCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 16,
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 14,
    color: "#059669",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: style.color.mainColor1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  contactBody: {
    gap: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    minWidth: 90,
  },
  contactValue: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
  },
  phoneLink: {
    color: style.color.mainColor1,
    textDecorationLine: "underline",
  },
});

