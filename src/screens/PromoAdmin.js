// src/screens/PromoAdmin.js
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  Alert, 
  Image 
} from "react-native";
import { supabase } from "../lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function PromoAdmin({ navigation }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discount, setDiscount] = useState("");
  const [promoUntil, setPromoUntil] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar os produtos.");
      return;
    }
    setProducts(data);
  };

  const handleSavePromotion = async () => {
    if (!selectedProduct) {
      Alert.alert("Aviso", "Selecione um produto.");
      return;
    }

    const numericDiscount = parseFloat(discount);
    if (isNaN(numericDiscount) || numericDiscount <= 0) {
      Alert.alert("Aviso", "Informe um desconto válido (> 0).");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        discount: numericDiscount,
        promo_until: promoUntil.toISOString(),
      })
      .eq("id", selectedProduct.id);

    if (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível aplicar a promoção.");
      return;
    }

    Alert.alert("Sucesso", `Promoção aplicada ao produto "${selectedProduct.name}"!`);
    setSelectedProduct(null);
    setDiscount("");
    fetchProducts();
  };

  // ------------------
  // Renderiza os cards
  // ------------------
  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        selectedProduct?.id === item.id && styles.productCardActive,
      ]}
      onPress={() => setSelectedProduct(item)}
    >
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.productImage} 
      />
      <Text style={styles.productName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha o produto para promoção</Text>

      {/* Lista horizontal de produtos */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 20 }}
      />

      {/* Campo de desconto */}
      <TextInput
        placeholder="Desconto (%)"
        placeholderTextColor="#aaa"
        style={styles.input}
        keyboardType="numeric"
        value={discount}
        onChangeText={setDiscount}
      />

      {/* Selecionar data */}
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateBtnText}>
          Expira em: {promoUntil.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={promoUntil}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setPromoUntil(date);
          }}
        />
      )}

      {/* Botão de salvar */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSavePromotion}>
        <Text style={styles.saveBtnText}>Aplicar Promoção</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#111" },
  title: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 12 },

  // --- Cards ---
  productCard: {
    width: 140,
    marginHorizontal: 8,
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  productCardActive: {
    borderWidth: 2,
    borderColor: "#20c997",
    backgroundColor: "#2a2a2a",
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: "cover",
  },
  productName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  productPrice: {
    color: "#20c997",
    fontSize: 13,
    marginTop: 4,
  },

  // --- Inputs & Botões ---
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  dateBtn: {
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  dateBtnText: { color: "#fff" },
  saveBtn: {
    backgroundColor: "#20c997",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
