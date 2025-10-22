import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function PostalScreen({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    buscarPedidos();
  }, []);

  const buscarPedidos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('entregador_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      setPedidos(data);
    }
  };

  const alterarStatus = async (orderId, novoStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: novoStatus })
      .eq('id', orderId);

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      buscarPedidos();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  const renderPedido = ({ item }) => (
    <View style={[styles.card, item.status === 'entregue' && styles.entregue]}>
      <Text style={styles.titulo}>Pedido #{item.id}</Text>
      <Text style={styles.text}>Status: {item.status}</Text>
      <Text style={styles.text}>Total: R${item.total}</Text>

      {item.status !== 'entregue' && (
        <View style={styles.botoes}>
          {item.status === 'pendente' && (
            <TouchableOpacity style={styles.btn} onPress={() => alterarStatus(item.id, 'a caminho')}>
              <Text style={styles.btnText}>A Caminho</Text>
            </TouchableOpacity>
          )}
          {item.status === 'a caminho' && (
            <TouchableOpacity style={styles.btn} onPress={() => alterarStatus(item.id, 'entregue')}>
              <Text style={styles.btnText}>Entregue</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const pedidosAtivos = pedidos.filter(p => p.status !== 'entregue');
  const pedidosEntregues = pedidos.filter(p => p.status === 'entregue');

  return (
    <View style={styles.container}>
      <Text style={styles.tituloGeral}>📦 Entregas Atuais</Text>
      <FlatList
        data={pedidosAtivos}
        renderItem={renderPedido}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text style={styles.text}>Nenhum pedido em andamento.</Text>}
      />

      <Text style={styles.tituloGeral}>✅ Entregas Concluídas</Text>
      <FlatList
        data={pedidosEntregues}
        renderItem={renderPedido}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text style={styles.text}>Nenhuma entrega concluída.</Text>}
      />

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 15 },
  tituloGeral: { color: '#20c997', fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  card: { backgroundColor: '#222', padding: 15, borderRadius: 15, marginBottom: 10 },
  entregue: { opacity: 0.6 },
  titulo: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  text: { color: '#ccc', fontSize: 14, marginVertical: 2 },
  botoes: { flexDirection: 'row', marginTop: 10 },
  btn: { backgroundColor: '#20c997', padding: 10, borderRadius: 10, marginRight: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#e63946', padding: 12, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold' },
});
