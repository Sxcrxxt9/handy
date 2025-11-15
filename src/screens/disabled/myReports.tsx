import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigations/navigator";
import { apiFetch } from "../../utils/apiClient";
import style from "../../../assets/style";

type MyReportsScreenProps = NativeStackScreenProps<RootStackParamList, 'MyReports'>;

type Report = {
  id: string;
  type: "normal" | "sos";
  details: string;
  location: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  latitude?: number;
  longitude?: number;
  assignedVolunteerId?: string;
  volunteerName?: string | null;
  volunteerTel?: string | null;
  createdAt?: any;
};

type ReportsResponse = {
  reports: Report[];
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "pending":
      return {
        label: "Waiting for Volunteer",
        color: "#F59E0B",
        icon: "time-outline",
      };
    case "in_progress":
      return {
        label: "In Progress",
        color: "#3B82F6",
        icon: "hourglass-outline",
      };
    case "completed":
      return {
        label: "Completed",
        color: "#10B981",
        icon: "checkmark-circle",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "#EF4444",
        icon: "close-circle",
      };
    default:
      return {
        label: status,
        color: "#6B7280",
        icon: "help-circle",
      };
  }
};

const formatDate = (dateValue: any) => {
  if (!dateValue) return "Not specified";
  
  let date: Date;
  if (dateValue._seconds) {
    date = new Date(dateValue._seconds * 1000);
  } else if (typeof dateValue === "string") {
    date = new Date(dateValue);
  } else {
    date = new Date(dateValue);
  }
  
  if (isNaN(date.getTime())) return "Not specified";
  
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MyReportsScreen({ navigation }: MyReportsScreenProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const response = await apiFetch<ReportsResponse>("/reports/my-reports");
      setReports(response.reports || []);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReports();
    }, [fetchReports])
  );

  const handleComplete = (reportId: string) => {
    Alert.alert(
      "Confirm Case Completion",
      "Do you want to confirm that this case is completed? The volunteer will receive points after you confirm.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setCompletingId(reportId);
              await apiFetch(`/reports/${reportId}/complete`, {
                method: "POST",
              });

              Alert.alert("Success", "Case completion confirmed successfully");
              await fetchReports();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Unable to confirm case completion");
            } finally {
              setCompletingId(null);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  if (loading && !reports.length) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Reports</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={style.color.mainColor2} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptySubtitle}>
              When you report an incident, reports will appear here
            </Text>
          </View>
        ) : (
          reports.map((report) => {
            const statusInfo = getStatusInfo(report.status);
            const isInProgress = report.status === "in_progress";
            const isCompleting = completingId === report.id;

            return (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.typeBadge}>
                    <Ionicons
                      name={report.type === "sos" ? "warning" : "alert-circle"}
                      size={18}
                      color={report.type === "sos" ? "#EF4444" : style.color.mainColor2}
                    />
                    <Text style={[styles.typeText, { color: report.type === "sos" ? "#EF4444" : style.color.mainColor2 }]}>
                      {report.type === "sos" ? "Emergency" : "General"}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + "22" }]}>
                    <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.detailsText}>{report.details}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={16} color="#6B7280" />
                    <Text style={styles.locationText}>{report.location || "Location not specified"}</Text>
                  </View>
                  {report.volunteerName && (
                    <>
                      <View style={styles.volunteerRow}>
                        <Ionicons name="person" size={16} color={style.color.mainColor2} />
                        <Text style={styles.volunteerText}>Volunteer: {report.volunteerName}</Text>
                      </View>
                      {report.volunteerTel && (
                        <TouchableOpacity
                          style={styles.volunteerTelRow}
                          onPress={() => {
                            Linking.openURL(`tel:${report.volunteerTel}`);
                          }}
                        >
                          <Ionicons name="call" size={16} color={style.color.mainColor2} />
                          <Text style={styles.volunteerTelText}>{report.volunteerTel}</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                  <Text style={styles.dateText}>{formatDate(report.createdAt)}</Text>
                </View>

                {isInProgress && (
                  <TouchableOpacity
                    style={[styles.completeButton, isCompleting && styles.completeButtonDisabled]}
                    onPress={() => handleComplete(report.id)}
                    disabled={isCompleting}
                  >
                    {isCompleting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.completeButtonText}>Confirm Completion</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  reportCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardBody: {
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 15,
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: "#6B7280",
  },
  volunteerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  volunteerText: {
    fontSize: 13,
    color: style.color.mainColor2,
    fontWeight: "600",
  },
  volunteerTelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    paddingVertical: 4,
  },
  volunteerTelText: {
    fontSize: 13,
    color: style.color.mainColor2,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: style.color.mainColor2,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});

