import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import api from '@/services/api';
import { ENDPOINTS, COLORS } from '@/constants/config';

export default function VendorOffersScreen() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      console.log('🛍️ Fetching waste offers...');
      const response: any = await api.get(ENDPOINTS.VENDOR_OFFERS);
      
      console.log('📥 Offers response:', response);
      
      if (response.success && response.data) {
        const offersData = response.data.offers || response.data;
        setOffers(offersData);
        console.log('✅ Loaded offers:', offersData.length, 'offers');
      } else {
        console.log('⚠️ No offers available');
        setOffers([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  const handlePurchase = async (offer: any) => {
    Alert.alert(
      'Purchase Waste',
      `Buy ${offer.weight}kg of ${offer.type} from ${offer.collector} for Rs. ${offer.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              console.log('💰 Purchasing waste...', offer.id);
              const response: any = await api.post(ENDPOINTS.VENDOR_PURCHASE, {
                offerId: offer.id,
                collectorId: offer.collectorId,
                wasteType: offer.type,
                weight: offer.weight,
                price: offer.price,
              });
              
              if (response.success) {
                Alert.alert('Success', 'Purchase completed!');
                fetchOffers(); // Refresh the list
              } else {
                Alert.alert('Error', response.message || 'Purchase failed');
              }
            } catch (error: any) {
              console.error('❌ Purchase error:', error);
              Alert.alert('Error', error.message || 'Purchase failed');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
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
