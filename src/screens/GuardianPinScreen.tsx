import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const CORRECT_PIN = '1234'; // TODO: hentes fra database

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GuardianPinScreen({ onSuccess, onCancel }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const press = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === CORRECT_PIN) {
        setTimeout(onSuccess, 200);
      } else {
        setError(true);
        setTimeout(() => setPin(''), 800);
      }
    }
  };

  const dots = Array(4).fill(0).map((_, i) => (
    <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
  ));

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.cancel} onPress={onCancel}>
        <Text style={styles.cancelText}>← Tilbake</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Verge-tilgang</Text>
      <Text style={styles.subtitle}>Skriv inn PIN-kode</Text>

      <View style={styles.dots}>{dots}</View>
      {error && <Text style={styles.error}>Feil PIN – prøv igjen</Text>}

      <View style={styles.keypad}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.key, key === '' && styles.keyEmpty]}
            onPress={() => {
              if (key === '⌫') setPin(p => p.slice(0, -1));
              else if (key !== '') press(key);
            }}
            disabled={key === ''}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: { position: 'absolute', top: 60, left: 20 },
  cancelText: { color: '#FFD700', fontSize: 24 },
  title: { fontSize: 40, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 22, color: '#AAAACC', marginBottom: 40 },
  dots: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  dot: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  dotFilled: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  error: { color: '#FF6666', fontSize: 20, marginBottom: 10 },
  keypad: {
    flexDirection: 'row', flexWrap: 'wrap',
    width: 300, justifyContent: 'center', gap: 16, marginTop: 20,
  },
  key: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#1a1a4e', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#3333aa',
  },
  keyEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
  keyText: { fontSize: 32, color: '#FFFFFF', fontWeight: '300' },
});
