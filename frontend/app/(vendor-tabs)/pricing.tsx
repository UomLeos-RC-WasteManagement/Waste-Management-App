import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, WASTE_TYPES } from '@/constants/config';

export default function PricingScreen() {
  const [pricing, setPricing] = useState<any>({
    'E-waste': '150',
    'Plastic': '40',
    'Polythene': '35',
    'Metal': '80',
    'Glass': '20',
    'Paper': '25',
    'Organic': '15',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Pricing updated successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pricing Management</Text>
        <Text style={styles.subtitle}>Set purchase prices per kg</Text>
      </View>

      <View style={styles.pricingList}>
        {WASTE_TYPES.map((type) => (
          <View key={type.value} style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.wasteIcon}>{type.icon}</Text>
              <Text style={styles.wasteType}>{type.label}</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.currency}>Rs.</Text>
              <TextInput
                style={styles.input}
                value={pricing[type.value]}
                onChangeText={(value) => setPricing({ ...pricing, [type.value]: value })}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={styles.unit}>/ kg</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Pricing</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 60, paddingBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#FFFFFF', opacity: 0.9 },
  pricingList: { padding: 20 },
  pricingCard: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  pricingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  wasteIcon: { fontSize: 28, marginRight: 12 },
  wasteType: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12 },
  currency: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark, marginRight: 8 },
  input: { flex: 1, fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  unit: { fontSize: 14, color: COLORS.gray, marginLeft: 8 },
  saveButton: { backgroundColor: COLORS.primary, margin: 20, padding: 18, borderRadius: 15, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
