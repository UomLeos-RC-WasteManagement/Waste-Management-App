import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import api from '@/services/api';
import { ENDPOINTS, COLORS } from '@/constants/config';

export default function VendorsScreen() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      console.log('🏭 Fetching vendors...');
      const response: any = await api.get(ENDPOINTS.COLLECTOR_VENDORS);
      
      console.log('📥 Vendors response:', response);
      
      if (response.success && response.data) {
        const vendorsData = response.data.vendors || response.data;
        setVendors(vendorsData);
        console.log('✅ Loaded vendors:', vendorsData.length, 'vendors');
      } else {
        console.log('⚠️ No vendors data available');
        setVendors([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVendors();
  };

  const handleContactVendor = (vendor: any) => {
    Alert.alert(
      vendor.name,
      `Contact: ${vendor.phone}\nLocation: ${vendor.location}\n\nWould you like to call this vendor?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling...', vendor.phone) },
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
        <Text style={styles.title}>Find Vendors</Text>
        <Text style={styles.subtitle}>Sell your collected waste</Text>
      </View>

      <View style={styles.vendorsList}>
        {vendors.map((vendor) => (
          <View key={vendor.id} style={styles.vendorCard}>
            <View style={styles.vendorHeader}>
              <Text style={styles.vendorIcon}>🏭</Text>
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{vendor.name}</Text>
                <Text style={styles.vendorLocation}>📍 {vendor.location}</Text>
              </View>
            </View>

            <View style={styles.wasteTypesContainer}>
              <Text style={styles.wasteTypesLabel}>Accepts:</Text>
              <View style={styles.wasteTypesList}>
                {vendor.wasteTypes.map((type: string) => (
                  <View key={type} style={styles.wasteTypeBadge}>
                    <Text style={styles.wasteTypeBadgeText}>{type}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.pricingContainer}>
              <Text style={styles.pricingLabel}>Pricing:</Text>
              {Object.entries(vendor.pricePerKg).map(([type, price]: any) => (
                <Text key={type} style={styles.pricingItem}>
                  {type}: Rs. {price}/kg
                </Text>
              ))}
            </View>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContactVendor(vendor)}
            >
              <Text style={styles.contactButtonText}>Contact Vendor</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  vendorsList: {
    padding: 20,
  },
  vendorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  vendorIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 5,
  },
  vendorLocation: {
    fontSize: 14,
    color: COLORS.gray,
  },
  wasteTypesContainer: {
    marginBottom: 15,
  },
  wasteTypesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  wasteTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wasteTypeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  wasteTypeBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  pricingContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  pricingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 6,
  },
  pricingItem: {
    fontSize: 13,
    color: COLORS.dark,
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
