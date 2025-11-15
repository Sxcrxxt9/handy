import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import style from "../../../assets/style";
import { RootStackParamList } from "../../navigations/navigator";
import { apiFetch } from "../../utils/apiClient";

 type RedeemScreenNavigationProp = StackNavigationProp<RootStackParamList, 'redeemScreen'>;

type RewardItem = {
  id: string;
  name: string;
  description: string;
  points: number;
  image: string;
  code: string;
  expiry: string;
};

type ProfileResponse = {
  user: {
    points?: number;
    type?: string;
    name?: string;
  };
};

type RedeemHistoryItem = {
  id: string;
  rewardName: string;
  rewardDescription?: string;
  pointsRequired: number;
  status: string;
  createdAt?: string;
};

type RedeemHistoryResponse = {
  redeems: RedeemHistoryItem[];
};

type CreateRedeemResponse = {
  message?: string;
  redeem: RedeemHistoryItem;
};

const rewards: RewardItem[] = [
  {
    id: "1",
    name: "Starbucks Coupon",
    description: "50 THB discount at all Starbucks branches",
    points: 500,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    code: "STARB50",
    expiry: "31/12/2025"
  },
  {
    id: "2",
    name: "McDonald's Coupon",
    description: "Free medium McFlurry",
    points: 300,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    code: "MCFREE123",
    expiry: "30/11/2025"
  },
  {
    id: "3",
    name: "Lotus's Coupon",
    description: "10% discount on all items",
    points: 700,
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    code: "LOTUS10",
    expiry: "15/12/2025"
  },
  {
    id: "4",
    name: "Amazon Coupon",
    description: "200 THB discount for online orders",
    points: 1000,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    code: "AMAZON200",
    expiry: "31/01/2026"
  },
  {
    id: "5",
    name: "Cinema Coupon",
    description: "Free movie ticket for 1 seat",
    points: 600,
    image: "https://images.unsplash.com/photo-1489599102910-59206b8ca314?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    code: "MOVIEFREE",
    expiry: "28/02/2026"
  },
  {
    id: "6",
    name: "Grab Coupon",
    description: "100 THB discount for travel",
    points: 800,
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    code: "GRAB100",
    expiry: "20/12/2025"
  }
];

const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending': return 'Pending Approval';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'completed': return 'Used';
    default: return status;
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending': return { color: '#F59E0B' };
    case 'approved': return { color: '#10B981' };
    case 'rejected': return { color: '#EF4444' };
    case 'completed': return { color: '#6B7280' };
    default: return { color: '#6B7280' };
  }
};

const formatDateTime = (value?: string) => {
  if (!value) return "Not specified";
  let date: Date;
  if (typeof value === 'string' && value.includes('_seconds')) {
    // Firestore timestamp format
    const timestamp = (value as any)._seconds * 1000;
    date = new Date(timestamp);
  } else if (typeof value === 'object' && (value as any)?._seconds) {
    date = new Date((value as any)._seconds * 1000);
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.getTime())) return "Not specified";
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Generate reward code from redeem ID and reward name
const generateRewardCode = (redeemId: string, rewardName: string): string => {
  const prefix = rewardName.substring(0, 3).toUpperCase().replace(/\s/g, '');
  const idPart = redeemId.substring(0, 8).toUpperCase();
  return `${prefix}${idPart}`;
};

