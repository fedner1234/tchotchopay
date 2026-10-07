import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { getWallet, getExchangeRates } from '../services/api';
import { COLORS } from '../theme/colors';
import Logo from '../components/Logo';

const QUICK_ACTION_DEFS = [
  { tKey: 'send',   emoji: '💸', screen: 'Send' },
  { tKey: 'market', emoji: '🛒', screen: 'Marketplace' },
  { tKey: 'topUp',  emoji: '📱', screen: 'TopUp' },
  { tKey: 'qrPay',  emoji: '📷', screen: 'QRPay' },
];

// Placeholder transactions shown before real API data loads
const SAMPLE_TXS = [
  { emoji: '📥', bg: '#D1FAE5', description: 'Received from Pierre',     type: 'receive', amount: 100,  date: 'Today, 10:34 AM' },
  { emoji: '📤', bg: '#FEE2E2', description: 'Sent to Marie',            type: 'send',    amount: 50,   date: 'Yesterday, 2:30 PM' },
  { emoji: '📲', bg: '#DBEAFE', description: 'Digicel Top-Up',           type: 'send',    amount: 10,   date: 'Oct 4, 10:15 AM' },
  { emoji: '🏦', bg: '#FEF3C7', description: 'Bank Transfer',            type: 'receive', amount: 500,  date: 'Oct 3, 9:00 AM' },
  { emoji: '🛒', bg: '#FFE4D6', description: 'Marketplace — Groceries',  type: 'send',    amount: 32.5, date: 'Oct 2, 6:45 PM' },
];

// Pull first name from full_name or firstName field
function getFirstName(user) {
  if (!user) return '';
  if (user.firstName) return user.firstName;
  if (user.full_name) return user.full_name.trim().split(' ')[0];
  return '';
}

