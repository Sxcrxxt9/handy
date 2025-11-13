import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import style from "../../../assets/style"

type RootStackParamList = {
  MainDisable: undefined;
};

type ReportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainDisable'>;

const { width, height } = Dimensions.get("window");

export default function ReportScreen2() {
  const navigation = useNavigation<ReportScreenNavigationProp>();
  
  const [selectedType, setSelectedType] = useState<string>("");
  const [details, setDetails] = useState<string>("");

  const incidentTypes = [
    { id: "traffic", name: "จราจร", icon: "car" },
    { id: "accident", name: "อุบัติเหตุ", icon: "warning" },
    { id: "flood", name: "น้ำท่วม", icon: "water" },
    { id: "other", name: "อื่นๆ", icon: "ellipsis-horizontal" },
  ];

  const handleReport = () => {
    // if (!selectedType) {
    // //   Alert.alert("แจ้งเตือน", "กรุณาเลือกประเภทเหตุการณ์");
    //   return;
    // }

    if (!details.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกรายละเอียด");
      return;
    }

    Alert.alert(
      "ยืนยันการแจ้งเหตุ",
      "คุณต้องการแจ้งเหตุนี้ใช่หรือไม่?",
      [
        {
          text: "ยกเลิก",
          style: "cancel"
        },
        {
          text: "แจ้งเหตุ",
          onPress: () => {
            console.log("แจ้งเหตุ:", {
              type: selectedType,
              details: details,
            });

            Alert.alert(
              "สำเร็จ",
              "แจ้งเหตุเรียบร้อยแล้ว",
              [
                {
                  text: "ตกลง",
                  onPress: () => navigation.replace('MainDisable')
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>แจ้งเหตุ</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.mapContainer}>
            <View style={styles.mockMap}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                style={styles.mapImage}
                resizeMode="cover"
              />
              <View style={styles.mapOverlay}>
                <Ionicons name="location" size={24} color="#E53935" />
                <Text style={styles.mapOverlayText}>ตำแหน่งปัจจุบัน</Text>
              </View>
              <View style={styles.mapMarker}>
                <Ionicons name="location" size={32} color="#E53935" />
              </View>
            </View>
          </View>

          <ScrollView style={styles.formContainer}>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ประเภท</Text>
              <TextInput
                style={styles.detailsInput2}
                multiline
                numberOfLines={1}
                value="แจ้งเหตุฉุกเฉิน"
                onChangeText={setDetails}
                textAlignVertical="top"
                editable={false}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>รายละเอียด *</Text>
              <TextInput
                style={styles.detailsInput}
                multiline
                numberOfLines={4}
                placeholder="กรุณากรอกรายละเอียดเหตุการณ์..."
                value={details}
                onChangeText={setDetails}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={styles.reportButton}
              onPress={handleReport}
            >
              <Ionicons name="alert-circle" size={24} color="#fff" />
              <Text style={styles.reportButtonText}>แจ้งเหตุ</Text>
            </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  mapOverlayText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  mapMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -16,
    marginTop: -16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  formContainer: {
    flex: 1,
    padding: 16,
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
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  typeButton: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  typeButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  typeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
  },
  typeTextSelected: {
    color: "#fff",
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
    backgroundColor: style.color.buttonColor,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  reportButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});