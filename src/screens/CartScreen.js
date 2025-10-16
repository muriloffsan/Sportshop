import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native";

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const navigation = useNavigation();

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
      .select("id, quantity, products(id, name, price, discount, promo_until, image_url)")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    const items = data || [];
    setCartItems(items);
    calcTotal(items);
  };

  const calcTotal = (items) => {
    const now = new Date();
    const sum = items.reduce((acc, item) => {
      let price = item.products.price;
      if (item.products.discount > 0 && item.products.promo_until && new Date(item.products.promo_until) > now) {
        price = price * (1 - item.products.discount / 100);
      }
      return acc + price * item.quantity;
    }, 0);
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

    if (!error) fetchCart();
  };

  const removeItem = async (item) => {
    const { error } = await supabase.from("cart").delete().eq("id", item.id);
    if (!error) fetchCart();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Aviso", "Seu carrinho está vazio.");
      return;
    }

    navigation.navigate("Checkout", { cartItems, total });
  };

  const renderItem = ({ item }) => {
    const now = new Date();
    let price = item.products.price;
    let hasDiscount = false;

    if (item.products.discount > 0 && item.products.promo_until && new Date(item.products.promo_until) > now) {
      price = price * (1 - item.products.discount / 100);
      hasDiscount = true;
    }

    return (
      <View style={styles.item}>
        <Image source={{ uri: item.products.image_url }} style={styles.image} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.name}>{item.products.name}</Text>

          {hasDiscount ? (
            <View style={styles.priceRow}>
              <Text style={styles.oldPrice}>R$ {item.products.price.toFixed(2)}</Text>
              <Text style={styles.discountPrice}>R$ {price.toFixed(2)}</Text>
            </View>
          ) : (
            <Text style={styles.price}>R$ {price.toFixed(2)}</Text>
          )}

          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={() => updateQuantity(item, item.quantity - 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qty}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item, item.quantity + 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeItem(item)} style={styles.removeBtn}>
              <Text style={styles.removeText}>Remover</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seu Carrinho</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Seu carrinho está vazio.</Text>}
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
  container: { flex: 1, padding: 16, backgroundColor: "#000" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 16, textAlign: "center" },
  item: {
    flexDirection: "row",
    marginBottom: 14,
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#00ffcc",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  image: { width: 70, height: 70, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: "600", color: "#fff" },
  price: { fontSize: 14, color: "#00ffcc", marginVertical: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  oldPrice: { fontSize: 12, color: "#888", textDecorationLine: "line-through", marginRight: 6 },
  discountPrice: { fontSize: 14, fontWeight: "bold", color: "#ff4b5c" },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#00ffcc",
    borderRadius: 8,
  },
  qtyBtnText: { color: "#00ffcc", fontSize: 18, fontWeight: "bold" },
  qty: { fontSize: 16, fontWeight: "bold", color: "#fff", marginHorizontal: 8 },
  removeBtn: { marginLeft: 12 },
  removeText: { color: "#ff4b5c", fontSize: 13 },
  emptyText: { color: "#aaa", textAlign: "center", marginTop: 40 },
  footer: {
    borderTopWidth: 1,
    borderColor: "#222",
    paddingTop: 12,
    marginTop: 16,
  },
  total: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 10, textAlign: "center" },
  checkoutBtn: {
    backgroundColor: "#00ffcc",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#00ffcc",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutText: { color: "#000", fontWeight: "bold", fontSize: 16 },
});
