import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import style from "../../../assets/style"
import { RootStackParamList } from "../../navigations/navigator";

type RedeemScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainVolunteer'>;

const { width, height } = Dimensions.get("window");

export default function RewardScreen() {
    const navigation = useNavigation<RedeemScreenNavigationProp>();
  const [userPoints, setUserPoints] = useState(1250);
  const [selectedReward, setSelectedReward] = useState<any>(null);

  const rewards = [
    {
      id: "1",
      name: "คูปอง Starbucks",
      description: "ส่วนลด 50 บาท ที่ Starbucks ทุกสาขา",
      points: 500,
      image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      code: "STARB50",
      expiry: "31/12/2024"
    },
    {
      id: "2",
      name: "คูปอง McDonald's",
      description: "ฟรี McFlurry ขนาดกลาง",
      points: 300,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      code: "MCFREE123",
      expiry: "30/11/2024"
    },
    {
      id: "3",
      name: "คูปอง Lotus's",
      description: "ส่วนลด 10% ทุกสินค้า",
      points: 700,
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      code: "LOTUS10",
      expiry: "15/12/2024"
    },
    {
      id: "4",
      name: "คูปอง Amazon",
      description: "ส่วนลด 200 บาท สำหรับสั่งซื้อออนไลน์",
      points: 1000,
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      code: "AMAZON200",
      expiry: "31/01/2025"
    },
    {
      id: "5",
      name: "คูปอง Cinema",
      description: "ตั๋วหนังฟรี 1 ที่นั่ง",
      points: 600,
      image: "https://images.unsplash.com/photo-1489599102910-59206b8ca314?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      code: "MOVIEFREE",
      expiry: "28/02/2025"
    },
    {
      id: "6",
      name: "คูปอง Grab",
      description: "ส่วนลด 100 บาท สำหรับการเดินทาง",
      points: 800,
      image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      code: "GRAB100",
      expiry: "20/12/2024"
    }
  ];

  const handleRedeem = (reward: any) => {
    if (userPoints < reward.points) {
      Alert.alert(
        "คะแนนไม่เพียงพอ",
        `คุณมีคะแนน ${userPoints} คะแนน แต่ต้องการ ${reward.points} คะแนน`,
        [{ text: "ตกลง" }]
      );
      return;
    }

    Alert.alert(
      "ยืนยันการแลกของรางวัล",
      `คุณต้องการแลก ${reward.name} ใช่หรือไม่? (ใช้ ${reward.points} คะแนน)`,
      [
        {
          text: "ยกเลิก",
          style: "cancel"
        },
        {
          text: "แลกเลย",
          onPress: () => {
            setUserPoints(userPoints - reward.points);
            setSelectedReward(reward);
            
            Alert.alert(
              "แลกของรางวัลสำเร็จ!",
              `รหัสส่วนลด: ${reward.code}\nใช้ได้ถึง: ${reward.expiry}`,
              [{ text: "ตกลง" }]
            );
          }
        }
      ]
    );
  };

  const copyCode = (code: string) => {
    Alert.alert(
      "คัดลอกรหัสแล้ว",
      `รหัส ${code} ถูกคัดลอกไปยังคลิปบอร์ดแล้ว`,
      [{ text: "ตกลง" }]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    navigation.goBack();}}
  >
    <Ionicons name="arrow-back" size={24} color="#333" />
  </TouchableOpacity>
          <Text style={styles.headerTitle}>คะแนนสะสม</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.pointsSection}>
            <View style={styles.pointsCard}>
              <Ionicons name="trophy" size={40} color="#FFD700" />
              <Text style={styles.pointsLabel}>คะแนนสะสมของคุณ</Text>
              <Text style={styles.pointsValue}>{userPoints.toLocaleString()} คะแนน</Text>
            </View>
          </View>

          {selectedReward && (
            <View style={styles.redeemedSection}>
              <Text style={styles.sectionTitle}>ของรางวัลล่าสุด</Text>
              <View style={styles.redeemedCard}>
                <Image 
                  source={{ uri: selectedReward.image }} 
                  style={styles.rewardImageSmall}
                />
                <View style={styles.redeemedInfo}>
                  <Text style={styles.rewardName}>{selectedReward.name}</Text>
                  <Text style={styles.rewardDescription}>{selectedReward.description}</Text>
                  <TouchableOpacity 
                    style={styles.codeButton}
                    onPress={() => copyCode(selectedReward.code)}
                  >
                    <Text style={styles.codeText}>รหัส: {selectedReward.code}</Text>
                    <Ionicons name="copy" size={16} color='#3A9EF3' />
                  </TouchableOpacity>
                  <Text style={styles.expiryText}>ใช้ได้ถึง: {selectedReward.expiry}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>ของรางวัลที่มี</Text>
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
                      <Text style={styles.pointsText}>{reward.points} คะแนน</Text>
                    </View>
                    <TouchableOpacity 
                      style={[
                        styles.redeemButton,
                        userPoints < reward.points && styles.redeemButtonDisabled
                      ]}
                      onPress={() => handleRedeem(reward)}
                      disabled={userPoints < reward.points}
                    >
                      <Text style={styles.redeemButtonText}>
                        {userPoints >= reward.points ? "แลกเลย" : "คะแนนไม่พอ"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>วิธีการเก็บคะแนน</Text>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#3A9EF3" />
              <Text style={styles.infoText}>แจ้งเหตุปกติ: +10 คะแนน</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#3A9EF3" />
              <Text style={styles.infoText}>แจ้งเหตุฉุกเฉิน: +20 คะแนน</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#3A9EF3" />
              <Text style={styles.infoText}>รับเคสช่วยเหลือ: +50 คะแนน</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#3A9EF3" />
              <Text style={styles.infoText}>เช็คอินประจำวัน: +5 คะแนน</Text>
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
});