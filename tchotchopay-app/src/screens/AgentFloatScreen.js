import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getToken } from '../services/storage';

const API   = 'https://tchotchopay.com/.netlify/functions';
const BRAND = { primary: '#1055CC', green: '#10B981', red: '#EF4444', yellow: '#F59E0B', bg: '#F9FAFB', card: '#FFFFFF', border: '#E5E7EB', muted: '#6B7280', dark: '#111827' };

const PRESETS = [100, 200, 500, 1000];
const ZELLE_EMAIL = 'tchotchopay@gmail.com';
const ZELLE_PHONE = '(305) 000-0000';

export default function AgentFloatScreen({ navigation }) {
  const [method, setMethod]       = useState('zelle');   // zelle | ach | card
  const [amount, setAmount]       = useState('');
  const [zelleRef, setZelleRef]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [agentFloat, setAgentFloat] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  // ── Fetch current float balance ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res   = await fetch(`${API}/agent-lookup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentToken: token, customerPhone: '0000000000' }),
        });
        const data = await res.json();
        if (data.agentFloat !== undefined) setAgentFloat(data.agentFloat);
      } catch {}
    })();
  }, []);

  const feeLabel = () => {
    const amt = parseFloat(amount) || 0;
    if (method === 'zelle') return amt ? `You send $${amt.toFixed(2)} — no fee` : 'No fee';
    if (method === 'ach')   return amt ? `Fee: $${Math.min(amt * 0.008, 5).toFixed(2)} (0.8%, max $5)` : 'Fee: 0.8%, max $5';
    return amt ? `Fee: $${(amt * 0.029 + 0.30).toFixed(2)} (2.9% + $0.30)` : 'Fee: 2.9% + $0.30';
  };

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 50)  { Alert.alert('Minimum', 'Minimum top-up is $50.'); return; }
    if (amt > 5000)         { Alert.alert('Maximum', 'Maximum top-up is $5,000.'); return; }

    if (method !== 'zelle') {
      Alert.alert('Coming Soon', 'ACH and card top-ups are coming soon. Please use Zelle for now.');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const res   = await fetch(`${API}/agent-topup-zelle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentToken: token, amountUSD: amt, zelleConfirmation: zelleRef }),
      });
      const data = await res.json();
      if (!res.ok) { Alert.alert('Error', data.error || 'Could not submit. Try again.'); return; }
      setSubmitMsg(data.message || 'Request submitted!');
      setSubmitted(true);
    } catch (e) {
      Alert.alert('Error', 'Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const openZelle = () => {
    // Deep-link into Zelle app if installed, else open App Store
    Linking.openURL(`zelle://send?amount=${amount || ''}`).catch(() =>
      Alert.alert('Zelle Not Found', `Send $${amount || '___'} via Zelle to:\n\n${ZELLE_EMAIL}\nor ${ZELLE_PHONE}\n\nMemo: FLOAT-[your name]`)
    );
  };

  if (submitted) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={[s.scroll, { alignItems: 'center', paddingTop: 40 }]}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>💚</Text>
          <Text style={s.successTitle}>Request Submitted!</Text>
          <Text style={s.successSub}>{submitMsg}</Text>

          <View style={[s.card, { width: '100%', marginTop: 24 }]}>
            <Text style={[s.label, { marginBottom: 10 }]}>SEND ZELLE TO:</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: BRAND.dark, marginBottom: 4 }}>{ZELLE_EMAIL}</Text>
            <Text style={{ fontSize: 14, color: BRAND.muted, marginBottom: 14 }}>or {ZELLE_PHONE}</Text>
            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12 }}>
              <Text style={{ fontSize: 13, color: '#92400E' }}>
                ⚠️ In the Zelle memo write:{'\n'}
                <Text style={{ fontWeight: '800' }}>FLOAT-[your name]</Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity style={[s.btn, { backgroundColor: '#22C55E', width: '100%', marginTop: 16 }]} onPress={openZelle}>
            <Text style={s.btnTxt}>Open Zelle App →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.ghostBtn} onPress={() => { setSubmitted(false); setAmount(''); setZelleRef(''); }}>
            <Text style={s.ghostBtnTxt}>Submit another request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.ghostBtn} onPress={() => navigation.goBack()}>
            <Text style={s.ghostBtnTxt}>← Back to Agent Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Text style={s.backTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>Top Up Float</Text>
        </View>

        {/* Current float */}
        {agentFloat !== null && (
          <View style={[s.card, { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' }]}>
            <Text style={s.label}>CURRENT FLOAT BALANCE</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: BRAND.green }}>${parseFloat(agentFloat).toFixed(2)}</Text>
            <Text style={{ fontSize: 12, color: BRAND.muted, marginTop: 2 }}>Available to load onto customer wallets</Text>
          </View>
        )}

        {/* Method tabs */}
        <View style={s.tabs}>
          {[
            { id: 'zelle', icon: '💚', label: 'Zelle', sub: 'FREE' },
            { id: 'ach',   icon: '🏦', label: 'Bank ACH', sub: '$5 max' },
            { id: 'card',  icon: '💳', label: 'Card', sub: '2.9%' },
          ].map(m => (
            <TouchableOpacity
              key={m.id}
              style={[s.tab, method === m.id && s.tabOn]}
              onPress={() => setMethod(m.id)}
            >
              <Text style={{ fontSize: 22 }}>{m.icon}</Text>
              <Text style={[s.tabLabel, method === m.id && { color: BRAND.primary }]}>{m.label}</Text>
              <Text style={[s.tabSub, m.id === 'zelle' && { color: BRAND.green }]}>{m.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <View style={s.card}>
          <Text style={s.label}>AMOUNT</Text>
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
            style={[s.input, { fontSize: 24, fontWeight: '700', textAlign: 'center', height: 60 }]}
            placeholder="Custom amount"
            placeholderTextColor={BRAND.muted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={v => { setAmount(v); }}
          />
          <Text style={{ fontSize: 12, color: method === 'zelle' ? BRAND.green : BRAND.muted, textAlign: 'center', marginTop: 4 }}>
            {feeLabel()}
          </Text>
        </View>

        {/* Zelle instructions */}
        {method === 'zelle' && (
          <View style={s.card}>
            <Text style={s.label}>HOW IT WORKS</Text>
            <View style={{ backgroundColor: '#F0FDF4', borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: BRAND.dark, lineHeight: 22 }}>
                <Text style={{ fontWeight: '800' }}>1.</Text> Enter amount below{'\n'}
                <Text style={{ fontWeight: '800' }}>2.</Text> Submit request{'\n'}
                <Text style={{ fontWeight: '800' }}>3.</Text> Send Zelle to <Text style={{ fontWeight: '800' }}>{ZELLE_EMAIL}</Text>{'\n'}
                <Text style={{ fontWeight: '800' }}>4.</Text> Admin approves in ~30 min{'\n'}
                <Text style={{ fontWeight: '800', color: BRAND.green }}>5.</Text> Float credited instantly ✓
              </Text>
            </View>
            <TextInput
              style={s.input}
              placeholder="Zelle confirmation # (optional)"
              placeholderTextColor={BRAND.muted}
              value={zelleRef}
              onChangeText={setZelleRef}
            />
          </View>
        )}

        {/* ACH / Card coming soon notice */}
        {method !== 'zelle' && (
          <View style={[s.card, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 20 }}>
              ⚡ {method === 'ach' ? 'ACH bank debit' : 'Card'} coming soon. Use Zelle for now — it's free and credits within 30 minutes.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[s.btn, { backgroundColor: method === 'zelle' ? BRAND.green : BRAND.muted }]}
          onPress={submit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnTxt}>{method === 'zelle' ? '💚 Submit Zelle Request' : `${method.toUpperCase()} — Coming Soon`}</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: BRAND.bg },
  scroll:       { padding: 16 },
  header:       { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  back:         { padding: 4 },
  backTxt:      { color: BRAND.primary, fontSize: 15, fontWeight: '600' },
  title:        { flex: 1, fontSize: 18, fontWeight: '800', color: BRAND.dark },
  card:         { backgroundColor: BRAND.card, borderRadius: 16, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  label:        { fontSize: 10, fontWeight: '800', color: BRAND.muted, letterSpacing: 0.8, marginBottom: 8 },
  tabs:         { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab:          { flex: 1, backgroundColor: BRAND.card, borderRadius: 12, borderWidth: 1.5, borderColor: BRAND.border, padding: 10, alignItems: 'center', gap: 2 },
  tabOn:        { borderColor: BRAND.primary, backgroundColor: '#EFF6FF' },
  tabLabel:     { fontSize: 12, fontWeight: '700', color: BRAND.dark },
  tabSub:       { fontSize: 10, color: BRAND.muted, fontWeight: '600' },
  presets:      { flexDirection: 'row', gap: 8, marginBottom: 12 },
  preset:       { flex: 1, borderWidth: 1.5, borderColor: BRAND.border, borderRadius: 10, padding: 10, alignItems: 'center' },
  presetOn:     { borderColor: BRAND.primary, backgroundColor: '#EFF6FF' },
  presetTxt:    { fontWeight: '700', color: BRAND.muted, fontSize: 13 },
  presetTxtOn:  { color: BRAND.primary },
  input:        { backgroundColor: BRAND.bg, borderWidth: 1.5, borderColor: BRAND.border, borderRadius: 12, padding: 14, fontSize: 15, color: BRAND.dark, marginBottom: 8 },
  btn:          { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  btnTxt:       { color: '#fff', fontSize: 15, fontWeight: '800' },
  ghostBtn:     { alignItems: 'center', marginTop: 14, padding: 8 },
  ghostBtnTxt:  { color: BRAND.muted, fontSize: 13 },
  successTitle: { fontSize: 24, fontWeight: '800', color: BRAND.green, textAlign: 'center', marginBottom: 8 },
  successSub:   { fontSize: 13, color: BRAND.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
});
