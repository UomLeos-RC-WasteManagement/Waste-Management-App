import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { COLORS } from '@/constants/config';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade', // Smooth fade animation instead of white flash
          animationDuration: 150,
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(collector-tabs)" />
        <Stack.Screen name="(vendor-tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      {/* Force dark status bar text on light backgrounds */}
      <StatusBar style="dark" backgroundColor={COLORS.white} translucent={false} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
