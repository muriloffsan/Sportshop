import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current; // opacidade
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // escala inicial menor

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2, // cresce
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // volta ao tamanho original
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login'); // navega depois de 2s
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        <Image source={require('../../assets/TASK.png')} style={styles.logo} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#20c997' 
  },
  logo: { 
    width: 250,
    height: 250, 
    marginBottom: 20, 
    resizeMode: 'contain' 
  },
  text: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#20c997' 
  }
});
