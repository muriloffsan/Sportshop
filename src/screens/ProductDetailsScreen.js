// src/screens/ProductDetailsScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProductDetailsScreen({ route }) {
  const { product } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image_url }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>R$ {product.price}</Text>
      <Text style={styles.description}>{product.description}</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Adicionar ao Carrinho</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#fff' },
  image: { width: 200, height: 200, borderRadius: 12, marginBottom: 16 },
  name: { fontSize: 20, fontWeight: 'bold' },
  price: { fontSize: 18, color: '#20c997', marginVertical: 8 },
  description: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#20c997', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});
