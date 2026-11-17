import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

/**
 * Wrap any money-moving screen with <KycGate navigation={navigation}>.
 * If the user's kyc_status is not 'approved', shows a verification wall.
 * Otherwise renders children normally.
 */
export default function KycGate({ navigation, children }) {
  const { user } = useAuth();

  if (!user || user.kyc_status !== 'approved') {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Identity Verification Required</Text>
        <Text style={styles.body}>
          To use this feature you must first verify your identity. This keeps your account and your recipients safe — it only takes 2 minutes.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.btnText}>Verify My Identity →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon:  { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.navy, textAlign: 'center', marginBottom: 12 },
  body:  { fontSize: 15, color: '#374151', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  back:    { marginTop: 4 },
  backText:{ color: '#6B7280', fontSize: 14 },
});
