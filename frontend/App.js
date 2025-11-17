import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import BoletimScreen from "./src/screens/BoletimScreen";
import ProfessorScreen from "./src/screens/ProfessorScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AdminScreen from "./src/screens/AdminScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="Register" component={RegisterScreen} />
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Boletim" component={BoletimScreen} />
  <Stack.Screen name="Professor" component={ProfessorScreen} />
  <Stack.Screen name="Admin" component={AdminScreen} />
</Stack.Navigator>
    </NavigationContainer>
  );
}