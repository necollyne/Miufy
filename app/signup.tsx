import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Modal, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { API_ENDPOINTS } from '../constants/config';

const { width, height } = Dimensions.get('window');

// Terms of Service Content
const termsContent = `
Last Updated: January 2026

Welcome to Miufy. By using our app, you agree to these terms.

1. ACCEPTANCE OF TERMS
By accessing or using Miufy, you agree to be bound by these Terms of Service. If you disagree with any part, you may not access the service.

2. USE OF SERVICE
Miufy is a study companion app designed to help students learn effectively. You agree to:
• Use the service only for lawful purposes
• Not share your account credentials
• Not attempt to hack or disrupt the service
• Respect other users' content and privacy

3. USER CONTENT
You retain ownership of content you create. By posting content, you grant Miufy a license to display and distribute your content within the app.

4. ACCOUNT SECURITY
You are responsible for maintaining the confidentiality of your account. Notify us immediately of any unauthorized use.

5. TERMINATION
We reserve the right to terminate accounts that violate these terms without prior notice.

6. CONTACT US
Questions? Reach us at support@miufy.app

By creating an account, you acknowledge that you have read, understood, and agree to these Terms of Service.
`;

// Privacy Policy Content
const privacyContent = `
Last Updated: January 2026

Your privacy is important to us. This policy explains how we handle your data.

1. INFORMATION WE COLLECT
• Account info: email, display name, password (encrypted)
• Study data: notes, videos, study sessions
• Device info: device type, OS version
• Usage data: app interactions, preferences

2. HOW WE USE YOUR DATA
We use your information to:
• Provide and improve our services
• Personalize your learning experience
• Send important updates about your account
• Analyze app usage to enhance features

3. DATA PROTECTION
• All data is encrypted in transit and at rest
• We use industry-standard security practices
• Regular security audits are conducted
• Access is limited to authorized personnel only

4. DATA SHARING
We do NOT sell your personal data. We may share:
• Anonymized analytics with partners
• Data when required by law
• Info with service providers (under strict agreements)

5. YOUR RIGHTS
You have the right to:
• Access your personal data
• Request data deletion
• Export your data
• Opt out of marketing communications

6. COOKIES AND TRACKING
We use minimal tracking to improve app performance.

7. CONTACT US
Privacy concerns? Email privacy@miufy.app

By using Miufy, you consent to our Privacy Policy.
`;

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [displayUsername, setDisplayUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const openModal = (type: 'terms' | 'privacy') => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

    if (type === 'terms') {
      setTermsModalVisible(true);
    } else {
      setPrivacyModalVisible(true);
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = (type: 'terms' | 'privacy') => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (type === 'terms') {
        setTermsModalVisible(false);
      } else {
        setPrivacyModalVisible(false);
      }
    });
  };

  // Legal Modal Component
  const LegalModal = ({ visible, title, content, type }: { visible: boolean, title: string, content: string, type: 'terms' | 'privacy' }) => (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={() => closeModal(type)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalIconContainer}>
              <Ionicons
                name={type === 'terms' ? 'document-text' : 'shield-checkmark'}
                size={28}
                color="#fff"
              />
            </View>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={() => closeModal(type)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.modalText}>{content}</Text>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.agreeButton}
              onPress={() => closeModal(type)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={22} color="#000" />
              <Text style={styles.agreeButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  const handleSignUp = async () => {
    if (!email || !displayUsername || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (!email.includes('@')) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          displayUsername: displayUsername,
          password: password
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success!", "Your account has been created.", [
          { text: "Continue to Login", onPress: () => router.replace('/login') }
        ]);
      } else {
        // More specific error messages
        if (response.status === 409 || (data.msg && data.msg.toLowerCase().includes('exists'))) {
          Alert.alert("Account Exists", "An account with this email already exists. Please login instead.");
        } else if (response.status === 400) {
          Alert.alert("Invalid Data", data.msg || "Please check your information and try again.");
        } else {
          Alert.alert("Registration Failed", data.msg || "Something went wrong. Please try again.");
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        Alert.alert("Connection Timeout", "The server is taking too long to respond. Please try again later.");
      } else {
        Alert.alert("Connection Error", "Cannot connect to server. Please check your internet connection.");
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
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary.spaceIndigo} />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add" size={40} color="#fff" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Miufy study community</Text>
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
            <Ionicons name="person-outline" size={22} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Display Name (e.g. MeowMii123)"
              placeholderTextColor="#999"
              value={displayUsername}
              onChangeText={setDisplayUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={22} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Create Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          {/* Password Requirements */}
          <View style={styles.requirements}>
            <View style={styles.requirementItem}>
              <Ionicons
                name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={password.length >= 6 ? "#99FF33" : "#ccc"}
              />
              <Text style={[styles.requirementText, password.length >= 6 && styles.requirementMet]}>
                At least 6 characters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={password === confirmPassword && password.length > 0 ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={password === confirmPassword && password.length > 0 ? "#99FF33" : "#ccc"}
              />
              <Text style={[styles.requirementText, password === confirmPassword && password.length > 0 && styles.requirementMet]}>
                Passwords match
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary.turquoise} />
            </View>
          ) : (
            <TouchableOpacity style={styles.btn} onPress={handleSignUp} activeOpacity={0.8}>
              <Text style={styles.btnText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          )}
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By signing up, you agree to our{' '}
          <Text style={styles.termsLink} onPress={() => openModal('terms')}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink} onPress={() => openModal('privacy')}>Privacy Policy</Text>
        </Text>

        {/* Legal Modals */}
        <LegalModal
          visible={termsModalVisible}
          title="Terms of Service"
          content={termsContent}
          type="terms"
        />
        <LegalModal
          visible={privacyModalVisible}
          title="Privacy Policy"
          content={privacyContent}
          type="privacy"
        />
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  backText: {
    color: Colors.primary.spaceIndigo,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.turquoise,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary.spaceIndigo,
    marginTop: 20,
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
  requirements: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#999',
  },
  requirementMet: {
    color: '#666',
  },
  loadingContainer: {
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: Colors.primary.turquoise,
    height: 58,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.primary.turquoise,
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
  termsText: {
    marginTop: 30,
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    lineHeight: 20,
    paddingBottom: 30,
  },
  termsLink: {
    color: Colors.primary.turquoise,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: width - 40,
    maxHeight: height * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: Colors.primary.turquoise,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary.spaceIndigo,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    maxHeight: height * 0.45,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#555',
  },
  modalFooter: {
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  agreeButton: {
    backgroundColor: Colors.primary.turquoise,
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary.turquoise,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  agreeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});