// Get expiry date (days from now)
const getExpiryDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Get expiry date from creation date (30 days from creation)
const getExpiryDateFromCreated = (createdAt?: string): string => {
  if (!createdAt) return getExpiryDate(30);
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return getExpiryDate(30);
  const expiryDate = new Date(createdDate);
  expiryDate.setDate(expiryDate.getDate() + 30);
  return expiryDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function RewardScreen() {
  const navigation = useNavigation<RedeemScreenNavigationProp>();
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [redeeming, setRedeeming] = useState<boolean>(false);
  const [history, setHistory] = useState<RedeemHistoryItem[]>([]);

  const fetchProfile = async () => {
    const profile = await apiFetch<ProfileResponse>("/auth/me");
    setUserPoints(profile.user?.points ?? 0);
  };

  const fetchHistory = async () => {
    const response = await apiFetch<RedeemHistoryResponse>("/redeem/my-redeems");
    const mapped = response.redeems.map(item => ({
      ...item,
      createdAt: item.createdAt ?? (item as any)?.createdAt?._seconds
        ? new Date((item as any).createdAt._seconds * 1000).toISOString()
        : undefined,
    }));
    setHistory(mapped);
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          setLoading(true);
          await Promise.all([fetchProfile(), fetchHistory()]);
        } catch (error: any) {
          // Silently fail - not critical
        } finally {
          setLoading(false);
        }
      };

      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleRedeem = async (reward: RewardItem) => {
    if (redeeming) return;

    if (userPoints < reward.points) {
      Alert.alert(
        "Insufficient Points",
        `You have ${userPoints} points but need ${reward.points} points`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Confirm Redeem Reward",
      `Do you want to redeem ${reward.name}? (Use ${reward.points} points)`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Redeem",
          onPress: async () => {
            try {
              setRedeeming(true);
              const response = await apiFetch<CreateRedeemResponse>("/redeem", {
                method: "POST",
                body: JSON.stringify({
                  rewardName: reward.name,
                  rewardDescription: reward.description,
                  pointsRequired: reward.points,
                }),
              });

              setUserPoints(prev => Math.max(0, prev - reward.points));
              // Refresh history to get the latest data from backend
              await fetchHistory();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Unable to redeem reward");
            } finally {
              setRedeeming(false);
              fetchProfile();
            }
          }
        }
      ]
    );
  };

  const copyCode = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert(
        "Code Copied",
        `Code ${code} has been copied to clipboard`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Unable to copy code");
    }
  };

  // Find all valid coupons (not rejected and not expired - within 30 days)
  const validCoupons = useMemo(() => {
    const now = new Date();
    
    return history
      .filter(item => {
        // Filter out rejected redeems
        if (item.status === 'rejected') return false;
        
        // Check if code is still valid (not expired - 30 days from creation)
        if (!item.createdAt) return false;
        
        const createdDate = new Date(item.createdAt);
        if (Number.isNaN(createdDate.getTime())) return false;
        
        const expiryDateObj = new Date(createdDate);
        expiryDateObj.setDate(expiryDateObj.getDate() + 30);
        
        // Only include if not expired
        return expiryDateObj >= now;
      })
      .map(item => {
        // Find matching reward image from rewards list
        const matchingReward = rewards.find(r => r.name === item.rewardName);
        const rewardCode = generateRewardCode(item.id, item.rewardName);
        const expiryDate = getExpiryDateFromCreated(item.createdAt);
        
        return {
          redeem: item,
          reward: matchingReward,
          code: rewardCode,
          expiry: expiryDate,
        };
      });
  }, [history]);

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={style.color.mainColor1} />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Points</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.pointsSection}>
            <View style={styles.pointsCard}>
              <Ionicons name="trophy" size={40} color="#FFD700" />
              <Text style={styles.pointsLabel}>Your Points</Text>
              <Text style={styles.pointsValue}>{userPoints.toLocaleString()} points</Text>
            </View>
          </View>

          {validCoupons.length > 0 && (
            <View style={styles.redeemedSection}>
              <Text style={styles.sectionTitle}>My Coupons</Text>
              {validCoupons.map((coupon, index) => (
                <View key={coupon.redeem.id} style={[styles.redeemedCard, index > 0 && styles.redeemedCardMargin]}>
                  <Image
                    source={{ uri: coupon.reward?.image || "https://via.placeholder.com/60" }}
                    style={styles.rewardImageSmall}
                  />
                  <View style={styles.redeemedInfo}>
                    <Text style={styles.rewardName}>{coupon.redeem.rewardName}</Text>
                    <Text style={styles.rewardDescription}>
                      {coupon.redeem.rewardDescription || ""}
                    </Text>
                    <TouchableOpacity
                      style={styles.codeButton}
                      onPress={() => copyCode(coupon.code)}
                    >
                      <Text style={styles.codeText}>Code: {coupon.code}</Text>
                      <Ionicons name="copy" size={16} color='#3A9EF3' />
                    </TouchableOpacity>
                    <Text style={styles.expiryText}>Valid until: {coupon.expiry}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            <View style={styles.rewardsGrid}>
              {rewards.map((reward) => (
                <View key={reward.id} style={styles.rewardCard}>
                  <Image
                    source={{ uri: reward.image }}
                    style={styles.rewardImage}
                  />
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardName}>{reward.name}</Text>
                    <Text style={styles.rewardDescription} numberOfLines={2}>
                      {reward.description}
                    </Text>
                    <View style={styles.pointsRequired}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.pointsText}>{reward.points} points</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.redeemButton,
                        (userPoints < reward.points || redeeming) && styles.redeemButtonDisabled
                      ]}
                      onPress={() => handleRedeem(reward)}
                      disabled={userPoints < reward.points || redeeming}
                    >
                      <Text style={styles.redeemButtonText}>
                        {userPoints >= reward.points ? (redeeming ? "Redeeming..." : "Redeem") : "Insufficient points"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Redeem History</Text>
              {history.map(item => (
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyName}>{item.rewardName}</Text>
                    <Text style={styles.historyPoints}>-{item.pointsRequired} points</Text>
                  </View>
                  {item.rewardDescription && (
                    <Text style={styles.historyDescription}>{item.rewardDescription}</Text>
                  )}
                  <View style={styles.statusBadge}>
                    <Text style={[styles.historyStatus, getStatusStyle(item.status)]}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                  <Text style={styles.historyMeta}>When: {formatDateTime(item.createdAt)}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>How to Earn Points</Text>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#3A9EF3" />
              <Text style={styles.infoText}>Daily login (after 6 AM): +50 points</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#3A9EF3" />
              <Text style={styles.infoText}>Help general case: +200 points</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#3A9EF3" />
              <Text style={styles.infoText}>Help emergency case: +500 points</Text>
            </View>
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
  pointsSection: {
    marginBottom: 20,
  },
  pointsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pointsLabel: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: style.color.buttonColor,
  },
  redeemedSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  redeemedCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  redeemedCardMargin: {
    marginTop: 12,
  },
  rewardImageSmall: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  redeemedInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  codeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9f0",
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  codeText: {
    color: style.color.mainColor1,
    fontWeight: "600",
    marginRight: 8,
  },
  expiryText: {
    fontSize: 12,
    color: "#999",
  },
  rewardsSection: {
    marginBottom: 20,
  },
  rewardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  rewardCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardImage: {
    width: "100%",
    height: 120,
  },
  rewardInfo: {
    padding: 12,
  },
  pointsRequired: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  pointsText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: style.color.buttonColor,
  },
  redeemButton: {
    backgroundColor: style.color.mainColor1,
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  redeemButtonDisabled: {
    backgroundColor: "#ccc",
  },
  redeemButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#333",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 16,
    zIndex: 10,
    padding: 4,
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
  historySection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyCard: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  historyName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  historyPoints: {
    fontSize: 14,
    fontWeight: "600",
    color: style.color.buttonColor,
  },
  historyDescription: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 12,
    color: "#777",
  },
  historyStatus: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusBadge: {
    marginTop: 4,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: "#777",
  },
});