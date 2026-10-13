import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../services/storage';

const API = 'https://tchotchopay.com/.netlify/functions';
const BRAND = { primary: '#1055CC', green: '#10B981', red: '#EF4444', yellow: '#F59E0B', bg: '#F9FAFB', card: '#FFFFFF', border: '#E5E7EB', muted: '#6B7280', dark: '#111827' };

// ── Quick-amount presets ───────────────────────────────────────────────────
const PRESETS = [20, 50, 100, 200];

export default function AgentLoadScreen({ navigation }) {
  const { user } = useAuth();

  const [step, setStep]               = useState('phone');   // phone | confirm | success
  const [phone, setPhone]             = useState('');
  const [amount, setAmount]           = useState('');
  const [customer, setCustomer]       = useState(null);
  const [agentFloat, setAgentFloat]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);

  // ── Look up customer ────────────────────────────────────────────────────
  const lookupCustomer = async () => {
    if (!phone.trim()) { Alert.alert('Enter phone number'); return; }
    setLoading(true);
    try {
      const token = await getToken();
      const res   = await fetch(`${API}/agent-lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentToken: token, customerPhone: phone }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert('Not Found', data.error || 'No account found.'); return; }
      setCustomer(data);
      setAgentFloat(data.agentFloat);
      setStep('confirm');
    } catch (e) {
      Alert.alert('Error', 'Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  // ── Confirm & load ──────────────────────────────────────────────────────
  const confirmLoad = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 5)   { Alert.alert('Invalid Amount', 'Minimum load is $5.00'); return; }
    if (amt > 500)          { Alert.alert('Too Large', 'Maximum single load is $500.00'); return; }
    if (agentFloat < amt)   { Alert.alert('Low Float', `Your float is $${agentFloat?.toFixed(2)}. Top it up first.`); return; }

    Alert.alert(
      'Confirm Load',
      `Load $${amt.toFixed(2)} to ${customer.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: processLoad },
      ]
    );
  };

  const processLoad = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res   = await fetch(`${API}/agent-load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentToken: token, customerPhone: phone, amountUSD: parseFloat(amount) }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert('Load Failed', data.error || 'Something went wrong.'); return; }
      setResult(data);
      setAgentFloat(data.agentFloatRemaining);
      setStep('success');
    } catch (e) {
      Alert.alert('Error', 'Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────
  const reset = () => {
    setStep('phone');
    setPhone('');
    setAmount('');
    setCustomer(null);
    setResult(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
              <Text style={s.backTxt}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.title}>Load Customer Wallet</Text>
            {agentFloat !== null && (
              <View style={s.floatBadge}>
                <Text style={s.floatBadgeTxt}>Float: ${parseFloat(agentFloat).toFixed(2)}</Text>
              </View>
            )}
          </View>

          {/* ── STEP 1: Phone ── */}
          {step === 'phone' && (
            <View style={s.card}>
              <Text style={s.label}>STEP 1 — FIND CUSTOMER</Text>
              <Text style={s.sub}>Enter the customer's phone number</Text>
              <TextInput
                style={s.input}
                placeholder="(305) 555-0100"
                placeholderTextColor={BRAND.muted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                returnKeyType="search"
                onSubmitEditing={lookupCustomer}
              />
              <TouchableOpacity
                style={[s.btn, { backgroundColor: BRAND.primary }]}
                onPress={lookupCustomer}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnTxt}>🔍  Find Customer</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {/* ── STEP 2: Confirm ── */}
          {step === 'confirm' && customer && (
            <View>
              <View style={s.card}>
                <Text style={s.label}>STEP 2 — CUSTOMER FOUND</Text>
                <View style={s.customerRow}>
                  <View style={s.avatar}>
                    <Text style={s.avatarTxt}>{customer.customerName?.slice(0,2).toUpperCase() || '??'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.customerName}>{customer.customerName}</Text>
                    <Text style={s.customerSub}>{phone} · Wallet: ${customer.walletBalance?.toFixed(2) || '0.00'} USDC</Text>
                  </View>
                  <View style={s.verifiedBadge}>
                    <Text style={s.verifiedTxt}>✓ Verified</Text>
                  </View>
                </View>
              </View>

              <View style={s.card}>
                <Text style={s.label}>STEP 3 — CASH AMOUNT RECEIVED</Text>
                <View style={s.presets}>
                  {PRESETS.map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[s.preset, amount === String(p) && s.presetOn]}
                      onPress={() => setAmount(String(p))}
                    >
                      <Text style={[s.presetTxt, amount === String(p) && s.presetTxtOn]}>${p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[s.input, s.amountInput]}
                  placeholder="Custom amount"
                  placeholderTextColor={BRAND.muted}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={v => setAmount(v)}
                />
                <Text style={s.hint}>Min $5 · Max $500 per load</Text>

                <TouchableOpacity
                  style={[s.btn, { backgroundColor: BRAND.green }]}
                  onPress={confirmLoad}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.btnTxt}>✓  Confirm & Load Wallet</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity style={s.ghostBtn} onPress={reset}>
                  <Text style={s.ghostBtnTxt}>← Search different number</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 'success' && result && (
            <View style={s.card}>
              <View style={s.successIcon}>
                <Text style={{ fontSize: 40 }}>✅</Text>
              </View>
              <Text style={s.successTitle}>Wallet Loaded!</Text>
              <Text style={s.successSub}>{result.message}</Text>

              <View style={s.receipt}>
                <View style={s.receiptRow}>
                  <Text style={s.receiptLabel}>Amount Loaded</Text>
                  <Text style={[s.receiptVal, { color: BRAND.green }]}>${parseFloat(amount).toFixed(2)} USDC</Text>
                </View>
                <View style={s.receiptRow}>
                  <Text style={s.receiptLabel}>Customer</Text>
                  <Text style={s.receiptVal}>{result.customerName}</Text>
                </View>
                <View style={s.receiptRow}>
                  <Text style={s.receiptLabel}>New Wallet Balance</Text>
                  <Text style={s.receiptVal}>${result.customerNewBalance?.toFixed(2)} USDC</Text>
                </View>
                <View style={[s.receiptRow, { borderTopWidth: 1, borderTopColor: BRAND.border, marginTop: 8, paddingTop: 8 }]}>
                  <Text style={s.receiptLabel}>Your Float Remaining</Text>
                  <Text style={[s.receiptVal, { color: BRAND.yellow }]}>${result.agentFloatRemaining?.toFixed(2)}</Text>
                </View>
              </View>

              <TouchableOpacity style={[s.btn, { backgroundColor: BRAND.primary }]} onPress={reset}>
                <Text style={s.btnTxt}>+ Load Another Customer</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: BRAND.bg },
  scroll:        { padding: 16, paddingBottom: 40 },
  header:        { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  back:          { padding: 4 },
  backTxt:       { color: BRAND.primary, fontSize: 15, fontWeight: '600' },
  title:         { flex: 1, fontSize: 18, fontWeight: '800', color: BRAND.dark },
  floatBadge:    { backgroundColor: '#D1FAE5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  floatBadgeTxt: { color: BRAND.green, fontSize: 12, fontWeight: '700' },
  card:          { backgroundColor: BRAND.card, borderRadius: 16, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  label:         { fontSize: 10, fontWeight: '800', color: BRAND.muted, letterSpacing: 0.8, marginBottom: 4 },
  sub:           { fontSize: 13, color: BRAND.muted, marginBottom: 14 },
  input:         { backgroundColor: BRAND.bg, borderWidth: 1.5, borderColor: BRAND.border, borderRadius: 12, padding: 14, fontSize: 16, color: BRAND.dark, marginBottom: 12 },
  amountInput:   { fontSize: 24, fontWeight: '700', textAlign: 'center', height: 60 },
  btn:           { borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 8 },
  btnTxt:        { color: '#fff', fontSize: 15, fontWeight: '800' },
  ghostBtn:      { alignItems: 'center', marginTop: 12, padding: 8 },
  ghostBtnTxt:   { color: BRAND.muted, fontSize: 13 },
  customerRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14 },
  avatar:        { width: 44, height: 44, borderRadius: 22, backgroundColor: BRAND.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:     { color: '#fff', fontWeight: '800', fontSize: 16 },
  customerName:  { fontSize: 15, fontWeight: '700', color: BRAND.dark },
  customerSub:   { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  verifiedBadge: { backgroundColor: '#D1FAE5', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedTxt:   { color: BRAND.green, fontSize: 11, fontWeight: '700' },
  presets:       { flexDirection: 'row', gap: 8, marginBottom: 12 },
  preset:        { flex: 1, borderWidth: 1.5, borderColor: BRAND.border, borderRadius: 10, padding: 12, alignItems: 'center' },
  presetOn:      { borderColor: BRAND.primary, backgroundColor: '#EFF6FF' },
  presetTxt:     { fontWeight: '700', color: BRAND.muted },
  presetTxtOn:   { color: BRAND.primary },
  hint:          { fontSize: 11, color: BRAND.muted, textAlign: 'center', marginBottom: 16 },
  successIcon:   { alignItems: 'center', marginBottom: 12 },
  successTitle:  { fontSize: 22, fontWeight: '800', color: BRAND.green, textAlign: 'center', marginBottom: 6 },
  successSub:    { fontSize: 13, color: BRAND.muted, textAlign: 'center', marginBottom: 20 },
  receipt:       { backgroundColor: BRAND.bg, borderRadius: 12, padding: 14, marginBottom: 16 },
  receiptRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  receiptLabel:  { fontSize: 13, color: BRAND.muted },
  receiptVal:    { fontSize: 13, fontWeight: '700', color: BRAND.dark },
});
