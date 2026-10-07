import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, StatusBar, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '💸',
    title: 'Voye Lajan Ayiti',
    subtitle: 'Send money to Haiti in seconds.\nNo hidden fees. Always fair.',
    color: ['#020B2D', '#0A1F6E'],
  },
  {
    id: '2',
    emoji: '💳',
    title: 'Pòtmonè Dijital',
    subtitle: 'Your digital wallet in US dollars.\nSafe, instant, always available.',
    color: ['#0A1F6E', '#1055CC'],
  },
  {
    id: '3',
    emoji: '📱',
    title: 'Kredi Telefòn',
    subtitle: 'Top up Digicel & Natcom directly\nfrom the app. Quick and easy.',
    color: ['#1055CC', '#00AEEF'],
  },
  {
    id: '4',
    emoji: '🔒',
    title: 'Sekirite Total',
    subtitle: 'Bank-level security protects\nevery transaction you make.',
    color: ['#020B2D', '#1055CC'],
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const next = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <LinearGradient colors={item.color} style={styles.slide}>
            <SafeAreaView style={styles.slideContent}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </SafeAreaView>
          </LinearGradient>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={next} style={styles.nextBtn}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020B2D' },
  slide: { width, flex: 1 },
  slideContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  emoji: { fontSize: 80, marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 17, color: 'rgba(255,255,255,0.88)', textAlign: 'center', lineHeight: 26 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, backgroundColor: '#fff' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#dfe6e9', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#1055CC', width: 24 },
  btnRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 20, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  skipBtn: { padding: 12 },
  skipText: { color: '#636e72', fontSize: 16 },
  nextBtn: {
    backgroundColor: '#1055CC', borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 14,
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
