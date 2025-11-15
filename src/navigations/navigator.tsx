import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/splashScreen";
import LoginScreen from "../screens/loginScreen";
import LoginDisable from "../screens/disabled/login";
import LoginVolunteer from "../screens/volunteer/login";
import RegisterDisable from "../screens/disabled/register";
import ForgotDisable from "../screens/disabled/forgot";

import RegisterVolunteer from "../screens/volunteer/register";
import ForgotVolunteer from "../screens/volunteer/forgot";

import BottomTabsDisable from "./bottomtabDisable";
import BottomTabsVolunteer from "./bottomtabVolunteer"
import ReportNormal from "../screens/disabled/reportNormal"
import ReportSOS from "../screens/disabled/reportSOS"
import caseScreen from "../screens/volunteer/case"
import redeemScreen from "../screens/volunteer/redeem"
import MyReportsScreen from "../screens/disabled/myReports"
import InProgressCaseScreen from "../screens/volunteer/inProgressCase"

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  LoginDisable: undefined;
  LoginVolunteer: undefined;
  RegisterDisable: undefined;
  ForgotDisable:undefined;
  RegisterVolunteer: undefined;
  ForgotVolunteer: undefined;
  MainDisable: undefined;
  MainVolunteer: undefined;
  ReportNormal: undefined;
  ReportSOS: undefined;
  caseScreen: undefined;
  redeemScreen: undefined;
  MyReports: undefined;
  InProgressCase: { reportId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="LoginDisable" component={LoginDisable}/>
      <Stack.Screen name="LoginVolunteer" component={LoginVolunteer}/>
      <Stack.Screen name="RegisterDisable" component={RegisterDisable}/>
      <Stack.Screen name="ForgotDisable" component={ForgotDisable}/>
      <Stack.Screen name="RegisterVolunteer" component={RegisterVolunteer}/>
      <Stack.Screen name="ForgotVolunteer" component={ForgotVolunteer}/>

      <Stack.Screen name="MainDisable" component={BottomTabsDisable} />
      <Stack.Screen name="MainVolunteer" component={BottomTabsVolunteer}/>

      <Stack.Screen name="ReportNormal" component={ReportNormal}/>
      <Stack.Screen name="ReportSOS" component={ReportSOS}/>

      <Stack.Screen name="caseScreen" component={caseScreen}/>
      <Stack.Screen name="redeemScreen" component={redeemScreen}/>
      <Stack.Screen name="MyReports" component={MyReportsScreen}/>
      <Stack.Screen name="InProgressCase" component={InProgressCaseScreen}/>
    </Stack.Navigator>
  );
}