// Get time-based greeting key for translations
function getGreetingKey() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'greetingMorning';
  if (h >= 12 && h < 18) return 'greetingAfternoon';
  if (h >= 18 && h < 22) return 'greetingEvening';
  return 'greetingNight';
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { t }    = useLang();
  const [wallet, setWallet] = useState(null);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const greeting  = t[getGreetingKey()];
  const firstName = getFirstName(user);
  const now       = new Date();
  const dayDate   = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const load = useCallback(async () => {
    // Run independently — rate must load even if wallet auth fails
    const [wResult, rResult] = await Promise.allSettled([getWallet(), getExchangeRates()]);

    if (wResult.status === 'fulfilled') {
      setWallet(wResult.value.data);
    }
    if (rResult.status === 'fulfilled') {
      const rRes = rResult.value;
      const r = rRes.data?.data?.rates ?? rRes.data?.rates ?? rRes.data;
      const htg = r?.HTG ?? r?.htg ?? null;
      if (htg) setRates({ HTG: parseFloat(htg), USD: r?.USD ?? 1 });
    } else {
      // Fallback static rate so banner always shows
      setRates({ HTG: 132.5, USD: 1.0 });
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const balance = parseFloat(wallet?.balance ?? 0) || 0;
  const htgRate = rates?.HTG ?? null;
  const txList  = (wallet?.transactions?.length > 0) ? wallet.transactions.slice(0, 5) : SAMPLE_TXS;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header nav ── */}
        <View style={styles.header}>
          <Logo size="md" />
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* ── Greeting ── */}
        <View style={styles.greetingBar}>
          <Text style={styles.greeting}>
            {greeting}{firstName ? `, ${firstName}` : ''} 👋
          </Text>
          <Text style={styles.date}>{dayDate}</Text>
        </View>

        {/* ── Balance Card ── */}
        <LinearGradient colors={[COLORS.navy, COLORS.primary]} style={styles.balanceCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {/* decorative circles */}
          <View style={styles.decCircle1} />
          <View style={styles.decCircle2} />

          <Text style={styles.balanceLabel}>{t.balance}</Text>
          {loading
            ? <ActivityIndicator color="#fff" size="large" style={{ marginVertical: 8 }} />
            : <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          }
          <Text style={styles.balanceSub}>
            {htgRate ? `≈ ${(balance * htgRate).toLocaleString()} HTG · Updated just now` : t.loading}
          </Text>

          {/* 4 action buttons */}
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.cardBtn} onPress={() => navigation.navigate('Send')}>
              <Text style={styles.cardBtnIcon}>📤</Text>
              <Text style={styles.cardBtnLabel}>{t.send}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardBtn} onPress={() => navigation.navigate('Wallet', { openAddFunds: true })}>
              <Text style={styles.cardBtnIcon}>➕</Text>
              <Text style={styles.cardBtnLabel}>{t.add}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardBtn} onPress={() => navigation.navigate('Wallet', { openReceive: true })}>
              <Text style={styles.cardBtnIcon}>📲</Text>
              <Text style={styles.cardBtnLabel}>{t.receive}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardBtn} onPress={() => navigation.navigate('Wallet', { openCashOut: true })}>
              <Text style={styles.cardBtnIcon}>🏦</Text>
              <Text style={styles.cardBtnLabel}>{t.cashOut}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>{t.quickActions}</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTION_DEFS.map((a) => (
            <TouchableOpacity
              key={a.tKey}
              style={styles.actionCard}
              onPress={() => a.screen && navigation.navigate(a.screen)}
              activeOpacity={0.75}
            >
              <Text style={styles.actionEmoji}>{a.emoji}</Text>
              <Text style={styles.actionLabel}>{t[a.tKey] || a.tKey}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Rate Banner ── */}
        <LinearGradient colors={[COLORS.primary, COLORS.cyan]} style={styles.rateBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.rateText}>
            {htgRate ? `$1 USD = ${htgRate.toFixed(2)} HTG` : 'Loading live rate…'}
          </Text>
          <Text style={styles.rateSub}>{t.liveRate}</Text>
        </LinearGradient>

        {/* ── Recent Activity ── */}
        <Text style={styles.sectionTitle}>{t.recentActivity}</Text>
        {txList.map((tx, i) => {
          const isApi = !!wallet?.transactions?.length;
          const isOut = isApi ? tx.type === 'send' : tx.type === 'send';
          const amt   = parseFloat(isApi ? tx.amount : tx.amount) || 0;
          const desc  = isApi ? (tx.description || 'Transfer') : tx.description;
          const date  = isApi ? (tx.date ? new Date(tx.date).toLocaleDateString() : '') : tx.date;
          const bg    = isApi ? (isOut ? '#FEE2E2' : '#D1FAE5') : tx.bg;
          const emoji = isApi ? (isOut ? '📤' : '📥') : tx.emoji;

          return (
            <View key={i} style={styles.txRow}>
              <View style={[styles.txAvatar, { backgroundColor: bg }]}>
                <Text style={{ fontSize: 18 }}>{emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txName}>{desc}</Text>
                <Text style={styles.txDate}>{date}</Text>
              </View>
              <Text style={[styles.txAmount, isOut ? styles.txOut : styles.txIn]}>
                {isOut ? '-' : '+'}${amt.toFixed(2)}
              </Text>
            </View>
          );
        })}

        {txList.length === 0 && (
          <View style={styles.emptyTx}>
            <Text style={styles.emptyTxText}>{t.noTxYet}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Send')}>
              <Text style={styles.emptyTxLink}>{t.sendFirst}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgPage },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  notifBtn: { padding: 8 },
  greetingBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  greeting: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  date: { fontSize: 12, color: COLORS.textLight, marginTop: 1 },

  // Balance card
  balanceCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, marginVertical: 16, overflow: 'hidden', position: 'relative' },
  decCircle1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)' },
  decCircle2: { position: 'absolute', bottom: -60, left: -20, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.04)' },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  balanceAmount: { color: '#fff', fontSize: 44, fontWeight: '800', letterSpacing: -1, marginBottom: 4 },
  balanceSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 22 },
  cardActions: { flexDirection: 'row', gap: 10 },
  cardBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  cardBtnIcon: { fontSize: 20, marginBottom: 4 },
  cardBtnLabel: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Quick Actions
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textDark, marginHorizontal: 20, marginBottom: 12, marginTop: 4 },
  actionsGrid: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 20 },
  actionCard: { flex: 1, alignItems: 'center', paddingVertical: 14, backgroundColor: '#fff', marginHorizontal: 4, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  actionEmoji: { fontSize: 26, marginBottom: 6 },
  actionLabel: { fontSize: 11, color: COLORS.textMid, fontWeight: '700' },

  // Rate banner
  rateBanner: { marginHorizontal: 20, borderRadius: 14, padding: 16, marginBottom: 20, alignItems: 'center' },
  rateText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  rateSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 },

  // Transactions
  txRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  txAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  txName: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  txDate: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  txOut: { color: '#EF4444' },
  txIn:  { color: '#10B981' },
  emptyTx: { alignItems: 'center', paddingVertical: 32 },
  emptyTxText: { color: COLORS.textLight, fontSize: 15 },
  emptyTxLink: { color: COLORS.primary, fontSize: 15, fontWeight: '700', marginTop: 8 },
});
