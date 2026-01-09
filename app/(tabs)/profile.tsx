import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function ProfileScreen() {
  const [displayUsername, setDisplayUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('username');
        if (name) setDisplayUsername(name);
      } catch (e) {
        Alert.alert("Error", "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Sigurado ka bang gusto mong mag-logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace('/login');
        },
        style: "destructive"
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary.turquoise} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={120} color={Colors.primary.spaceIndigo} />
        </View>
        <Text style={styles.displayName}>{displayUsername || 'Student'}</Text>
        <Text style={styles.statusText}>Miufy Study Member</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color={Colors.primary.spaceIndigo} />
          <Text style={styles.menuText}>Account Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color={Colors.primary.spaceIndigo} />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color={Colors.primary.spaceIndigo} />
          <Text style={styles.menuText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF5A5A" />
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.brightSnow, padding: 25, paddingTop: 80 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  avatarContainer: { marginBottom: 10 },
  displayName: { fontSize: 28, fontWeight: 'bold', color: Colors.primary.spaceIndigo },
  statusText: { fontSize: 14, color: 'gray', marginTop: 5 },
  menuSection: { backgroundColor: 'white', borderRadius: 25, padding: 10, marginBottom: 30, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: Colors.primary.spaceIndigo, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#FFEDED', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logoutBtnText: { color: '#FF5A5A', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});