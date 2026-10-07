import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useStripe } from '@stripe/stripe-react-native';
import { sendTopUp, getExchangeRates, getWallet, addFundsToWallet } from '../services/api';
import { COLORS } from '../theme/colors';

// ── Country → operators map ──────────────────────────────────────────────────
const COUNTRY_DATA = {
  HT: {
    name: 'Haiti', flag: '🇭🇹',
    operators: [
      { id: 'digicel-ht', name: 'Digicel', emoji: '🔴', color: '#e17055' },
      { id: 'natcom-ht',  name: 'Natcom',  emoji: '🔵', color: '#0984e3' },
    ],
  },
  DO: {
    name: 'Dominican Rep.', flag: '🇩🇴',
    operators: [
      { id: 'claro-do',   name: 'Claro',   emoji: '🔴', color: '#e17055' },
      { id: 'altice-do',  name: 'Altice',  emoji: '🟣', color: '#6c5ce7' },
      { id: 'viva-do',    name: 'Viva',    emoji: '🟡', color: '#fdcb6e' },
    ],
  },
  CU: {
    name: 'Cuba', flag: '🇨🇺',
    operators: [
      { id: 'cubacel', name: 'Cubacel', emoji: '📡', color: '#00b894' },
    ],
  },
  JM: {
    name: 'Jamaica', flag: '🇯🇲',
    operators: [
      { id: 'digicel-jm', name: 'Digicel', emoji: '🔴', color: '#e17055' },
      { id: 'flow-jm',    name: 'Flow',    emoji: '🟢', color: '#00b894' },
    ],
  },
  TT: {
    name: 'Trinidad', flag: '🇹🇹',
    operators: [
      { id: 'digicel-tt', name: 'Digicel', emoji: '🔴', color: '#e17055' },
      { id: 'bmobile-tt', name: 'bmobile', emoji: '🟠', color: '#e67e22' },
    ],
  },
  GY: {
    name: 'Guyana', flag: '🇬🇾',
    operators: [
      { id: 'digicel-gy', name: 'Digicel', emoji: '🔴', color: '#e17055' },
      { id: 'egt-gy',     name: 'EGT',     emoji: '🟢', color: '#27ae60' },
    ],
  },
  BB: {
    name: 'Barbados', flag: '🇧🇧',
    operators: [
      { id: 'digicel-bb', name: 'Digicel', emoji: '🔴', color: '#e17055' },
      { id: 'flow-bb',    name: 'Flow',    emoji: '🟢', color: '#00b894' },
    ],
  },
  MQ: {
    name: 'Martinique', flag: '🇲🇶',
    operators: [
      { id: 'orange-mq',  name: 'Orange',  emoji: '🟠', color: '#e67e22' },
      { id: 'digicel-mq', name: 'Digicel', emoji: '🔴', color: '#e17055' },
    ],
  },
  GP: {
    name: 'Guadeloupe', flag: '🇬🇵',
    operators: [
      { id: 'orange-gp',  name: 'Orange',  emoji: '🟠', color: '#e67e22' },
      { id: 'digicel-gp', name: 'Digicel', emoji: '🔴', color: '#e17055' },
    ],
  },
  PR: {
    name: 'Puerto Rico', flag: '🇵🇷',
    operators: [
      { id: 'claro-pr',   name: 'Claro',    emoji: '🔴', color: '#e17055' },
      { id: 'tmobile-pr', name: 'T-Mobile', emoji: '🟣', color: '#6c5ce7' },
    ],
  },
  CA: {
    name: 'Canada', flag: '🇨🇦',
    operators: [
      { id: 'rogers-ca', name: 'Rogers', emoji: '🔴', color: '#e17055' },
      { id: 'bell-ca',   name: 'Bell',   emoji: '🔵', color: '#0984e3' },
      { id: 'telus-ca',  name: 'Telus',  emoji: '🟢', color: '#27ae60' },
    ],
  },
  FR: {
    name: 'France', flag: '🇫🇷',
    operators: [
      { id: 'orange-fr', name: 'Orange', emoji: '🟠', color: '#e67e22' },
      { id: 'sfr-fr',    name: 'SFR',    emoji: '🔴', color: '#e17055' },
      { id: 'free-fr',   name: 'Free',   emoji: '🟣', color: '#6c5ce7' },
    ],
  },
  US: {
    name: 'USA', flag: '🇺🇸',
    operators: [
      { id: 'att-us',     name: 'AT&T',    emoji: '🔵', color: '#0984e3' },
      { id: 'tmobile-us', name: 'T-Mobile',emoji: '🟣', color: '#6c5ce7' },
      { id: 'verizon-us', name: 'Verizon', emoji: '🔴', color: '#e17055' },
    ],
  },
};

