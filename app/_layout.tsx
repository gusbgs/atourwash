import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/colors";
import SplashScreen from "./splash";

ExpoSplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, hasSeenOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    ExpoSplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (showSplash || isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'onboarding';

    if (!isAuthenticated) {
      if (!hasSeenOnboarding) {
        router.replace('/onboarding');
      } else if (!inAuthGroup) {
        router.replace('/login');
      }
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/' as any);
    }
  }, [isAuthenticated, isLoading, hasSeenOnboarding, segments, showSplash]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Kembali" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="new-order" 
        options={{ 
          headerShown: false,
          presentation: 'modal',
          contentStyle: { backgroundColor: colors.background },
        }} 
      />
      <Stack.Screen 
        name="order-detail" 
        options={{ 
          headerShown: true,
          title: 'Detail Pesanan',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }} 
      />
      <Stack.Screen 
        name="production-detail" 
        options={{ 
          headerShown: true,
          title: 'Progress Produksi',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }} 
      />
      <Stack.Screen 
        name="pelanggan" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="cabang" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="keuangan" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="inventaris" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="laporan" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="lainnya" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="karyawan" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="customer-detail" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <AppProvider>
            <RootLayoutNav />
          </AppProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
