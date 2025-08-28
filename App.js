import 'react-native-gesture-handler';
import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/CadastroScreens';
import HomeScreen from './src/screens/HomeScreen';
import CustomSplashScreen from './src/screens/splashScreen';

ExpoSplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const prepare = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Splash customizada */}
          <Stack.Screen name="Splash" component={CustomSplashScreen} />

          {/* Login */}
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen
                navigation={props.navigation} // só navigation
                onSignedIn={(u) => {
                  setUser(u);
                  props.navigation.navigate('Home'); // navigate apenas
                }}
              />
            )}
          </Stack.Screen>

          {/* Cadastro */}
          <Stack.Screen name="SignUp">
            {(props) => (
              <SignUpScreen navigation={props.navigation} />
            )}
          </Stack.Screen>

          {/* Home */}
          <Stack.Screen name="Home">
            {(props) => (
              <HomeScreen
                navigation={props.navigation}
                user={user}
                onSignOut={() => {
                  setUser(null);
                  props.navigation.navigate('Login'); // navigate apenas
                }}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
