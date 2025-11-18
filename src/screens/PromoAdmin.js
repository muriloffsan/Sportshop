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
  Image,
  SafeAreaView,
  Platform
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

    // REGISTRO NA TABELA PROMOTIONS
    const { error: promoError } = await supabase
      .from("promotions")
      .insert([
        {
          product_id: selectedProduct.id,
          discount: numericDiscount,
          start_date: new Date().toISOString(),
          end_date: promoUntil.toISOString(),
          is_active: true,
        },
      ]);

    if (promoError) {
      console.error(promoError);
      Alert.alert("Aviso", "Promoção aplicada, mas não foi possível salvar no histórico.");
    }

    Alert.alert("Sucesso", `Promoção aplicada ao produto "${selectedProduct.name}"!`);
    setSelectedProduct(null);
    setDiscount("");
    fetchProducts();
  };

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

      <View style={{ width: "100%" }}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <Text style={styles.title}>Gerenciar Promoções</Text>

        {/* Lista de produtos */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          style={{ marginBottom: 10 }}
        />

        {/* Inputs */}
        <View style={styles.box}>
          <Text style={styles.label}>Desconto (%)</Text>
          <TextInput
            placeholder="Ex: 15"
            placeholderTextColor="#666"
            style={styles.input}
            keyboardType="numeric"
            value={discount}
            onChangeText={setDiscount}
          />

          <Text style={styles.label}>Expira em</Text>

          <TouchableOpacity 
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateBtnText}>
              {promoUntil.toLocaleDateString()}
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
        </View>

        {/* Botão */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSavePromotion}>
          <Text style={styles.saveBtnText}>Aplicar Promoção</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

// -------------------------
// ESTILOS MODERNIZADOS
// -------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },

  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 30, // garante espaço para bottom tabs
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
  },

  // --- Cards ---
  productCard: {
    width: 150,
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#222",
  },
  productCardActive: {
    borderColor: "#20c997",
    backgroundColor: "#1f2a23",
  },

  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
  },

  productName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  productPrice: {
    color: "#20c997",
    fontSize: 14,
    marginTop: 2,
  },

  // --- Caixa de inputs ---
  box: {
    backgroundColor: "#1a1a1a",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#222",
  },

  label: {
    color: "#bbb",
    fontSize: 13,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 15,
  },

  dateBtn: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  dateBtnText: {
    color: "#fff",
    fontSize: 15,
  },

  // --- Botão salvar ---
  saveBtn: {
    backgroundColor: "#20c997",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
