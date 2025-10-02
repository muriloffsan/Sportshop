// src/screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView 
} from "react-native";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Imagens locais do banner
  const banners = [
    { id: 1, image: require("../../assets/Bola.png") },
    { id: 2, image: require("../../assets/camisa.png") },
    { id: 3, image: require("../../assets/icon.png") },
  ];

  // ---------------------
  // FETCH PRODUCTS
  // ---------------------
  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase.from("products").select("*");
      if (category) query = query.eq("category", category);
      const { data, error } = await query;

      if (error) {
        console.log("Erro ao buscar produtos:", error);
        return;
      }

      if (data) {
        setProducts(data);
        const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    };

    fetchProducts();
  }, [category]);

  // ---------------------
  // CHECK USER ROLE
  // ---------------------
  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setIsAdmin(profile?.role?.trim().toLowerCase() === "admin");
    };

    checkRole();
  }, []);

  // ---------------------
  // CATEGORY HANDLER
  // ---------------------
  const handleCategoryPress = (item) => {
    setCategory(category === item ? null : item);
  };

  // ---------------------
  // PRICE CALCULATION
  // ---------------------
  const getFinalPrice = (product) => {
    const now = new Date();
    if (product.discount > 0 && product.promo_until && new Date(product.promo_until) > now) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  const isOnPromotion = (product) => {
    const now = new Date();
    return product.discount > 0 && product.promo_until && new Date(product.promo_until) > now;
  };

  // ---------------------
  // RENDER PRODUCT CARD
  // ---------------------
  const renderProduct = ({ item }) => {
    const finalPrice = getFinalPrice(item);
    const onPromo = isOnPromotion(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ProductDetails", { product: item })}
      >
        <Image source={{ uri: item.image_url }} style={styles.image} />
        <Text style={styles.name}>{item.name}</Text>

        {onPromo ? (
          <View style={styles.priceRow}>
            <Text style={styles.oldPrice}>R$ {item.price.toFixed(2)}</Text>
            <Text style={styles.discountPrice}>R$ {finalPrice.toFixed(2)}</Text>
          </View>
        ) : (
          <Text style={styles.price}>R$ {finalPrice.toFixed(2)}</Text>
        )}
      </TouchableOpacity>
    );
  };

  // ---------------------
  // JSX
  // ---------------------
  return (
    <ScrollView style={styles.container}>
      {/* Categorias */}
      <Text style={styles.title}>Categorias</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryBtn, category === item && styles.categoryBtnActive]}
            onPress={() => handleCategoryPress(item)}
          >
            <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // 👉 impede conflito com ScrollView principal
      />

      {/* Banner só aparece em "Todos os produtos" */}
      {!category && (
        <FlatList
          data={banners}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image source={item.image} style={styles.banner} />
          )}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Título de produtos */}
      <Text style={styles.title}>
        {category ? `Produtos de ${category}` : "Todos os Produtos"}
      </Text>

      {/* Botão admin */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => navigation.navigate("PromoAdmin")}
        >
          <Text style={styles.adminBtnText}>+ Adicionar Promoção</Text>
        </TouchableOpacity>
      )}

      {/* Produtos */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        scrollEnabled={false} // 👉 scroll quem faz é o ScrollView principal
      />
    </ScrollView>
  );
}

// ---------------------
// STYLES
// ---------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#111" },
  banner: {
    width: width - 32,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: "cover",
  },
  title: { fontSize: 18, fontWeight: "bold", marginVertical: 10, color: "#fff" },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  image: { width: 100, height: 100, borderRadius: 10, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: "600", textAlign: "center", color: "#000" },
  price: { fontSize: 14, color: "#20c997", marginTop: 4 },
  categoryBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#333",
    marginHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryBtnActive: { backgroundColor: "#20c997" },
  categoryText: { fontSize: 14, color: "#aaa" },
  categoryTextActive: { color: "#fff", fontWeight: "bold" },
  adminBtn: {
    backgroundColor: "#20c997",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 12,
  },
  adminBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  oldPrice: { fontSize: 12, color: "#888", textDecorationLine: "line-through", marginRight: 6 },
  discountPrice: { fontSize: 14, fontWeight: "bold", color: "#e63946" },
});
