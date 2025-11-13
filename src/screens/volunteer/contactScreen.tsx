import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5} from "@expo/vector-icons";
import style from "../../../assets/style";

const { width, height } = Dimensions.get("window");

interface TeamMember {
  id: string;
  name: string;
  position: string;
  iconName: string;
  iconColor?: string;
  phone: string;
  instagram: string;
  description: string;
}

export default function ContactScreen() {
  

  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "ปุญญพัฒน์ ถานะภิรมย์",
      position: "Developer",
      iconName: "code",
      iconColor: style.color.mainColor1,
      phone: "0820855888",
      instagram: "_poo.nn",
      description: "6610742477"
    },
    {
      id: "2",
      name: "คุณานนท์ ชาญวิทยากุล",
      position: "Developer",
      iconName: "headset",
      iconColor: style.color.mainColor1,
      phone: "0820560989",
      instagram: "kunanon_bm",
      description: "6610742386"
    },
    {
      id: "3",
      name: "สิทธิชัย เกษแก้ว",
      position: "Developer",
      iconName: "people", 
      iconColor: style.color.mainColor1,
      phone: "0963602324",
      instagram: "nhom_jc",
      description: "6610742568"
    },
    // {
    //   id: "4",
    //   name: "พัชราภรณ์ สวยงาม",
    //   position: "ผู้ช่วยทีม",
    //   image: "",
    //   phone: "0845678901",
    //   instagram: "patchraporn_beauty",
    //   description: "พร้อมให้บริการและช่วยเหลือประชาชนด้วยความเต็มใจและรอยยิ้ม"
    // }
  ];

  const callNumber = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openInstagram = (username: string) => {
    Linking.openURL(`https://www.instagram.com/${username}`);
  };

  const openFacebook = () => {
    Linking.openURL('https://www.facebook.com/');
  };

  const openLine = () => {
    Linking.openURL('https://line.me/R/ti/p/@lineofficial');
  };

  const renderIcon = (iconName: any, color: string = "#4CAF50") => {
    return (
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={iconName} size={40} color={color} />
      </View>
    );
  };

  const renderTeamMember = (member: TeamMember) => (
    <View key={member.id} style={styles.memberCard}>
      {renderIcon(member.iconName, member.iconColor)}

      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberPosition}>{member.position}</Text>
        <Text style={styles.memberDescription}>{member.description}</Text>
        
        <View style={styles.contactButtons}>
          <TouchableOpacity 
            style={styles.phoneButton} 
            onPress={() => callNumber(member.phone)}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.buttonText}>โทร</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.igButton} 
            onPress={() => openInstagram(member.instagram)}
          >
            <Ionicons name="logo-instagram" size={20} color="#fff" />
            <Text style={styles.buttonText}>IG</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* ส่วนหัว */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ติดต่อทีมงาน</Text>
          {/* <Text style={styles.headerSubtitle}>เราพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง</Text> */}
        </View>
        
        <ScrollView style={styles.content}>
          {teamMembers.map(renderTeamMember)}

          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>ช่องทางการติดต่ออื่นๆ</Text>
            
            <TouchableOpacity 
              style={[styles.socialButton, styles.fbButton]}
              onPress={openFacebook}
            >
              <FontAwesome5 name="facebook" size={20} color="#fff" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, styles.lineButton]}
              onPress={openLine}
            >
              <FontAwesome5 name="line" size={20} color="#fff" />
              <Text style={styles.socialButtonText}>Line Official</Text>
            </TouchableOpacity>
            
            <View style={styles.emergencyContact}>
              <Text style={styles.emergencyTitle}>ติดต่อฉุกเฉิน</Text>
              <TouchableOpacity 
                style={styles.emergencyButton}
                onPress={() => callNumber('191')}
              >
                <Ionicons name="alert-circle" size={24} color="#fff" />
                <Text style={styles.emergencyButtonText}>โทร 191</Text>
              </TouchableOpacity>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  memberCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // memberImage: {
  //   width: 80,
  //   height: 80,
  //   borderRadius: 40,
  //   marginRight: 16,
  // },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  memberPosition: {
    fontSize: 14,
    color: style.color.subColor1,
    marginBottom: 8,
    fontWeight: "500",
  },
  memberDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  contactButtons: {
    flexDirection: "row",
  },
  phoneButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: style.color.mainColor1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
  },
  igButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E1306C",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "500",
  },
  contactSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  fbButton: {
    backgroundColor: style.color.mainColor1,
  },
  lineButton: {
    backgroundColor: style.color.mainColor2,
  },
  socialButtonText: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  emergencyContact: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: style.color.buttonColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
});