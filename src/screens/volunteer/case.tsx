import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import style from "../../../assets/style"

type RootStackParamList = {
  MainVolunteer: undefined;
};

type CaseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainVolunteer'>;

const { width, height } = Dimensions.get("window");

export default function CaseScreen() {
  const navigation = useNavigation<CaseScreenNavigationProp>();
  
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [status, setStatus] = useState<string>("กำลังตรวจสอบ");

  const mockCases = [
    {
      id: "1",
      type: "จราจร",
      location: "ถนนสุขุมวิท กทม.",
      description: "ารจราจรติดขัดจากเหตุการณ์พิเศษ",
      priority: "สูง",
      time: "14:30",
      distance: "1.2 km",
      icon: "car",
      color: style.color.mainColor1,
      position: { x: 100, y: 150 }
    },
    {
      id: "2",
      type: "จราจร",
      location: "ซอยรามคำแหง 24",
      description: "ารจราจรติดขัดจากเหตุการณ์พิเศษ",
      priority: "ปานกลาง",
      time: "13:45",
      distance: "2.5 km",
      icon: "car",
      color: style.color.mainColor1,
      position: { x: 250, y: 80 }
    },
    {
      id: "3",
      type: "จราจร",
      location: "แยกราชประสงค์",
      description: "การจราจรติดขัดจากเหตุการณ์พิเศษ",
      priority: "ต่ำ",
      time: "15:20",
      distance: "3.1 km",
      icon: "car",
      color: style.color.mainColor1,
      position: { x: 180, y: 250 }
    },
    {
      id: "4",
      type: "จราจร",
      location: "ตลาดนัดจตุจักร",
      description: "ารจราจรติดขัดจากเหตุการณ์พิเศษ",
      priority: "สูงมาก",
      time: "12:15",
      distance: "4.3 km",
      icon: "car",
      color: style.color.mainColor1,
      position: { x: 300, y: 200 }
    }
  ];

  const handleAcceptCase = () => {
    if (!selectedCase) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกเคสที่ต้องการรับ");
      return;
    }

    Alert.alert(
      "ยืนยันการรับเคส",
      `คุณต้องการรับเคส ${selectedCase.type} ใช่หรือไม่?`,
      [
        {
          text: "ยกเลิก",
          style: "cancel"
        },
        {
          text: "รับเคส",
          onPress: () => {
            console.log("รับเคส:", selectedCase);
            
            Alert.alert(
              "สำเร็จ",
              `รับเคส ${selectedCase.type} เรียบร้อยแล้ว`,
              [
                {
                  text: "ตกลง",
                  onPress: () => navigation.navigate('MainVolunteer')
                }
              ]
            );
          }
        }
      ]
    );
  };

  const selectCase = (caseItem: any) => {
    setSelectedCase(caseItem);
    setStatus("พร้อมรับเคส");
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>รับเคส</Text>
          <Text style={styles.headerSubtitle}>เลือกเคสที่ต้องการช่วยเหลือ</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.mapContainer}>
            <View style={styles.mockMap}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                style={styles.mapImage}
                resizeMode="cover"
              />
              
              {mockCases.map((caseItem) => (
                <TouchableOpacity
                  key={caseItem.id}
                  style={[
                    styles.caseMarker,
                    { 
                      left: caseItem.position.x,
                      top: caseItem.position.y,
                      backgroundColor: caseItem.color,
                      borderColor: selectedCase?.id === caseItem.id ? "#fff" : caseItem.color
                    }
                  ]}
                  onPress={() => selectCase(caseItem)}
                >
                  <Ionicons 
                    name={caseItem.icon as any} 
                    size={20} 
                    color="#fff" 
                  />
                  {selectedCase?.id === caseItem.id && (
                    <View style={styles.selectedRing} />
                  )}
                </TouchableOpacity>
              ))}
              
              <View style={styles.mapOverlay}>
                <Ionicons name="list" size={20} color="#333" />
                <Text style={styles.mapOverlayText}>
                  {selectedCase ? `เคส: ${selectedCase.type}` : "เลือกเคสจากหมุดบนแผนที่"}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.detailsContainer}>
            {selectedCase ? (
              <View style={styles.caseDetails}>
                <View style={styles.caseHeader}>
                  <View style={[styles.priorityBadge, { backgroundColor: selectedCase.color }]}>
                    <Text style={styles.priorityText}>{selectedCase.priority}</Text>
                  </View>
                  <Text style={styles.caseType}>{selectedCase.type}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location" size={20} color="#666" />
                  <Text style={styles.detailText}>{selectedCase.location}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time" size={20} color="#666" />
                  <Text style={styles.detailText}>{selectedCase.time} • {selectedCase.distance}</Text>
                </View>

                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionLabel}>รายละเอียด</Text>
                  <Text style={styles.descriptionText}>{selectedCase.description}</Text>
                </View>

                <View style={styles.statusSection}>
                  <Text style={styles.statusLabel}>สถานะ:</Text>
                  <Text style={[
                    styles.statusText,
                    { color: status === "พร้อมรับเคส" ? "#4CAF50" : "#FF9800" }
                  ]}>
                    {status}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={handleAcceptCase}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.acceptButtonText}>รับเคสนี้</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="map" size={48} color="#ccc" />
                <Text style={styles.placeholderText}>กรุณาเลือกเคสจากแผนที่</Text>
                <Text style={styles.placeholderSubtext}>กดที่หมุดสีต่างๆ เพื่อดูรายละเอียด</Text>
              </View>
            )}
          </ScrollView>
        </View>
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
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.4,
    position: "relative",
  },
  mockMap: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    position: "relative",
    overflow: "hidden",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  caseMarker: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  selectedRing: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
    top: -5,
    left: -5,
  },
  mapOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 12,
    borderRadius: 8,
  },
  mapOverlayText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  caseDetails: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  caseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  priorityText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  caseType: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  descriptionBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  statusSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: style.color.mainColor1,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  placeholder: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});