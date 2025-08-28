import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checked, setChecked] = useState(false); // checkbox funcional

  const handleSignUp = () => {
    if (!checked) {
      Alert.alert('Erro', 'Você precisa aceitar os Termos de Uso e Política de Privacidade.');
      return;
    }
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }
    Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
    navigation.navigate('Login');
  };

  const handleTermsPress = () => {
    Linking.openURL('https://www.exemplo.com/termos'); // link dos termos
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/TASK.png')} style={styles.logo} />

      {/* Subtítulo */}
      <Text style={styles.subtitle}>Cadastro</Text>

      {/* Inputs */}
      <TextInput
        placeholder="Email ou usuário"
        placeholderTextColor="#aaa"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="Confirme a senha"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />

      {/* Termos funcional */}
      <TouchableOpacity style={styles.checkboxRow} onPress={() => setChecked(!checked)}>
        <Ionicons name={checked ? "checkbox" : "square-outline"} size={20} color="#20c997" />
        <Text style={styles.terms} onPress={handleTermsPress}>
          By continuing, you agree to the Terms of Use and Privacy Policy
        </Text>
      </TouchableOpacity>

      {/* Botão Cadastro */}
      <TouchableOpacity style={styles.btn} onPress={handleSignUp}>
        <Text style={styles.btnText}>Cadastrar</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Redes sociais */}
      <Text style={styles.socialText}>Ou cadastre-se com</Text>
      <View style={styles.socialRow}>
        <Ionicons name="logo-facebook" size={28} color="#fff" />
        <Ionicons name="logo-apple" size={28} color="#fff" />
        <Ionicons name="logo-google" size={28} color="#fff" />
        <Ionicons name="logo-twitter" size={28} color="#fff" />
      </View>

      {/* Link login */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Já tem conta? Fazer login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 220, height: 220, marginBottom: 25, resizeMode: 'contain' },
  subtitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 15 },
  input: { width: '100%', padding: 14, borderWidth: 1, borderColor: '#555', borderRadius: 25, color: '#fff', marginVertical: 8, backgroundColor: '#222' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  terms: { color: '#aaa', fontSize: 12, flex: 1, marginLeft: 5, textDecorationLine: 'underline' },
  btn: { width: '100%', backgroundColor: '#20c997', padding: 14, borderRadius: 25, alignItems: 'center', marginVertical: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  divider: { width: '100%', height: 1, backgroundColor: '#333', marginVertical: 20 },
  socialText: { color: '#aaa', marginBottom: 10 },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between', width: '60%' },
  link: { color: '#20c997', marginTop: 12 },
});
