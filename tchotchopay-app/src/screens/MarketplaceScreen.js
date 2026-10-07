import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { getWalletBalance, addFundsToWallet, sendMoney } from '../services/api';
import { COLORS } from '../theme/colors';

// Category keys map to translation keys in LangContext
const CATEGORY_KEYS = [
  { key: 'All',       tKey: 'catAll' },
  { key: 'Food',      tKey: 'catFood' },
  { key: 'Utilities', tKey: 'catUtilities' },
  { key: 'Phone',     tKey: 'catPhone' },
  { key: 'School',    tKey: 'catSchool' },
  { key: 'Transport', tKey: 'catTransport' },
  { key: 'Health',    tKey: 'catHealth' },
];

const SERVICES = [
  { emoji: '🍽️', name: 'Food & Grocery',   sub: 'Local markets & delivery',  cat: 'Food',      amounts: ['10', '20', '50', '100'] },
  { emoji: '⚡',  name: 'Electricity',       sub: 'EDH bill payment',          cat: 'Utilities', amounts: ['25', '50', '100', '200'] },
  { emoji: '📱',  name: 'Phone Top-Up',      sub: 'Digicel & Natcom',          cat: 'Phone',     amounts: ['5', '10', '20', '25'],  route: 'TopUp' },
  { emoji: '🎓',  name: 'School Fees',       sub: 'Pay tuition directly',      cat: 'School',    amounts: ['50', '100', '200', '500'] },
  { emoji: '🚌',  name: 'Transportation',    sub: 'Tap-tap & moto',            cat: 'Transport', amounts: ['2', '5', '10', '20'] },
  { emoji: '💊',  name: 'Pharmacy',          sub: 'Medicine & health',         cat: 'Health',    amounts: ['10', '25', '50', '100'] },
  { emoji: '🌊',  name: 'Water (CAMEP)',     sub: 'Water bill payment',        cat: 'Utilities', amounts: ['15', '30', '50', '100'] },
  { emoji: '🛒',  name: 'Supermarket',       sub: 'Pay at checkout with QR',   cat: 'Food',      amounts: ['20', '50', '100', '200'] },
];

const QUICK_AMTS = ['5', '10', '20', '50'];

