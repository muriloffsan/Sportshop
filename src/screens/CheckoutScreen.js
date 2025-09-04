import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function CheckoutScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado.");
      navigation.goBack();
      return;
    }

    const { data, error } = await supabase
      .from("cart")
      .select("id, quantity, products(id, name, price)")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    setCartItems(data || []);
    calcTotal(data || []);
  };

  const calcTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + item.quantity * item.products.price, 0);
    setTotal(sum);
  };

  const handleConfirmOrder = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado.");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Aviso", "Seu carrinho está vazio.");
      return;
    }

    // Monta payload
    const orderPayload = {
      user_id: user.id,
      items: cartItems.map((item) => ({
        product_id: item.products.id,
        name: item.products.name,
        price: item.products.price,
        quantity: item.quantity,
      })),
      total: total,
      status: "pending",
    };

    // Insere no Supabase
    const { error } = await supabase.from("orders").insert([orderPayload]);

    if (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível confirmar o pedido.");
      return;
    }

    // Limpa carrinho
    await supabase.from("cart").delete().eq("user_id", user.id);

    Alert.alert("Sucesso", "Seu pedido foi confirmado!");
    navigation.replace("Home"); // volta para home depois da compra
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>
        {item.products.name} (x{item.quantity})
      </Text>
      <Text style={styles.price}>R$ {(item.products.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo da Compra</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />

      <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>

      <TouchableOpacity style={styles.btn} onPress={handleConfirmOrder}>
        <Text style={styles.btnText}>Confirmar Pedido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  item: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  name: { fontSize: 16 },
  price: { fontSize: 16, fontWeight: "600", color: "#20c997" },
  total: { fontSize: 18, fontWeight: "bold", marginVertical: 20 },
  btn: { backgroundColor: "#20c997", padding: 14, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
