import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import style from "../../assets/style";
import Header from "../../assets/constants/header";

export default function LoginScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const navigation = useNavigation();

    const handleVolunteerPress = () => {
        navigation.navigate("LoginVolunteer" as never); 
    };

    const handleDisabledPress = () => {
        navigation.navigate("LoginDisable" as never); 
    };

    useEffect(() => {
        const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
            Alert.alert(
                "Permission Denied",
                "Location access is required to use the app"
            );
            return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
        } catch (error) {
        }
        };

        requestLocationPermission();
    }, []);
    
    return (
        <View style={styles.container}>
        <Header title="Login" />
        <View style={styles.content}>
            <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button1} onPress={handleVolunteerPress}>
                <MaterialCommunityIcons name="account-group" size={40} color="#fff" />
                <Text style={styles.buttonText}>Volunteer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button2} onPress={handleDisabledPress}>
                <MaterialCommunityIcons name="wheelchair-accessibility" size={40} color="#fff" />
                <Text style={styles.buttonText}>Disabled</Text>
            </TouchableOpacity>
            </View>
        </View>
        </View>
    );    
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#f5f5f5",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
    },
    button1: {
        flex: 1,
        backgroundColor: style.color.mainColor1,
        marginHorizontal: 10,
        paddingVertical: 30,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    button2: {
        flex: 1,
        backgroundColor: style.color.mainColor2,
        marginHorizontal: 10,
        paddingVertical: 30,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        marginTop: 10,
        fontSize: 16,
        fontWeight: "bold",
    },
});
