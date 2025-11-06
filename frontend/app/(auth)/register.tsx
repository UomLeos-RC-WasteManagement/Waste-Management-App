import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { COLORS, WASTE_TYPES } from '@/constants/config';

type Role = 'user' | 'collector' | 'vendor';

interface RoleConfig {
  icon: string;
  title: string;
  color: string;
}

const roleConfigs: Record<Role, RoleConfig> = {
  user: { icon: '👤', title: 'User', color: '#2ECC71' },
  collector: { icon: '🚛', title: 'Collector', color: '#3498DB' },
  vendor: { icon: '🏭', title: 'Vendor', color: '#9B59B6' },
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const params = useLocalSearchParams();
  
  const role = (params.role as Role) || 'user';
  const roleConfig = roleConfigs[role];
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: role,
    // Collector specific
    acceptedWasteTypes: [] as string[],
    operatingHours: '',
    description: '',
    // Vendor specific
    businessType: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleWasteType = (wasteType: string) => {
    setFormData(prev => {
      const current = prev.acceptedWasteTypes;
      const updated = current.includes(wasteType)
        ? current.filter(t => t !== wasteType)
        : [...current, wasteType];
      return { ...prev, acceptedWasteTypes: updated };
    });
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, phone } = formData;

    // Validation
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Role-specific validation
    if (role === 'collector' && formData.acceptedWasteTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one waste type you accept');
      return;
    }

    if (role === 'vendor' && !formData.businessType) {
      Alert.alert('Error', 'Please enter your business type');
      return;
    }

    setLoading(true);
    try {
      // Prepare data based on role
      const registrationData: any = {
        name,
        email: email.toLowerCase().trim(),
        password,
        phone,
        role,
      };

      if (role === 'collector') {
        registrationData.acceptedWasteTypes = formData.acceptedWasteTypes;
        registrationData.operatingHours = formData.operatingHours;
        registrationData.description = formData.description;
      } else if (role === 'vendor') {
        registrationData.businessType = formData.businessType;
        registrationData.description = formData.description;
        registrationData.website = formData.website;
      }

      await register(registrationData);
      
      // Navigate based on role
      if (role === 'collector') {
        router.replace('/(collector-tabs)');
      } else if (role === 'vendor') {
        router.replace('/(vendor-tabs)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.icon}>{roleConfig.icon}</Text>
          <Text style={[styles.title, { color: roleConfig.color }]}>
            Register as {roleConfig.title}
          </Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>
        </View>

        <View style={styles.form}>
          {/* Basic Information */}
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+1234567890"
              value={formData.phone}
              onChangeText={(value) => handleChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              secureTextEntry
            />
          </View>

          {/* Collector Specific Fields */}
          {role === 'collector' && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                Collection Point Details
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Accepted Waste Types *</Text>
                <View style={styles.wasteTypeGrid}>
                  {['E-waste', 'Plastic', 'Polythene', 'Glass', 'Paper', 'Metal', 'Organic'].map(
                    (type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.wasteTypeChip,
                          formData.acceptedWasteTypes.includes(type) && {
                            backgroundColor: roleConfig.color,
                            borderColor: roleConfig.color,
                          },
                        ]}
                        onPress={() => toggleWasteType(type)}
                      >
                        <Text
                          style={[
                            styles.wasteTypeText,
                            formData.acceptedWasteTypes.includes(type) && styles.wasteTypeTextActive,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Operating Hours</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Mon-Fri 9AM-5PM"
                  value={formData.operatingHours}
                  onChangeText={(value) => handleChange('operatingHours', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us about your collection point"
                  value={formData.description}
                  onChangeText={(value) => handleChange('description', value)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </>
          )}

          {/* Vendor Specific Fields */}
          {role === 'vendor' && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Business Details</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Business Type *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Recycling Plant, Waste Processing"
                  value={formData.businessType}
                  onChangeText={(value) => handleChange('businessType', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChangeText={(value) => handleChange('website', value)}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us about your business"
                  value={formData.description}
                  onChangeText={(value) => handleChange('description', value)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: roleConfig.color },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.linkText, { color: roleConfig.color }]}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  icon: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.dark,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.light,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  wasteTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wasteTypeChip: {
    borderWidth: 2,
    borderColor: COLORS.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  wasteTypeText: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '500',
  },
  wasteTypeTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
