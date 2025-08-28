import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ user, onSignOut }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
        Bem-vindo {user?.email} 🎉
      </Text>
      <Button title="Sair" onPress={onSignOut} />
    </View>
  );
}
