// src/screens/ProductDetailsScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProductDetailsScreen({ route }) {
  const { product } = route.params;

  const handleAddToCart = async () => {
    // Recupera usuário logado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para adicionar ao carrinho.");
      return;
    }

    // Verifica se produto já está no carrinho
    const { data: existing, error: checkError } = await supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (checkError) {
      console.error(checkError);
      Alert.alert("Erro", "Não foi possível verificar o carrinho.");
      return;
    }

    if (existing) {
      // Se já existe, atualiza quantidade
      const { error: updateError } = await supabase
        .from("cart")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);

      if (updateError) {
        Alert.alert("Erro", "Não foi possível atualizar o carrinho.");
      } else {
        Alert.alert("Sucesso", "Quantidade atualizada no carrinho!");
      }
    } else {
      // Se não existe, insere
      const { error: insertError } = await supabase
        .from("cart")
        .insert([{ user_id: user.id, product_id: product.id, quantity: 1 }]);

      if (insertError) {
        Alert.alert("Erro", "Não foi possível adicionar ao carrinho.");
      } else {
        Alert.alert("Sucesso", "Produto adicionado ao carrinho!");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image_url }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>R$ {product.price}</Text>
      <Text style={styles.description}>{product.description}</Text>

      <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
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
