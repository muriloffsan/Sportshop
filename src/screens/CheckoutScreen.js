import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function CheckoutScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  // ---------------------
  // FETCH CART
  // ---------------------
  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado.");
      navigation.goBack();
      return;
    }

    const { data, error } = await supabase
      .from("cart")
      .select("id, quantity, products(id, name, price, discount, promo_until)")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    setCartItems(data || []);
    calcTotal(data || []);
  };

  // ---------------------
  // CALC TOTAL COM PROMO
  // ---------------------
  const getFinalPrice = (product) => {
    const now = new Date();
    if (product.discount > 0 && (!product.promo_until || new Date(product.promo_until) > now)) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  const calcTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + item.quantity * getFinalPrice(item.products), 0);
    setTotal(sum);
  };

  // ---------------------
  // CONFIRM ORDER
  // ---------------------
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

    try {
      // 1️⃣ Cria pedido na tabela orders
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{ user_id: user.id, total, status: "pending" }])
        .select("id")
        .single();

      if (orderError || !orderData) {
        console.error(orderError);
        Alert.alert("Erro", "Não foi possível criar o pedido.");
        return;
      }

      const orderId = orderData.id;

      // 2️⃣ Salva itens do pedido na tabela order_items
      const itemsPayload = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.products.id,
        quantity: item.quantity,
        price: getFinalPrice(item.products)
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsPayload);

      if (itemsError) {
        console.error(itemsError);
        Alert.alert("Erro", "Não foi possível salvar os itens do pedido.");
        return;
      }

      // 3️⃣ Limpa carrinho
      await supabase.from("cart").delete().eq("user_id", user.id);

      Alert.alert("Sucesso", "Pedido confirmado com sucesso!");
      navigation.replace("Home");
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Ocorreu um problema ao processar o pedido.");
    }
  };

  // ---------------------
  // RENDER ITEM
  // ---------------------
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>
        {item.products.name} (x{item.quantity})
      </Text>
      <Text style={styles.price}>
        R$ {(getFinalPrice(item.products) * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo da Compra</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>Seu carrinho está vazio.</Text>}
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
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12, color: "#111" },
  item: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, padding: 10, backgroundColor: "#f9f9f9", borderRadius: 8 },
  name: { fontSize: 16, fontWeight: "500" },
  price: { fontSize: 16, fontWeight: "600", color: "#20c997" },
  total: { fontSize: 18, fontWeight: "bold", marginVertical: 20, textAlign: "right" },
  btn: { backgroundColor: "#20c997", padding: 14, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
