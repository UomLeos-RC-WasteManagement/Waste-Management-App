import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '@/services/api';
import { ENDPOINTS, COLORS, WASTE_TYPES, POINTS_PER_KG } from '@/constants/config';

export default function ScanQRScreen() {
  const [userQR, setUserQR] = useState('');
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  
  // Waste collection form state
  const [weight, setWeight] = useState('');
  const [selectedWasteType, setSelectedWasteType] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openCamera = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to scan QR codes');
        return;
      }
    }

    setScanned(false);
    setShowCamera(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setShowCamera(false);
    setUserQR(data);
    handleScanQR(data);
  };

  const handleScanQR = async (qrData?: string) => {
    const qrCode = qrData || userQR;
    
    if (!qrCode.trim()) {
      Alert.alert('Error', 'Please scan or enter user QR code');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Looking up user with QR:', qrCode);
      
      const response: any = await api.post(ENDPOINTS.COLLECTOR_VERIFY_QR, {
        qrCode: qrCode
      });
      
      console.log('✅ User found:', response);
      
      if (response.success && response.data.user) {
        setScannedUser(response.data.user);
        setRecentTransactions(response.data.recentTransactions || []);
      } else {
        Alert.alert('Error', 'User not found');
        setScannedUser(null);
      }
    } catch (error: any) {
      console.error('❌ Error finding user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to find user.';
      Alert.alert('Error', errorMessage);
      setScannedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWasteModal = () => {
    setWeight('');
    setSelectedWasteType('');
    setNotes('');
    setShowWasteModal(true);
  };

  const calculatePoints = () => {
    if (!weight || !selectedWasteType) return 0;
    const weightValue = parseFloat(weight) || 0;
    return Math.round(weightValue * (POINTS_PER_KG[selectedWasteType as keyof typeof POINTS_PER_KG] || 0));
  };

  const handleSubmitCollection = async () => {
    if (!weight || parseFloat(weight) <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    if (!selectedWasteType) {
      Alert.alert('Error', 'Please select a waste type');
      return;
    }

    const weightValue = parseFloat(weight);
    const points = calculatePoints();

    setSubmitting(true);
    try {
      console.log('📝 Recording collection...');
      
      const response: any = await api.post(ENDPOINTS.COLLECTOR_RECORD_COLLECTION, {
        userId: scannedUser._id,
        wasteType: selectedWasteType,
        quantity: weightValue,
        unit: 'kg',
        qrCodeScanned: true,
        notes: notes || `QR scan collection`
      });
      
      console.log('✅ Collection recorded:', response);
      
      if (response.success) {
        const earnedPoints = response.data.transaction.pointsEarned;
        const newBadges = response.data.newBadges;
        
        // Update the scanned user's points locally
        setScannedUser((prev: any) => ({
          ...prev,
          points: (prev.points || 0) + earnedPoints,
          totalWasteDisposed: (prev.totalWasteDisposed || 0) + weightValue
        }));

        // Add to recent transactions
        setRecentTransactions((prev) => [{
          wasteType: selectedWasteType,
          quantity: { value: weightValue },
          pointsEarned: earnedPoints,
          createdAt: new Date().toISOString()
        }, ...prev.slice(0, 4)]);

        setShowWasteModal(false);
        
        let message = `✅ Collection recorded!\n\n📦 ${weightValue}kg of ${selectedWasteType}\n🎁 ${earnedPoints} points awarded to ${scannedUser.name}`;
        
        if (newBadges && newBadges.length > 0) {
          message += `\n\n🎖️ New badge(s) earned!`;
        }
        
        Alert.alert('Success!', message);
      } else {
        Alert.alert('Error', response.message || 'Failed to record collection');
      }
    } catch (error: any) {
      console.error('❌ Error recording collection:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to record collection';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setUserQR('');
    setScannedUser(null);
    setRecentTransactions([]);
    setWeight('');
    setSelectedWasteType('');
    setNotes('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📷 Scan & Collect</Text>
          <Text style={styles.subtitle}>Scan user QR code to record waste collection</Text>
        </View>

        {/* Scan Section */}
        {!scannedUser ? (
          <View style={styles.scanSection}>
            <View style={styles.scanCard}>
              <Text style={styles.scanIcon}>📱</Text>
              <Text style={styles.scanTitle}>Scan User QR Code</Text>
              <Text style={styles.scanDescription}>
                Point your camera at the user's QR code to identify them
              </Text>
              
              <TouchableOpacity
                style={styles.scanButton}
                onPress={openCamera}
                disabled={loading}
              >
                <Text style={styles.scanButtonText}>📷 Open Camera Scanner</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Enter QR code manually..."
                value={userQR}
                onChangeText={setUserQR}
                autoCapitalize="none"
              />
              
              <TouchableOpacity
                style={[styles.verifyButton, (!userQR.trim() || loading) && styles.buttonDisabled]}
                onPress={() => handleScanQR()}
                disabled={loading || !userQR.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify User</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* User Details Section */
          <View style={styles.userSection}>
            {/* User Profile Card */}
            <View style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {scannedUser.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{scannedUser.name}</Text>
                  <Text style={styles.userEmail}>{scannedUser.email}</Text>
                  {scannedUser.phone && (
                    <Text style={styles.userPhone}>📞 {scannedUser.phone}</Text>
                  )}
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{scannedUser.points || 0}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{scannedUser.totalWasteDisposed?.toFixed(1) || 0} kg</Text>
                  <Text style={styles.statLabel}>Total Waste</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{scannedUser.badges?.length || 0}</Text>
                  <Text style={styles.statLabel}>Badges</Text>
                </View>
              </View>
            </View>

            {/* Add Waste Collection Button */}
            <TouchableOpacity
              style={styles.addWasteButton}
              onPress={handleOpenWasteModal}
            >
              <Text style={styles.addWasteIcon}>➕</Text>
              <View style={styles.addWasteTextContainer}>
                <Text style={styles.addWasteTitle}>Add Waste Collection</Text>
                <Text style={styles.addWasteSubtitle}>Record new waste drop-off and award points</Text>
              </View>
              <Text style={styles.addWasteArrow}>›</Text>
            </TouchableOpacity>

            {/* Recent Transactions */}
            {recentTransactions.length > 0 && (
              <View style={styles.transactionsCard}>
                <Text style={styles.transactionsTitle}>📋 Recent Transactions</Text>
                {recentTransactions.map((transaction, index) => (
                  <View key={index} style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      <Text>{WASTE_TYPES.find(w => w.value === transaction.wasteType)?.icon || '♻️'}</Text>
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionType}>{transaction.wasteType}</Text>
                      <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
                    </View>
                    <View style={styles.transactionStats}>
                      <Text style={styles.transactionWeight}>{transaction.quantity.value} kg</Text>
                      <Text style={styles.transactionPoints}>+{transaction.pointsEarned} pts</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>🔄 Scan New User</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <Text style={styles.cameraTitle}>Scan User QR Code</Text>
                <Text style={styles.cameraSubtitle}>
                  Position the QR code within the frame
                </Text>
              </View>

              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.closeButtonText}>✕ Cancel</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>

      {/* Waste Collection Modal */}
      <Modal
        visible={showWasteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWasteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Waste Collection</Text>
              <TouchableOpacity onPress={() => setShowWasteModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {scannedUser && (
              <View style={styles.modalUserInfo}>
                <Text style={styles.modalUserName}>For: {scannedUser.name}</Text>
                <Text style={styles.modalUserPoints}>Current Points: {scannedUser.points}</Text>
              </View>
            )}

            <ScrollView style={styles.modalBody}>
              {/* Waste Type Selection */}
              <Text style={styles.modalSectionTitle}>Select Waste Type</Text>
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
                      {POINTS_PER_KG[type.value as keyof typeof POINTS_PER_KG]} pts/kg
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Weight Input */}
              <Text style={styles.modalSectionTitle}>Enter Weight (kg)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., 2.5"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />

              {/* Notes */}
              <Text style={styles.modalSectionTitle}>Notes (Optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.notesInput]}
                placeholder="Any additional notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />

              {/* Points Preview */}
              {weight && selectedWasteType && (
                <View style={styles.pointsPreview}>
                  <Text style={styles.pointsPreviewLabel}>Points to Award:</Text>
                  <Text style={styles.pointsPreviewValue}>+{calculatePoints()} points</Text>
                </View>
              )}
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowWasteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, (!weight || !selectedWasteType || submitting) && styles.buttonDisabled]}
                onPress={handleSubmitCollection}
                disabled={!weight || !selectedWasteType || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit & Award Points</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 20,
    paddingBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scanSection: {
    padding: 20,
    flex: 1,
  },
  scanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scanIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 10,
  },
  scanDescription: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: COLORS.gray,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    width: '100%',
    marginBottom: 15,
  },
  verifyButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  userSection: {
    padding: 20,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
  },
  addWasteButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addWasteIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  addWasteTextContainer: {
    flex: 1,
  },
  addWasteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  addWasteSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  addWasteArrow: {
    fontSize: 30,
    color: COLORS.primary,
  },
  transactionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  transactionStats: {
    alignItems: 'flex-end',
  },
  transactionWeight: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  transactionPoints: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionButtons: {
    marginTop: 10,
  },
  resetButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  // Camera Modal Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  cameraSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
  },
  scanFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderColor: COLORS.primary,
  },
  topLeft: {
    top: -100,
    left: -100,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -100,
    right: -100,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -100,
    left: -100,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -100,
    right: -100,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  closeButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  // Waste Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.gray,
    padding: 5,
  },
  modalUserInfo: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  modalUserPoints: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
    marginTop: 10,
  },
  wasteTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  wasteTypeCard: {
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '31%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wasteTypeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  wasteTypeIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  wasteTypeLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 3,
    textAlign: 'center',
  },
  wasteTypePoints: {
    fontSize: 9,
    color: COLORS.gray,
  },
  modalInput: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  pointsPreview: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  pointsPreviewLabel: {
    fontSize: 16,
    color: COLORS.dark,
  },
  pointsPreviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
