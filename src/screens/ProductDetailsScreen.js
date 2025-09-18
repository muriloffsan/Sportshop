// src/screens/ProductDetailsScreen.js
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  FlatList, 
  TextInput, 
  ScrollView // 👈 aqui é o lugar certo
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";


export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [avgRating, setAvgRating] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, user_id")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setReviews(data || []);
      if (data.length > 0) {
        const avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
        setAvgRating(avg.toFixed(1));
      } else {
        setAvgRating(null);
      }
    }
  };

  const handleAddToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para adicionar ao carrinho.");
      return;
    }

    const { data: existing, error: checkError } = await supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (checkError) {
      console.error(checkError);
      Alert.alert("Erro", "Não foi possível verificar o carrinho.");
      return;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("cart")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);

      if (updateError) {
        Alert.alert("Erro", "Não foi possível atualizar o carrinho.");
      } else {
        Alert.alert("Sucesso", "Quantidade atualizada no carrinho!");
      }
    } else {
      const { error: insertError } = await supabase
        .from("cart")
        .insert([{ user_id: user.id, product_id: product.id, quantity: 1 }]);

      if (insertError) {
        Alert.alert("Erro", "Não foi possível adicionar ao carrinho.");
      } else {
        Alert.alert("Sucesso", "Produto adicionado ao carrinho!");
      }
    }
  };

  const handleAddReview = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para avaliar.");
      return;
    }

    if (rating < 1 || rating > 5) {
      Alert.alert("Erro", "Selecione uma nota de 1 a 5.");
      return;
    }

    const { error } = await supabase.from("reviews").insert([
      {
        user_id: user.id,
        product_id: product.id,
        rating,
        comment,
      },
    ]);

    if (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível enviar a avaliação.");
    } else {
      setRating(0);
      setComment("");
      fetchReviews();
      Alert.alert("Sucesso", "Avaliação enviada!");
    }
  };

  const renderStars = (score, size = 20) => {
    return (
      <View style={{ flexDirection: "row" }}>
        {Array.from({ length: 5 }, (_, i) => (
          <Ionicons
            key={i}
            name={i < score ? "star" : "star-outline"}
            size={size}
            color="#FFD700"
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {renderStars(item.rating, 16)}
        <Text style={styles.reviewDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );
  // Função para calcular preço final
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



 return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Image source={{ uri: product.image_url }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>

{isOnPromotion(product) ? (
  <View style={styles.priceRow}>
    <Text style={styles.oldPrice}>R$ {product.price.toFixed(2)}</Text>
    <Text style={styles.discountPrice}>
      R$ {getFinalPrice(product).toFixed(2)}
    </Text>
    <Text style={styles.discountBadge}>-{product.discount}%</Text>
  </View>
) : (
  <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
)}

<Text style={styles.description}>{product.description}</Text>

      {/* Média de avaliações */}
      {avgRating ? (
        <View style={styles.avgContainer}>
          {renderStars(Math.round(avgRating))}
          <Text style={styles.avgText}>
            {avgRating} / 5 ({reviews.length} avaliações)
          </Text>
        </View>
      ) : (
        <Text style={{ color: "#aaa", marginBottom: 10 }}>
          Ainda sem avaliações
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
        <Text style={styles.buttonText}>Adicionar ao Carrinho</Text>
      </TouchableOpacity>

      {/* Avaliações */}
      <Text style={styles.sectionTitle}>Avaliações</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReview}
        ListEmptyComponent={
          <Text style={{ color: "#aaa" }}>Ainda não há avaliações.</Text>
        }
        scrollEnabled={false} // evita conflito de scroll dentro do ScrollView
      />

      {/* Formulário para enviar avaliação */}
      <View style={styles.reviewForm}>
        <Text style={styles.sectionTitle}>Deixe sua avaliação</Text>
        {/* Estrelas clicáveis */}
        <View style={styles.starInput}>
          {Array.from({ length: 5 }, (_, i) => (
            <TouchableOpacity key={i} onPress={() => setRating(i + 1)}>
              <Ionicons
                name={i < rating ? "star" : "star-outline"}
                size={32}
                color="#FFD700"
              />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Escreva seu comentário"
          value={comment}
          onChangeText={setComment}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.button} onPress={handleAddReview}>
          <Text style={styles.buttonText}>Enviar Avaliação</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#111" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
    backgroundColor: "#20c997",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backText: { color: "#fff", fontSize: 14, marginLeft: 6 },
  image: { width: 200, height: 200, borderRadius: 12, alignSelf: "center", marginBottom: 16 },
  name: { fontSize: 22, fontWeight: "bold", color: "#fff", textAlign: "center" },
  price: { fontSize: 18, color: "#20c997", marginVertical: 8, textAlign: "center" },
  description: { fontSize: 14, textAlign: "center", marginBottom: 20, color: "#aaa" },
  avgContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  avgText: { color: "#fff", marginLeft: 6 },
  button: { backgroundColor: "#20c997", padding: 12, borderRadius: 8, marginTop: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginTop: 20, marginBottom: 10 },
  reviewItem: { backgroundColor: "#222", padding: 10, borderRadius: 8, marginBottom: 10 },
  reviewComment: { color: "#fff", marginTop: 4 },
  reviewDate: { color: "#888", fontSize: 12, marginLeft: 8 },
  reviewForm: { marginTop: 20 },
  starInput: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  input: { backgroundColor: "#222", color: "#fff", padding: 10, borderRadius: 8, marginBottom: 10 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 8 },
oldPrice: { fontSize: 16, color: "#888", textDecorationLine: "line-through", marginRight: 8 },
discountPrice: { fontSize: 20, fontWeight: "bold", color: "#e63946" },
discountBadge: { fontSize: 14, fontWeight: "bold", color: "#20c997", marginLeft: 6 },

});

