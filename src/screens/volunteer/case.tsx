import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";

import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import style from "../../../assets/style";
import { apiFetch } from "../../utils/apiClient";
import { RootStackParamList } from "../../navigations/navigator";

type CaseScreenProps = NativeStackScreenProps<RootStackParamList, 'caseScreen'>;

const { width } = Dimensions.get("window");

type ReportCase = {
  id: string;
  type: "normal" | "sos";
  details: string;
  location: string;
  priority: "low" | "medium" | "high";
  latitude?: number;
  longitude?: number;
  createdAt?: string;
};

type AvailableCasesResponse = {
  cases: ReportCase[];
};

type CaseViewModel = {
  id: string;
  displayType: string;
  location: string;
  description: string;
  priorityLabel: string;
  priorityColor: string;
  createdAtLabel: string;
  raw: ReportCase;
};

const priorityMap: Record<string, { label: string; color: string }> = {
  high: { label: "Urgent", color: "#FF5252" },
  medium: { label: "General", color: style.color.mainColor1 },
  low: { label: "Pending Review", color: "#8D6E63" },
};

const formatTimestamp = (value?: string) => {
  if (!value) return "Time not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time not specified";
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
};

const mapCaseToViewModel = (report: ReportCase): CaseViewModel => {
  const typeLabel = report.type === "sos" ? "Emergency" : "General";
  const priority = priorityMap[report.priority] ?? priorityMap.medium;

  return {
    id: report.id,
    displayType: typeLabel,
    location: report.location || "Location not specified",
    description: report.details || "No additional details",
    priorityLabel: priority.label,
    priorityColor: priority.color,
    createdAtLabel: formatTimestamp(report.createdAt),
    raw: report,
  };
};

