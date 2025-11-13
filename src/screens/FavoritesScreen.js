// src/screens/FavoritesScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para ver favoritos.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select(
        `
        id,
        products (
          id,
          name,
          price,
          image_url
        )
      `
      )
      .eq("user_id", user.id);

    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      setFavorites(data || []);
    }

    setLoading(false);
  };

  const renderItem = ({ item }) => {
    const product = item.products;

    if (!product) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ProductDetails", { product })}
      >
        <Image
          source={{ uri: product.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>Nenhum favorito ainda.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // fundo mais escuro
    padding: 16,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a", // contraste com o fundo
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#00ffcc",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#00ffcc20", // borda sutil para destaque
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  info: {
    marginLeft: 14,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00ffcc", // destaque para preço sem ficar agressivo
    marginTop: 6,
  },
  empty: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
});

