import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import style from '../../../assets/style/index'
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigations/navigator";

const { width, height } = Dimensions.get("window");
type MainVolunteerScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "MainVolunteer"
>;

export default function HomeScreen() {
  const navigation = useNavigation<MainVolunteerScreenProp>()
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const newsData = [
    { 
      id: "1", 
      title: "ข่าวสารสำคัญ", 
      image: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "ประกาศจากหน่วยงานรัฐ"
    },
    { 
      id: "2", 
      title: "แจ้งเตือนสภาพอากาศ", 
      image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "พยากรณ์อากาศประจำสัปดาห์"
    },
    { 
      id: "3", 
      title: "กิจกรรมชุมชน", 
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "กิจกรรมน่าสนใจในชุมชน"
    },
  ];

  const renderItem = ({ item }: {item: any}) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.image }} style={styles.slideImage} />
      <View style={styles.slideContent}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    </View>
  );

  const handleCase =()=>{
    navigation.navigate("caseScreen");
  }
  const handleRedeem =()=>{
    navigation.navigate("redeemScreen")
  }

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {newsData.map((_, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp'
          });
          
          return (
            <Animated.View
              key={i}
              style={[styles.paginationDot, { opacity }]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home Screen</Text>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.sliderContainer}>
            <FlatList
              data={newsData}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setActiveIndex(index);
              }}
              renderItem={renderItem}
            />
            {renderPagination()}
          </View>

          <View style={styles.buttonSection}>
            <Text style={styles.sectionTitle}>รับแจ้งเหตุ</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.buttonNormal}
              onPress={()=>handleCase()}>
                <View style={styles.buttonIcon}>
                  <Ionicons name="alert-circle-outline" size={32} color="#fff" />
                </View>
                <Text style={styles.buttonText}>รับแจ้งเหตุ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.buttonEmergency}
              onPress={()=>handleRedeem()}>
                <View style={styles.buttonIcon}>
                  <Ionicons name="star" size={32} color="#fff" />
                </View>
                <Text style={styles.buttonText}>คะแนนสะสม</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color='#3A9EF3' />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>เบอร์ติดต่อฉุกเฉิน</Text>
                <Text style={styles.infoText}>082-085-5888</Text>
              </View>
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
    justifyContent: "center"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333"
  },
  content: {
    flex: 1,
  },
  sliderContainer: {
    height: height * 0.35,
    marginBottom: 20,
  },
  slide: {
    width: width,
    height: height * 0.35,
  },
  slideImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  slideContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
  },
  slideTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  slideDescription: {
    color: "#fff",
    fontSize: 14,
  },
  pagination: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    margin: 4,
  },
  buttonSection: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonNormal: {
    flex: 1,
    marginRight: 8,
    height: height * 0.15,
    borderRadius: 12,
    backgroundColor: style.color.mainColor1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonEmergency: {
    flex: 1,
    marginLeft: 8,
    height: height * 0.15,
    borderRadius: 12,
    backgroundColor: style.color.buttonColor,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonIcon: {
    marginBottom: 8,
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold",
    textAlign: "center",
  },
  infoSection: {
    padding: 16,
    backgroundColor: "#fff",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#DCE4FB",
    borderRadius: 8,
  },
  infoContent: {
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
});