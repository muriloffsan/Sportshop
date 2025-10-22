import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Linking } from 'react-native';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checked, setChecked] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Digite um email e uma senha válida.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    if (!checked) {
      Alert.alert("Erro", "Você precisa aceitar os Termos de Uso e Política de Privacidade.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      console.log("Resultado signup:", { data, error });

      if (error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Sucesso", "Verifique seu e-mail para confirmar sua conta!");
        navigation.navigate("Login");
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      Alert.alert("Erro inesperado", err.message);
    }
  };

  const handleTermsPress = () => {
    Linking.openURL('https://www.exemplo.com/termos');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/TASK.png')} style={styles.logo} />

      <Text style={styles.subtitle}>Cadastro</Text>

      <TextInput
        placeholder="Email"
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

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setChecked(!checked)}>
        <Ionicons name={checked ? "checkbox" : "square-outline"} size={20} color="#20c997" />
        <Text style={styles.terms} onPress={handleTermsPress}>
          By continuing, you agree to the Terms of Use and Privacy Policy
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleSignUp}>
        <Text style={styles.btnText}>Cadastrar</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* LOGIN SOCIAL COM ÍCONES REDONDOS */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Text style={styles.socialText}>Ou continue com</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Facebook signup')}>
            <FontAwesome name="facebook-square" size={24} color="#3b5998" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Google signup')}>
            <AntDesign name="google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Twitter signup')}>
            <FontAwesome name="twitter-square" size={24} color="#1DA1F2" />
          </TouchableOpacity>
        </View>
      </View>

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
  socialText: { color: '#aaa', marginBottom: 10, fontSize: 14 },
  socialRow: { flexDirection: 'row', justifyContent: 'center' },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  link: { color: '#20c997', marginTop: 12 },
});
