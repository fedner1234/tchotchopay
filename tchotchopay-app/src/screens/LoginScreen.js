import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields.');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Logo area */}
          <View style={styles.logoBox}>
            <Text style={styles.logo}>💸</Text>
            <Text style={styles.brand}>TchotchoPay</Text>
            <Text style={styles.tagline}>Voye lajan — fasil, vit, san komisyon</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <Text style={styles.heading}>Konekte</Text>

            <Text style={styles.label}>Imel</Text>
            <TextInput
              style={styles.input}
              placeholder="ou@gmail.com"
              placeholderTextColor="#b2bec3"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Modpas</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#b2bec3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Text style={styles.eye}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity>
              <Text style={styles.forgot}>Bliye modpas ou?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Konekte</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pa gen kont?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.link}> Kreye kont gratis</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  logoBox: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 64 },
  brand: { fontSize: 28, fontWeight: '800', color: '#2d3436', marginTop: 8 },
  tagline: { fontSize: 13, color: '#636e72', marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  heading: { fontSize: 22, fontWeight: '800', color: '#2d3436', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#636e72', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1.5, borderColor: '#dfe6e9', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#2d3436',
    backgroundColor: '#f8f9fa',
  },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { padding: 12, marginLeft: 8 },
  eye: { fontSize: 18 },
  forgot: { color: '#1055CC', fontSize: 13, textAlign: 'right', marginTop: 8 },
  btn: {
    backgroundColor: '#1055CC', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 28,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#636e72', fontSize: 15 },
  link: { color: '#1055CC', fontSize: 15, fontWeight: '700' },
});
