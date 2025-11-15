import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ScrollView, Animated, Linking, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import style from '../../../assets/style/index'
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigations/navigator";
import { apiFetch } from "../../utils/apiClient";
import { fetchTopHeadlines, NewsArticle } from "../../utils/newsService";

const { width, height } = Dimensions.get("window");
type MainVolunteerScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "MainVolunteer"
>;

type MyCasesResponse = {
  cases: Array<{
    id: string;
    status: string;
    type: string;
    details: string;
    location: string;
  }>;
};

export default function HomeScreen() {
  const navigation = useNavigation<MainVolunteerScreenProp>()
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeCase, setActiveCase] = useState<{ id: string; type: string; details: string } | null>(null);
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

  const fetchActiveCase = useCallback(async () => {
    try {
      const response = await apiFetch<MyCasesResponse>("/reports/my-cases");
      const inProgressCase = response.cases?.find((c) => c.status === "in_progress");
      setActiveCase(inProgressCase || null);
    } catch (error) {
      // Silently fail - not critical
      setActiveCase(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchActiveCase();
      // Force refresh when coming back to screen
      loadNews(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleCase = () => {
    if (activeCase) {
      navigation.navigate("InProgressCase", { reportId: activeCase.id });
    } else {
      navigation.navigate("caseScreen");
    }
  };

  const handleRedeem = () => {
    navigation.navigate("redeemScreen");
  };

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
        
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.sliderContainer}>
            {loadingNews ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={style.color.mainColor1} />
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

          {activeCase && (
            <View style={styles.activeCaseCard}>
              <View style={styles.activeCaseHeader}>
                <Ionicons name="hourglass" size={24} color="#3B82F6" />
                <View style={styles.activeCaseContent}>
                  <Text style={styles.activeCaseTitle}>You are currently helping a case</Text>
                  <Text style={styles.activeCaseSubtitle} numberOfLines={1}>
                    {activeCase.details}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.activeCaseButton}
                onPress={() => navigation.navigate("InProgressCase", { reportId: activeCase.id })}
              >
                <Text style={styles.activeCaseButtonText}>Go to Help Page</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonSection}>
            <Text style={styles.sectionTitle}>Accept Reports</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.buttonNormal, activeCase && styles.buttonDisabled]}
                onPress={handleCase}
                disabled={activeCase !== null}
              >
                <View style={styles.buttonIcon}>
                  <Ionicons
                    name={activeCase ? "checkmark-circle" : "alert-circle-outline"}
                    size={32}
                    color="#fff"
                  />
                </View>
                <Text style={styles.buttonText}>
                  {activeCase ? "Helping" : "Accept Reports"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.buttonEmergency} onPress={handleRedeem}>
                <View style={styles.buttonIcon}>
                  <Ionicons name="star" size={32} color="#fff" />
                </View>
                <Text style={styles.buttonText}>Points</Text>
              </TouchableOpacity>
            </View>

            
              <TouchableOpacity
                style={styles.emergencyButton}
                onPress={() => Linking.openURL("tel:191")}
              >
                <MaterialIcons name="emergency" size={24} color="#fff" />
                <Text style={styles.emergencyButtonText}>Emergency Call 191</Text>
              </TouchableOpacity>
            
          </View>

          {/* <View style={styles.infoSection}>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => Linking.openURL("tel:191")}
            >
              <MaterialIcons name="emergency" size={24} color="#fff" />
              <Text style={styles.emergencyButtonText}>Emergency Call 191</Text>
            </TouchableOpacity>
          </View> */}
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
    marginBottom: 12,
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
  },
  activeCaseCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  activeCaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  activeCaseContent: {
    flex: 1,
    marginLeft: 12,
  },
  activeCaseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 4,
  },
  activeCaseSubtitle: {
    fontSize: 13,
    color: "#3B82F6",
  },
  activeCaseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeCaseButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
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