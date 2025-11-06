import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '@/constants/config';

export default function VendorOffersScreen() {
  const [offers] = useState([
    { id: '1', collector: 'Green Point Collector', type: 'E-waste', weight: 45, price: 6750 },
    { id: '2', collector: 'Eco Waste Center', type: 'Plastic', weight: 120, price: 4800 },
    { id: '3', collector: 'Recycling Hub', type: 'Paper', weight: 67, price: 1675 },
  ]);

  const handlePurchase = (offer: any) => {
    Alert.alert(
      'Purchase Waste',
      `Buy ${offer.weight}kg of ${offer.type} from ${offer.collector} for Rs. ${offer.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Purchase', onPress: () => Alert.alert('Success', 'Purchase completed!') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Waste Offers</Text>
        <Text style={styles.subtitle}>Buy waste from collectors</Text>
      </View>

      <View style={styles.offersList}>
        {offers.map((offer) => (
          <View key={offer.id} style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <Text style={styles.collectorName}>{offer.collector}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{offer.type}</Text>
              </View>
            </View>
            <View style={styles.offerDetails}>
              <Text style={styles.offerWeight}>⚖️ {offer.weight} kg</Text>
              <Text style={styles.offerPrice}>💰 Rs. {offer.price}</Text>
            </View>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={() => handlePurchase(offer)}
            >
              <Text style={styles.purchaseButtonText}>Purchase</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 60, paddingBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#FFFFFF', opacity: 0.9 },
  offersList: { padding: 20 },
  offerCard: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  collectorName: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark },
  typeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  typeBadgeText: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary },
  offerDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  offerWeight: { fontSize: 16, color: COLORS.dark },
  offerPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  purchaseButton: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 10, alignItems: 'center' },
  purchaseButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
