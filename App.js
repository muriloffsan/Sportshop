import 'react-native-gesture-handler';
import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/CadastroScreens';
import HomeScreen from './src/screens/HomeScreen';
import CustomSplashScreen from './src/screens/splashScreen'; // sua tela customizada

// Impede o splash do Expo de sumir sozinho
ExpoSplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const prepare = async () => {
      // simula carregamento inicial
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAppIsReady(true);
    };
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await ExpoSplashScreen.hideAsync(); // fecha splash nativo do Expo
    }
  }, [appIsReady]);

  // Enquanto não estiver pronto, mostra apenas a splash customizada
  if (!appIsReady) {
    return <CustomSplashScreen />;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} user={user} onSignOut={() => setUser(null)} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onSignedIn={(u) => setUser(u)} />}
              </Stack.Screen>
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
