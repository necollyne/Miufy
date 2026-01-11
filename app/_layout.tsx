import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import SplashScreen from '../components/SplashScreen';

// Prevent the native splash from auto-hiding
ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden or error - ignore
});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Prepare app and hide native splash
    const prepare = async () => {
      try {
        // Hide native splash screen
        await ExpoSplashScreen.hideAsync();
      } catch (e) {
        // Error hiding splash - continue anyway
        console.log('Splash screen error:', e);
      }
      setIsReady(true);
    };
    prepare();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show nothing until ready
  if (!isReady) {
    return null;
  }

  // Show custom splash screen
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Landing page logic */}
      <Stack.Screen name="index" />

      {/* Auth screens */}
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />

      {/* Main App Screens */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}