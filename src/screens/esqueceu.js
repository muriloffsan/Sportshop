import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Erro', 'Preencha o campo de email!');
      return;
    }
    Alert.alert('Sucesso', `Um link de redefinição foi enviado para ${email}`);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/TASK.png')} style={styles.logo} />

      {/* Subtítulo */}
      <Text style={styles.subtitle}>Esqueceu a senha</Text>

      {/* Input de email */}
      <TextInput
        placeholder="Email ou usuário"
        placeholderTextColor="#aaa"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      {/* Botão */}
      <TouchableOpacity style={styles.btn} onPress={handleResetPassword}>
        <Text style={styles.btnText}>Redefinir senha</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Redes sociais */}
      <Text style={styles.socialText}>Ou use sua conta social</Text>
      <View style={styles.socialRow}>
        <Ionicons name="logo-facebook" size={28} color="#fff" />
        <Ionicons name="logo-apple" size={28} color="#fff" />
        <Ionicons name="logo-google" size={28} color="#fff" />
        <Ionicons name="logo-twitter" size={28} color="#fff" />
      </View>

      {/* Link login */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Voltar ao login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: { 
    width: 220, 
    height: 220, 
    marginBottom: 25, 
    resizeMode: 'contain' 
  },
  subtitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 15 
  },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 25,
    color: '#fff',
    marginVertical: 8,
    backgroundColor: '#222',
  },
  btn: {
    width: '100%',
    backgroundColor: '#20c997',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 12,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  divider: { width: '100%', height: 1, backgroundColor: '#333', marginVertical: 20 },
  socialText: { color: '#aaa', marginBottom: 10 },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between', width: '60%' },
  link: { color: '#20c997', marginTop: 12 },
});