const COUNTRY_CODES = Object.keys(COUNTRY_DATA);
const AMOUNTS = ['5', '10', '20', '25', '50'];

export default function TopUpScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // ── Form state ──
  const [country,  setCountry]  = useState('HT');
  const [operator, setOperator] = useState('digicel-ht');
  const [phone,    setPhone]    = useState('');
  const [amount,   setAmount]   = useState('');

  // ── Payment step state ──
  const [step,          setStep]          = useState('form');   // 'form' | 'payment'
  const [payMethod,     setPayMethod]     = useState('wallet'); // 'wallet' | 'card'
  const [walletBalance, setWalletBalance] = useState(null);

  // ── UI state ──
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [htgRate,     setHtgRate]     = useState(null);
  const [rateLoading, setRateLoading] = useState(true);

  // Fetch live HTG rate
  const fetchRate = useCallback(async () => {
    try {
      const res = await getExchangeRates();
      const rates = res.data?.data?.rates ?? res.data?.rates ?? res.data;
      const rate = rates?.HTG ?? rates?.htg ?? null;
      if (rate) setHtgRate(parseFloat(rate));
    } catch {
      setHtgRate(132.5);
    } finally {
      setRateLoading(false);
    }
  }, []);

  useEffect(() => { fetchRate(); }, [fetchRate]);

  // Load wallet balance when entering payment step
  useEffect(() => {
    if (step === 'payment' && walletBalance === null) {
      getWallet()
        .then(r => setWalletBalance(parseFloat(r.data?.balance ?? 0)))
        .catch(() => setWalletBalance(0));
    }
  }, [step]);

  const handleCountryChange = (code) => {
    setCountry(code);
    setOperator(COUNTRY_DATA[code].operators[0].id);
  };

  const activeOps = COUNTRY_DATA[country].operators;
  const amt       = parseFloat(amount) || 0;
  const fee       = parseFloat((amt * 0.02).toFixed(2));
  const total     = parseFloat((amt + fee).toFixed(2));
  const htgValue  = htgRate ? (amt * htgRate).toFixed(0) : null;
  const opName    = activeOps.find(o => o.id === operator)?.name || '';

  // ── Send via wallet balance ──
  const sendViaWallet = async () => {
    if (walletBalance !== null && walletBalance < total) {
      return Alert.alert(
        'Insufficient Balance',
        `Your wallet has $${walletBalance.toFixed(2)}. You need $${total.toFixed(2)}.\n\nSwitch to "Debit / Card" to pay by card.`,
      );
    }
    setLoading(true);
    try {
      await sendTopUp({ operator, phone: phone.trim(), amount: amt, country, paymentMethod: 'wallet' });
      setSuccess(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Top-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Send via Stripe card ──
  const sendViaCard = async () => {
    setLoading(true);
    try {
      // 1. Create payment intent for the top-up amount
      const res = await addFundsToWallet({ amount: total, currency: 'usd' });
      const { clientSecret } = res.data;
      if (!clientSecret) throw new Error('Payment setup failed.');

      // 2. Init Stripe sheet
      const { error: initErr } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Tchotcho Pay',
        style: 'alwaysLight',
      });
      if (initErr) throw new Error(initErr.message);

      // 3. Present Stripe payment UI (card, Apple Pay, Google Pay)
      const { error: presentErr } = await presentPaymentSheet();
      if (presentErr) {
        if (presentErr.code === 'Canceled') return;
        throw new Error(presentErr.message);
      }

      // 4. Payment collected → deliver airtime
      await sendTopUp({ operator, phone: phone.trim(), amount: amt, country, paymentMethod: 'card' });
      setSuccess(true);
    } catch (err) {
      Alert.alert('Payment Failed', err.message || err.response?.data?.error || 'Could not process payment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (payMethod === 'card') return sendViaCard();
    return sendViaWallet();
  };

  const resetAll = () => {
    setSuccess(false); setStep('form');
    setPhone(''); setAmount(''); setWalletBalance(null);
  };

  // ── Success screen ──
  if (success) {
    return (
      <SafeAreaView style={[styles.safe, styles.successPage]}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>📱</Text>
        <Text style={styles.successTitle}>Kredi Voye!</Text>
        <Text style={styles.successSub}>${amt.toFixed(2)} airtime sent to</Text>
        <Text style={styles.successPhone}>{phone}</Text>
        <Text style={styles.successOp}>{opName} · {COUNTRY_DATA[country].flag} {COUNTRY_DATA[country].name}</Text>
        <TouchableOpacity style={styles.successBtn} onPress={resetAll}>
          <Text style={styles.successBtnText}>Send Another</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── STEP: Payment method ──
  if (step === 'payment') {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep('form')}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.payContainer} showsVerticalScrollIndicator={false}>

          {/* Summary card */}
          <LinearGradient colors={[COLORS.navy, COLORS.primary]} style={styles.summaryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.summaryLabel}>Top-Up Summary</Text>
            <Text style={styles.summaryAmount}>${amt.toFixed(2)}</Text>
            <Text style={styles.summarySub}>
              {COUNTRY_DATA[country].flag} {opName} · {phone}
            </Text>
            {htgValue && (
              <Text style={styles.summaryHtg}>≈ {parseInt(htgValue).toLocaleString()} HTG airtime</Text>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryDetailLabel}>Airtime</Text>
              <Text style={styles.summaryDetailVal}>${amt.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryDetailLabel}>Service fee (2%)</Text>
              <Text style={styles.summaryDetailVal}>${fee.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 6 }]}>
              <Text style={[styles.summaryDetailLabel, { fontWeight: '700', color: '#fff' }]}>Total charged</Text>
              <Text style={[styles.summaryDetailVal, { fontWeight: '800', fontSize: 16 }]}>${total.toFixed(2)}</Text>
            </View>
          </LinearGradient>

          {/* Payment method label */}
          <Text style={styles.payLabel}>Pay with</Text>

          {/* Tabs */}
          <View style={styles.payTabs}>
            <TouchableOpacity
              style={[styles.payTab, payMethod === 'wallet' && styles.payTabActive]}
              onPress={() => setPayMethod('wallet')}
            >
              <Text style={styles.payTabEmoji}>💳</Text>
              <Text style={[styles.payTabLabel, payMethod === 'wallet' && styles.payTabLabelActive]}>
                USDC Wallet
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.payTab, payMethod === 'card' && styles.payTabActive]}
              onPress={() => setPayMethod('card')}
            >
              <Text style={styles.payTabEmoji}>🏦</Text>
              <Text style={[styles.payTabLabel, payMethod === 'card' && styles.payTabLabelActive]}>
                Debit / Card
              </Text>
            </TouchableOpacity>
          </View>

          {/* USDC Wallet panel */}
          {payMethod === 'wallet' && (
            <View style={styles.payPanel}>
              <Text style={styles.payPanelTitle}>💳 Pay from USDC Wallet</Text>
              {walletBalance === null ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 12 }} />
              ) : (
                <>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Available balance</Text>
                    <Text style={[
                      styles.balanceVal,
                      walletBalance < total && { color: '#EF4444' },
                    ]}>
                      ${walletBalance.toFixed(2)} USDC
                    </Text>
                  </View>
                  {walletBalance < total && (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningText}>
                        ⚠️ Not enough balance. Switch to "Debit / Card" to pay directly.
                      </Text>
                    </View>
                  )}
                  {walletBalance >= total && (
                    <View style={styles.okBox}>
                      <Text style={styles.okText}>✅ Balance sufficient — ready to send!</Text>
                    </View>
                  )}
                </>
              )}
              <Text style={styles.payPanelNote}>Instant · No conversion fee · Available 24/7</Text>
            </View>
          )}

          {/* Card panel */}
          {payMethod === 'card' && (
            <View style={styles.payPanel}>
              <Text style={styles.payPanelTitle}>🏦 Pay by Debit or Credit Card</Text>
              <Text style={styles.payPanelDesc}>
                Stripe's secure payment sheet opens so you can enter your card details.
                Supports Apple Pay and Google Pay too.
              </Text>
              <View style={styles.cardIcons}>
                {['💳 Visa', '💳 Mastercard', '🍎 Apple Pay', 'G Google Pay'].map(i => (
                  <View key={i} style={styles.cardIconChip}>
                    <Text style={styles.cardIconText}>{i}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.payPanelNote}>Secured by Stripe · 256-bit SSL encryption</Text>
            </View>
          )}

          {/* Pay CTA */}
          <TouchableOpacity
            style={[styles.sendBtn, loading && { opacity: 0.6 }]}
            onPress={handlePay}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.sendBtnText}>
                  {payMethod === 'card'
                    ? `Pay $${total.toFixed(2)} & Send Airtime →`
                    : `Send $${amt.toFixed(2)} from Wallet →`}
                </Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── STEP: Form ──
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Phone Top-Up 📱</Text>
          <Text style={styles.sub}>Send airtime to 13+ countries</Text>

          {/* Live Rate Banner */}
          <LinearGradient colors={[COLORS.primary, COLORS.cyan]} style={styles.rateBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {rateLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.rateText}>💱 $1 USD = {htgRate ? htgRate.toFixed(2) : '—'} HTG</Text>
                <Text style={styles.rateSub}>Live rate · No hidden fees</Text>
              </>
            )}
          </LinearGradient>

          {/* Country */}
          <Text style={styles.label}>Country</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll} contentContainerStyle={{ paddingRight: 8 }}>
            {COUNTRY_CODES.map((code) => {
              const c = COUNTRY_DATA[code];
              const active = country === code;
              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.countryBtn, active && styles.countryBtnActive]}
                  onPress={() => handleCountryChange(code)}
                >
                  <Text style={styles.countryFlag}>{c.flag}</Text>
                  <Text style={[styles.countryName, active && styles.countryNameActive]}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Operator */}
          <Text style={styles.label}>Operator</Text>
          <View style={styles.operatorRow}>
            {activeOps.map((op) => {
              const active = operator === op.id;
              return (
                <TouchableOpacity
                  key={op.id}
                  style={[styles.operatorCard, active && { borderColor: op.color, borderWidth: 2.5 }]}
                  onPress={() => setOperator(op.id)}
                >
                  <Text style={styles.opEmoji}>{op.emoji}</Text>
                  <Text style={[styles.opName, active && { color: op.color, fontWeight: '700' }]}>{op.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Phone */}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder={country === 'HT' ? '+509 3X XX XXXX' : '+1 (000) 000-0000'}
            placeholderTextColor="#b2bec3"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Amount */}
          <Text style={styles.label}>Amount (USD)</Text>
          <View style={styles.amtGrid}>
            {AMOUNTS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.amtBtn, amount === a && styles.amtBtnActive]}
                onPress={() => setAmount(a)}
              >
                <Text style={[styles.amtBtnText, amount === a && styles.amtBtnTextActive]}>${a}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Or enter custom amount"
            placeholderTextColor="#b2bec3"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          {/* HTG conversion hint */}
          {amt > 0 && htgRate && (
            <View style={styles.conversionRow}>
              <Text style={styles.conversionText}>
                ≈ {parseInt(htgValue).toLocaleString()} HTG · Fee: ${fee.toFixed(2)} · Total: ${total.toFixed(2)}
              </Text>
            </View>
          )}

          {/* CTA — goes to payment step */}
          <TouchableOpacity
            style={[styles.sendBtn, (!phone || !amount || amt < 1) && { opacity: 0.45 }]}
            onPress={() => {
              if (!phone.trim()) return Alert.alert('Missing Info', 'Please enter a phone number.');
              if (amt < 1) return Alert.alert('Missing Info', 'Minimum top-up is $1.');
              setStep('payment');
            }}
            disabled={!phone || !amount || amt < 1}
          >
            <Text style={styles.sendBtnText}>Choose Payment →</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgPage },
  container: { flexGrow: 1, padding: 20, paddingBottom: 48 },

  heading: { fontSize: 26, fontWeight: '800', color: COLORS.textDark, marginBottom: 4 },
  sub: { fontSize: 14, color: COLORS.textLight, marginBottom: 16 },

  rateBanner: { borderRadius: 14, padding: 14, marginBottom: 20, alignItems: 'center' },
  rateText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  rateSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 3 },

  label: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10, marginTop: 18 },

  countryScroll: { marginBottom: 0, flexGrow: 0 },
  countryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 12, marginRight: 8, borderWidth: 1.5, borderColor: '#E5E7EB' },
  countryBtnActive: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  countryFlag: { fontSize: 18, marginRight: 6 },
  countryName: { fontSize: 12, color: COLORS.textMid, fontWeight: '600' },
  countryNameActive: { color: COLORS.primary },

  operatorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  operatorCard: { flexBasis: '30%', flexGrow: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB' },
  opEmoji: { fontSize: 24, marginBottom: 4 },
  opName: { fontSize: 12, color: COLORS.textMid, fontWeight: '600', textAlign: 'center' },

  input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.textDark, backgroundColor: '#fff', marginTop: 4 },
  amtGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  amtBtn: { paddingHorizontal: 18, paddingVertical: 12, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB' },
  amtBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  amtBtnText: { color: COLORS.textDark, fontWeight: '700', fontSize: 14 },
  amtBtnTextActive: { color: '#fff' },

  conversionRow: { backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, marginTop: 8 },
  conversionText: { color: COLORS.primary, fontSize: 13, fontWeight: '600', textAlign: 'center' },

  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 24 },
  sendBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // ── Payment step ──
  payContainer: { padding: 20, paddingBottom: 48 },
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  backArrow: { fontSize: 15, fontWeight: '600', color: COLORS.primary },

  summaryCard: { borderRadius: 20, padding: 22, marginBottom: 20 },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  summaryAmount: { color: '#fff', fontSize: 44, fontWeight: '800', letterSpacing: -1 },
  summarySub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 4 },
  summaryHtg: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 12 },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryDetailLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  summaryDetailVal: { color: '#fff', fontSize: 13 },

  payLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  payTabs: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 14, padding: 4, marginBottom: 14 },
  payTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 11 },
  payTabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  payTabEmoji: { fontSize: 18 },
  payTabLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMid },
  payTabLabelActive: { color: COLORS.primary },

  payPanel: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  payPanelTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 12 },
  payPanelDesc: { fontSize: 13, color: COLORS.textMid, lineHeight: 20, marginBottom: 14 },
  payPanelNote: { fontSize: 11, color: COLORS.textLight, marginTop: 10 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { fontSize: 13, color: COLORS.textMid },
  balanceVal: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  warningBox: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginTop: 4 },
  warningText: { fontSize: 12, color: '#EF4444', lineHeight: 18 },
  okBox: { backgroundColor: '#ECFDF5', borderRadius: 10, padding: 12, marginTop: 4 },
  okText: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  cardIcons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  cardIconChip: { backgroundColor: '#F3F4F6', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  cardIconText: { fontSize: 11, fontWeight: '600', color: COLORS.textMid },

  // Success
  successPage: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successTitle: { fontSize: 32, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  successSub: { fontSize: 16, color: COLORS.textMid },
  successPhone: { fontSize: 20, fontWeight: '700', color: COLORS.textDark, marginTop: 4 },
  successOp: { fontSize: 14, color: COLORS.textLight, marginTop: 4, marginBottom: 4 },
  successBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, marginTop: 32 },
  successBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
