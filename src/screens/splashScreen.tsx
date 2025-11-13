import React, { useEffect } from "react";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import style from '../../assets/style'

const { width, height } = Dimensions.get("window");

type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
        navigation.replace("Login");
        }, 4000);
        return () => clearTimeout(timer);
    }, []);
    
    return (
        <View style={styles.container}>
            <Image
                source={require("../../assets/image/logo.png")}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.appName}>Handy</Text>
            <Text style={styles.tagLine}>giving help to those who need it most</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo:{
    width: width * 0.4, 
    height: height * 0.2, 
    marginBottom: 10
  },
  appName:{
    fontSize: 32,
    fontWeight: "700",
    color: style.color.subColor1,
    letterSpacing: 3.2,
    marginBottom: 5
  },
  tagLine:{
    fontSize: 16,
    color: style.color.mainColor1,
  }
});
