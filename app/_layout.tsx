import { Stack } from 'expo-router';

export default function RootLayout() {
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