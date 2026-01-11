import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/Colors';
import { API_ENDPOINTS } from '../../constants/config';

export default function ProfileScreen() {
  const [displayUsername, setDisplayUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Refresh profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const name = await AsyncStorage.getItem('username');

      if (name) setDisplayUsername(name);

      // Fetch latest from server if logged in - this is the source of truth for profile picture
      if (userId) {
        try {
          const response = await fetch(API_ENDPOINTS.getUser(userId));
          if (response.ok) {
            const user = await response.json();
            if (user.displayUsername) {
              setDisplayUsername(user.displayUsername);
              await AsyncStorage.setItem('username', user.displayUsername);
            }
            if (user.profilePicture) {
              setProfilePicture(user.profilePicture);
              await AsyncStorage.setItem('profilePicture', user.profilePicture);
            } else {
              // No profile picture on server - clear local cache to prevent old account data showing
              setProfilePicture(null);
              await AsyncStorage.removeItem('profilePicture');
            }
          }
        } catch (e) {
          // On network error, try local cache as fallback
          const picture = await AsyncStorage.getItem('profilePicture');
          if (picture) setProfilePicture(picture);
          console.log('Error fetching from server:', e);
        }
      }
    } catch (e) {
      Alert.alert("Error", "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const pickProfilePicture = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Don't force editing/cropping
      quality: 0.7,
      base64: true
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfilePicture(base64Image);
      await AsyncStorage.setItem('profilePicture', base64Image);

      // Save to server
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        try {
          await fetch(API_ENDPOINTS.updateUser(userId), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profilePicture: base64Image })
          });
        } catch (e) {
          console.log('Error saving profile picture:', e);
        }
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickProfilePicture}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle" size={120} color={Colors.primary.spaceIndigo} />
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.displayName}>{displayUsername || 'Student'}</Text>
        <Text style={styles.statusText}>Miufy Study Member</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/account')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.primary.spaceIndigo} />
          <Text style={styles.menuText}>Account Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.primary.spaceIndigo} />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomWidth: 0 }]}
          onPress={() => router.push('/settings/privacy')}
          activeOpacity={0.7}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color={Colors.primary.spaceIndigo} />
          <Text style={styles.menuText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF5A5A" />
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.brightSnow },
  contentContainer: { padding: 25, paddingTop: 80, paddingBottom: 120 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  avatarContainer: { marginBottom: 10, position: 'relative' },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.primary.spaceIndigo,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff'
  },
  displayName: { fontSize: 28, fontWeight: 'bold', color: Colors.primary.spaceIndigo },
  statusText: { fontSize: 14, color: 'gray', marginTop: 5 },
  menuSection: { backgroundColor: 'white', borderRadius: 25, padding: 10, marginBottom: 30, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: Colors.primary.spaceIndigo, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#FFEDED', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logoutBtnText: { color: '#FF5A5A', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});