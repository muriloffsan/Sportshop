// src/screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log("Erro ao obter usuário:", userError);
      return;
    }

    if (!user) {
      console.log("Usuário não logado");
      return;
    }

    console.log("Usuário logado:", user);

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.log("Erro ao buscar perfil:", error);
    }

    console.log("Profile retornado:", profile);

    // Lista de IDs de usuários que você quer forçar como admin
    const forcedAdmins = ["COLOQUE_AQUI_O_USER_ID_DO_ADMIN"];
    const isForcedAdmin = forcedAdmins.includes(user.id);

    // Considera admin se o role for admin ou se estiver na lista de forcedAdmins
    setIsAdmin(profile?.role?.trim().toLowerCase() === "admin" || isForcedAdmin);
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
    if (product.discount > 0 && (!product.promo_until || new Date(product.promo_until) > now)) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  // ---------------------
  // RENDER PRODUCT CARD
  // ---------------------
  const renderProduct = ({ item }) => {
    const finalPrice = getFinalPrice(item);
    const hasDiscount = finalPrice < item.price;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ProductDetails", { product: item })}
      >
        <Image source={{ uri: item.image_url }} style={styles.image} />
        <Text style={styles.name}>{item.name}</Text>

        {hasDiscount ? (
          <View style={styles.priceRow}>
            <Text style={styles.oldPrice}>R$ {item.price.toFixed(2)}</Text>
            <Text style={styles.discountPrice}>R$ {finalPrice.toFixed(2)}</Text>
          </View>
        ) : (
          <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
        )}
      </TouchableOpacity>
    );
  };

  // ---------------------
  // JSX
  // ---------------------
  return (
    <View style={styles.container}>
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
      />

      <Text style={styles.title}>
        {category ? `Produtos de ${category}` : "Todos os Produtos"}
      </Text>

      {isAdmin && (
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => navigation.navigate("PromoAdmin")}
        >
          <Text style={styles.adminBtnText}>+ Adicionar Promoção</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </View>
  );
}

// ---------------------
// STYLES
// ---------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#111" },
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
