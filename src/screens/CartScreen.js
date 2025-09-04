import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado.");
      return;
    }

    const { data, error } = await supabase
      .from("cart")
      .select("id, quantity, products(id, name, price, image_url)")
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

  const updateQuantity = async (item, newQty) => {
    if (newQty <= 0) {
      removeItem(item);
      return;
    }

    const { error } = await supabase
      .from("cart")
      .update({ quantity: newQty })
      .eq("id", item.id);

    if (!error) {
      fetchCart();
    }
  };

  const removeItem = async (item) => {
    const { error } = await supabase.from("cart").delete().eq("id", item.id);
    if (!error) {
      fetchCart();
    }
  };

  const handleCheckout = () => {
    Alert.alert("Compra Finalizada", "Obrigado por comprar com a gente!");
    // Aqui futuramente você pode salvar em "orders"
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.products.image_url }} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.name}>{item.products.name}</Text>
        <Text style={styles.price}>R$ {item.products.price}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity onPress={() => updateQuantity(item, item.quantity - 1)} style={styles.qtyBtn}>
            <Text>-</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateQuantity(item, item.quantity + 1)} style={styles.qtyBtn}>
            <Text>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeItem(item)} style={styles.removeBtn}>
            <Text style={{ color: "red" }}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Carrinho</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ textAlign: "center" }}>Seu carrinho está vazio.</Text>}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutText}>Finalizar Compra</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  item: { flexDirection: "row", marginBottom: 12, backgroundColor: "#f9f9f9", padding: 10, borderRadius: 8 },
  image: { width: 60, height: 60, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: "600" },
  price: { fontSize: 14, color: "#20c997", marginVertical: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { padding: 6, borderWidth: 1, borderRadius: 6, marginHorizontal: 4 },
  qty: { fontSize: 16, fontWeight: "bold" },
  removeBtn: { marginLeft: 10 },
  footer: { borderTopWidth: 1, borderColor: "#ddd", paddingTop: 12, marginTop: 12 },
  total: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  checkoutBtn: { backgroundColor: "#20c997", padding: 14, borderRadius: 8, alignItems: "center" },
  checkoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
