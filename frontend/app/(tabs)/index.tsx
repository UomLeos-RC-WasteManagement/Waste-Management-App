import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { ENDPOINTS, COLORS, WASTE_TYPES } from '@/constants/config';

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const response: any = await api.get(ENDPOINTS.DASHBOARD);
      if (response.success) {
        setDashboard(response.data);
        // Update user points if changed
        if (response.data.user.points !== user?.points) {
          updateUser({ points: response.data.user.points });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, updateUser]);

  useEffect(() => {
    if (user) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user, fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  // Redirect to login if not authenticated
  if (!user && !loading) {
    return <Redirect href="/(auth)/login" />;
  }

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
        <Text style={styles.greeting}>Hello, {user?.name}! 👋</Text>
        <Text style={styles.subtitle}>Let&apos;s make Earth green</Text>
      </View>

      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>Your Points</Text>
        <Text style={styles.pointsValue}>{user?.points || 0}</Text>
        <TouchableOpacity style={styles.redeemButton} onPress={() => router.push('/(tabs)/rewards')}>
          <Text style={styles.redeemButtonText}>Redeem Rewards</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🗑️</Text>
          <Text style={styles.statValue}>{dashboard?.user?.totalWasteDisposed || 0} kg</Text>
          <Text style={styles.statLabel}>Total Waste</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>{dashboard?.stats?.totalTransactions || 0}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🏅</Text>
          <Text style={styles.statValue}>{dashboard?.user?.badges?.length || 0}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.monthlyCard}>
          <Text style={styles.monthlyText}>
            {dashboard?.stats?.monthlyWaste || 0} kg waste recycled
          </Text>
        </View>
      </View>

      {dashboard?.stats?.wasteBreakdown && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waste Breakdown</Text>
          {Object.entries(dashboard.stats.wasteBreakdown).map(([type, amount]: any) => {
            const wasteInfo = WASTE_TYPES.find(w => w.value === type);
            return (
              <View key={type} style={styles.wasteItem}>
                <Text style={styles.wasteIcon}>{wasteInfo?.icon || '♻️'}</Text>
                <Text style={styles.wasteType}>{type}</Text>
                <Text style={styles.wasteAmount}>{amount} kg</Text>
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('/(tabs)/map')}
      >
        <Text style={styles.actionButtonText}>Find Collection Points</Text>
      </TouchableOpacity>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
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
  pointsCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: -20,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pointsLabel: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 10,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  redeemButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  monthlyCard: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  monthlyText: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '600',
  },
  wasteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  wasteIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  wasteType: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
  },
  wasteAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionButton: {
    backgroundColor: COLORS.secondary,
    margin: 20,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