export default function CaseScreen({ navigation }: CaseScreenProps) {
  const [cases, setCases] = useState<CaseViewModel[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseViewModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accepting, setAccepting] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [showCaseModal, setShowCaseModal] = useState<boolean>(false);
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

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch<AvailableCasesResponse>("/reports/available-cases");
      const mapped = response.cases.map(report => mapCaseToViewModel({
        ...report,
        createdAt: report.createdAt ?? (report as any)?.createdAt?._seconds
          ? new Date((report as any).createdAt._seconds * 1000).toISOString()
          : undefined,
      }));
      setCases(mapped);

      // Calculate map region only on initial load or if region hasn't been set
      if (!mapRegion && (mapped.length > 0 || userLocation)) {
        const locations: Array<{ latitude: number; longitude: number }> = [];
        if (userLocation) locations.push(userLocation);
        mapped.forEach(c => {
          if (c.raw.latitude && c.raw.longitude) {
            locations.push({ latitude: c.raw.latitude, longitude: c.raw.longitude });
          }
        });

        if (locations.length > 0) {
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
      }
      // Otherwise, just update the cases - markers will update automatically without re-rendering the map
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to load data");
    } finally {
      setLoading(false);
    }
  }, [userLocation, mapRegion]);

  useFocusEffect(
    useCallback(() => {
      fetchUserLocation();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  useEffect(() => {
    if (userLocation) {
      fetchCases();
    }
  }, [userLocation, fetchCases]);

  const handleMarkerPress = (caseItem: CaseViewModel) => {
    setSelectedCase(caseItem);
    setShowCaseModal(true);
  };

  const handleAcceptCase = () => {
    if (!selectedCase) {
      Alert.alert("Alert", "Please select a case to accept");
      return;
    }

    Alert.alert(
      "Confirm Accept Case",
      `Do you want to accept this ${selectedCase.displayType} case?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: async () => {
            try {
              setAccepting(true);
              await apiFetch(`/reports/${selectedCase.id}/accept`, {
                method: "POST",
              });

              setShowCaseModal(false);
              Alert.alert(
                "Success",
                `Case ${selectedCase.displayType} accepted successfully`,
                [
                  {
                    text: "OK",
                    onPress: () => navigation.navigate('InProgressCase', { reportId: selectedCase.id }),
                  },
                ]
              );
              await fetchCases();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Unable to accept case");
            } finally {
              setAccepting(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchUserLocation(), fetchCases()]);
    } finally {
      setRefreshing(false);
    }
  };

  const getDefaultRegion = () => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    if (cases.length > 0 && cases[0].raw.latitude && cases[0].raw.longitude) {
      return {
        latitude: cases[0].raw.latitude,
        longitude: cases[0].raw.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return {
      latitude: 13.7563,
      longitude: 100.5018,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  const defaultRegion = getDefaultRegion();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Accept Cases</Text>
            <Text style={styles.headerSubtitle}>
              {cases.length ? `${cases.length} cases waiting for volunteers` : "Real-time updates"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={loading || refreshing || loadingLocation}
          >
            {(loading || refreshing || loadingLocation) ? (
              <ActivityIndicator size="small" color={style.color.mainColor1} />
            ) : (
              <Ionicons
                name="refresh"
                size={18}
                color={style.color.mainColor1}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          {loading && !mapRegion ? (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color={style.color.mainColor1} />
              <Text style={styles.mapPlaceholderText}>Loading map...</Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={mapRegion || defaultRegion}
              showsUserLocation={false}
              showsMyLocationButton={false}
              onRegionChangeComplete={(region) => {
                // Prevent unnecessary region updates during refresh
                if (!mapRegion) {
                  setMapRegion(region);
                }
              }}
            >
              {/* User location marker */}
              {userLocation && (
                <Marker
                  coordinate={userLocation}
                  title="Your location"
                  description="You are here"
                >
                  <View style={styles.userMarkerContainer}>
                    <Ionicons name="person" size={28} color="#3B82F6" />
                  </View>
                </Marker>
              )}

              {/* Case markers */}
              {cases.map((caseItem) => {
                if (!caseItem.raw.latitude || !caseItem.raw.longitude) return null;
                const isSOS = caseItem.raw.type === "sos";
                const isSelected = selectedCase?.id === caseItem.id;

                return (
                  <Marker
                    key={caseItem.id}
                    coordinate={{
                      latitude: caseItem.raw.latitude,
                      longitude: caseItem.raw.longitude,
                    }}
                    title={caseItem.displayType}
                    description={caseItem.location}
                    identifier={caseItem.id}
                    onPress={() => handleMarkerPress(caseItem)}
                    onCalloutPress={() => handleMarkerPress(caseItem)}
                  >
                    <View
                      style={[
                        styles.caseMarkerContainer,
                        isSelected && styles.caseMarkerSelected,
                        { borderColor: caseItem.priorityColor },
                      ]}
                    >
                      <Ionicons
                        name={isSOS ? "warning" : "alert-circle"}
                        size={24}
                        color={caseItem.priorityColor}
                      />
                    </View>
                  </Marker>
                );
              })}
            </MapView>
          )}

          {/* Info overlay */}
          {!loading && (
            <View style={styles.mapInfoOverlay}>
              {userLocation && (
                <View style={styles.infoBadge}>
                  <Ionicons name="person" size={14} color="#3B82F6" />
                  <Text style={styles.infoBadgeText}>You</Text>
                </View>
              )}
              <View style={styles.infoBadge}>
                <Ionicons name="alert-circle" size={14} color="#FF5252" />
                <Text style={styles.infoBadgeText}>{cases.length} cases</Text>
              </View>
            </View>
          )}
        </View>

        {/* Cases List */}
        <View style={styles.casesListContainer}>
          <View style={styles.casesListHeader}>
            <Text style={styles.sectionTitle}>Cases Waiting for Help</Text>
            <Text style={styles.sectionSubtitle}>
              {cases.length ? `${cases.length} cases waiting for volunteers` : "System will update automatically"}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
            style={styles.casesScrollView}
          >
            {loading && !cases.length ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color={style.color.mainColor1} />
                <Text style={styles.loadingText}>Loading data...</Text>
              </View>
            ) : cases.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="cloud-outline" size={46} color={style.color.mainColor1} />
                <Text style={styles.emptyTitle}>No cases waiting</Text>
                <Text style={styles.emptySubtitle}>We will notify you immediately when there are new cases</Text>
              </View>
            ) : (
              cases.map((caseItem) => {
                const isSelected = selectedCase?.id === caseItem.id;
                const isSOS = caseItem.raw.type === "sos";

                return (
                  <TouchableOpacity
                    key={caseItem.id}
                    style={[styles.caseCard, isSelected && styles.caseCardActive]}
                    activeOpacity={0.8}
                    onPress={() => handleMarkerPress(caseItem)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.badge, { backgroundColor: caseItem.priorityColor + "22" }]}>
                        <Ionicons
                          name={isSOS ? "flame" : "alert-circle"}
                          size={18}
                          color={caseItem.priorityColor}
                        />
                        <Text style={[styles.badgeText, { color: caseItem.priorityColor }]}>
                          {caseItem.priorityLabel}
                        </Text>
                      </View>
                      <Text style={styles.timestamp}>{caseItem.createdAtLabel}</Text>
                    </View>

                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{caseItem.displayType}</Text>
                      <Text style={styles.cardDescription} numberOfLines={2}>
                        {caseItem.description}
                      </Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-sharp" size={16} color="#6B7280" />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {caseItem.location}
                        </Text>
                      </View>

                      <View style={styles.actionHint}>
                        <Ionicons
                          name={isSelected ? "chevron-forward" : "hand-left-outline"}
                          size={18}
                          color={isSelected ? caseItem.priorityColor : "#9CA3AF"}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Case Detail Modal */}
        {showCaseModal && selectedCase && (
          <Modal
            visible={true}
            transparent={true}
            animationType="slide"
            onRequestClose={() => {
              setShowCaseModal(false);
              setSelectedCase(null);
            }}
          >
            <View style={styles.modalOverlay}>
              <TouchableOpacity
                style={styles.modalBackdrop}
                activeOpacity={1}
                onPress={() => {
                  setShowCaseModal(false);
                  setSelectedCase(null);
                }}
              />
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHandle} />
                </View>

                <ScrollView 
                  style={styles.modalScrollView} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalScrollContent}
                >
                  <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                      <View style={styles.detailBadgeRow}>
                        <View
                          style={[styles.detailBadge, { backgroundColor: selectedCase.priorityColor + "1a" }]}
                        >
                          <Ionicons
                            name={selectedCase.raw.type === "sos" ? "warning" : "alert-circle"}
                            size={24}
                            color={selectedCase.priorityColor}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.detailTitle}>{selectedCase.displayType}</Text>
                          <Text style={styles.detailSubtitle}>{selectedCase.createdAtLabel}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.detailInfoCard}>
                      <Text style={styles.detailSectionTitle}>Details</Text>
                      <Text style={styles.detailRowText}>{selectedCase.description}</Text>
                    </View>

                    <View style={styles.detailInfoCard}>
                      <Text style={styles.detailSectionTitle}>Location</Text>
                      <View style={styles.locationRow}>
                        <Ionicons name="location" size={20} color="#6B7280" />
                        <Text style={styles.locationInfoText}>{selectedCase.location}</Text>
                      </View>
                    </View>

                    <View style={styles.detailInfoCard}>
                      <View style={styles.priorityRow}>
                        <View style={[styles.priorityBadge, { backgroundColor: selectedCase.priorityColor + "22" }]}>
                          <Text style={[styles.priorityText, { color: selectedCase.priorityColor }]}>
                            {selectedCase.priorityLabel}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.acceptButton, accepting && styles.acceptButtonDisabled]}
                      onPress={handleAcceptCase}
                      disabled={accepting}
                    >
                      {accepting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={20} color="#fff" />
                          <Text style={styles.acceptButtonText}>Accept This Case</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mapContainer: {
    height: "50%",
    position: "relative",
  },
  casesListContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  casesListHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  casesScrollView: {
    flexGrow: 0,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  mapPlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  mapInfoOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
    gap: 8,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
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
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  caseMarkerSelected: {
    transform: [{ scale: 1.2 }],
    shadowOpacity: 0.5,
  },
  markerTouchable: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    minHeight: "50%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  detailCard: {
    padding: 20,
  },
  detailHeader: {
    marginBottom: 20,
  },
  detailBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  detailInfoCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  detailRowText: {
    fontSize: 15,
    color: "#4B5563",
    flex: 1,
    lineHeight: 22,
  },
  locationInfoText: {
    fontSize: 15,
    color: "#4B5563",
    flex: 1,
    fontWeight: "500",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  priorityText: {
    fontSize: 13,
    fontWeight: "600",
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: style.color.mainColor1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  acceptButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0.05,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  cardList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  caseCard: {
    width: width * 0.68,
    marginHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  caseCardActive: {
    borderColor: style.color.mainColor1,
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: style.color.mainColor1,
  },
  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  cardContent: {
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  cardFooter: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationText: {
    fontSize: 13,
    color: "#6B7280",
    flexShrink: 1,
  },
  actionHint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  emptyCard: {
    width: width * 0.7,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    paddingHorizontal: 24,
    textAlign: "center",
  },
  loadingCard: {
    width: width * 0.7,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 36,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
});