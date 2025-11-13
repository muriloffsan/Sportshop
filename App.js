import 'react-native-gesture-handler';
import React, { useEffect, useCallback, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './src/lib/supabase';

import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/CadastroScreens';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import CustomSplashScreen from './src/screens/splashScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import PromoAdmin from './src/screens/PromoAdmin';
import FavoritesScreen from './src/screens/FavoritesScreen';
import PostalScreen from './src/screens/PostalScreen';

ExpoSplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator();

// -----------------------------
// ÍCONES PADRÃO DO TOPO
// -----------------------------
function AppHeader() {
  const navigation = useNavigation();
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.navigate("OrderHistory")}>
        <Icon name="clipboard-text" size={28} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Favorites")}>
        <Icon name="heart-outline" size={28} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
        <Icon name="cart" size={28} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

function BackButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 6 }}>
      <Icon name="arrow-left" size={26} color="#000" />
    </TouchableOpacity>
  );
}

function LogoutButton() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace("Login");
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 6 }}>
      <Icon name="logout" size={26} color="#000" />
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
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']} onLayout={onLayoutRootView}>
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
                headerTitleStyle: styles.headerTitle,
                headerRight: () => <AppHeader />,
              }}
            />

            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Detalhes do Produto',
                headerTitleStyle: styles.headerTitle,
                headerLeft: () => <BackButton />,
              }}
            />

            <Stack.Screen
              name="Postal"
              component={PostalScreen}
              options={{
                headerShown: true,
                headerTitle: 'Área do Entregador',
                headerTitleStyle: styles.headerTitle,
                headerLeft: () => <BackButton />,
              }}
            />

            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{
                headerShown: true,
                headerTitle: 'Seu Carrinho',
                headerTitleStyle: styles.headerTitle,
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
                headerTitleStyle: styles.headerTitle,
                headerLeft: () => <BackButton />,
              }}
            />

            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{
                headerShown: true,
                headerTitle: 'Finalizar Compra',
                headerTitleStyle: styles.headerTitle,
                headerLeft: () => <BackButton />,
              }}
            />

            <Stack.Screen
              name="PromoAdmin"
              component={PromoAdmin}
              options={{
                headerShown: true,
                headerTitle: 'Promoções Admin',
                headerTitleStyle: styles.headerTitle,
                headerLeft: () => <BackButton />,
              }}
            />

            <Stack.Screen
              name="OrderHistory"
              component={OrderHistoryScreen}
              options={{
                headerShown: true,
                headerTitle: 'Histórico de Pedidos',
                headerTitleStyle: styles.headerTitle,
                headerLeft: () => <BackButton />,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 130,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
});
