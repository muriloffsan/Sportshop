import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function PostalScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Pendente"); // Filtro inicial

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);

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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      Alert.alert("Erro", "Não foi possível carregar os pedidos.");
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  const alterarStatus = async (orderId, novoStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: novoStatus })
      .eq("id", orderId);

    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      fetchOrders(); // Atualiza a lista
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace("Login");
  };

  const pedidosFiltrados = orders.filter(
    (p) => p.status?.toLowerCase() === filtro.toLowerCase()
  );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.products.image_url }} style={styles.productImage} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.productName}>{item.products.name}</Text>
        <Text style={styles.productQty}>Qtd: {item.quantity}</Text>
        <Text style={styles.productPrice}>
          R$ {(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.headerRow}>
        <Text style={styles.orderDate}>
          Pedido #{item.id} - {new Date(item.created_at).toLocaleString()}
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

      {/* Botões de ação */}
      {item.status !== "Entregue" && (
        <View style={styles.actionRow}>
          {item.status === "Pendente" && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => alterarStatus(item.id, "A Caminho")}
            >
              <Text style={styles.actionText}>Marcar como "A Caminho"</Text>
            </TouchableOpacity>
          )}
          {item.status === "A Caminho" && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => alterarStatus(item.id, "Entregue")}
            >
              <Text style={styles.actionText}>Marcar como "Entregue"</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
      <Text style={styles.title}> Painel do Entregador</Text>

      {/* Filtros */}
      <View style={styles.filterRow}>
        {["Pendente", "A Caminho", "Entregue"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filtro === f && styles.filterActive]}
            onPress={() => setFiltro(f)}
          >
            <Text style={styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de pedidos */}
      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhum pedido {filtro.toLowerCase()} no momento.
          </Text>
        }
      />

      {/* Botão de sair */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00ffcc",
    textAlign: "center",
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#222",
  },
  filterActive: { backgroundColor: "#00ffcc" },
  filterText: { color: "#fff", fontWeight: "bold" },
  orderCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#00ffcc",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderDate: { fontWeight: "600", color: "#ccc", fontSize: 13 },
  orderStatus: {
    fontWeight: "bold",
    fontSize: 13,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    textTransform: "capitalize",
  },
  statusDelivered: { backgroundColor: "#00ffcc20", color: "#00ffcc" },
  statusPending: { backgroundColor: "#ffaa0020", color: "#ffaa00" },
  statusDefault: { backgroundColor: "#444", color: "#fff" },
  orderTotal: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#00ffcc",
    textAlign: "right",
    marginTop: 6,
  },
  orderItem: {
    flexDirection: "row",
    marginBottom: 8,
    backgroundColor: "#111",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#222",
  },
  productImage: { width: 55, height: 55, borderRadius: 8 },
  productName: { fontSize: 14, fontWeight: "600", color: "#fff" },
  productQty: { fontSize: 12, color: "#aaa", marginTop: 2 },
  productPrice: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#00ffcc",
    marginTop: 4,
  },
  emptyText: { color: "#888", textAlign: "center", marginTop: 40 },
  actionRow: { marginTop: 8 },
  actionBtn: {
    backgroundColor: "#00ffcc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionText: { color: "#000", fontWeight: "bold" },
  logoutBtn: {
    backgroundColor: "#e63946",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "bold" },
});
