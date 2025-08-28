import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

export default function LoginScreen({ navigation, onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email && password) {
      // simulação de login (mock)
      onSignedIn({ email });
    } else {
      Alert.alert('Erro', 'Preencha email e senha.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Login</Text>
      <TextInput
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 8 }}
      />
      <Button title="Entrar" onPress={handleLogin} />
      <View style={{ marginTop: 12 }}>
        <Button title="Criar Conta" onPress={() => navigation.navigate('SignUp')} />
      </View>
    </View>
  );
}
