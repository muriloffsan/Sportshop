import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  Alert, 
  SafeAreaView
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../lib/supabase";

export default function PromoAdmin() {
  const [coupons, setCoupons] = useState([]);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const [promoUntil, setPromoUntil] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase.from("coupons").select("*");

    if (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar os cupons.");
      return;
    }

    setCoupons(data);
  };

  const handleCreateCoupon = async () => {
    const numericDiscount = parseFloat(discount);
    const numericUsage = parseInt(usageLimit);

    if (!couponCode.trim()) {
      Alert.alert("Aviso", "Digite o código do cupom.");
      return;
    }

    if (isNaN(numericDiscount) || numericDiscount <= 0) {
      Alert.alert("Aviso", "Informe um desconto válido (> 0).");
      return;
    }

    if (isNaN(numericUsage) || numericUsage <= 0) {
      Alert.alert("Aviso", "Informe um limite de uso válido (> 0).");
      return;
    }

    const { error } = await supabase
      .from("coupons")
      .insert([
        {
          code: couponCode.toUpperCase(),
          discount: numericDiscount,
          end_date: promoUntil.toISOString(),
          usage_limit: numericUsage,
        },
      ]);

    if (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível criar o cupom.");
      return;
    }

    Alert.alert("Sucesso", `Cupom "${couponCode}" criado!`);
    setCouponCode("");
    setDiscount("");
    setUsageLimit("");
    fetchCoupons();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <Text style={styles.title}>Gerenciar Cupons</Text>

        {/* FORM */}
        <View style={styles.form}>

          <Text style={styles.label}>Código do Cupom</Text>
          <TextInput
            placeholder="Ex: BLACKFRIDAY"
            placeholderTextColor="#888"
            style={styles.input}
            value={couponCode}
            onChangeText={setCouponCode}
          />

          <Text style={styles.label}>Desconto (%)</Text>
          <TextInput
            placeholder="Ex: 15"
            placeholderTextColor="#888"
            keyboardType="numeric"
            style={styles.input}
            value={discount}
            onChangeText={setDiscount}
          />

          <Text style={styles.label}>Limite de Uso</Text>
          <TextInput
            placeholder="Ex: 100"
            placeholderTextColor="#888"
            keyboardType="numeric"
            style={styles.input}
            value={usageLimit}
            onChangeText={setUsageLimit}
          />

          <Text style={styles.label}>Expira em</Text>
          <TouchableOpacity 
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateBtnText}>
              {promoUntil.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={promoUntil}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setPromoUntil(date);
              }}
            />
          )}
        </View>

        {/* Botão criar */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleCreateCoupon}>
          <Text style={styles.saveBtnText}>Criar Cupom</Text>
        </TouchableOpacity>

        {/* LISTA */}
        <FlatList
          data={coupons}
          keyExtractor={(item) => item.id.toString()}
          style={{ marginTop: 20 }}
          renderItem={({ item }) => (
            <View style={styles.couponCard}>
              <Text style={styles.couponCode}>{item.code}</Text>
              <Text style={styles.couponText}>Desconto: {item.discount}%</Text>
              <Text style={styles.couponText}>Limite: {item.usage_limit}</Text>
              <Text style={styles.couponText}>
                Usado: {item.used_count}
              </Text>
              <Text style={styles.couponDate}>
                Expira em: {new Date(item.end_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        />

      </View>
    </SafeAreaView>
  );
}

const GREEN = "#20c997";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    padding: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: GREEN,
    marginBottom: 20,
    textAlign: "center",
  },

  form: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
  },

  label: {
    color: "#fff",
    marginBottom: 6,
    fontSize: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: GREEN,
    padding: 12,
    borderRadius: 8,
    color: "#fff",
    marginBottom: 15,
  },

  dateBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: GREEN,
    alignItems: "center",
  },
  dateBtnText: {
    color: "#000",
    fontWeight: "bold",
  },

  saveBtn: {
    marginTop: 15,
    padding: 14,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },

  couponCard: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: GREEN,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  couponCode: {
    color: GREEN,
    fontSize: 18,
    fontWeight: "bold",
  },
  couponText: {
    color: "#ccc",
    fontSize: 15,
  },
  couponDate: {
    color: "#888",
    marginTop: 4,
  },
});
