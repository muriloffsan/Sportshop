import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Linking } from 'react-native';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleLogin = async () => {
    if (!checked) {
      Alert.alert('Erro', 'Você precisa aceitar os Termos de Uso e Política de Privacidade.');
      return;
    }
    if (!email || (!password && !isForgotPassword)) {
      Alert.alert('Erro', 'Preencha email e senha.');
      return;
    }

    if (isForgotPassword) {
      handleResetPassword();
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      console.log("Resultado login:", { data, error });

      if (error) {
        Alert.alert("Erro", error.message);
      } else {
        navigation.replace("Home");
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      Alert.alert("Erro inesperado", err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erro', 'Preencha o campo de email!');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('Sucesso', `Um link de redefinição foi enviado para ${email}`);
      setIsForgotPassword(false);
    }
  };

  const handleTermsPress = () => {
    Linking.openURL('https://www.exemplo.com/termos');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/TASK.png')} style={styles.logo} />
      <Text style={styles.subtitle}>
        {isForgotPassword ? 'Redefinir senha' : 'LOGIN'}
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      {!isForgotPassword && (
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      )}

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setChecked(!checked)}>
        <Ionicons name={checked ? "checkbox" : "square-outline"} size={20} color="#20c997" />
        <Text style={styles.terms} onPress={handleTermsPress}>
          By continuing, you agree to the Terms of Use and Privacy Policy
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={handleLogin}
      >
        <Text style={styles.btnText}>
          {isForgotPassword ? 'Redefinir senha' : 'Log in'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsForgotPassword(!isForgotPassword)}>
        <Text style={styles.link}>
          {isForgotPassword ? 'Voltar ao login' : 'Esqueceu sua senha ...'}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* LOGIN SOCIAL COM ÍCONES REDONDOS */}
      {!isForgotPassword && (
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={styles.socialText}>Or continue with</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Facebook login')}>
              <FontAwesome name="facebook-square" size={24} color="#3b5998" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Google login')}>
              <AntDesign name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Twitter login')}>
              <FontAwesome name="twitter-square" size={24} color="#1DA1F2" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!isForgotPassword && (
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      )}
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
  link: { color: '#20c997', marginTop: 12 },
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
});
