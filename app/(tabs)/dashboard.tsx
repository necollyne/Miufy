import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// ALISIN O I-COMMENT ANG MGA FIREBASE IMPORTS NA ITO:
// import { auth } from '../../firebaseConfig'; 
// import { signOut } from 'firebase/auth'; 
import { router } from 'expo-router';

export default function DashboardScreen() {
  const handleLogout = () => {
    // Temporary: Babalik muna tayo sa login screen habang ginagawa ang bagong Auth
    router.replace('/login'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Miufy Dashboard</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  logoutBtn: { backgroundColor: '#FF5A5A', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 }
});