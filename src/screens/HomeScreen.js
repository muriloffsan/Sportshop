import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ícones Ionicons

const products = [
  { id: '1', name: 'Tênis', price: '$1.200', image: require('../../assets/Tenis.png') },
  { id: '2', name: 'Bola de Futebol', price: '$350', image: require('../../assets/Bola.png') },
  { id: '3', name: 'Camisa', price: '$199.99', image: require('../../assets/camisa.png') },
];

export default function HomeScreen({ navigation, user, onSignOut }) {

  const handleSignOut = () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => { onSignOut(); navigation.navigate('Login'); } }
      ]
    );
  };

  const handleBuy = (product) => {
    Alert.alert('Compra', `Você comprou: ${product.name} por ${product.price}`);
  };

  return (
    <View style={styles.container}>
      {/* Header com ícones */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={{ marginRight: 15 }}>
            <Ionicons name="menu-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="cart-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/TASK.png')} style={styles.logoImage} />
      </View>

      {/* Título */}
      <Text style={styles.title}>SportShop</Text>

      {/* Descrição */}
      <Text style={styles.description}>
        Buscamos oferecer o melhor em roupas, tênis e acessórios esportivos para quem vive o esporte dentro e fora das quadras. Trabalhamos para unir qualidade, conforto e estilo, ajudando você a alcançar sua melhor performance e viver com mais energia. Venha fazer parte da nossa paixão pelo movimento e descubra tudo o que o esporte pode trazer para sua vida!
      </Text>

      {/* Loja */}
      <Text style={styles.sectionTitle}>LOJA</Text>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item)}>
              <Text style={styles.buyButtonText}>Comprar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.verMaisButton}>
        <Text style={styles.verMaisText}>Ver mais</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  headerIcons: { flexDirection: 'row' },
  logoContainer: { alignItems: 'center', marginBottom: 10 },
  logoImage: { width: 250, height: 250, resizeMode: 'contain' },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  description: { color: '#aaa', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  list: { paddingBottom: 10 },
  card: { backgroundColor: '#222', borderRadius: 10, padding: 8, marginRight: 12, width: 120, alignItems: 'center' },
  productImage: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 8 },
  productName: { color: '#fff', fontWeight: 'bold', marginBottom: 3, fontSize: 12 },
  productPrice: { color: '#20c997', marginBottom: 8, fontSize: 12 },
  buyButton: { backgroundColor: '#20c997', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 5 },
  buyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  verMaisButton: { alignSelf: 'center', marginTop: 10, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#20c997' },
  verMaisText: { color: '#111', fontWeight: 'bold' },
});
