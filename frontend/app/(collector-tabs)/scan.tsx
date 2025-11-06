import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, WASTE_TYPES, POINTS_PER_KG } from '@/constants/config';
import { useAuth } from '@/context/AuthContext';

export default function ScanQRScreen() {
  const { user } = useAuth();
  const [userQR, setUserQR] = useState('');
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [weight, setWeight] = useState('');
  const [selectedWasteType, setSelectedWasteType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScanQR = async () => {
    if (!userQR.trim()) {
      Alert.alert('Error', 'Please enter user QR code');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call to verify user
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock user data
      setScannedUser({
        _id: userQR,
        name: 'John Doe',
        email: 'john@example.com',
        points: 450,
        qrCode: userQR,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to find user. Please check the QR code.');
      setScannedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordCollection = async () => {
    if (!scannedUser) {
      Alert.alert('Error', 'Please scan a user QR code first');
      return;
    }

    if (!weight || parseFloat(weight) <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    if (!selectedWasteType) {
      Alert.alert('Error', 'Please select a waste type');
      return;
    }

    const weightValue = parseFloat(weight);
    const points = Math.round(weightValue * (POINTS_PER_KG[selectedWasteType] || 0));

    Alert.alert(
      'Confirm Collection',
      `Record ${weightValue}kg of ${selectedWasteType} for ${scannedUser.name}?\n\nUser will earn: ${points} points`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              // TODO: API call to record transaction
              await new Promise(resolve => setTimeout(resolve, 500));
              
              Alert.alert(
                'Success!',
                `Collection recorded successfully!\n\n${scannedUser.name} earned ${points} points`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Reset form
                      setUserQR('');
                      setScannedUser(null);
                      setWeight('');
                      setSelectedWasteType('');
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to record collection');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReset = () => {
    setUserQR('');
    setScannedUser(null);
    setWeight('');
    setSelectedWasteType('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan User QR Code</Text>
          <Text style={styles.subtitle}>Record waste collection</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step 1: Scan User</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter or scan user QR code"
                value={userQR}
                onChangeText={setUserQR}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleScanQR}
              disabled={loading || !userQR.trim()}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Searching...' : 'Verify User'}
              </Text>
            </TouchableOpacity>
          </View>

          {scannedUser && (
            <>
              <View style={styles.userCard}>
                <Text style={styles.userIcon}>👤</Text>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{scannedUser.name}</Text>
                  <Text style={styles.userEmail}>{scannedUser.email}</Text>
                  <Text style={styles.userPoints}>Current Points: {scannedUser.points}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Step 2: Select Waste Type</Text>
                <View style={styles.wasteTypeGrid}>
                  {WASTE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.wasteTypeCard,
                        selectedWasteType === type.value && styles.wasteTypeCardActive,
                      ]}
                      onPress={() => setSelectedWasteType(type.value)}
                    >
                      <Text style={styles.wasteTypeIcon}>{type.icon}</Text>
                      <Text style={styles.wasteTypeLabel}>{type.label}</Text>
                      <Text style={styles.wasteTypePoints}>
                        {POINTS_PER_KG[type.value]} pts/kg
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Step 3: Enter Weight</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter weight in kg"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                  />
                </View>
                {weight && selectedWasteType && (
                  <View style={styles.pointsPreview}>
                    <Text style={styles.pointsPreviewText}>
                      User will earn: {Math.round(parseFloat(weight || '0') * (POINTS_PER_KG[selectedWasteType] || 0))} points
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={handleReset}
                >
                  <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleRecordCollection}
                  disabled={loading || !weight || !selectedWasteType}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Recording...' : 'Record Collection'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
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
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  userIcon: {
    fontSize: 48,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  userPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  wasteTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wasteTypeCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '31%',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  wasteTypeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  wasteTypeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  wasteTypeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
    textAlign: 'center',
  },
  wasteTypePoints: {
    fontSize: 10,
    color: COLORS.gray,
  },
  pointsPreview: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  pointsPreviewText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonPrimary: {
    flex: 2,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  buttonTextSecondary: {
    color: COLORS.dark,
  },
});
