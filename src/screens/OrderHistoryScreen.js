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
        order_items!inner(
          quantity,
          price,
          products!inner(id, name, image_url)
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
        <Text style={styles.productPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.headerRow}>
        <Text style={styles.orderDate}>
          Pedido: {new Date(item.created_at).toLocaleString()}
        </Text>
        <Text
          style={[
            styles.orderStatus,
            item.status === "Entregue"
              ? styles.statusDelivered
              : item.status === "Pendente"
              ? styles.statusPending
              : styles.statusDefault,
          ]}
        >
          {item.status}
        </Text>
      </View>

      <FlatList
        data={item.order_items}
        keyExtractor={(i) => i.products.id.toString()}
        renderItem={renderOrderItem}
        scrollEnabled={false}
      />

      <Text style={styles.orderTotal}>Total: R$ {item.total.toFixed(2)}</Text>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ffcc" />
      </View>
    );

  return (
    <View style={styles.container}>


      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#00ffcc",
    textAlign: "center",
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: "#121212",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#00ffcc",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#00ffcc20",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderDate: {
    fontWeight: "600",
    color: "#ccc",
    fontSize: 13,
  },
  orderStatus: {
    fontWeight: "700",
    fontSize: 13,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    textTransform: "capitalize",
    overflow: "hidden",
  },
  statusDelivered: {
    backgroundColor: "#00ffcc33",
    color: "#00ffcc",
  },
  statusPending: {
    backgroundColor: "#ffaa0033",
    color: "#ffaa00",
  },
  statusDefault: {
    backgroundColor: "#444",
    color: "#fff",
  },
  orderTotal: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#00ffcc",
    textAlign: "right",
    marginTop: 10,
  },
  orderItem: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#1b1b1b",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  productImage: {
    width: 55,
    height: 55,
    borderRadius: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  productQty: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00ffcc",
    marginTop: 4,
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
});
