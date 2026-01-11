import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textTranslate = useRef(new Animated.Value(20)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const loaderOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation sequence
        Animated.sequence([
            // Logo appears with scale
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]),
            // App name fades in
            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(textTranslate, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            // Tagline fades in
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            // Loader appears
            Animated.timing(loaderOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            // Hold for a moment
            Animated.delay(800),
        ]).start(() => {
            // Animation complete, notify parent
            onFinish();
        });
    }, []);

    return (
        <View style={styles.container}>
            {/* Background decorative circles */}
            <View style={styles.topCircle} />
            <View style={styles.bottomCircle} />

            {/* Main content */}
            <View style={styles.content}>
                {/* Logo */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        },
                    ]}
                >
                    <View style={styles.logoGlow} />
                    <Image
                        source={require('../assets/images/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* App Name */}
                <Animated.Text
                    style={[
                        styles.appName,
                        {
                            opacity: textOpacity,
                            transform: [{ translateY: textTranslate }],
                        },
                    ]}
                >
                    Miufy
                </Animated.Text>

                {/* Tagline */}
                <Animated.Text
                    style={[
                        styles.tagline,
                        { opacity: taglineOpacity },
                    ]}
                >
                    Study smarter, not harder
                </Animated.Text>

                {/* Loading indicator */}
                <Animated.View
                    style={[
                        styles.loaderContainer,
                        { opacity: loaderOpacity },
                    ]}
                >
                    <View style={styles.loader}>
                        <Animated.View style={styles.loaderDot} />
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#41E2BA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topCircle: {
        position: 'absolute',
        top: -height * 0.15,
        right: -width * 0.2,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    bottomCircle: {
        position: 'absolute',
        bottom: -height * 0.1,
        left: -width * 0.2,
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    content: {
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logoGlow: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    logo: {
        width: 140,
        height: 140,
    },
    appName: {
        fontSize: 52,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    tagline: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
        fontWeight: '500',
    },
    loaderContainer: {
        marginTop: 50,
    },
    loader: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loaderDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
        marginHorizontal: 4,
    },
});
