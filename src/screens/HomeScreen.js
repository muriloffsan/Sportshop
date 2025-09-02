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

      // gera lista de categorias únicas
      const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
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
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.categoryBtn, 
              category === item && styles.categoryBtnActive
            ]}
            onPress={() => setCategory(category === item ? null : item)}
          >
            <Text style={styles.categoryText}>{item}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.title}>Produtos</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  card: { flex: 1, margin: 8, backgroundColor: '#f9f9f9', borderRadius: 12, padding: 10, alignItems: 'center' },
  image: { width: 100, height: 100, borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  price: { fontSize: 14, color: '#20c997', marginTop: 4 },
  categoryBtn: { padding: 8, borderRadius: 20, backgroundColor: '#eee', marginRight: 8 },
  categoryBtnActive: { backgroundColor: '#20c997' },
  categoryText: { fontSize: 14 }
});
