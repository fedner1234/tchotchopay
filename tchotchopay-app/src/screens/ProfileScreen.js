import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Switch, Modal, Linking, Share, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../context/AuthContext';
import { useLang, TRANSLATIONS, LANGUAGES } from '../context/LangContext';
import { updateProfile } from '../services/api';

// ── Virtual Card Modal ────────────────────────────────────────────────────────
function VirtualCardModal({ visible, onClose, user }) {
  const [flipped, setFlipped] = useState(false);
  const cardNum = '4242  4242  4242  4242';
  const expiry  = '12/28';
  const cvv     = '737';

  const copyCard = async () => {
    await Clipboard.setStringAsync(cardNum.replace(/\s/g, ''));
    Alert.alert('Copied!', 'Card number copied to clipboard.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.vcModal}>
          <Text style={styles.vcTitle}>💳 Virtual Card</Text>
          <Text style={styles.vcSub}>Spend your USDC anywhere Visa is accepted</Text>

          {/* Card visual */}
          <TouchableOpacity onPress={() => setFlipped(f => !f)} activeOpacity={0.85}>
            <LinearGradient
              colors={['#0A1F6E', '#1055CC', '#00AEEF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.vcCard}
            >
              <View style={styles.vcCardTop}>
                <Text style={styles.vcBrand}>TCHOTCHO PAY</Text>
                <Text style={{ fontSize: 28 }}>💳</Text>
              </View>
              {!flipped ? (
                <>
                  <View style={styles.vcChip} />
                  <Text style={styles.vcNum}>{cardNum}</Text>
                  <View style={styles.vcCardBottom}>
                    <View>
                      <Text style={styles.vcFieldLabel}>CARD HOLDER</Text>
                      <Text style={styles.vcFieldVal}>{user?.firstName?.toUpperCase() || 'YOUR NAME'} {user?.lastName?.toUpperCase() || ''}</Text>
                    </View>
                    <View>
                      <Text style={styles.vcFieldLabel}>EXPIRES</Text>
                      <Text style={styles.vcFieldVal}>{expiry}</Text>
                    </View>
                    <Text style={styles.vcVisa}>VISA</Text>
                  </View>
                </>
              ) : (
                <View style={styles.vcBack}>
                  <View style={styles.vcMagStripe} />
                  <View style={styles.vcCvvRow}>
                    <View style={styles.vcCvvBar} />
                    <View style={styles.vcCvvBox}>
                      <Text style={styles.vcCvvText}>{cvv}</Text>
                    </View>
                  </View>
                  <Text style={styles.vcBackNote}>Tap to flip back</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.vcHint}>Tap card to see CVV</Text>

          {/* Actions */}
          <View style={styles.vcActions}>
            <TouchableOpacity style={styles.vcActionBtn} onPress={copyCard}>
              <Text style={styles.vcActionEmoji}>📋</Text>
              <Text style={styles.vcActionLabel}>Copy Number</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.vcActionBtn}
              onPress={() => Share.share({ message: `My Tchotcho Pay Virtual Card\nNumber: ${cardNum}\nExpiry: ${expiry}\n\nDownload the app: tchotchopay.com` })}
            >
              <Text style={styles.vcActionEmoji}>↑</Text>
              <Text style={styles.vcActionLabel}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.vcActionBtn}
              onPress={() => Linking.openURL('https://tchotchopay.com/card.html')}
            >
              <Text style={styles.vcActionEmoji}>🌐</Text>
              <Text style={styles.vcActionLabel}>Learn More</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vcStatusRow}>
            <View style={styles.vcDot} />
            <Text style={styles.vcStatus}>Card active · $0.00 spent this month</Text>
          </View>

          <TouchableOpacity style={styles.vcClose} onPress={onClose}>
            <Text style={styles.vcCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Refer & Earn Modal ────────────────────────────────────────────────────────
function ReferModal({ visible, onClose, user }) {
  const code = ('REF' + (user?.firstName || 'TCP').slice(0, 3).toUpperCase() + '2026');
  const link = `https://tchotchopay.com/signup?ref=${code}`;

  const shareReferral = () =>
    Share.share({
      message: `🎉 Join me on Tchotcho Pay — send money to Haiti instantly!\n\nUse my code **${code}** and we both get $5.\n\n👉 ${link}`,
    });

  const copyCode = async () => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied!', `Referral code ${code} copied.`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.referModal}>
          <Text style={{ fontSize: 56, textAlign: 'center', marginBottom: 8 }}>🎁</Text>
          <Text style={styles.referTitle}>Refer & Earn</Text>
          <Text style={styles.referSub}>Invite friends — you both get <Text style={{ color: '#10B981', fontWeight: '800' }}>$5 USDC</Text> when they send their first transfer.</Text>

          <View style={styles.referCodeBox}>
            <Text style={styles.referCodeLabel}>YOUR CODE</Text>
            <Text style={styles.referCode}>{code}</Text>
          </View>

          <TouchableOpacity style={styles.referShareBtn} onPress={shareReferral}>
            <Text style={styles.referShareText}>↑ Share Referral Link</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.referCopyBtn} onPress={copyCode}>
            <Text style={styles.referCopyText}>📋 Copy Code</Text>
          </TouchableOpacity>

          <View style={styles.referStats}>
            <View style={styles.referStat}>
              <Text style={styles.referStatNum}>12</Text>
              <Text style={styles.referStatLabel}>Friends Invited</Text>
            </View>
            <View style={styles.referStat}>
              <Text style={styles.referStatNum}>$60</Text>
              <Text style={styles.referStatLabel}>Total Earned</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.vcClose} onPress={onClose}>
            <Text style={styles.vcCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Personal Info Modal (editable) ───────────────────────────────────────────
function PersonalInfoModal({ visible, onClose, user, onSaved }) {
  // full_name comes from Supabase; split into first + last for editing
  const nameParts   = (user?.full_name || '').trim().split(' ');
  const initFirst   = nameParts[0] || user?.firstName || '';
  const initLast    = nameParts.slice(1).join(' ') || user?.lastName || '';

  const [firstName, setFirstName] = useState(initFirst);
  const [lastName,  setLastName]  = useState(initLast);
  const [phone,     setPhone]     = useState(user?.phone || '');
  const [saving,    setSaving]    = useState(false);
  const [editMode,  setEditMode]  = useState(false);

  // Reset when modal opens
  React.useEffect(() => {
    if (visible) {
      const parts = (user?.full_name || '').trim().split(' ');
      setFirstName(parts[0] || user?.firstName || '');
      setLastName(parts.slice(1).join(' ') || user?.lastName || '');
      setPhone(user?.phone || '');
      setEditMode(false);
    }
  }, [visible]);

  const handleSave = async () => {
    const full_name = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (full_name.length < 2) return Alert.alert('Invalid Name', 'Please enter your first and last name.');
    setSaving(true);
    try {
      await updateProfile({ full_name, phone: phone.trim() });
      onSaved({ full_name, phone: phone.trim(), firstName: firstName.trim(), lastName: lastName.trim() });
      setEditMode(false);
      Alert.alert('✅ Saved', 'Your profile has been updated.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.infoModal}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={styles.infoTitle}>👤 Personal Info</Text>
            <TouchableOpacity onPress={() => setEditMode(e => !e)} style={styles.editToggle}>
              <Text style={styles.editToggleText}>{editMode ? 'Cancel' : '✏️ Edit'}</Text>
            </TouchableOpacity>
          </View>

          {editMode ? (
            <>
              <Text style={styles.fieldLabel}>First Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor="#b2bec3"
                autoCapitalize="words"
              />
              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor="#b2bec3"
                autoCapitalize="words"
              />
              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInput
                style={styles.fieldInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (000) 000-0000"
                placeholderTextColor="#b2bec3"
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {[
                { label: 'First Name', val: firstName || '—' },
                { label: 'Last Name',  val: lastName  || '—' },
                { label: 'Email',      val: user?.email || '—' },
                { label: 'Phone',      val: phone || '—' },
                { label: 'Country',    val: 'United States 🇺🇸' },
                { label: 'KYC Status', val: '✅ Verified' },
              ].map(f => (
                <View key={f.label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{f.label}</Text>
                  <Text style={styles.infoVal}>{f.val}</Text>
                </View>
              ))}
            </>
          )}

          <TouchableOpacity style={styles.vcClose} onPress={onClose}>
            <Text style={styles.vcCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Main ProfileScreen ────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const { lang, setLang, t }         = useLang();
  const [biometric, setBiometric]         = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showCard, setShowCard]           = useState(false);
  const [showRefer, setShowRefer]         = useState(false);
  const [showInfo, setShowInfo]           = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const enableBiometric = async (val) => {
    if (val) {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Enable biometric login' });
      if (result.success) { setBiometric(true); Alert.alert('✅ Enabled', 'Biometric login is now active.'); }
    } else {
      setBiometric(false);
    }
  };

  // Wired actions for every menu item
  const handleMenuItem = (label) => {
    switch (label) {
      case 'Virtual Card':
        return setShowCard(true);
      case 'Refer & Earn':
        return setShowRefer(true);
      case 'Transaction History':
        return navigation.navigate('Wallet');
      case 'Personal Info':
        return setShowInfo(true);
      case 'Security & KYC':
        return LocalAuthentication.authenticateAsync({ promptMessage: 'Verify your identity' })
          .then(r => Alert.alert(r.success ? '✅ Identity Verified' : '❌ Failed', r.success ? 'Your Face ID / Fingerprint is active and protecting your account.' : 'Biometric check failed.'));
      case 'Linked Bank Account':
        return Alert.alert('🏦 Bank Account', 'Bank linking via Plaid is available in the full release. For now, add funds using your debit or credit card.', [
          { text: 'Add Funds Instead', onPress: () => navigation.navigate('Wallet') },
          { text: 'OK' },
        ]);
      case 'Chat Support':
        return Linking.openURL('mailto:support@tchotchopay.com?subject=Support Request');
      case 'FAQ':
        return Linking.openURL('https://tchotchopay.com/faq.html');
      case 'Terms & Privacy':
        return Linking.openURL('https://tchotchopay.com/terms.html');
      default:
        return Alert.alert(label, 'Coming soon!');
    }
  };

  const MENU_SECTIONS = [
    {
      title: t.wallet || 'Wallet',
      items: [
        { emoji: '💳', label: 'Virtual Card',        desc: 'Spend USDC anywhere online',    bg: '#DBEAFE' },
        { emoji: '👥', label: 'Refer & Earn',        desc: 'Get $5 for each friend invited', bg: '#D1FAE5' },
        { emoji: '📋', label: 'Transaction History', desc: 'View all payments & receipts',   bg: '#EDE9FE' },
      ],
    },
    {
      title: t.account || 'Account',
      items: [
        { emoji: '👤', label: 'Personal Info',       desc: 'Name, email, phone',             bg: '#F3F4F6' },
        { emoji: '🔒', label: 'Security & KYC',      desc: 'Face ID · Identity verified',    bg: '#FEF3C7' },
        { emoji: '🏦', label: 'Linked Bank Account', desc: 'Add or change bank',             bg: '#F3F4F6' },
      ],
    },
    {
      title: t.support || 'Support',
      items: [
        { emoji: '💬', label: 'Chat Support',    desc: 'Talk to our team 24/7',       bg: '#F3F4F6' },
        { emoji: '📖', label: 'FAQ',             desc: 'Frequently asked questions',  bg: '#F3F4F6' },
        { emoji: '📜', label: 'Terms & Privacy', desc: 'Legal & privacy policy',      bg: '#F3F4F6' },
      ],
    },
  ];

  // Derive display name from full_name (Supabase) or fallback fields
  const nameParts   = (user?.full_name || '').trim().split(' ');
  const displayFirst = nameParts[0] || user?.firstName || 'Tchotcho';
  const displayLast  = nameParts.slice(1).join(' ') || user?.lastName || 'User';
  const initials     = (displayFirst[0] || 'T') + (displayLast[0] || 'P');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient colors={['#1055CC', '#00AEEF']} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.name}>{displayFirst} {displayLast}</Text>
          <Text style={styles.email}>{user?.email || 'user@tchotchopay.com'}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✅ Verified Account</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>47</Text>
            <Text style={styles.statLabel}>{t.transfers || 'Transfers'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNum}>$4.2K</Text>
            <Text style={styles.statLabel}>{t.totalSent || 'Total Sent'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>{t.referrals || 'Referrals'}</Text>
          </View>
        </View>

        {/* Biometric Toggle */}
        <View style={styles.biometricRow}>
          <Text style={styles.biometricLabel}>👆 Face ID / Fingerprint</Text>
          <Switch
            value={biometric}
            onValueChange={enableBiometric}
            trackColor={{ false: '#dfe6e9', true: '#1055CC' }}
            thumbColor="#fff"
          />
        </View>

        {/* Notifications Toggle */}
        <View style={[styles.biometricRow, { marginTop: -12 }]}>
          <Text style={styles.biometricLabel}>🔔 Push Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#dfe6e9', true: '#1055CC' }}
            thumbColor="#fff"
          />
        </View>

        {/* Language Switcher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LANGUAGE · LANG · LANGUE · IDIOMA</Text>
          <View style={[styles.sectionCard, { flexDirection: 'row', padding: 10, gap: 8 }]}>
            {[
              { code: 'en', flag: '🇺🇸', label: 'EN' },
              { code: 'ht', flag: '🇭🇹', label: 'HT' },
              { code: 'fr', flag: '🇫🇷', label: 'FR' },
              { code: 'es', flag: '🇪🇸', label: 'ES' },
            ].map(({ code, flag, label }) => {
              const active = lang === code;
              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.langBtn, active && styles.langBtnActive]}
                  onPress={() => setLang(code)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.langFlag}>{flag}</Text>
                  <Text style={[styles.langLabel, active && styles.langLabelActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => handleMenuItem(item.label)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.desc && <Text style={styles.menuDesc}>{item.desc}</Text>}
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>TchotchoPay v1.0.0</Text>
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modals */}
      <VirtualCardModal  visible={showCard}  onClose={() => setShowCard(false)}  user={user} />
      <ReferModal        visible={showRefer} onClose={() => setShowRefer(false)} user={user} />
      <PersonalInfoModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        user={user}
        onSaved={(fields) => updateUser(fields)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },

  // Header
  profileHeader: { alignItems: 'center', paddingTop: 28, paddingBottom: 20, backgroundColor: '#fff' },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: '#2d3436' },
  email: { fontSize: 14, color: '#636e72', marginTop: 4 },
  verifiedBadge: { marginTop: 10, backgroundColor: '#d4edda', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  verifiedText: { color: '#155724', fontSize: 12, fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  statNum: { fontSize: 22, fontWeight: '800', color: '#2d3436' },
  statLabel: { fontSize: 11, color: '#636e72', marginTop: 4 },

  // Toggles
  biometricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 14, padding: 16, marginBottom: 8 },
  biometricLabel: { fontSize: 15, fontWeight: '600', color: '#2d3436' },

  // Menu
  section: { marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#b2bec3', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, color: '#2d3436', fontWeight: '600' },
  menuDesc: { fontSize: 12, color: '#b2bec3', marginTop: 2 },
  chevron: { fontSize: 22, color: '#b2bec3' },

  // Language switcher
  langBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: '#F3F4F6' },
  langBtnActive: { backgroundColor: '#EFF6FF', borderWidth: 2, borderColor: '#1055CC' },
  langFlag: { fontSize: 22, marginBottom: 4 },
  langLabel: { fontSize: 11, fontWeight: '700', color: '#636e72' },
  langLabelActive: { color: '#1055CC' },

  logoutBtn: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#e17055', marginBottom: 16 },
  logoutText: { color: '#e17055', fontWeight: '700', fontSize: 16 },
  version: { textAlign: 'center', color: '#b2bec3', fontSize: 12, marginBottom: 8 },

  // ── Shared modal base ──
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  vcClose: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  vcCloseText: { color: '#636e72', fontSize: 15, fontWeight: '600' },

  // ── Virtual Card modal ──
  vcModal: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  vcTitle: { fontSize: 22, fontWeight: '800', color: '#2d3436', textAlign: 'center', marginBottom: 4 },
  vcSub: { fontSize: 13, color: '#636e72', textAlign: 'center', marginBottom: 20 },
  vcCard: { borderRadius: 20, padding: 22, marginBottom: 8, minHeight: 200 },
  vcCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  vcBrand: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  vcChip: { width: 38, height: 28, borderRadius: 5, backgroundColor: '#FFD700', marginBottom: 16 },
  vcNum: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 3, marginBottom: 20 },
  vcCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  vcFieldLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  vcFieldVal: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 2 },
  vcVisa: { color: '#fff', fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
  vcBack: { paddingTop: 20 },
  vcMagStripe: { height: 40, backgroundColor: '#333', borderRadius: 4, marginBottom: 20, marginHorizontal: -22 },
  vcCvvRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vcCvvBar: { flex: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4 },
  vcCvvBox: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  vcCvvText: { fontSize: 18, fontWeight: '800', color: '#2d3436' },
  vcBackNote: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center', marginTop: 16 },
  vcHint: { textAlign: 'center', color: '#b2bec3', fontSize: 12, marginBottom: 16 },
  vcActions: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  vcActionBtn: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  vcActionEmoji: { fontSize: 20, marginBottom: 4 },
  vcActionLabel: { fontSize: 11, fontWeight: '600', color: '#636e72' },
  vcStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 },
  vcDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  vcStatus: { fontSize: 12, color: '#636e72' },

  // ── Refer modal ──
  referModal: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  referTitle: { fontSize: 24, fontWeight: '800', color: '#2d3436', textAlign: 'center', marginBottom: 8 },
  referSub: { fontSize: 14, color: '#636e72', textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  referCodeBox: { backgroundColor: '#EFF6FF', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: '#DBEAFE' },
  referCodeLabel: { fontSize: 10, fontWeight: '700', color: '#1055CC', letterSpacing: 1.5, marginBottom: 6 },
  referCode: { fontSize: 28, fontWeight: '900', color: '#1055CC', letterSpacing: 4 },
  referShareBtn: { backgroundColor: '#1055CC', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  referShareText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  referCopyBtn: { backgroundColor: '#F3F4F6', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  referCopyText: { color: '#2d3436', fontSize: 15, fontWeight: '600' },
  referStats: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  referStat: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, alignItems: 'center' },
  referStatNum: { fontSize: 26, fontWeight: '800', color: '#2d3436' },
  referStatLabel: { fontSize: 12, color: '#636e72', marginTop: 2 },

  // ── Personal Info modal ──
  infoModal: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  infoTitle: { fontSize: 22, fontWeight: '800', color: '#2d3436', marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoLabel: { fontSize: 13, color: '#636e72', fontWeight: '500' },
  infoVal: { fontSize: 14, color: '#2d3436', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  infoEditBtn: { marginTop: 20, backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  infoEditText: { fontSize: 14, fontWeight: '600', color: '#2d3436' },

  // Edit mode styles
  editToggle: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#EFF6FF', borderRadius: 10 },
  editToggleText: { fontSize: 13, fontWeight: '700', color: '#1055CC' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 14 },
  fieldInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: '#020B2D', backgroundColor: '#F8FAFF',
  },
  saveBtn: { backgroundColor: '#1055CC', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
