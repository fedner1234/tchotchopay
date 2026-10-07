import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
  const scale = new Animated.Value(0.8);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Onboarding'), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#00AEEF', '#020B2D']} style={styles.container}>
      <Animated.View style={[styles.inner, { transform: [{ scale }], opacity }]}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tagline}>lajan an nan men nou</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inner: { alignItems: 'center' },
  logo: { width: 220, height: 220, marginBottom: 12 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center', fontWeight: '600' },
});
