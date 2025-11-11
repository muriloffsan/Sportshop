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
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [promotions, setPromotions] = useState([]);

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
        const uniqueCategories = [
          ...new Set(data.map((p) => p.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      }
    };

    fetchProducts();
  }, [category]);
  // ---------------------
// FETCH PROMOTIONS
// ---------------------
useEffect(() => {
  const fetchPromotions = async () => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("is_active", true)
      .lte("start_date", now)
      .or(`end_date.is.null,end_date.gte.${now}`);

    if (error) {
      console.log("Erro ao buscar promoções:", error);
      return;
    }

    setPromotions(data || []);
  };

  fetchPromotions();
}, []);


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
  // PRICE & PROMO
  // ---------------------
  const getFinalPrice = (product) => {
    const now = new Date();
    if (
      product.discount > 0 &&
      product.promo_until &&
      new Date(product.promo_until) > now
    ) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  const isOnPromotion = (product) => {
    const now = new Date();
    return (
      product.discount > 0 &&
      product.promo_until &&
      new Date(product.promo_until) > now
    );
  };

  // ---------------------
  // RENDER PRODUCT
  // ---------------------
  const renderProduct = ({ item }) => {
    const finalPrice = getFinalPrice(item);
    const onPromo = isOnPromotion(item);

    return (
      <View style={styles.card}>
        {/* Selo de promoção */}
        {onPromo && (
          <View style={styles.promoTag}>
            <Text style={styles.promoText}>Promoção</Text>
          </View>
        )}

        {/* Imagem do produto */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ProductDetails", { product: item })
          }
          style={styles.imageContainer}
        >
          <Image source={{ uri: item.image_url }} style={styles.image} />
        </TouchableOpacity>

        {/* Nome */}
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        {/* Preços */}
        {onPromo ? (
          <View style={styles.priceRow}>
            <Text style={styles.oldPrice}>R$ {item.price.toFixed(2)}</Text>
            <Text style={styles.discountPrice}>R$ {finalPrice.toFixed(2)}</Text>
          </View>
        ) : (
          <Text style={styles.price}>R$ {finalPrice.toFixed(2)}</Text>
        )}

        {/* Botão de comprar */}
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() =>
            navigation.navigate("ProductDetails", { product: item, buy: true })
          }
        >
          <Text style={styles.buyButtonText}>Comprar</Text>
        </TouchableOpacity>
      </View>
    );
  };


  // ---------------------
  // JSX
  // ---------------------
  return (
    <ScrollView style={styles.container}>
      {/* CATEGORIAS */}
      <Text style={styles.title}>Categorias</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 10,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              category === item && styles.categoryBtnActive,
            ]}
            onPress={() => setCategory(category === item ? null : item)}
          >
            <Text
              style={[
                styles.categoryText,
                category === item && styles.categoryTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />

      {/* BANNER PUBLICITÁRIO */}
      {!category && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerContainer}
        >
          {/* Banner 1 - Publicidade principal */}
          <View style={[styles.banner, { backgroundColor: "#00bf63" }]}>
            <View style={styles.bannerLeft}>
              <Image
                source={require("../../assets/TASK.png")}
                style={styles.bannerLogo}
              />
            </View>
            <View style={styles.bannerRight}>
              <Text style={styles.bannerTitle}>Qualidade e Desempenho</Text>
              <Text style={styles.bannerText}>
                Os melhores produtos esportivos do mercado para você estão aqui!
              </Text>
            </View>
          </View>

          {/* Banner 2 - Mais vendido */}
          <View style={[styles.banner, { backgroundColor: "#000" }]}>
            <Image
              source={require("../../assets/Bola.png")}
              style={styles.bannerProduct}
            />
            <View style={styles.bannerRight}>
              <Text style={styles.bannerTitle}>Mais Vendidos</Text>
              <Text style={styles.bannerText}>
                O item mais{" "}
                <Text style={{ color: "#00bf63", fontWeight: "bold" }}>
                  vendidos
                </Text>{" "}
                da semana! Garanta já o seu!
              </Text>
            </View>
          </View>

          {/* Banner 3 - Promoção */}
          <View style={[styles.banner, { backgroundColor: "#000" }]}>
            <Image
              source={require("../../assets/camisa.png")}
              style={styles.bannerProduct}
            />
            <View style={styles.bannerRight}>
              <Text style={styles.bannerTitle}>Super Promoção 💥</Text>
              <Text style={styles.bannerText}>
                Descontos de{" "}
                <Text style={{ color: "#00bf63", fontWeight: "bold" }}>
                  até 50%
                </Text>{" "}
                válidos até{" "}
                <Text style={{ color: "#00bf63", fontWeight: "bold" }}>
                  12/10
                </Text>
                !
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Título */}
      <Text style={styles.title}>
        {category ? `Produtos de ${category}` : "Todos os Produtos"}
      </Text>

      {/* Admin */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => navigation.navigate("PromoAdmin")}
        >
          <Text style={styles.adminBtnText}>+ Adicionar Promoção</Text>
        </TouchableOpacity>
      )}

      {/* PRODUTOS */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

// ---------------------
// ESTILOS
// ---------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#111" },

  // BANNERS
  bannerContainer: { marginBottom: 20 },
  banner: {
    width: width - 32,
    height: 180,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginRight: 12,
  },
  bannerLeft: { flex: 1, alignItems: "center" },
  bannerRight: { flex: 2 },
  bannerLogo: { width: 90, height: 90, resizeMode: "contain" },
  bannerProduct: { width: 100, height: 100, borderRadius: 12, marginRight: 12 },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  bannerText: { fontSize: 14, color: "#ddd" },

  // PRODUTOS
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
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  oldPrice: {
    fontSize: 12,
    color: "#888",
    textDecorationLine: "line-through",
    marginRight: 6,
  },
  discountPrice: { fontSize: 14, fontWeight: "bold", color: "#e63946" },

  // CATEGORIAS
  categoryBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#333",
    marginHorizontal: 6,
    alignItems: "center",
  },
  categoryBtnActive: { backgroundColor: "#20c997" },
  categoryText: { fontSize: 14, color: "#aaa" },
  categoryTextActive: { color: "#fff", fontWeight: "bold" },

  // ADMIN
  adminBtn: {
    backgroundColor: "#20c997",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 12,
  },
  adminBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  promoTag: {
  position: "absolute",
  top: 8,
  left: 8,
  backgroundColor: "#e63946",
  paddingVertical: 3,
  paddingHorizontal: 8,
  borderRadius: 8,
  zIndex: 2,
},
promoText: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "bold",
  textTransform: "uppercase",
},
imageContainer: {
  width: "100%",
  alignItems: "center",
  marginBottom: 8,
},
buyButton: {
  backgroundColor: "#20c997",
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 10,
  marginTop: 8,
  width: "80%",
  alignItems: "center",
  alignSelf: "center",
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 4,
},
buyButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
},

});
