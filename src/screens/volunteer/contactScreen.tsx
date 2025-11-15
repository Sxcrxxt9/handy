import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import style from "../../../assets/style";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  iconName: string;
  iconColor?: string;
  phone: string;
  instagram: string;
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
    },
    {
      id: "2",
      name: "คุณานนท์ ชาญวิทยากุล",
      position: "Developer",
      iconName: "headset",
      iconColor: style.color.mainColor1,
      phone: "0820560989",
      instagram: "beam.knn",
    },
    {
      id: "3",
      name: "สิทธิชัย เกษแก้ว",
      position: "Developer",
      iconName: "people",
      iconColor: style.color.mainColor1,
      phone: "0963602324",
      instagram: "nhom_jc",
    },
  ];

  const callNumber = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openInstagram = (username: string) => {
    Linking.openURL(`https://www.instagram.com/${username}`);
  };
  const openFacebook = () => { Linking.openURL('https://www.facebook.com/'); }; 
  const openLine = () => { Linking.openURL('https://line.me/R/ti/p/@lineofficial'); };

  /** ─────────────────────────────────────────
   *  Animated Icon Bounce
   ───────────────────────────────────────── */
  const renderIcon = (iconName: any) => {
    const bounceAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -6,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    return (
      <Animated.View
        style={[styles.iconContainer, { transform: [{ translateY: bounceAnim }] }]}
      >
        <Ionicons name={iconName} size={34} color="#fff" />
      </Animated.View>
    );
  };

  const renderTeamMember = (member: TeamMember) => (
    <View key={member.id} style={styles.memberCard}>
      {renderIcon(member.iconName)}

      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberPosition}>{member.position}</Text>

        <View style={styles.contactButtons}>
          <TouchableOpacity
            style={styles.phoneButton}
            onPress={() => callNumber(member.phone)}
          >
            <Ionicons name="call" size={18} color={style.color.mainColor1} />
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.igButton}
            onPress={() => openInstagram(member.instagram)}
          >
            <FontAwesome5 name="instagram" size={16} color="#E1306C" />
            <Text style={styles.buttonTextIG}>Instagram</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contact The Team</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => callNumber("191")}
          >
            <MaterialIcons name="emergency" size={24} color="#fff" />
            <Text style={styles.emergencyButtonText}>Emergency Call 191</Text>
          </TouchableOpacity> */}

          {teamMembers.map(renderTeamMember)}

          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Other Contact Channels</Text>

            <TouchableOpacity style={[styles.socialButton, styles.fbButton]}
            onPress={openFacebook}>
              <FontAwesome5 name="facebook" size={20} color="#fff" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialButton, styles.lineButton]}
            onPress={openLine}>
              <FontAwesome5 name="line" size={20} color="#fff" />
              <Text style={styles.socialButtonText}>Line Official</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ─────────────────────────────────────────
 *                Styles
 * ───────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
  },

  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EB",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3A3A3A",
  },

  content: { padding: 16 },

  /* Animated Icon Container */
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 40,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: style.color.mainColor1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  /* Member Card */
  memberCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  memberPosition: {
    fontSize: 14,
    color: style.color.subColor1,
    marginVertical: 4,
    fontWeight: "500",
  },

  /* Buttons */
  contactButtons: {
    flexDirection: "row",
    marginTop: 10,
  },
  phoneButton: {
    flexDirection: "row",
    backgroundColor: style.color.mainColor1 + "15",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
  },
  igButton: {
    flexDirection: "row",
    backgroundColor: "#FCE4EC",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: style.color.mainColor1,
    marginLeft: 6,
    fontWeight: "600",
  },
  buttonTextIG: {
    color: "#E1306C",
    marginLeft: 6,
    fontWeight: "600",
  },

  /* Emergency */
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D7263D",
    paddingVertical: 20,
    borderRadius: 12,
    justifyContent: "center",
    marginBottom: 22,
    shadowColor: "#D7263D",
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  emergencyButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "bold",
  },

  /* Other Contact Section */
  contactSection: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },

  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  fbButton: { backgroundColor: "#0A64A4" },
  lineButton: { backgroundColor: "#00C300" },

  socialButtonText: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
  },
});
