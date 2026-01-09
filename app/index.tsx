import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.topShape} />
      <View style={styles.bottomShape} />
      <View style={styles.midCircle} />

      <View style={styles.contentContainer}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoShadow} />
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
          />
        </View>

        <View>
          <Text style={styles.title}>Miufy</Text>
          <Text style={styles.tagline}>Master video knowledge.</Text>
        </View>

        <View style={styles.textArea}>
          <Text style={styles.headline}>
            Transform how you study from videos.
          </Text>
          <Text style={styles.subHeadline}>
            Capture insights, organize notes, and boost your learning efficiency.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.push('/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/register')}
          activeOpacity={0.6}
        >
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    overflow: 'hidden', 
  },
  topShape: {
    position: 'absolute',
    top: -height * 0.15,
    left: -width * 0.2,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: '#41E2BA',
    opacity: 0.12,
    transform: [{ scaleX: 1.2 }],
  },
  bottomShape: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#41E2BA',
    opacity: 0.15,
  },
  midCircle: {
    position: 'absolute',
    top: height * 0.3,
    right: width * 0.1,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#41E2BA',
    opacity: 0.2,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  logoShadow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#41E2BA',
    opacity: 0.3,
    transform: [{ translateY: 10 }],
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    zIndex: 1,
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 22,
    color: '#41E2BA',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 5,
  },
  textArea: {
    marginTop: 50,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 34,
  },
  subHeadline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    paddingTop: 20,
    alignItems: 'center',
  },
  mainButton: {
    backgroundColor: '#41E2BA',
    width: '100%',
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#41E2BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#555',
    fontSize: 17,
    fontWeight: '700',
  },
});