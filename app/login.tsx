import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { API_ENDPOINTS } from '../constants/config';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (!email.includes('@')) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        // Clear ALL previous session data to prevent cross-account contamination
        // This fixes: password still working after change, profile picture persistence
        await AsyncStorage.clear();
        await AsyncStorage.setItem('userId', data.userId);
        await AsyncStorage.setItem('username', data.displayUsername || email);
        router.replace('/(tabs)/home');
      } else {
        // More specific error messages based on status
        if (response.status === 401) {
          Alert.alert("Login Failed", "Invalid email or password. Please try again.");
        } else if (response.status === 404) {
          Alert.alert("Account Not Found", "No account found with this email. Please sign up first.");
        } else {
          Alert.alert("Login Failed", data.msg || "Something went wrong. Please try again.");
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        Alert.alert("Connection Timeout", "The server is taking too long to respond. Please try again later.");
      } else {
        Alert.alert("Connection Error", "Cannot connect to server. Please check your internet connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="book" size={50} color="#fff" />
          </View>
          <Text style={styles.appName}>Miufy</Text>
          <Text style={styles.tagline}>Learn smarter, not harder</Text>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue your study session</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={22} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={22} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#999" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary.turquoise} />
            </View>
          ) : (
            <TouchableOpacity style={styles.btn} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.btnText}>Login</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          )}
        </View>

        {/* Sign Up Link */}
        <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkBtn}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.brightSnow,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 30,
    paddingTop: 60,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#99FF33',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#99FF33',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary.spaceIndigo,
    marginTop: 15,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  welcomeSection: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary.spaceIndigo,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#EEE',
    paddingHorizontal: 15,
    height: 58,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary.spaceIndigo,
  },
  eyeIcon: {
    padding: 5,
  },
  loadingContainer: {
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#99FF33',
    height: 58,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#99FF33',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  btnText: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 18,
    marginRight: 10,
  },
  linkBtn: {
    marginTop: 30,
    alignItems: 'center',
    paddingBottom: 30,
  },
  linkText: {
    color: '#888',
    fontSize: 15,
  },
  linkBold: {
    fontWeight: 'bold',
    color: Colors.primary.spaceIndigo,
  }
});