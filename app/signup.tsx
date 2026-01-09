import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import Colors from '../constants/Colors'; 

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [displayUsername, setDisplayUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !displayUsername || !password) {
      Alert.alert("Error", "Paki-fill up lahat ng fields.");
      return;
    }

    if (!email.includes('@')) {
      Alert.alert("Error", "Valid email is required (must contain @)");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://192.168.1.15:5000/api/auth/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: email, 
          displayUsername: displayUsername, 
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Account created!");
        router.replace('/login'); 
      } else {
        Alert.alert("Registration Failed", data.msg || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "Hindi makakonekta sa server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back to Login</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join the Miufy study community.</Text>
      
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
          placeholder="Display Username (e.g. MeowMii123)"
          placeholderTextColor="#999"
          value={displayUsername}
          onChangeText={setDisplayUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Create Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary.turquoise} />
        ) : (
          <Pressable style={styles.btn} onPress={handleSignUp}>
            <Text style={styles.btnText}>Sign Up Now</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.brightSnow, padding: 30, paddingTop: 80 },
  backBtn: { marginBottom: 20 },
  backText: { color: Colors.primary.turquoise, fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 32, fontWeight: '900', color: Colors.primary.spaceIndigo, marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'gray', marginBottom: 40 },
  form: { width: '100%' },
  input: { backgroundColor: 'white', padding: 18, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  btn: { backgroundColor: Colors.primary.turquoise, padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  btnText: { fontWeight: 'bold', color: Colors.primary.spaceIndigo, fontSize: 16 }
});