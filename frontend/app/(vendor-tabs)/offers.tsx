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
  TextInput,
  Modal,
} from 'react-native';
import api from '@/services/api';
import { ENDPOINTS, COLORS } from '@/constants/config';

export default function VendorOffersScreen() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [pricePerKg, setPricePerKg] = useState('');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      console.log('🛍️ Fetching waste offers...');
      const response: any = await api.get(ENDPOINTS.VENDOR_OFFERS);
      
      console.log('📥 Offers response:', response);
      
      if (response.success && response.data) {
        // Data now comes from WasteOffer model, not collector inventory
        const offersData = Array.isArray(response.data) ? response.data : [];
        
        // Transform to include collector info
        const transformedOffers = offersData.map((offer: any) => ({
          ...offer,
          collectorId: offer.collector?._id || offer.collector,
          collectorName: offer.collector?.name || 'Unknown Collector',
          quantity: offer.quantity?.value || offer.quantity,
          wasteType: offer.wasteType,
        }));
        
        setOffers(transformedOffers);
        console.log('✅ Loaded offers:', transformedOffers.length, 'offers');
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
    setSelectedOffer(offer);
    
    // Prompt for price per kg
    Alert.prompt(
      'Enter Price',
      `How much will you pay per kg for ${offer.wasteType || 'this waste'}?\n\nQuantity: ${offer.quantity || 0} kg`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setSelectedOffer(null),
        },
        {
          text: 'Purchase',
          onPress: (priceInput?: string) => {
            const price = parseFloat(priceInput || '0');
            
            if (!price || price <= 0) {
              Alert.alert('Invalid Price', 'Please enter a valid price per kg');
              setSelectedOffer(null);
              return;
            }
            
            completePurchase(offer, price);
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const completePurchase = async (offer: any, pricePerKg: number) => {
    try {
      console.log('💰 Purchasing waste...', offer);
      
      const quantity = offer.quantity || offer.weight || 0;
      const totalAmount = quantity * pricePerKg;
      
      // Prepare purchase data
      const purchaseData = {
        offerId: offer._id, // Link to the WasteOffer
        collectorId: offer.collectorId || offer.collector?._id || offer.collector,
        wasteType: offer.wasteType || offer.type || 'Mixed',
        quantity: quantity,
        pricePerUnit: pricePerKg,
        notes: `Purchased from ${offer.collectorName}`,
      };
      
      console.log('📤 Purchase data:', purchaseData);
      
      const response: any = await api.post(ENDPOINTS.VENDOR_PURCHASE, purchaseData);
      
      if (response.success) {
        Alert.alert(
          'Success! ✅',
          `You have successfully purchased:\n\n` +
          `Waste Type: ${purchaseData.wasteType}\n` +
          `Quantity: ${quantity} kg\n` +
          `Price per kg: Rs. ${pricePerKg}\n` +
          `Total: Rs. ${totalAmount.toFixed(2)}\n\n` +
          `From: ${offer.collectorName}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedOffer(null);
                fetchOffers(); // Refresh the list
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Purchase failed');
        setSelectedOffer(null);
      }
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      Alert.alert('Error', error.message || 'Failed to complete purchase');
      setSelectedOffer(null);
    }
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
        {offers.map((offer, index) => (
          <View key={offer._id || `offer-${index}`} style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <Text style={styles.collectorName}>
                {offer.collectorName || 'Unknown Collector'}
              </Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {offer.wasteType || offer.type || 'Mixed'}
                </Text>
              </View>
            </View>
            <View style={styles.offerDetails}>
              <Text style={styles.offerWeight}>
                ⚖️ {offer.quantity || offer.weight || 0} kg
              </Text>
              <Text style={styles.offerPrice}>
                💰 Price on request
              </Text>
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
