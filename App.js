import 'react-native-gesture-handler';
import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './src/lib/supabase';

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
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Listener para mudanças no estado de auth
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
        }
      );

      setAppIsReady(true);

      return () => {
        authListener.subscription.unsubscribe();
      };
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
<<<<<<< HEAD
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
=======
          <Stack.Screen name="Splash" component={CustomSplashScreen} />
          
          {!user ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          ) : (
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} user={user} />}
            </Stack.Screen>
          )}
>>>>>>> e5fc9749cb2c5c1da84c74608e22cf9e4b82d990
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