export default function MarketplaceScreen({ navigation }) {
  const { user } = useAuth();
  const { t }    = useLang();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [activeCategory, setActiveCategory] = useState('All');
  const [search,         setSearch]         = useState('');

  // Payment modal state
  const [selectedItem,  setSelectedItem]  = useState(null);
  const [modalVisible,  setModalVisible]  = useState(false);
  const [amount,        setAmount]        = useState('');
  const [payMethod,     setPayMethod]     = useState('wallet'); // 'wallet' | 'card'
  const [walletBal,     setWalletBal]     = useState(null);
  const [paying,        setPaying]        = useState(false);
  const [successItem,   setSuccessItem]   = useState(null);

  const filtered = SERVICES.filter((s) => {
    const matchCat    = activeCategory === 'All' || s.cat === activeCategory;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.sub.toLowerCase().includes(search.toLowerCase()) ||
                        (t[`cat${s.cat}`] || s.cat).toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Load wallet balance when modal opens
  useEffect(() => {
    if (modalVisible && walletBal === null && user?.circle_wallet_id) {
      getWalletBalance(user.circle_wallet_id)
        .then(r => setWalletBal(parseFloat(r.data?.usdcBalance ?? r.data?.balance ?? 0)))
        .catch(() => setWalletBal(0));
    }
  }, [modalVisible]);

  const openItem = (item) => {
    // Phone Top-Up → navigate to the dedicated TopUp screen
    if (item.route === 'TopUp' && navigation) {
      return navigation.navigate('TopUp');
    }
    setSelectedItem(item);
    setAmount('');
    setPayMethod('wallet');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
    setAmount('');
    setPaying(false);
  };

  const amt   = parseFloat(amount) || 0;
  const fee   = parseFloat((amt * 0.01).toFixed(2));   // 1% marketplace fee
  const total = parseFloat((amt + fee).toFixed(2));

  const payViaWallet = async () => {
    if (!amt || amt < 0.5) return Alert.alert('Amount required', 'Enter an amount to continue.');
    if (walletBal !== null && walletBal < total) {
      return Alert.alert(
        'Insufficient Balance',
        `Your wallet has $${walletBal.toFixed(2)}. You need $${total.toFixed(2)}.\n\nSwitch to "Debit / Card" to pay by card.`,
      );
    }
    setPaying(true);
    try {
      // In production: call merchant payment API here
      await new Promise(r => setTimeout(r, 1200)); // simulate processing
      closeModal();
      setSuccessItem(selectedItem?.name);
    } catch (err) {
      Alert.alert('Payment Error', err.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const payViaCard = async () => {
    if (!amt || amt < 0.5) return Alert.alert('Amount required', 'Enter an amount to continue.');
    setPaying(true);
    try {
      const res = await addFundsToWallet({ amount: total, currency: 'usd' });
      const { clientSecret } = res.data;
      if (!clientSecret) throw new Error('Payment setup failed.');

      const { error: initErr } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Tchotcho Pay',
        style: 'alwaysLight',
      });
      if (initErr) throw new Error(initErr.message);

      const { error: presentErr } = await presentPaymentSheet();
      if (presentErr) {
        if (presentErr.code === 'Canceled') return;
        throw new Error(presentErr.message);
      }

      closeModal();
      setSuccessItem(selectedItem?.name);
    } catch (err) {
      Alert.alert('Payment Failed', err.message || 'Could not process card payment.');
    } finally {
      setPaying(false);
    }
  };

  const handlePay = () => payMethod === 'card' ? payViaCard() : payViaWallet();

  // ── Success screen ──
  if (successItem) {
    return (
      <SafeAreaView style={styles.successPage}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>🎉</Text>
        <Text style={styles.successTitle}>{t.paymentSent || 'Payment Sent!'}</Text>
        <Text style={styles.successSub}>
          {successItem} · ${amt.toFixed(2)} USDC{'\n'}No cash needed!
        </Text>
        <TouchableOpacity style={styles.successBtn} onPress={() => setSuccessItem(null)}>
          <Text style={styles.successBtnText}>{t.done || 'Done'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.marketplace || 'Marketplace'} 🏪</Text>
        <Text style={styles.sub}>{t.marketSub || 'Pay for anything in Haiti with USDC'}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t.searchServices || 'Search services...'}
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catScrollContent}
      >
        {CATEGORY_KEYS.map(({ key, tKey }) => (
          <TouchableOpacity
            key={key}
            style={[styles.catChip, activeCategory === key && styles.catChipActive]}
            onPress={() => setActiveCategory(key)}
          >
            <Text style={[styles.catLabel, activeCategory === key && styles.catLabelActive]}>{t[tKey] || key}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.card}
            onPress={() => openItem(item)}
            activeOpacity={0.82}
          >
            <Text style={styles.cardEmoji}>{item.emoji}</Text>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardSub}>{item.sub}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardPrice}>{item.amounts[0] === '2' ? 'From $2.00' : `From $${item.amounts[0]}`}</Text>
              <Text style={styles.cardArrow}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 32, width: '100%' }} />
      </ScrollView>

      {/* ── Payment Modal ── */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {/* Service header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalEmoji}>{selectedItem?.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
                <Text style={styles.modalSub}>{selectedItem?.sub}</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.closeX}>
                <Text style={styles.closeXText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Amount */}
              <Text style={styles.label}>{t.amountUsd || 'Amount (USD)'}</Text>
              <View style={styles.amtRow}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.amtInput}
                  placeholder="0.00"
                  placeholderTextColor="#b2bec3"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>

              {/* Quick amounts */}
              <View style={styles.quickRow}>
                {(selectedItem?.amounts || QUICK_AMTS).map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.quickBtn, amount === a && styles.quickBtnActive]}
                    onPress={() => setAmount(a)}
                  >
                    <Text style={[styles.quickBtnText, amount === a && { color: '#fff' }]}>${a}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fee + total */}
              {amt > 0 && (
                <LinearGradient colors={[COLORS.navy, COLORS.primary]} style={styles.summaryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{selectedItem?.name}</Text>
                    <Text style={styles.summaryVal}>${amt.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Fee (1%)</Text>
                    <Text style={styles.summaryVal}>${fee.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.summaryRow, { marginTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 8 }]}>
                    <Text style={[styles.summaryLabel, { color: '#fff', fontWeight: '700' }]}>Total</Text>
                    <Text style={[styles.summaryVal, { fontSize: 18, fontWeight: '800' }]}>${total.toFixed(2)}</Text>
                  </View>
                </LinearGradient>
              )}

              {/* Payment method tabs */}
              <Text style={styles.label}>{t.paymentMethod || 'Pay with'}</Text>
              <View style={styles.payTabs}>
                <TouchableOpacity
                  style={[styles.payTab, payMethod === 'wallet' && styles.payTabActive]}
                  onPress={() => setPayMethod('wallet')}
                >
                  <Text style={styles.payTabEmoji}>💳</Text>
                  <Text style={[styles.payTabLabel, payMethod === 'wallet' && styles.payTabLabelActive]}>USDC Wallet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.payTab, payMethod === 'card' && styles.payTabActive]}
                  onPress={() => setPayMethod('card')}
                >
                  <Text style={styles.payTabEmoji}>🏦</Text>
                  <Text style={[styles.payTabLabel, payMethod === 'card' && styles.payTabLabelActive]}>Debit / Card</Text>
                </TouchableOpacity>
              </View>

              {/* Wallet panel */}
              {payMethod === 'wallet' && (
                <View style={styles.payPanel}>
                  {walletBal === null ? (
                    <ActivityIndicator color={COLORS.primary} />
                  ) : (
                    <View style={styles.balRow}>
                      <Text style={styles.balLabel}>{t.availableBalance || 'Available balance'}</Text>
                      <Text style={[styles.balVal, walletBal < total && amt > 0 && { color: COLORS.error }]}>
                        ${walletBal.toFixed(2)} USDC
                      </Text>
                    </View>
                  )}
                  {walletBal !== null && walletBal < total && amt > 0 && (
                    <View style={styles.warnBox}>
                      <Text style={styles.warnText}>⚠️ Not enough balance. Switch to card to pay.</Text>
                    </View>
                  )}
                  {walletBal !== null && walletBal >= total && amt > 0 && (
                    <View style={styles.okBox}>
                      <Text style={styles.okText}>✅ Balance sufficient</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Card panel */}
              {payMethod === 'card' && (
                <View style={styles.payPanel}>
                  <Text style={styles.payPanelNote}>Stripe secure checkout — Visa, Mastercard, Apple Pay, Google Pay</Text>
                </View>
              )}

              {/* Pay button */}
              <TouchableOpacity
                style={[styles.payBtn, (!amt || paying) && { opacity: 0.5 }]}
                onPress={handlePay}
                disabled={!amt || paying}
              >
                {paying
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.payBtnText}>
                      {payMethod === 'card'
                        ? `Pay $${total.toFixed(2)} by Card →`
                        : `Pay $${total.toFixed(2)} from Wallet →`}
                    </Text>
                }
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgPage },

  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textDark, marginBottom: 2 },
  sub: { fontSize: 13, color: COLORS.textLight },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textDark },

  catScroll: { marginBottom: 16, height: 48 },
  catScrollContent: { paddingHorizontal: 20, alignItems: 'center' },
  catChip: {
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1.5, borderColor: '#E5E7EB', marginRight: 8, height: 36, justifyContent: 'center',
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMid },
  catLabelActive: { color: '#fff' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  card: {
    width: '46%', marginHorizontal: '2%', marginBottom: 14,
    backgroundColor: '#fff', borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  cardEmoji: { fontSize: 32, marginBottom: 10 },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginBottom: 3 },
  cardSub: { fontSize: 11, color: COLORS.textLight, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  cardArrow: { fontSize: 16, color: COLORS.primary, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  modalEmoji: { fontSize: 36 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textDark },
  modalSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  closeX: { padding: 6 },
  closeXText: { fontSize: 18, color: COLORS.textLight, fontWeight: '600' },

  label: { fontSize: 12, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 16 },
  amtRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14 },
  dollarSign: { fontSize: 22, color: COLORS.textMid, marginRight: 4 },
  amtInput: { flex: 1, fontSize: 28, fontWeight: '700', color: COLORS.textDark, paddingVertical: 14 },

  quickRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  quickBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#F3F4F6', borderRadius: 10, alignItems: 'center' },
  quickBtnActive: { backgroundColor: COLORS.primary },
  quickBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },

  summaryCard: { borderRadius: 14, padding: 16, marginTop: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  summaryVal: { color: '#fff', fontSize: 13, fontWeight: '600' },

  payTabs: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 12 },
  payTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 9 },
  payTabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  payTabEmoji: { fontSize: 16 },
  payTabLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMid },
  payTabLabelActive: { color: COLORS.primary },

  payPanel: { backgroundColor: '#F8FAFF', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  balRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balLabel: { fontSize: 13, color: COLORS.textMid },
  balVal: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  warnBox: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, marginTop: 8 },
  warnText: { fontSize: 12, color: COLORS.error },
  okBox: { backgroundColor: '#ECFDF5', borderRadius: 8, padding: 10, marginTop: 8 },
  okText: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
  payPanelNote: { fontSize: 12, color: COLORS.textMid, lineHeight: 18 },

  payBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginTop: 4, marginBottom: 8 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Success
  successPage: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgPage, paddingHorizontal: 32 },
  successTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  successSub: { fontSize: 15, color: COLORS.textMid, textAlign: 'center', lineHeight: 22 },
  successBtn: { marginTop: 32, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48 },
  successBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
