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
    backgroundColor: "#000",
    padding: 16,
  },
  list: {
    paddingBottom: 20,
  },

  // NOVO CARD
  card: {
    flexDirection: "row",
    backgroundColor: "#121212", // grafite suave
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    alignItems: "center",

    // sombra elegante
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,

    // borda muito sutil
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#1f1f1f",
  },

  info: {
    marginLeft: 16,
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },

  price: {
    fontSize: 15,
    fontWeight: "600",
    color: "#20c997",
    marginTop: 2,
  },

  empty: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 50,
  },
});


