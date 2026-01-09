import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors'; 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Paki-fill up lahat ng fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://192.168.1.15:5000/api/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('userId', data.userId);
        await AsyncStorage.setItem('username', data.displayUsername);
        router.replace('/(tabs)/home'); 
      } else {
        Alert.alert("Login Failed", data.msg || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Hindi makakonekta sa server. Siguraduhing tama ang IP address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Log in to continue your study session.</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary.turquoise} style={{ marginTop: 20 }} />
        ) : (
          <Pressable style={styles.btn} onPress={handleLogin}>
            <Text style={styles.btnText}>Login</Text>
          </Pressable>
        )}

        <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkBtn}>
          <Text style={styles.linkText}>Dont have an account? <Text style={{fontWeight: 'bold'}}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.brightSnow, padding: 30, paddingTop: 100 },
  title: { fontSize: 32, fontWeight: '900', color: Colors.primary.spaceIndigo, marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'gray', marginBottom: 40 },
  form: { width: '100%' },
  input: { backgroundColor: 'white', padding: 18, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  btn: { backgroundColor: Colors.primary.turquoise, padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  btnText: { fontWeight: 'bold', color: Colors.primary.spaceIndigo, fontSize: 16 },
  linkBtn: { marginTop: 25, alignItems: 'center' },
  linkText: { color: Colors.primary.spaceIndigo, fontSize: 14 }
});