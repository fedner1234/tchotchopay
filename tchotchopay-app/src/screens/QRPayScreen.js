import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import { toQR } from 'toqr';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

/** Render a QR code from a string using toqr + react-native-svg */
function QRCode({ value, size = 240, color = '#020B2D', bg = '#fff' }) {
  const matrix = useMemo(() => {
    try {
      const flat = toQR(value);           // Uint8Array, length = dim²
      const dim  = Math.round(Math.sqrt(flat.length));
      // Convert to 2-D array of booleans
      const grid = [];
      for (let r = 0; r < dim; r++) {
        grid.push(Array.from(flat.slice(r * dim, (r + 1) * dim)).map(Boolean));
      }
      return { grid, dim };
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) return <Text style={{ color: COLORS.textLight }}>QR unavailable</Text>;

  const { grid, dim } = matrix;
  const cell = size / dim;

  return (
    <Svg width={size} height={size}>
      <Rect x={0} y={0} width={size} height={size} fill={bg} />
      {grid.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <Rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell}
              height={cell}
              fill={color}
            />
          ) : null
        )
      )}
    </Svg>
  );
}

export default function QRPayScreen({ navigation }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // The QR value encodes a payment request: app deep-link + user ID
  const userId     = user?.id || user?.walletId || 'tchotchopay-demo';
  const firstName  = user?.firstName || '';
  const qrValue    = `tchotchopay://pay?to=${userId}&name=${encodeURIComponent(firstName)}`;
  const displayId  = `@${(firstName || 'user').toLowerCase().replace(/\s+/g, '')}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Send me money on TchotchoPay!\n${qrValue}`,
        title: 'My TchotchoPay QR Code',
      });
    } catch {}
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>QR Pay</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Let others scan to pay you instantly</Text>

        {/* QR Card */}
        <View style={styles.qrCard}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.firstName?.[0] || 'T') + (user?.lastName?.[0] || 'P')}
            </Text>
          </View>
          <Text style={styles.displayName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.displayId}>{displayId}</Text>

          {/* QR Code */}
          <View style={styles.qrWrapper}>
            <QRCode value={qrValue} size={220} color="#020B2D" bg="#ffffff" />
            {/* Center logo badge */}
            <View style={styles.qrCenter}>
              <Text style={styles.qrCenterText}>T</Text>
            </View>
          </View>

          <Text style={styles.scanLabel}>Scan to pay with TchotchoPay</Text>
        </View>

        {/* Amount hint */}
        <View style={styles.hintRow}>
          <Text style={styles.hintIcon}>💡</Text>
          <Text style={styles.hintText}>The sender can enter any amount after scanning</Text>
        </View>

        {/* Action buttons */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>📤  Share My QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
          <Text style={styles.copyBtnText}>{copied ? '✅  Copied!' : '📋  Copy Payment Link'}</Text>
        </TouchableOpacity>

        {/* How it works */}
        <View style={styles.howSection}>
          <Text style={styles.howTitle}>How it works</Text>
          {[
            { emoji: '📲', text: 'Share your QR code with friends & family' },
            { emoji: '📸', text: 'They scan it with TchotchoPay or any camera' },
            { emoji: '💸', text: 'Money lands in your USDC wallet instantly' },
            { emoji: '🆓', text: 'Transfers inside TchotchoPay are free' },
          ].map(({ emoji, text }) => (
            <View key={text} style={styles.howRow}>
              <Text style={styles.howEmoji}>{emoji}</Text>
              <Text style={styles.howText}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgPage },
  container: { paddingHorizontal: 20, paddingBottom: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 24, color: COLORS.textDark },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  subtitle: { textAlign: 'center', fontSize: 14, color: COLORS.textLight, marginBottom: 20 },

  // QR Card
  qrCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
    marginBottom: 16,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  displayName: { fontSize: 18, fontWeight: '800', color: COLORS.textDark },
  displayId: { fontSize: 13, color: COLORS.textLight, marginBottom: 20, marginTop: 2 },

  qrWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  qrCenter: {
    position: 'absolute', width: 40, height: 40, borderRadius: 8,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  qrCenterText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  scanLabel: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },

  // Hint
  hintRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginBottom: 16, gap: 10 },
  hintIcon: { fontSize: 18 },
  hintText: { flex: 1, fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  // Buttons
  shareBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  shareBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  copyBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: '#E5E7EB' },
  copyBtnText: { color: COLORS.textDark, fontSize: 16, fontWeight: '700' },

  // How it works
  howSection: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  howTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark, marginBottom: 14 },
  howRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  howEmoji: { fontSize: 20, width: 28 },
  howText: { flex: 1, fontSize: 13, color: COLORS.textMid, lineHeight: 18 },
});
