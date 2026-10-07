import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useStripe } from '@stripe/stripe-react-native';
import { sendMoney, getWallet, createPaymentIntent } from '../services/api';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { COLORS } from '../theme/colors';

const PROVIDERS = [
  { id: 'moncash', name: 'MonCash', emoji: '📱', color: '#00A651' },
  { id: 'natcash', name: 'NatCash', emoji: '📲', color: '#003087' },
  { id: 'wallet',  name: 'USDC Wallet', emoji: '💳', color: COLORS.primary },
];

const RECENT = [
  { initials: 'MJ', name: 'Marie Jean',    phone: '+509 3712-3456', color: '#7C3AED' },
  { initials: 'PL', name: 'Pierre Louis',  phone: '+509 3688-1234', color: '#0EA5E9' },
  { initials: 'RF', name: 'Rose Fleur',    phone: '+509 4791-5678', color: '#EC4899' },
];

const HTG_RATE = 132.5;

export default function SendMoneyScreen({ navigation }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const { t }    = useLang();

  // Steps: 'recipient' → 'amount' → 'payment' → success
  const [step, setStep] = useState('recipient');
  const [provider, setProvider]   = useState('moncash');
  const [recipient, setRecipient] = useState(null);
  const [walletAddr, setWalletAddr] = useState('');   // destination wallet address (USDC sends)
  const [walletAddrInput, setWalletAddrInput] = useState(''); // typing state
  const [amountStr, setAmountStr] = useState('0');
  const [payMethod, setPayMethod] = useState('wallet'); // 'wallet' | 'card'
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [txRef, setTxRef]         = useState('');

  const amount  = parseFloat(amountStr) || 0;
  const fee     = parseFloat((amount * 0.01).toFixed(2));
  const total   = parseFloat((amount + fee).toFixed(2));
  const htgVal  = parseFloat((amount * HTG_RATE).toFixed(0));

  // Load wallet balance when entering payment step
  useEffect(() => {
    if (step === 'payment' && walletBalance === null) {
      getWallet()
        .then(r => setWalletBalance(parseFloat(r.data?.balance ?? 0)))
        .catch(() => setWalletBalance(0));
    }
  }, [step]);

  /* ── numpad ── */
  const numpadPress = (key) => {
    if (key === '⌫') {
      setAmountStr(s => s.length > 1 ? s.slice(0, -1) : '0');
    } else if (key === '.') {
      setAmountStr(s => s.includes('.') ? s : s + '.');
    } else {
      setAmountStr(s => s === '0' ? key : s + key);
    }
  };

  /* ── execute send via wallet balance ── */
  const sendViaWallet = async () => {
    if (walletBalance !== null && walletBalance < total) {
      return Alert.alert(
        'Insufficient Balance',
        `Your wallet has $${walletBalance.toFixed(2)}. You need $${total.toFixed(2)}.\n\nTap "Pay by Card" to add funds and send.`,
      );
    }
    setLoading(true);
    try {
      // USDC wallet-to-wallet transfer (direct on-chain)
      if (provider === 'wallet') {
        const destAddr = walletAddr.trim();
        if (!destAddr) throw new Error('Please enter a valid wallet address.');
        const res = await api.post('/.netlify/functions/circle-wallet', {
          action:             'sendUsdc',
          walletId:           user?.circle_wallet_id,
          destinationAddress: destAddr,
          amount:             amount.toString(),
          userId:             user?.id || user?.email,
        });
        setTxRef(res.data?.transaction?.id || 'TX' + Date.now());
        setSuccess(true);
        return;
      }
      // MonCash / NatCash transfer
      const res = await sendMoney({
        provider,
        recipientPhone: recipient.phone,
        amount,
        paymentMethod: 'wallet',
        note: '',
      });
      setTxRef(res.data?.reference || 'TX' + Date.now());
      setSuccess(true);
    } catch (err) {
      Alert.alert('Transfer Failed', err.response?.data?.error || err.message || 'Could not send. Try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── execute send via Stripe card ── */
  const sendViaCard = async () => {
    setLoading(true);
    try {
      // 1. Create Stripe payment intent for the full amount
      const res = await createPaymentIntent({
        amount: total,
        wallet: provider === 'wallet' ? 'moncash' : provider, // fallback
        phoneNumber: recipient.phone.replace(/\D/g, ''),
      });
      const { clientSecret } = res.data;
      if (!clientSecret) throw new Error('Payment setup failed.');

      // 2. Init Stripe sheet
      const { error: initErr } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Tchotcho Pay',
        style: 'alwaysLight',
      });
      if (initErr) throw new Error(initErr.message);

      // 3. Show Stripe payment UI
      const { error: presentErr } = await presentPaymentSheet();
      if (presentErr) {
        if (presentErr.code === 'Canceled') return;
        throw new Error(presentErr.message);
      }

      // 4. Payment collected → execute transfer
      const txRes = await sendMoney({
        provider,
        recipientPhone: recipient.phone,
        amount,
        paymentMethod: 'card',
        note: '',
      });
      setTxRef(txRes.data?.reference || 'TX' + Date.now());
      setSuccess(true);
    } catch (err) {
      Alert.alert('Payment Failed', err.message || err.response?.data?.error || 'Could not process payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (payMethod === 'card') return sendViaCard();
    return sendViaWallet();
  };

  const reset = () => {
    setSuccess(false); setStep('recipient'); setRecipient(null);
    setAmountStr('0'); setTxRef(''); setWalletBalance(null);
    setWalletAddr(''); setWalletAddrInput('');
  };

  /* ── SUCCESS ── */
  if (success) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>🎉</Text>
        <Text style={styles.successTitle}>Lajan voye!</Text>
        <Text style={styles.successSub}>
          ${amount.toFixed(2)} sent to {recipient?.name}{'\n'}
          via {PROVIDERS.find(p => p.id === provider)?.name}
        </Text>
        <Text style={styles.txRef}>Ref: {txRef}</Text>
        <TouchableOpacity style={styles.sendBtn} onPress={reset}>
          <Text style={styles.sendBtnText}>Send Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* ── STEP 1: Recipient ── */
  if (step === 'recipient') {
    const isWalletSend = provider === 'wallet';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            <Text style={styles.screenTitle}>{t.sendMoney || 'Send Money'} 💸</Text>
            <Text style={styles.screenSub}>{t.recipient || 'Choose where to send'}</Text>
          </View>

          {/* Provider selector */}
          <View style={styles.providerRow}>
            {PROVIDERS.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.providerChip, provider === p.id && { borderColor: p.color, backgroundColor: '#EFF6FF' }]}
                onPress={() => { setProvider(p.id); setWalletAddrInput(''); }}
              >
                <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
                <Text style={[styles.providerLabel, provider === p.id && { color: p.color, fontWeight: '700' }]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── USDC Wallet: address input ── */}
          {isWalletSend ? (
            <>
              <Text style={styles.sectionLabel}>Recipient Wallet Address</Text>
              <View style={styles.walletAddrInputBox}>
                <Text style={styles.walletAddrInputIcon}>🔗</Text>
                <TextInput
                  style={styles.walletAddrInputField}
                  placeholder="0x... or Arc wallet address"
                  placeholderTextColor="#b2bec3"
                  value={walletAddrInput}
                  onChangeText={setWalletAddrInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline={false}
                />
              </View>
              <TouchableOpacity
                style={[styles.newRecipientBtn, { marginTop: 8 }, (!walletAddrInput.trim() || walletAddrInput.trim().length < 10) && { opacity: 0.4 }]}
                disabled={!walletAddrInput.trim() || walletAddrInput.trim().length < 10}
                onPress={() => {
                  const addr = walletAddrInput.trim();
                  setWalletAddr(addr);
                  setRecipient({ initials: '💳', name: `${addr.slice(0, 6)}…${addr.slice(-4)}`, phone: '', color: COLORS.primary });
                  setStep('amount');
                }}
              >
                <Text style={{ fontSize: 22, marginRight: 12 }}>✅</Text>
                <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 15 }}>Confirm Address & Continue</Text>
              </TouchableOpacity>
              <View style={styles.walletAddrTip}>
                <Text style={styles.walletAddrTipText}>💡 Paste the recipient's Tchotcho Pay or compatible wallet address. Double-check before sending — transfers cannot be reversed.</Text>
              </View>
            </>
          ) : (
            <>
              {/* Recent contacts (MonCash / NatCash only) */}
              <Text style={styles.sectionLabel}>{t.recent || 'Recent'}</Text>
              {RECENT.map(c => (
                <TouchableOpacity
                  key={c.phone}
                  style={styles.contactRow}
                  onPress={() => { setRecipient(c); setStep('amount'); }}
                >
                  <View style={[styles.contactAvatar, { backgroundColor: c.color }]}>
                    <Text style={styles.contactInitials}>{c.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{c.name}</Text>
                    <Text style={styles.contactPhone}>{c.phone}</Text>
                  </View>
                  <Text style={{ color: COLORS.textLight, fontSize: 22 }}>›</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.sectionLabel}>{t.orEnterNumber || 'Or enter a number'}</Text>
              <TouchableOpacity
                style={styles.newRecipientBtn}
                onPress={() => {
                  setRecipient({ initials: '?', name: 'New Recipient', phone: '+509', color: COLORS.primary });
                  setStep('amount');
                }}
              >
                <Text style={{ fontSize: 22, marginRight: 12 }}>➕</Text>
                <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 15 }}>{t.enterPhone || 'Enter phone number'}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ── STEP 2: Amount with numpad ── */
  if (step === 'amount') {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep('recipient')}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.amountSection}>
          <Text style={styles.sendingToLabel}>Sending to</Text>
          <View style={styles.recipientPill}>
            <View style={[styles.pillAvatar, { backgroundColor: recipient?.color || COLORS.primary }]}>
              <Text style={styles.pillInitials}>{recipient?.initials}</Text>
            </View>
            <Text style={styles.pillName}>{recipient?.name}</Text>
          </View>
          <Text style={styles.amountDisplay}>${amountStr}</Text>
          <Text style={styles.amountUsdc}>{amount.toFixed(2)} USDC</Text>
          {amount > 0 && (
            <Text style={styles.amountRate}>≈ {htgVal.toLocaleString()} HTG · Fee: ${fee.toFixed(2)}</Text>
          )}
        </View>

        <View style={styles.numpad}>
          {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(key => (
            <TouchableOpacity
              key={key}
              style={styles.numKey}
              onPress={() => numpadPress(key)}
              activeOpacity={0.7}
            >
              <Text style={styles.numKeyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.sendBtn, styles.sendBtnLarge, amount < 1 && { opacity: 0.4 }]}
          onPress={() => { if (amount >= 1) setStep('payment'); }}
          disabled={amount < 1}
        >
          <Text style={styles.sendBtnText}>Choose Payment →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* ── STEP 3: Payment method ── */
  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setStep('amount')}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Summary */}
        <LinearGradient colors={[COLORS.navy, COLORS.primary]} style={styles.summaryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.summaryLabel}>You're sending</Text>
          <Text style={styles.summaryAmount}>${amount.toFixed(2)}</Text>
          <Text style={styles.summarySub}>
            to {recipient?.name} · via {PROVIDERS.find(p => p.id === provider)?.name}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryDetail}>Transfer amount</Text>
            <Text style={styles.summaryDetailVal}>${amount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryDetail}>Fee (1%)</Text>
            <Text style={styles.summaryDetailVal}>${fee.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', marginTop: 8, paddingTop: 10 }]}>
            <Text style={[styles.summaryDetail, { fontWeight: '700' }]}>Total charged</Text>
            <Text style={[styles.summaryDetailVal, { fontWeight: '800', fontSize: 16 }]}>${total.toFixed(2)}</Text>
          </View>
        </LinearGradient>

        {/* Payment method tabs */}
        <Text style={styles.payLabel}>{t.paymentMethod || 'Payment method'}</Text>
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

        {/* Wallet panel */}
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
                      ⚠️ Insufficient balance. Switch to "Debit / Card" to pay by card instead.
                    </Text>
                  </View>
                )}
                {provider === 'wallet' && walletAddr ? (
                  <View style={[styles.warningBox, { backgroundColor: '#EFF6FF', marginTop: 8 }]}>
                    <Text style={[styles.warningText, { color: COLORS.primary }]}>
                      📤 Sending to: {walletAddr.slice(0, 10)}…{walletAddr.slice(-6)}
                    </Text>
                  </View>
                ) : null}
              </>
            )}
            <Text style={styles.payPanelNote}>Instant · No extra fee · Available 24/7</Text>
          </View>
        )}

        {/* Card panel */}
        {payMethod === 'card' && (
          <View style={styles.payPanel}>
            <Text style={styles.payPanelTitle}>🏦 Pay by Debit or Credit Card</Text>
            <Text style={styles.payPanelDesc}>
              Stripe's secure payment sheet will open so you can enter your card details.
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

        {/* Send button */}
        <TouchableOpacity
          style={[styles.sendBtn, styles.sendBtnLarge, loading && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.sendBtnText}>
                {payMethod === 'card' ? `Pay $${total.toFixed(2)} & Send →` : `Send $${amount.toFixed(2)} from Wallet →`}
              </Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgPage },
  topBar: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  screenTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textDark },
  screenSub: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },

  providerRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 20 },
  providerChip: {
    flex: 1, flexDirection: 'column', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', borderRadius: 14, padding: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  providerLabel: { fontSize: 11, color: COLORS.textMid, fontWeight: '600', textAlign: 'center' },

  sectionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: 24, marginBottom: 10 },
  contactRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 14, padding: 14, marginBottom: 8 },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  contactInitials: { color: '#fff', fontWeight: '800', fontSize: 16 },
  contactName: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  contactPhone: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  newRecipientBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', marginHorizontal: 20, borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: COLORS.primary, marginBottom: 20 },

  // Wallet address input
  walletAddrInputBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fff', marginBottom: 4 },
  walletAddrInputIcon: { fontSize: 22, marginRight: 10 },
  walletAddrInputField: { flex: 1, fontSize: 14, color: COLORS.textDark, fontFamily: 'monospace' },
  walletAddrTip: { marginHorizontal: 20, marginTop: 16, backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FDE68A' },
  walletAddrTipText: { fontSize: 12, color: '#92400E', lineHeight: 18 },

  // Amount step
  backBtn: { padding: 20, paddingBottom: 0 },
  backArrow: { fontSize: 24, color: COLORS.textDark },
  amountSection: { alignItems: 'center', paddingTop: 16, paddingBottom: 12 },
  sendingToLabel: { fontSize: 13, color: COLORS.textLight, marginBottom: 12 },
  recipientPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 50, paddingVertical: 8, paddingHorizontal: 16, gap: 10, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 24 },
  pillAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  pillInitials: { color: '#fff', fontWeight: '800', fontSize: 13 },
  pillName: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  amountDisplay: { fontSize: 60, fontWeight: '800', color: COLORS.textDark, letterSpacing: -2 },
  amountUsdc: { fontSize: 15, color: COLORS.textLight, marginTop: 4 },
  amountRate: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginTop: 8 },
  numKey: { width: '33.333%', height: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E5E7EB' },
  numKeyText: { fontSize: 24, fontWeight: '500', color: COLORS.textDark },

  // Payment step
  summaryCard: { marginHorizontal: 20, borderRadius: 20, padding: 22, marginTop: 12, marginBottom: 20, overflow: 'hidden' },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  summaryAmount: { color: '#fff', fontSize: 42, fontWeight: '800', letterSpacing: -1 },
  summarySub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryDetail: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  summaryDetailVal: { color: '#fff', fontSize: 13 },

  payLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: 24, marginBottom: 10 },
  payTabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, backgroundColor: '#F3F4F6', borderRadius: 14, padding: 4 },
  payTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  payTabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  payTabEmoji: { fontSize: 18 },
  payTabLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMid },
  payTabLabelActive: { color: COLORS.primary },

  payPanel: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  payPanelTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 12 },
  payPanelDesc: { fontSize: 13, color: COLORS.textMid, lineHeight: 20, marginBottom: 14 },
  payPanelNote: { fontSize: 11, color: COLORS.textLight, marginTop: 10 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { fontSize: 13, color: COLORS.textMid },
  balanceVal: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  warningBox: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginTop: 6 },
  warningText: { fontSize: 12, color: '#EF4444', lineHeight: 18 },
  cardIcons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  cardIconChip: { backgroundColor: '#F3F4F6', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  cardIconText: { fontSize: 11, fontWeight: '600', color: COLORS.textMid },

  // Send/CTA
  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginHorizontal: 20, marginTop: 8 },
  sendBtnLarge: { marginBottom: 12 },
  sendBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // Success
  successTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textDark, marginBottom: 10, textAlign: 'center' },
  successSub: { fontSize: 15, color: COLORS.textMid, textAlign: 'center', lineHeight: 22 },
  txRef: { fontSize: 12, color: COLORS.textLight, marginTop: 8, marginBottom: 24 },
});
