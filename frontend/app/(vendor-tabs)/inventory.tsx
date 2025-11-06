import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS, WASTE_TYPES } from '@/constants/config';

export default function CollectorInventoryScreen() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      // TODO: Replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInventory([
        { type: 'E-waste', weight: 45.5, collections: 12 },
        { type: 'Plastic', weight: 123.2, collections: 34 },
        { type: 'Paper', weight: 67.8, collections: 21 },
        { type: 'Metal', weight: 34.1, collections: 8 },
        { type: 'Glass', weight: 28.5, collections: 15 },
      ]);
    } catch (error) {
      console.error('Error fetching inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInventory();
  };

  const getTotalWeight = () => {
    return inventory.reduce((sum, item) => sum + item.weight, 0).toFixed(1);
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
        <Text style={styles.title}>Inventory</Text>
        <Text style={styles.subtitle}>Collected waste ready to sell</Text>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Inventory</Text>
        <Text style={styles.totalValue}>{getTotalWeight()} kg</Text>
      </View>

      <View style={styles.inventoryList}>
        {inventory.map((item, index) => {
          const wasteInfo = WASTE_TYPES.find(w => w.value === item.type);
          return (
            <View key={index} style={styles.inventoryCard}>
              <Text style={styles.inventoryIcon}>{wasteInfo?.icon || '♻️'}</Text>
              <View style={styles.inventoryInfo}>
                <Text style={styles.inventoryType}>{item.type}</Text>
                <Text style={styles.inventoryCollections}>
                  {item.collections} collections
                </Text>
              </View>
              <View style={styles.inventoryWeight}>
                <Text style={styles.inventoryWeightValue}>{item.weight} kg</Text>
              </View>
            </View>
          );
        })}
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
  totalCard: {
    backgroundColor: '#E8F5E9',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 10,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  inventoryList: {
    padding: 20,
    paddingTop: 0,
  },
  inventoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inventoryIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  inventoryCollections: {
    fontSize: 13,
    color: COLORS.gray,
  },
  inventoryWeight: {
    alignItems: 'flex-end',
  },
  inventoryWeightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
