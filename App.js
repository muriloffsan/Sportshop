// App.js
import 'react-native-gesture-handler';
import React, { useEffect, useCallback, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/CadastroScreens';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen.js';
import CustomSplashScreen from './src/screens/splashScreen';
import CartScreen from './src/screens/CartScreen.js';

ExpoSplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator();

function AppHeader() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
      <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
        <Text style={{ fontSize: 24 }}>🛒</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      setAppIsReady(true);
    };
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await ExpoSplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={({ route }) => ({ 
            headerShown: false,
            headerRight: () => route.name === 'Home' ? <AppHeader /> : null
          })}
        >
          <Stack.Screen name="Splash" component={CustomSplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: true, headerTitle: 'Início', headerRight: () => <AppHeader /> }} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
          <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true, headerTitle: 'Seu Carrinho' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}