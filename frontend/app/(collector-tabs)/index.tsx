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
import { COLORS } from '@/constants/config';

export default function CollectorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        todayCollections: 15,
        todayWeight: 125.5,
        weeklyWeight: 456.2,
        monthlyWeight: 1850.0,
        totalEarnings: 125000,
        pendingInventory: 234.5,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'collector') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user, fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  // Redirect if not a collector
  if (!user && !loading) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user && user.role !== 'collector') {
    return <Redirect href="/" />;
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
        <Text style={styles.greeting}>Hello, {user?.name}! 🚛</Text>
        <Text style={styles.subtitle}>Collector Dashboard</Text>
      </View>

      <View style={styles.quickStats}>
        <View style={[styles.quickStatCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.quickStatValue}>{stats?.todayCollections || 0}</Text>
          <Text style={styles.quickStatLabel}>Today Collections</Text>
        </View>
        <View style={[styles.quickStatCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.quickStatValue}>{stats?.todayWeight || 0} kg</Text>
          <Text style={styles.quickStatLabel}>Today Weight</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{stats?.weeklyWeight || 0} kg</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>{stats?.monthlyWeight || 0} kg</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>Rs. {stats?.totalEarnings || 0}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{stats?.pendingInventory || 0} kg</Text>
            <Text style={styles.statLabel}>Inventory</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(collector-tabs)/scan' as any)}
        >
          <Text style={styles.actionButtonIcon}>📱</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Scan User QR Code</Text>
            <Text style={styles.actionButtonSubtitle}>Record new waste collection</Text>
          </View>
          <Text style={styles.actionButtonArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(collector-tabs)/inventory' as any)}
        >
          <Text style={styles.actionButtonIcon}>📦</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>View Inventory</Text>
            <Text style={styles.actionButtonSubtitle}>Check collected waste</Text>
          </View>
          <Text style={styles.actionButtonArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(collector-tabs)/vendors' as any)}
        >
          <Text style={styles.actionButtonIcon}>🏭</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Find Vendors</Text>
            <Text style={styles.actionButtonSubtitle}>Sell your collected waste</Text>
          </View>
          <Text style={styles.actionButtonArrow}>›</Text>
        </TouchableOpacity>
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
  quickStats: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  quickStatCard: {
    flex: 1,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 5,
  },
  quickStatLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
  },
  actionButtonArrow: {
    fontSize: 28,
    color: COLORS.gray,
  },
});
