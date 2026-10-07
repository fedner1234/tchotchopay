import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * TchotchoPay logo — matches tchotchopay.com nav
 * T icon (blue top bar + blue stem, red accent dot) + "Tchotcho" navy + "Pay" blue
 */
export default function Logo({ size = 'md' }) {
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.4 : 1;
  const iconSize = Math.round(32 * scale);
  const barH    = Math.round(7 * scale);
  const stemW   = Math.round(8 * scale);
  const accentS = Math.round(8 * scale);
  const fontSize = Math.round(18 * scale);
  const tagSize  = Math.round(9 * scale);

  return (
    <View style={styles.row}>
      {/* ── T icon ── */}
      <View style={{ width: iconSize, height: iconSize, marginRight: Math.round(7 * scale) }}>
        {/* horizontal top bar */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: barH, backgroundColor: '#0A1F6E', borderRadius: 3,
        }} />
        {/* vertical stem — centered */}
        <View style={{
          position: 'absolute',
          top: barH,
          left: (iconSize - stemW) / 2,
          width: stemW,
          bottom: 0,
          backgroundColor: '#1055CC', borderRadius: 3,
        }} />
        {/* red accent dot — bottom-left of stem */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: (iconSize - stemW) / 2 - accentS / 2,
          width: accentS,
          height: accentS,
          backgroundColor: '#CC2222',
          borderRadius: 2,
        }} />
      </View>

      {/* ── Text ── */}
      <View>
        <View style={styles.textRow}>
          <Text style={[styles.tchotcho, { fontSize }]}>Tchotcho</Text>
          <Text style={[styles.pay, { fontSize }]}>Pay</Text>
        </View>
        <Text style={[styles.tagline, { fontSize: tagSize }]}>Money for the Caribbean</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  textRow: { flexDirection: 'row', alignItems: 'baseline' },
  tchotcho: { fontWeight: '800', color: '#020B2D', letterSpacing: -0.3 },
  pay:      { fontWeight: '800', color: '#1055CC', letterSpacing: -0.3 },
  tagline:  { color: '#9CA3AF', fontWeight: '500', marginTop: 1 },
});
