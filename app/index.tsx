import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, StatusBar, Animated } from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(20)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(30)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Staggered animation sequence
    Animated.sequence([
      // Logo fade in and scale
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Title fade in
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Content fade in
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Button fade in
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background shapes */}
      <View style={styles.topShape} />
      <View style={styles.bottomShape} />
      <View style={styles.accentDot} />

      <View style={styles.contentContainer}>
        {/* Logo with animation */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }
          ]}
        >
          <View style={styles.logoGlow} />
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
          />
        </Animated.View>

        {/* Title with animation */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslate }],
          }}
        >
          <Text style={styles.title}>Miufy</Text>
          <Text style={styles.tagline}>Study smarter, not harder</Text>
        </Animated.View>

        {/* Content with animation */}
        <Animated.View
          style={[
            styles.textArea,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
            }
          ]}
        >
          <Text style={styles.headline}>
            Transform how you learn from videos
          </Text>
          <Text style={styles.subHeadline}>
            Take timestamped notes, organize your insights, and master any topic with ease.
          </Text>
        </Animated.View>
      </View>

      {/* Button with animation */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslate }],
          }
        ]}
      >
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.push('/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
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
    top: -height * 0.18,
    left: -width * 0.25,
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: width * 0.65,
    backgroundColor: '#41E2BA',
    opacity: 0.08,
  },
  bottomShape: {
    position: 'absolute',
    bottom: -height * 0.12,
    right: -width * 0.25,
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    backgroundColor: '#41E2BA',
    opacity: 0.1,
  },
  accentDot: {
    position: 'absolute',
    top: height * 0.35,
    right: width * 0.08,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#41E2BA',
    opacity: 0.15,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
    paddingTop: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  logoGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#41E2BA',
    opacity: 0.2,
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 18,
    color: '#41E2BA',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  textArea: {
    marginTop: 45,
    paddingHorizontal: 10,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 34,
  },
  subHeadline: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: 5,
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
    height: 58,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#41E2BA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});