import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ScrollView, Animated, Linking, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import style from '../../../assets/style/index'
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigations/navigator";
import { fetchTopHeadlines, NewsArticle } from "../../utils/newsService";

const { width, height } = Dimensions.get("window");
type MainDisableScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "MainDisable"
>;


export default function HomeScreen() {
  const navigation = useNavigation<MainDisableScreenProp>()
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadNews = useCallback(async (forceRefresh = false) => {
    try {
      setLoadingNews(true);
      const news = await fetchTopHeadlines(forceRefresh);
      setNewsData(news);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoadingNews(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNews(true);
    }, [loadNews])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const news = await fetchTopHeadlines(true);
      setNewsData(news);
    } catch (error) {
      console.error('Failed to refresh news:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderItem = ({ item }: {item: NewsArticle}) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.image }} style={styles.slideImage} />
      <View style={styles.slideContent}>
        <Text style={styles.slideTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.slideDescription} numberOfLines={1}>{item.description}</Text>
        {item.source && (
          <Text style={styles.slideSource} numberOfLines={1}>{item.source}</Text>
        )}
      </View>
    </View>
  );

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

  const handleReport =()=>{
    navigation.navigate("ReportNormal");
  }
  const handleReport2 =()=>{
    navigation.navigate("ReportSOS");
  }
  const handleMyReports =()=>{
    navigation.navigate("MyReports" as never);
  }

  const callEmergency = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home Screen</Text>
        </View>
        
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.sliderContainer}>
            {loadingNews ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={style.color.mainColor2} />
                <Text style={styles.loadingText}>กำลังโหลดข่าวสาร...</Text>
              </View>
            ) : newsData.length > 0 ? (
              <>
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
              </>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>ไม่พบข้อมูลข่าวสาร</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonSection}>
            <Text style={styles.sectionTitle}>Report Incident</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.buttonNormal}
              onPress={()=>handleReport()}>
                <View style={styles.buttonIcon}>
                  <Ionicons name="alert-circle-outline" size={32} color="#fff" />
                </View>
                <Text style={styles.buttonText}>General Report</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.buttonEmergency}
              onPress={()=>handleReport2()}>
                <View style={styles.buttonIcon}>
                  <Ionicons name="warning-outline" size={32} color="#fff" />
                </View>
                <Text style={styles.buttonText}>Emergency Report</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.infoCard} onPress={handleMyReports}>
              <Ionicons name="document-text" size={24} color={style.color.mainColor2} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>My Reports</Text>
                <Text style={styles.infoText}>View and manage all reports</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.emergencyButton}
              onPress={() => callEmergency('191')}
            >
              <MaterialIcons name="emergency" size={24} color="#fff" />
              <Text style={styles.emergencyButtonText}>Emergency Call 191</Text>
            </TouchableOpacity>
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
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
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
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 12,
    paddingBottom: 16,
    maxHeight: "35%",
  },
  slideTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  slideDescription: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
  },
  slideSource: {
    color: "#fff",
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.35,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
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
    backgroundColor: style.color.mainColor2,
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f1f8e9",
    borderRadius: 8,
    marginBottom: 12,
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
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D7263D",
    paddingVertical: 20,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#D7263D",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  emergencyButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "bold",
  },
});