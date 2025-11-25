import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
import { supabase } from "../lib/supabase";

export default function CheckoutScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

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
    calcTotal(data || [], 0);
  };

  // ---------------------
  // CALC TOTAL COM PROMO E CUPOM
  // ---------------------
  const getFinalPrice = (product) => {
    const now = new Date();
    if (product.discount > 0 && (!product.promo_until || new Date(product.promo_until) > now)) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  const calcTotal = (items, appliedDiscount = 0) => {
    const sum = items.reduce((acc, item) => acc + item.quantity * getFinalPrice(item.products), 0);
    const finalValue = sum * (1 - appliedDiscount / 100);
    setTotal(finalValue);
  };

  // ---------------------
  // APLICAR CUPOM SUPABASE
  // ---------------------
  const handleApplyCoupon = async () => {
  const code = coupon.trim().toUpperCase();
  if (!code) {
    Alert.alert("Aviso", "Digite um código de cupom válido.");
    return;
  }

  try {
    // Busca o cupom pelo código e ativo
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (error || !data) {
      Alert.alert("Cupom inválido", "Esse código não existe ou expirou.");
      return;
    }

    const now = new Date();

    if (data.end_date && new Date(data.end_date) < now) {
      Alert.alert("Cupom expirado", "Este cupom já expirou.");
      return;
    }

    if (data.used_count >= data.usage_limit) {
      Alert.alert("Cupom esgotado", "Este cupom já atingiu o limite de uso.");
      return;
    }

    // Aplica desconto
    setDiscount(data.discount);
    setAppliedCoupon(data);
    calcTotal(cartItems, data.discount);

    Alert.alert("Sucesso!", `Cupom "${data.code}" aplicado com ${data.discount}% de desconto!`);

  } catch (err) {
    console.error(err);
    Alert.alert("Erro", "Ocorreu um problema ao aplicar o cupom.");
  }
};


  // ---------------------
  // CONFIRMAR PEDIDO
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
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{ user_id: user.id, total, status: "Pendente" }])
        .select("id")
        .single();

      if (orderError || !orderData) {
        console.error(orderError);
        Alert.alert("Erro", "Não foi possível criar o pedido.");
        return;
      }

      const orderId = orderData.id;

      const itemsPayload = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.products.id,
        quantity: item.quantity,
        price: getFinalPrice(item.products),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsPayload);

      if (itemsError) {
        console.error(itemsError);
        Alert.alert("Erro", "Não foi possível salvar os itens do pedido.");
        return;
      }

      // Atualiza contador de uso do cupom
      if (appliedCoupon) {
        await supabase
          .from("coupons")
          .update({ used_count: appliedCoupon.used_count + 1 })
          .eq("id", appliedCoupon.id);
      }

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
      <Text style={styles.name}>{item.products.name} (x{item.quantity})</Text>
      <Text style={styles.price}>
        R$ {(getFinalPrice(item.products) * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  // ---------------------
  // JSX
  // ---------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo da Compra</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Seu carrinho está vazio.</Text>}
      />

      <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>

      <View style={styles.couponRow}>
        <TextInput
          placeholder="Insira seu cupom"
          placeholderTextColor="#888"
          style={styles.couponInput}
          value={coupon}
          onChangeText={setCoupon}
        />
        <TouchableOpacity style={styles.couponBtn} onPress={handleApplyCoupon}>
          <Text style={styles.couponBtnText}>Aplicar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleConfirmOrder}>
        <Text style={styles.btnText}>Finalizar Pedido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#000" },
  title: { fontSize: 24, fontWeight: "bold", color: "#4CAF50", textAlign: "center", marginBottom: 20 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222",
  },
  name: { fontSize: 16, fontWeight: "500", color: "#fff" },
  price: { fontSize: 16, fontWeight: "bold", color: "#4CAF50" },
  total: { fontSize: 18, fontWeight: "bold", color: "#4CAF50", marginVertical: 20, textAlign: "right" },
  couponRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  couponInput: {
    flex: 1,
    backgroundColor: "#111",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 10,
  },
  couponBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  couponBtnText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  btn: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  btnText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  emptyText: { color: "#888", textAlign: "center", marginTop: 40 },
});
