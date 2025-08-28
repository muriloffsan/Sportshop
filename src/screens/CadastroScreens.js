import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    if (email && password) {
      Alert.alert('Conta criada!', 'Agora faça login.');
      navigation.navigate('Login');
    } else {
      Alert.alert('Erro', 'Preencha todos os campos.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Criar Conta</Text>
      <TextInput
        placeholder="E-mail"
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
      <Button title="Cadastrar" onPress={handleSignUp} />
    </View>
  );
}
