import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        total,
        status,
        created_at,
        order_items(
          quantity,
          price,
          products(id, name, image_url)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.products.image_url }} style={styles.productImage} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.productName}>{item.products.name}</Text>
        <Text style={styles.productQty}>Qtd: {item.quantity}</Text>
        <Text style={styles.productPrice}>R$ {item.price}</Text>
      </View>
    </View>
  );

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderDate}>Pedido: {new Date(item.created_at).toLocaleString()}</Text>
      <Text style={styles.orderStatus}>Status: {item.status}</Text>
      <FlatList
        data={item.order_items}
        keyExtractor={(i) => i.products.id.toString()}
        renderItem={renderOrderItem}
        scrollEnabled={false}
      />
      <Text style={styles.orderTotal}>Total: R$ {item.total.toFixed(2)}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center" }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Pedidos</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>Nenhum pedido encontrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  orderCard: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: "#f9f9f9" },
  orderDate: { fontWeight: "600", marginBottom: 4 },
  orderStatus: { marginBottom: 8, color: "#555" },
  orderTotal: { fontWeight: "bold", marginTop: 8 },
  orderItem: { flexDirection: "row", marginBottom: 8, backgroundColor: "#fff", padding: 6, borderRadius: 6 },
  productImage: { width: 50, height: 50, borderRadius: 6 },
  productName: { fontSize: 14, fontWeight: "600" },
  productQty: { fontSize: 12, color: "#555" },
  productPrice: { fontSize: 12, fontWeight: "bold", color: "#20c997" },
});
