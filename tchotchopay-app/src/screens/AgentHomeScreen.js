import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../services/storage';

const API   = 'https://tchotchopay.com/.netlify/functions';
const BRAND = { primary: '#1055CC', green: '#10B981', red: '#EF4444', yellow: '#F59E0B', bg: '#F9FAFB', card: '#FFFFFF', border: '#E5E7EB', muted: '#6B7280', dark: '#111827' };

export default function AgentHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [float, setFloat]     = useState(null);
  const [loads, setLoads]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [earned, setEarned]   = useState(0);

  useEffect(() => { fetchAgentData(); }, []);

  const fetchAgentData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      // Use agent-lookup with a dummy phone to get float balance
      const res = await fetch(`${API}/agent-lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentToken: token, customerPhone: '0000000000' }),
      });
      const data = await res.json();
      if (data.agentFloat !== undefined) setFloat(data.agentFloat);
    } catch {}
    setLoading(false);
  };

  const floatColor = float === null ? BRAND.muted : float < 100 ? BRAND.red : float < 300 ? BRAND.yellow : BRAND.green;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} refreshControl={undefined}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Agent Dashboard 🏪</Text>
            <Text style={s.name}>{user?.full_name || user?.email || 'Agent'}</Text>
          </View>
          <View style={s.onlineDot} />
        </View>

        {/* Float card */}
        <View style={[s.floatCard, { borderColor: floatColor + '40' }]}>
          <Text style={s.floatLabel}>Your Float Balance</Text>
          {loading
            ? <ActivityIndicator color={BRAND.green} style={{ marginVertical: 8 }} />
            : <Text style={[s.floatAmount, { color: floatColor }]}>
                ${float !== null ? parseFloat(float).toFixed(2) : '—'}
              </Text>
          }
          <Text style={s.floatSub}>Available to load onto customer wallets</Text>
          {float !== null && float < 100 && (
            <View style={s.lowWarning}>
              <Text style={s.lowWarningTxt}>⚠️ Low float — top up to continue loading customers</Text>
            </View>
          )}
          <TouchableOpacity
            style={[s.btn, { backgroundColor: BRAND.green, marginTop: 14 }]}
            onPress={() => navigation.navigate('AgentFloat')}
          >
            <Text style={s.btnTxt}>+ Top Up Float</Text>
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.actions}>
          <TouchableOpacity
            style={s.actionCard}
            onPress={() => navigation.navigate('AgentLoad')}
          >
            <Text style={{ fontSize: 32, marginBottom: 8 }}>💵</Text>
            <Text style={s.actionTitle}>Load Customer</Text>
            <Text style={s.actionSub}>Customer hands you cash → credit their wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.actionCard}
            onPress={() => navigation.navigate('AgentFloat')}
          >
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🏦</Text>
            <Text style={s.actionTitle}>Top Up Float</Text>
            <Text style={s.actionSub}>Zelle · ACH · Card</Text>
          </TouchableOpacity>
        </View>

        {/* How it works */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>How You Earn</Text>
          <View style={s.earnRow}>
            <View style={s.earnIcon}><Text style={{ fontSize: 18 }}>👥</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.earnTitle}>$1 per customer load</Text>
              <Text style={s.earnSub}>Every time you load a customer wallet, you earn $1 commission</Text>
            </View>
          </View>
          <View style={s.earnRow}>
            <View style={s.earnIcon}><Text style={{ fontSize: 18 }}>📈</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.earnTitle}>50 loads = $50/month extra</Text>
              <Text style={s.earnSub}>One load per day at your shop adds up fast</Text>
            </View>
          </View>
          <View style={s.earnRow}>
            <View style={s.earnIcon}><Text style={{ fontSize: 18 }}>⚡</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.earnTitle}>Instant wallet credit</Text>
              <Text style={s.earnSub}>Customer's wallet is credited the moment you confirm</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: BRAND.bg },
  scroll:       { padding: 16, paddingBottom: 40 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting:     { fontSize: 14, color: BRAND.muted, fontWeight: '600' },
  name:         { fontSize: 20, fontWeight: '800', color: BRAND.dark, marginTop: 2 },
  onlineDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.green },
  floatCard:    { backgroundColor: BRAND.card, borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  floatLabel:   { fontSize: 12, color: BRAND.muted, fontWeight: '700', letterSpacing: 0.5 },
  floatAmount:  { fontSize: 42, fontWeight: '900', marginVertical: 4 },
  floatSub:     { fontSize: 12, color: BRAND.muted },
  lowWarning:   { backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10, marginTop: 10 },
  lowWarningTxt:{ fontSize: 12, color: '#92400E', fontWeight: '600' },
  btn:          { borderRadius: 12, padding: 14, alignItems: 'center' },
  btnTxt:       { color: '#fff', fontSize: 14, fontWeight: '800' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: BRAND.dark, marginBottom: 10 },
  actions:      { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionCard:   { flex: 1, backgroundColor: BRAND.card, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  actionTitle:  { fontSize: 14, fontWeight: '800', color: BRAND.dark, marginBottom: 4 },
  actionSub:    { fontSize: 11, color: BRAND.muted, lineHeight: 16 },
  card:         { backgroundColor: BRAND.card, borderRadius: 16, padding: 18, marginBottom: 16 },
  earnRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  earnIcon:     { width: 40, height: 40, borderRadius: 12, backgroundColor: BRAND.bg, alignItems: 'center', justifyContent: 'center' },
  earnTitle:    { fontSize: 13, fontWeight: '700', color: BRAND.dark },
  earnSub:      { fontSize: 12, color: BRAND.muted, marginTop: 2, lineHeight: 17 },
});
