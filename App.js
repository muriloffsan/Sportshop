import 'react-native-gesture-handler';
import React, { useEffect, useCallback, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { supabase } from './src/lib/supabase'; // <== Import necessário

import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/CadastroScreens';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen.js';
import CustomSplashScreen from './src/screens/splashScreen';
import CartScreen from './src/screens/CartScreen.js';
import CheckoutScreen from './src/screens/CheckoutScreen.js';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen.js';
import PromoAdmin from './src/screens/PromoAdmin';
import FavoritesScreen from './src/screens/FavoritesScreen.js';

ExpoSplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator();

// -----------------------------
// ÍCONES PADRÃO DO TOPO
// -----------------------------
function AppHeader() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10, width: 120 }}>
      <TouchableOpacity onPress={() => navigation.navigate("OrderHistory")}>
        <Icon name="clipboard-text" size={24} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Favorites")}>
        <Icon name="heart-outline" size={24} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
        <Icon name="cart" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

function BackButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
      <Text style={{ fontSize: 24 }}>⬅</Text>
    </TouchableOpacity>
  );
}

// -----------------------------
// BOTÃO DE SAIR (no header do carrinho)
// -----------------------------
function LogoutButton() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace("Login");
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
      <Icon name="logout" size={24} color="#d9534f" />
    </TouchableOpacity>
  );
}

// -----------------------------
// APP PRINCIPAL
// -----------------------------
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
          screenOptions={({ navigation, route }) => ({
            headerShown: false,
            headerRight: () => route.name === 'Home' ? <AppHeader /> : null,
            headerLeft: () =>
              navigation.canGoBack() &&
              route.name !== 'Home' &&
              route.name !== 'Login' &&
              route.name !== 'Splash'
                ? <BackButton />
                : null
          })}
        >
          <Stack.Screen name="Splash" component={CustomSplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />

          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: true,
              headerTitle: 'Início',
              headerRight: () => <AppHeader />,
            }}
          />

          <Stack.Screen
            name="ProductDetails"
            component={ProductDetailsScreen}
            options={{
              headerTitle: 'Detalhes do Produto',
              headerLeft: () => <BackButton />,
            }}
          />

          {/* ======= CARRINHO COM BOTÃO DE SAIR ======= */}
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
              headerShown: true,
              headerTitle: 'Seu Carrinho',
              headerLeft: () => <BackButton />,
              headerRight: () => <LogoutButton />,
            }}
          />

          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{
              headerShown: true,
              headerTitle: "Meus Favoritos",
              headerLeft: () => <BackButton />,
            }}
          />

          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{
              headerShown: true,
              headerTitle: 'Finalizar Compra',
              headerLeft: () => <BackButton />,
            }}
          />

          <Stack.Screen
            name="PromoAdmin"
            component={PromoAdmin}
            options={{
              headerShown: true,
              headerTitle: 'Promoções Admin',
              headerLeft: () => <BackButton />,
            }}
          />

          <Stack.Screen
            name="OrderHistory"
            component={OrderHistoryScreen}
            options={{
              headerShown: true,
              headerTitle: 'Histórico de Pedidos',
              headerLeft: () => <BackButton />,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
