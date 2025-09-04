// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    let query = supabase.from('products').select('*');
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (!error && data) {
      setProducts(data);
      const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  };

  // 👉 Agora sem Alert
  const handleCategoryPress = (item) => {
    if (category === item) {
      setCategory(null); // se já estava selecionada, volta para todos
    } else {
      setCategory(item);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>R$ {item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categorias</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.categoryBtn, 
              category === item && styles.categoryBtnActive
            ]}
            onPress={() => handleCategoryPress(item)}
          >
            <Text style={[
              styles.categoryText,
              category === item && styles.categoryTextActive
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />

      <Text style={styles.title}>
        {category ? `Produtos de ${category}` : "Todos os Produtos"}
      </Text>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#111' }, 
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#fff' },
  card: { 
    flex: 1, 
    margin: 8, 
    backgroundColor: '#fff', // <- fundo branco
    borderRadius: 12, 
    padding: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4
  },
  image: { width: 100, height: 100, borderRadius: 10, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#000' }, // <- texto preto
  price: { fontSize: 14, color: '#20c997', marginTop: 4 },
  categoryBtn: { 
    flex: 1,
    paddingVertical: 14, 
    paddingHorizontal: 10, 
    borderRadius: 12, 
    backgroundColor: '#333', 
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  categoryBtnActive: { backgroundColor: '#20c997' },
  categoryText: { fontSize: 14, color: '#aaa' },
  categoryTextActive: { color: '#fff', fontWeight: 'bold' }
});