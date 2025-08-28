import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation, onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleLogin = () => {
    if (email && password) {
      onSignedIn({ email }); // simula login
    } else {
      Alert.alert('Erro', 'Preencha email e senha.');
    }
  };

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Erro', 'Preencha o campo de email!');
      return;
    }
    Alert.alert('Sucesso', `Um link de redefinição foi enviado para ${email}`);
    setIsForgotPassword(false); // volta para login
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/TASK.png')} style={styles.logo} />

      {/* Subtítulo */}
      <Text style={styles.subtitle}>
        {isForgotPassword ? 'Redefinir senha' : 'LOGIN'}
      </Text>

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

      {/* Remember me */}
      {!isForgotPassword && (
        <TouchableOpacity style={styles.rememberContainer}>
          <Text style={styles.remember}>Remember me</Text>
        </TouchableOpacity>
      )}

      {/* Termos */}
      <View style={styles.checkboxRow}>
        <Ionicons name="checkbox" size={20} color="#20c997" />
        <Text style={styles.terms}>
          By continuing, you agree to the Terms of Use and Privacy Policy
        </Text>
      </View>

      {/* Botão */}
      <TouchableOpacity
        style={styles.btn}
        onPress={isForgotPassword ? handleResetPassword : handleLogin}
      >
        <Text style={styles.btnText}>
          {isForgotPassword ? 'Redefinir senha' : 'Log in'}
        </Text>
      </TouchableOpacity>

      {/* Alternar entre Login e Esqueceu senha */}
      <TouchableOpacity
        onPress={() => setIsForgotPassword(!isForgotPassword)}
      >
        <Text style={styles.link}>
          {isForgotPassword ? 'Voltar ao login' : 'Esqueceu sua senha ...'}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Redes sociais */}
      <Text style={styles.socialText}>Ou continue com</Text>
      <View style={styles.socialRow}>
        <Ionicons name="logo-facebook" size={28} color="#fff" />
        <Ionicons name="logo-apple" size={28} color="#fff" />
        <Ionicons name="logo-google" size={28} color="#fff" />
        <Ionicons name="logo-twitter" size={28} color="#fff" />
      </View>

      {/* Link cadastro */}
      {!isForgotPassword && (
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      )}
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
  rememberContainer: { alignSelf: 'flex-start', marginTop: 5 },
  remember: { color: '#aaa', fontSize: 14 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  terms: { color: '#aaa', fontSize: 12, flex: 1, marginLeft: 5 },
  btn: {
    width: '100%',
    backgroundColor: '#20c997',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 12,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#20c997', marginTop: 12 },
  divider: { width: '100%', height: 1, backgroundColor: '#333', marginVertical: 20 },
  socialText: { color: '#aaa', marginBottom: 10 },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between', width: '60%' },
});
