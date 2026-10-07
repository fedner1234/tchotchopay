import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';

const PERSONA_TEMPLATE_ID = 'itmpl_YOUR_TEMPLATE_ID'; // Replace with your Persona template ID

const STEPS = ['account', 'kyc'];

export default function SignUpScreen({ navigation }) {
  const { register } = useAuth();
  const [step, setStep] = useState('account');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '',
  });
  const [inquiryId, setInquiryId] = useState(null);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const submitAccount = () => {
    const { firstName, lastName, email, phone, password, confirm } = form;
    if (!firstName || !lastName || !email || !phone || !password)
      return Alert.alert('Error', 'Please fill in all fields.');
    if (password !== confirm)
      return Alert.alert('Error', 'Passwords do not match.');
    if (password.length < 8)
      return Alert.alert('Error', 'Password must be at least 8 characters.');
    setStep('kyc');
  };

  const handleKycMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.name === 'inquiry:completed') {
        setInquiryId(data.metadata?.inquiryId);
        await completeRegistration(data.metadata?.inquiryId);
      } else if (data.name === 'inquiry:failed') {
        Alert.alert('Verification Failed', 'Please try again.');
        setStep('account');
      }
    } catch (_) {}
  };

  const completeRegistration = async (kycInquiryId) => {
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        password: form.password,
        kycInquiryId,
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      Alert.alert('Error', msg);
      setStep('account');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'kyc') {
    const personaUrl = `https://withpersona.com/verify?inquiry-template-id=${PERSONA_TEMPLATE_ID}&environment=sandbox&fields[name-first]=${encodeURIComponent(form.firstName)}&fields[name-last]=${encodeURIComponent(form.lastName)}&fields[email-address]=${encodeURIComponent(form.email)}`;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.kycHeader}>
          <TouchableOpacity onPress={() => setStep('account')}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.kycTitle}>Verify Identity</Text>
        </View>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1055CC" />
            <Text style={styles.loadingText}>Creating your account…</Text>
          </View>
        ) : (
          <WebView
            source={{ uri: personaUrl }}
            onMessage={handleKycMessage}
            injectedJavaScript={`
              window.addEventListener('message', (e) => {
                window.ReactNativeWebView.postMessage(JSON.stringify(e.data));
              });
            `}
            style={{ flex: 1 }}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Kreye Kont 💸</Text>
          <Text style={styles.sub}>Free to join. No monthly fees.</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>First Name</Text>
              <TextInput style={styles.input} placeholder="Jean" placeholderTextColor="#b2bec3"
                value={form.firstName} onChangeText={set('firstName')} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput style={styles.input} placeholder="Pierre" placeholderTextColor="#b2bec3"
                value={form.lastName} onChangeText={set('lastName')} />
            </View>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="ou@gmail.com" placeholderTextColor="#b2bec3"
            value={form.email} onChangeText={set('email')}
            keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} placeholder="+1 (305) 000-0000" placeholderTextColor="#b2bec3"
            value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Min. 8 characters" placeholderTextColor="#b2bec3"
            value={form.password} onChangeText={set('password')} secureTextEntry />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput style={styles.input} placeholder="Re-enter password" placeholderTextColor="#b2bec3"
            value={form.confirm} onChangeText={set('confirm')} secureTextEntry />

          <Text style={styles.terms}>
            By continuing you agree to TchotchoPay's{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          <TouchableOpacity style={styles.btn} onPress={submitAccount}>
            <Text style={styles.btnText}>Continue to Verify ID →</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}> Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  backBtn: { color: '#1055CC', fontSize: 16, fontWeight: '600' },
  heading: { fontSize: 26, fontWeight: '800', color: '#2d3436', marginBottom: 4 },
  sub: { fontSize: 14, color: '#636e72', marginBottom: 24 },
  row: { flexDirection: 'row', marginBottom: 0 },
  label: { fontSize: 13, fontWeight: '600', color: '#636e72', marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1.5, borderColor: '#dfe6e9', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: '#2d3436', backgroundColor: '#fff',
  },
  terms: { fontSize: 12, color: '#636e72', marginTop: 16, lineHeight: 18 },
  termsLink: { color: '#1055CC', fontWeight: '600' },
  btn: {
    backgroundColor: '#1055CC', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#636e72', fontSize: 15 },
  link: { color: '#1055CC', fontSize: 15, fontWeight: '700' },
  kycHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  kycTitle: { fontSize: 18, fontWeight: '700', marginLeft: 16, color: '#2d3436' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#636e72', fontSize: 15 },
});
