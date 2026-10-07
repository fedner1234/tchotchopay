import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, Modal, TextInput,
  Share, Platform, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { useStripe } from '@stripe/stripe-react-native';
import { getWalletBalance, getTransactions, addFundsToWallet } from '../services/api';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

// ── Minimal QR renderer ──────────────────────────────────────────────────────
function MiniQR({ value, size = 180 }) {
  try {
    const { toQR } = require('toqr');
    const flat = toQR(value);
    const dim  = Math.round(Math.sqrt(flat.length));
    const cell = size / dim;
    const cells = [];
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        if (flat[r * dim + c]) {
          cells.push(
            <Rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={COLORS.deepNavy} />
          );
        }
      }
    }
    return (
      <Svg width={size} height={size}>
        <Rect x={0} y={0} width={size} height={size} fill="#fff" />
        {cells}
      </Svg>
    );
  } catch {
    return (
      <View style={{ width: size, height: size, backgroundColor: '#F3F4F6', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>QR unavailable</Text>
      </View>
    );
  }
}

export default function WalletScreen({ route }) {
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const openedFromHome = useRef(false);

  // ── Wallet data ──
  const walletAddress  = user?.wallet_address  || null;
  const circleWalletId = user?.circle_wallet_id || null;

  const [balance,      setBalance]      = useState(parseFloat(user?.usdc_balance || 0));
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  // ── Modal / UI ──
  const [addFundsModal, setAddFundsModal] = useState(false);
  const [fundsTab,      setFundsTab]      = useState('card'); // 'card' | 'usdc' | 'ach'
  const [loadAmount,    setLoadAmount]    = useState('');
  const [adding,        setAdding]        = useState(false);
  const [addrModal,     setAddrModal]     = useState(false); // full address modal

  // ── ACH / Plaid state ──
  const [linkedBank,    setLinkedBank]    = useState(null);  // { name, mask }
  const [bankLoading,   setBankLoading]   = useState(false);
  const [achAmount,     setAchAmount]     = useState('');
  const [achSending,    setAchSending]    = useState(false);

  // ── Cash Out state ──
  const [cashOutModal,  setCashOutModal]  = useState(false);
  const [cashOutMethod, setCashOutMethod] = useState(null); // 'moncash' | 'natcash' | 'bank' | 'agent' | null
  const [cashOutPhone,  setCashOutPhone]  = useState('');
  const [cashOutAmount, setCashOutAmount] = useState('');
  const [cashOutSending,setCashOutSending]= useState(false);
  const openedCashOut = useRef(false);
  const openedReceive = useRef(false);

  // ── Load balance + transactions ──
  const load = useCallback(async () => {
    try {
      if (circleWalletId) {
        const bRes = await getWalletBalance(circleWalletId);
        const bal  = bRes.data?.usdcBalance ?? bRes.data?.balance ?? balance;
        setBalance(parseFloat(bal) || 0);
      }
    } catch (_) {}
    try {
      const tRes = await getTransactions(circleWalletId);
      const txs  = tRes.data?.transactions || tRes.data?.data?.transactions || [];
      setTransactions(txs);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  }, [circleWalletId]);

  useEffect(() => { load(); }, [load]);

  // Auto-open Add Funds modal when navigated from HomeScreen "Add" button
  useEffect(() => {
    if (route?.params?.openAddFunds && !openedFromHome.current) {
      openedFromHome.current = true;
      setFundsTab('card');
      setAddFundsModal(true);
    }
  }, [route?.params?.openAddFunds]);

  // Auto-open Receive (USDC tab) when navigated from HomeScreen "Receive" button
  useEffect(() => {
    if (route?.params?.openReceive && !openedReceive.current) {
      openedReceive.current = true;
      setFundsTab('usdc');
      setAddFundsModal(true);
    }
  }, [route?.params?.openReceive]);

  // Auto-open Cash Out modal when navigated from HomeScreen "Cash Out" button
  useEffect(() => {
    if (route?.params?.openCashOut && !openedCashOut.current) {
      openedCashOut.current = true;
      setCashOutModal(true);
    }
  }, [route?.params?.openCashOut]);

  // ── Add funds via Stripe ──
  const handleAddFunds = async () => {
    const amt = parseFloat(loadAmount);
    if (!amt || amt < 10) return Alert.alert('Minimum $10', 'Please enter at least $10 to add funds.');
    setAdding(true);
    try {
      const res = await addFundsToWallet({ amount: amt, currency: 'usd' });
      const { clientSecret, feeUsd, totalUsd } = res.data;
      if (!clientSecret) throw new Error('Payment setup failed. Please try again.');

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Tchotcho Pay',
        defaultBillingDetails: {
          name: user?.full_name || user?.email || 'Tchotcho Pay User',
        },
        style: 'alwaysLight',
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === 'Canceled') return;
        throw new Error(presentError.message);
      }

      setAddFundsModal(false);
      setLoadAmount('');
      Alert.alert(
        'Deposit Successful! 🎉',
        `$${amt.toFixed(2)} has been added to your Tchotcho Pay wallet.\n(Fee: $${feeUsd} · Total charged: $${totalUsd})`,
      );
      load();
    } catch (err) {
      Alert.alert('Payment Error', err.message || err.response?.data?.error || 'Could not add funds. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  // ── Load linked bank on tab open ──
  const loadLinkedBank = useCallback(async () => {
    setBankLoading(true);
    try {
      const res = await api.post('/.netlify/functions/plaid-link', { action: 'getAccounts' });
      const accounts = res.data?.accounts || [];
      if (accounts.length > 0) {
        setLinkedBank({ name: accounts[0].account_name, mask: accounts[0].mask });
      } else {
        setLinkedBank(null);
      }
    } catch (_) { setLinkedBank(null); }
    setBankLoading(false);
  }, []);

  // ── Connect bank via Plaid Link ──
  const handleConnectBank = async () => {
    setBankLoading(true);
    try {
      const res = await api.post('/.netlify/functions/plaid-link', { action: 'createLinkToken' });
      const linkToken = res.data?.linkToken;
      if (!linkToken) throw new Error('Could not start bank link. Please try again.');
      // Open Plaid hosted Link in the user's browser
      const plaidUrl = `https://cdn.plaid.com/link/v2/stable/link.html?token=${linkToken}`;
      await Linking.openURL(plaidUrl);
      // After returning, reload linked accounts
      setTimeout(() => loadLinkedBank(), 2000);
    } catch (err) {
      Alert.alert('Bank Link Error', err.response?.data?.error || err.message || 'Could not connect bank.');
    }
    setBankLoading(false);
  };

  // ── ACH deposit via linked bank ──
  const handleAchDeposit = async () => {
    const amt = parseFloat(achAmount);
    if (!amt || amt < 10) return Alert.alert('Minimum $10', 'Please enter at least $10.');
    if (!linkedBank) return Alert.alert('No Bank', 'Please connect your bank first.');
    setAchSending(true);
    try {
      // ACH transfers go through Plaid + Stripe ACH — backend handles it
      await api.post('/.netlify/functions/plaid-link', { action: 'initiateTransfer', amount: amt });
      setAddFundsModal(false);
      setAchAmount('');
      Alert.alert('Transfer Initiated ✅', `$${amt.toFixed(2)} ACH transfer started from ${linkedBank.name} (···${linkedBank.mask}). Funds arrive in 1–3 business days.`);
      load();
    } catch (err) {
      Alert.alert('Transfer Error', err.response?.data?.error || 'ACH transfer failed. Please try again.');
    }
    setAchSending(false);
  };

  // ── Cash Out handler ──
  const handleCashOut = async () => {
    const amt = parseFloat(cashOutAmount);
    if (!amt || amt < 5) return Alert.alert('Minimum $5', 'Please enter at least $5 to cash out.');
    if ((cashOutMethod === 'moncash' || cashOutMethod === 'natcash') && !cashOutPhone.trim()) {
      return Alert.alert('Phone Required', 'Please enter the recipient phone number.');
    }
    if (amt > balance) return Alert.alert('Insufficient Balance', `Your current balance is $${balance.toFixed(2)}.`);

    setCashOutSending(true);
    try {
      if (cashOutMethod === 'moncash' || cashOutMethod === 'natcash') {
        await api.post('/.netlify/functions/moncash-transfer', {
          provider:     cashOutMethod === 'moncash' ? 'moncash' : 'natcash',
          phone:        cashOutPhone.replace(/\D/g, ''),
          amountUsd:    amt,
          walletId:     circleWalletId,
          senderUserId: user?.id || user?.email,
        });
        setCashOutModal(false);
        setCashOutPhone('');
        setCashOutAmount('');
        setCashOutMethod(null);
        Alert.alert(
          'Cash Out Initiated! ✅',
          `$${amt.toFixed(2)} will be sent to ${cashOutPhone} via ${cashOutMethod === 'moncash' ? 'MonCash' : 'NatCash'}.\n\nFunds usually arrive within minutes.`
        );
        load();
      } else if (cashOutMethod === 'bank') {
        // Redirect user to ACH withdrawal flow (via Plaid)
        setCashOutModal(false);
        setFundsTab('ach');
        loadLinkedBank();
        setAddFundsModal(true);
        Alert.alert(
          'Bank Withdrawal',
          'Use your linked bank account to withdraw funds. ACH withdrawals arrive in 1–3 business days.'
        );
      }
    } catch (err) {
      Alert.alert('Cash Out Error', err.response?.data?.error || err.message || 'Could not complete cash out. Please try again.');
    }
    setCashOutSending(false);
  };

  const copyAddress = async () => {
    if (!walletAddress) return Alert.alert('No address', 'Wallet address not found. Please log out and log in again.');
    await Clipboard.setStringAsync(walletAddress);
    Alert.alert('Copied!', 'Wallet address copied to clipboard.');
  };

  const shareAddress = async () => {
    if (!walletAddress) return;
    await Share.share({ message: `My Tchotcho Pay USDC wallet address:\n${walletAddress}` });
  };

  // Truncate address for display: first 8 + … + last 6
  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`
    : '—  No wallet linked';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <Text style={styles.heading}>Pòtmonè mwen 💳</Text>
        <Text style={styles.sub}>USDC · Digital Dollar Wallet</Text>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* ── Balance Card ── */}
            <LinearGradient
              colors={[COLORS.navy, COLORS.primary]}
              style={styles.balanceCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.balLabel}>Available Balance</Text>
              <Text style={styles.balAmount}>${balance.toFixed(2)}</Text>
              <Text style={styles.balCoin}>USDC · US Dollar Coin</Text>

              {/* Wallet address — prominently displayed */}
              <TouchableOpacity style={styles.addrRow} onPress={() => setAddrModal(true)}>
                <View style={styles.addrBadge}>
                  <Text style={styles.addrBadgeLabel}>Arc Wallet Address</Text>
                  <Text style={styles.addrBadgeValue}>{shortAddr}</Text>
                </View>
                <Text style={styles.addrCopyHint}>👁 View</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* ── Quick Actions ── */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => { setFundsTab('card'); setAddFundsModal(true); }}>
                <Text style={styles.actionEmoji}>➕</Text>
                <Text style={styles.actionLabel}>Add Funds</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => { setFundsTab('usdc'); setAddFundsModal(true); }}>
                <Text style={styles.actionEmoji}>📲</Text>
                <Text style={styles.actionLabel}>Receive</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={copyAddress}>
                <Text style={styles.actionEmoji}>📋</Text>
                <Text style={styles.actionLabel}>Copy Addr</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={shareAddress}>
                <Text style={styles.actionEmoji}>📤</Text>
                <Text style={styles.actionLabel}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* ── Wallet Address Card (full, always visible) ── */}
            <View style={styles.walletAddrCard}>
              <View style={styles.walletAddrHeader}>
                <Text style={styles.walletAddrTitle}>🔗 Arc Wallet Address</Text>
                <View style={styles.chainBadge}>
                  <Text style={styles.chainBadgeText}>ARC</Text>
                </View>
              </View>
              <Text style={styles.walletAddrDesc}>
                Send USDC to this address to fund your wallet. Funds arrive in minutes.
              </Text>
              <TouchableOpacity style={styles.addrFullBox} onPress={copyAddress} activeOpacity={0.7}>
                <Text style={styles.addrFull} numberOfLines={2} selectable>
                  {walletAddress || '—  Log in to see your address'}
                </Text>
              </TouchableOpacity>
              <View style={styles.addrActions}>
                <TouchableOpacity style={styles.addrActionBtn} onPress={copyAddress}>
                  <Text style={styles.addrActionText}>📋 Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addrActionBtn} onPress={shareAddress}>
                  <Text style={styles.addrActionText}>📤 Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.addrActionBtn, styles.addrActionQR]} onPress={() => { setFundsTab('usdc'); setAddFundsModal(true); }}>
                  <Text style={[styles.addrActionText, { color: '#fff' }]}>⬛ QR Code</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Savings Progress ── */}
            <View style={styles.savingsCard}>
              <Text style={styles.savingsTitle}>💰 USDC Savings Goal</Text>
              <Text style={styles.savingsSub}>Keep your value. USDC = $1 always.</Text>
              <View style={styles.savingsBar}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.cyan]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.savingsFill, { width: `${Math.min((balance / 1000) * 100, 100)}%` }]}
                />
              </View>
              <Text style={styles.savingsGoal}>${balance.toFixed(0)} / $1,000 goal</Text>
            </View>

            {/* ── Transactions ── */}
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>🧾</Text>
                <Text style={styles.emptyText}>No transactions yet.</Text>
                <Text style={styles.emptySub}>Add funds to get started.</Text>
              </View>
            ) : (
              transactions.map((tx, i) => (
                <View key={i} style={styles.txRow}>
                  <View style={[styles.txIcon, { backgroundColor: tx.type === 'debit' ? '#FEF9C3' : '#DCFCE7' }]}>
                    <Text style={{ fontSize: 18 }}>{tx.type === 'debit' ? '↗️' : '↙️'}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.txDesc}>{tx.description || 'Transfer'}</Text>
                    <Text style={styles.txDate}>{tx.createDate ? new Date(tx.createDate).toLocaleDateString() : ''}</Text>
                  </View>
                  <Text style={[styles.txAmt, tx.type === 'debit' ? styles.txOut : styles.txIn]}>
                    {tx.type === 'debit' ? '-' : '+'}${parseFloat(tx.amount || 0).toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* ── Full Address Modal ── */}
      <Modal visible={addrModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Arc Wallet Address</Text>
            <Text style={styles.modalSub}>Your USDC receiving address on the Arc network</Text>
            <View style={styles.qrCenter}>
              <MiniQR value={walletAddress || 'tchotchopay'} size={200} />
            </View>
            <TouchableOpacity style={styles.addrFullBox} onPress={copyAddress} activeOpacity={0.7}>
              <Text style={styles.addrFull} selectable>{walletAddress || '—'}</Text>
            </TouchableOpacity>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={copyAddress}>
                <Text style={styles.modalBtnText}>📋 Copy Address</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnShare]} onPress={shareAddress}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>📤 Share</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setAddrModal(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Cash Out Modal ── */}
      <Modal visible={cashOutModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cash Out 🏦</Text>
            <Text style={styles.modalSub}>
              Balance: <Text style={{ color: COLORS.primary, fontWeight: '800' }}>${balance.toFixed(2)} USDC</Text>
            </Text>

            {/* Method selector */}
            {!cashOutMethod ? (
              <>
                <Text style={styles.coMethodTitle}>Choose withdrawal method:</Text>

                <TouchableOpacity style={styles.coMethodCard} onPress={() => setCashOutMethod('moncash')}>
                  <Text style={styles.coMethodEmoji}>🟡</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coMethodName}>MonCash</Text>
                    <Text style={styles.coMethodDesc}>Send to any MonCash number in Haiti</Text>
                  </View>
                  <Text style={styles.coMethodArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.coMethodCard} onPress={() => setCashOutMethod('natcash')}>
                  <Text style={styles.coMethodEmoji}>🔵</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coMethodName}>NatCash</Text>
                    <Text style={styles.coMethodDesc}>Send to any NatCash number in Haiti</Text>
                  </View>
                  <Text style={styles.coMethodArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.coMethodCard} onPress={() => setCashOutMethod('agent')}>
                  <Text style={styles.coMethodEmoji}>🤝</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coMethodName}>Cash Agent</Text>
                    <Text style={styles.coMethodDesc}>Pick up cash from a local Tchotcho Pay agent in Haiti</Text>
                  </View>
                  <Text style={styles.coMethodArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.coMethodCard} onPress={() => setCashOutMethod('bank')}>
                  <Text style={styles.coMethodEmoji}>🏦</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coMethodName}>Bank Account (ACH)</Text>
                    <Text style={styles.coMethodDesc}>Withdraw to your US bank — 1–3 business days</Text>
                  </View>
                  <Text style={styles.coMethodArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.coMethodCardSavings} onPress={() => setCashOutModal(false)}>
                  <Text style={styles.coMethodEmoji}>💎</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.coMethodName, { color: COLORS.primary }]}>Keep as USDC</Text>
                    <Text style={styles.coMethodDesc}>Hold your digital dollars — no fees, no loss of value</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Back + selected method */}
                <TouchableOpacity onPress={() => setCashOutMethod(null)} style={styles.coBackBtn}>
                  <Text style={styles.coBackText}>← Back</Text>
                </TouchableOpacity>
                <View style={styles.coSelectedBadge}>
                  <Text style={styles.coSelectedText}>
                    {cashOutMethod === 'moncash' ? '🟡 MonCash'
                      : cashOutMethod === 'natcash' ? '🔵 NatCash'
                      : cashOutMethod === 'agent' ? '🤝 Cash Agent'
                      : '🏦 Bank (ACH)'}
                  </Text>
                </View>

                {(cashOutMethod === 'moncash' || cashOutMethod === 'natcash') && (
                  <>
                    <Text style={styles.label}>Recipient Phone Number (Haiti)</Text>
                    <View style={styles.amtRow}>
                      <Text style={[styles.dollarSign, { fontSize: 18 }]}>📱</Text>
                      <TextInput
                        style={[styles.amtInput, { fontSize: 18 }]}
                        placeholder="+509 XXXX XXXX"
                        placeholderTextColor="#b2bec3"
                        value={cashOutPhone}
                        onChangeText={setCashOutPhone}
                        keyboardType="phone-pad"
                      />
                    </View>
                    <Text style={styles.label}>Amount (USD)</Text>
                    <View style={styles.amtRow}>
                      <Text style={styles.dollarSign}>$</Text>
                      <TextInput
                        style={styles.amtInput}
                        placeholder="0.00"
                        placeholderTextColor="#b2bec3"
                        value={cashOutAmount}
                        onChangeText={setCashOutAmount}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.quickRow}>
                      {['10', '25', '50', '100'].map((a) => (
                        <TouchableOpacity key={a} style={[styles.quickBtn, cashOutAmount === a && styles.quickBtnActive]} onPress={() => setCashOutAmount(a)}>
                          <Text style={[styles.quickBtnText, cashOutAmount === a && { color: '#fff' }]}>${a}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.achInfoBox}>
                      <Text style={styles.achInfoText}>⚡ Usually arrives within minutes</Text>
                      <Text style={styles.achInfoText}>💱 USDC → HTG converted at live rate</Text>
                      <Text style={styles.achInfoText}>💰 1% cash-out fee applies</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={handleCashOut} disabled={cashOutSending}>
                      {cashOutSending
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.addBtnText}>Send Cash Out →</Text>}
                    </TouchableOpacity>
                  </>
                )}

                {cashOutMethod === 'bank' && (
                  <>
                    <View style={styles.achInfoBox}>
                      <Text style={styles.achInfoText}>🏦 Withdraw to your linked US bank account</Text>
                      <Text style={styles.achInfoText}>⏱ Arrives in 1–3 business days</Text>
                      <Text style={styles.achInfoText}>✅ No card fees — 1% withdrawal fee</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={handleCashOut} disabled={cashOutSending}>
                      <Text style={styles.addBtnText}>Withdraw to Bank →</Text>
                    </TouchableOpacity>
                  </>
                )}

                {cashOutMethod === 'agent' && (
                  <>
                    <Text style={styles.label}>Amount (USD)</Text>
                    <View style={styles.amtRow}>
                      <Text style={styles.dollarSign}>$</Text>
                      <TextInput
                        style={styles.amtInput}
                        placeholder="0.00"
                        placeholderTextColor="#b2bec3"
                        value={cashOutAmount}
                        onChangeText={setCashOutAmount}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.quickRow}>
                      {['10', '25', '50', '100'].map((a) => (
                        <TouchableOpacity key={a} style={[styles.quickBtn, cashOutAmount === a && styles.quickBtnActive]} onPress={() => setCashOutAmount(a)}>
                          <Text style={[styles.quickBtnText, cashOutAmount === a && { color: '#fff' }]}>${a}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.achInfoBox}>
                      <Text style={styles.achInfoText}>🤝 Show your agent code at any Tchotcho Pay agent location</Text>
                      <Text style={styles.achInfoText}>⚡ Instant cash pickup — no waiting</Text>
                      <Text style={styles.achInfoText}>📍 Find agents at tchotchopay.com/agents</Text>
                      <Text style={styles.achInfoText}>💰 1% cash-out fee applies</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.addBtn, (!cashOutAmount || cashOutSending) && { opacity: 0.5 }]}
                      onPress={async () => {
                        const amt = parseFloat(cashOutAmount);
                        if (!amt || amt < 5) return Alert.alert('Minimum $5', 'Enter at least $5 to cash out.');
                        if (amt > balance) return Alert.alert('Insufficient Balance', `Your balance is $${balance.toFixed(2)}.`);
                        // Generate a one-time agent code (in production this hits the backend)
                        const code = 'AGT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
                        setCashOutModal(false);
                        setCashOutAmount('');
                        setCashOutMethod(null);
                        Alert.alert(
                          '🤝 Agent Code Ready',
                          `Show this code to your Tchotcho Pay agent:\n\n${code}\n\nAmount: $${amt.toFixed(2)}\n\nThe agent will verify your identity and hand you cash.`,
                          [{ text: 'OK' }]
                        );
                      }}
                      disabled={!cashOutAmount || cashOutSending}
                    >
                      <Text style={styles.addBtnText}>Generate Agent Code →</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={() => { setCashOutModal(false); setCashOutMethod(null); setCashOutPhone(''); setCashOutAmount(''); }}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Add Funds Modal ── */}
      <Modal visible={addFundsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Funds</Text>
            <Text style={styles.modalSub}>Load your USDC wallet instantly</Text>

            <View style={styles.fundsTabs}>
              <TouchableOpacity
                style={[styles.fundsTab, fundsTab === 'card' && styles.fundsTabActive]}
                onPress={() => setFundsTab('card')}
              >
                <Text style={styles.fundsTabEmoji}>💳</Text>
                <Text style={[styles.fundsTabLabel, fundsTab === 'card' && styles.fundsTabLabelActive]}>Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fundsTab, fundsTab === 'ach' && styles.fundsTabActive]}
                onPress={() => { setFundsTab('ach'); loadLinkedBank(); }}
              >
                <Text style={styles.fundsTabEmoji}>🏦</Text>
                <Text style={[styles.fundsTabLabel, fundsTab === 'ach' && styles.fundsTabLabelActive]}>Bank / ACH</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fundsTab, fundsTab === 'usdc' && styles.fundsTabActive]}
                onPress={() => setFundsTab('usdc')}
              >
                <Text style={styles.fundsTabEmoji}>🔗</Text>
                <Text style={[styles.fundsTabLabel, fundsTab === 'usdc' && styles.fundsTabLabelActive]}>USDC</Text>
              </TouchableOpacity>
            </View>

            {/* CARD TAB */}
            {fundsTab === 'card' && (
              <>
                <Text style={styles.label}>Amount (USD)</Text>
                <View style={styles.amtRow}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.amtInput}
                    placeholder="0.00"
                    placeholderTextColor="#b2bec3"
                    value={loadAmount}
                    onChangeText={setLoadAmount}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.quickRow}>
                  {['25', '50', '100', '500'].map((a) => (
                    <TouchableOpacity key={a} style={[styles.quickBtn, loadAmount === a && styles.quickBtnActive]} onPress={() => setLoadAmount(a)}>
                      <Text style={[styles.quickBtnText, loadAmount === a && { color: '#fff' }]}>${a}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.cardNote}>Visa · Mastercard · Apple Pay · Google Pay — secured by Stripe</Text>
                <TouchableOpacity style={styles.addBtn} onPress={handleAddFunds} disabled={adding}>
                  {adding
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.addBtnText}>Pay & Add Funds →</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* ACH BANK TRANSFER TAB */}
            {fundsTab === 'ach' && (
              <>
                {bankLoading ? (
                  <ActivityIndicator color={COLORS.primary} size="large" style={{ marginVertical: 24 }} />
                ) : linkedBank ? (
                  <>
                    {/* Linked bank card */}
                    <View style={styles.bankCard}>
                      <View style={styles.bankIconBox}>
                        <Text style={{ fontSize: 24 }}>🏦</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bankName}>{linkedBank.name}</Text>
                        <Text style={styles.bankMask}>Account ending ···{linkedBank.mask}</Text>
                      </View>
                      <View style={styles.bankLinkedBadge}>
                        <Text style={styles.bankLinkedText}>✓ Linked</Text>
                      </View>
                    </View>

                    <Text style={styles.label}>Amount (USD)</Text>
                    <View style={styles.amtRow}>
                      <Text style={styles.dollarSign}>$</Text>
                      <TextInput
                        style={styles.amtInput}
                        placeholder="0.00"
                        placeholderTextColor="#b2bec3"
                        value={achAmount}
                        onChangeText={setAchAmount}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.quickRow}>
                      {['50', '100', '250', '500'].map((a) => (
                        <TouchableOpacity key={a} style={[styles.quickBtn, achAmount === a && styles.quickBtnActive]} onPress={() => setAchAmount(a)}>
                          <Text style={[styles.quickBtnText, achAmount === a && { color: '#fff' }]}>${a}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.achInfoBox}>
                      <Text style={styles.achInfoText}>✅ No card fees — ACH is free</Text>
                      <Text style={styles.achInfoText}>⏱ Arrives in 1–3 business days</Text>
                      <Text style={styles.achInfoText}>🔒 Secured by Plaid + 256-bit encryption</Text>
                    </View>

                    <TouchableOpacity style={styles.addBtn} onPress={handleAchDeposit} disabled={achSending}>
                      {achSending
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.addBtnText}>Transfer from Bank →</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleConnectBank} style={{ alignItems: 'center', marginTop: 12 }}>
                      <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '600' }}>Change bank account</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.bankEmptyBox}>
                      <Text style={{ fontSize: 48, marginBottom: 12 }}>🏦</Text>
                      <Text style={styles.bankEmptyTitle}>Connect Your Bank</Text>
                      <Text style={styles.bankEmptyDesc}>
                        Link your US bank account to add funds with zero card fees. Powered by Plaid — used by millions.
                      </Text>
                    </View>

                    <View style={styles.achInfoBox}>
                      <Text style={styles.achInfoText}>✅ Free ACH transfers — no card fee</Text>
                      <Text style={styles.achInfoText}>🏦 Works with Chase, BofA, Wells Fargo + 12,000 banks</Text>
                      <Text style={styles.achInfoText}>🔒 Bank-level security via Plaid</Text>
                    </View>

                    <TouchableOpacity style={styles.addBtn} onPress={handleConnectBank} disabled={bankLoading}>
                      {bankLoading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.addBtnText}>🏦 Connect Bank Account</Text>}
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

            {/* USDC RECEIVE TAB */}
            {fundsTab === 'usdc' && (
              <>
                <Text style={styles.usdcDesc}>
                  Send USDC to your Arc wallet address below. Funds arrive within minutes.
                </Text>
                <View style={styles.qrCenter}>
                  <MiniQR value={walletAddress || 'tchotchopay'} size={180} />
                </View>
                <TouchableOpacity style={styles.addrFullBox} onPress={copyAddress} activeOpacity={0.7}>
                  <Text style={styles.addrLabel}>Arc Wallet Address</Text>
                  <Text style={styles.addrFull} numberOfLines={2}>{walletAddress || '—'}</Text>
                </TouchableOpacity>
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity style={styles.modalBtn} onPress={copyAddress}>
                    <Text style={styles.modalBtnText}>📋 Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.modalBtnShare]} onPress={shareAddress}>
                    <Text style={[styles.modalBtnText, { color: '#fff' }]}>📤 Share</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={() => { setAddFundsModal(false); setLoadAmount(''); }}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFF' },

  heading: { fontSize: 26, fontWeight: '800', color: COLORS.textDark, marginHorizontal: 20, marginTop: 16, marginBottom: 2 },
  sub: { fontSize: 13, color: COLORS.textLight, marginHorizontal: 20, marginBottom: 16 },

  // Balance card
  balanceCard: { marginHorizontal: 20, borderRadius: 22, padding: 22, marginBottom: 16 },
  balLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  balAmount: { color: '#fff', fontSize: 48, fontWeight: '800', letterSpacing: -1.5, marginBottom: 2 },
  balCoin: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 18 },

  addrRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12 },
  addrBadge: {},
  addrBadgeLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  addrBadgeValue: { color: '#fff', fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },
  addrCopyHint: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

  // Actions
  actionRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, gap: 10 },
  actionBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  actionEmoji: { fontSize: 20, marginBottom: 4 },
  actionLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMid },

  // Wallet address card
  walletAddrCard: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 20, borderWidth: 1.5, borderColor: '#E5E7EB' },
  walletAddrHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  walletAddrTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  chainBadge: { backgroundColor: COLORS.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  chainBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  walletAddrDesc: { fontSize: 12, color: COLORS.textLight, marginBottom: 12, lineHeight: 18 },
  addrFullBox: { backgroundColor: '#F8FAFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
  addrLabel: { fontSize: 10, color: COLORS.textLight, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  addrFull: { fontSize: 12, color: COLORS.textDark, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', lineHeight: 20, letterSpacing: 0.3 },
  addrActions: { flexDirection: 'row', gap: 8 },
  addrActionBtn: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  addrActionQR: { backgroundColor: COLORS.primary },
  addrActionText: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },

  // Savings
  savingsCard: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  savingsTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  savingsSub: { fontSize: 12, color: COLORS.textLight, marginBottom: 12 },
  savingsBar: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  savingsFill: { height: '100%', borderRadius: 8, minWidth: 8 },
  savingsGoal: { fontSize: 12, color: COLORS.textMid, fontWeight: '600' },

  // Transactions
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginHorizontal: 20, marginBottom: 12 },
  emptyBox: { alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: COLORS.textMid },
  emptySub: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  txRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  txIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txDesc: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  txDate: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  txAmt: { fontSize: 15, fontWeight: '800' },
  txOut: { color: '#EF4444' },
  txIn:  { color: '#10B981' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark, marginBottom: 4 },
  modalSub: { fontSize: 13, color: COLORS.textLight, marginBottom: 20 },

  fundsTabs: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 20 },
  fundsTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 9 },
  fundsTabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  fundsTabEmoji: { fontSize: 16 },
  fundsTabLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMid },
  fundsTabLabelActive: { color: COLORS.primary },

  label: { fontSize: 12, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  amtRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, marginBottom: 12 },
  dollarSign: { fontSize: 22, color: COLORS.textMid, marginRight: 4 },
  amtInput: { flex: 1, fontSize: 28, fontWeight: '700', color: COLORS.textDark, paddingVertical: 14 },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#F3F4F6', borderRadius: 10, alignItems: 'center' },
  quickBtnActive: { backgroundColor: COLORS.primary },
  quickBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  cardNote: { fontSize: 11, color: COLORS.textLight, textAlign: 'center', marginBottom: 16 },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ACH / Bank
  bankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#BBF7D0', gap: 12 },
  bankIconBox: { width: 44, height: 44, backgroundColor: '#DCFCE7', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bankName: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  bankMask: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  bankLinkedBadge: { backgroundColor: '#10B981', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  bankLinkedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bankEmptyBox: { alignItems: 'center', paddingVertical: 16, marginBottom: 8 },
  bankEmptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginBottom: 8 },
  bankEmptyDesc: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
  achInfoBox: { backgroundColor: '#F8FAFF', borderRadius: 12, padding: 14, marginBottom: 16, gap: 6 },
  achInfoText: { fontSize: 12, color: COLORS.textMid, lineHeight: 20 },

  usdcDesc: { fontSize: 13, color: COLORS.textMid, lineHeight: 20, marginBottom: 16 },
  qrCenter: { alignItems: 'center', marginBottom: 16, padding: 12, backgroundColor: '#F8FAFF', borderRadius: 16 },

  modalBtnRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  modalBtn: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  modalBtnShare: { backgroundColor: COLORS.primary },
  modalBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },

  closeBtn: { alignItems: 'center', paddingVertical: 14 },
  closeBtnText: { fontSize: 15, color: COLORS.textLight, fontWeight: '600' },

  // Cash Out
  coMethodTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  coMethodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFF', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  coMethodCardSavings: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#BFDBFE', gap: 12 },
  coMethodEmoji: { fontSize: 28 },
  coMethodName: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 2 },
  coMethodDesc: { fontSize: 12, color: COLORS.textLight, lineHeight: 18 },
  coMethodArrow: { fontSize: 22, color: COLORS.textLight, fontWeight: '700' },
  coBackBtn: { marginBottom: 12 },
  coBackText: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  coSelectedBadge: { backgroundColor: '#EFF6FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16, alignSelf: 'flex-start' },
  coSelectedText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
