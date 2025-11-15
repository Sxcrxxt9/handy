import React from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import style from '../../assets/style/index'

type HeaderProps = {
  title: string;
};

const { width, height } = Dimensions.get("window");

export default function Header({ title }: HeaderProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <Image 
            source={require("../../assets/image/logo.png")}
            style={styles.logo}
            resizeMode="contain"/>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Handy</Text>
          <Text style={styles.subtitle}>giving help to those who need it most</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999, 
      paddingVertical: 10
    },
    container: {
      height: 60,
      flexDirection: "row", 
      alignItems: "center", 
      paddingHorizontal: 25,
      paddingVertical: 5
    },
    textContainer: {
      flexDirection: "column",
      marginLeft: 10
    },
    title: {
      color: style.color.subColor1,
      fontSize: 20,
      fontWeight: "bold",
    },
    logo: {
      width: width * 0.12,
      marginRight: 10, 
    },
    subtitle: {
      color: style.color.mainColor1,
      fontSize: 12,
    },
});



