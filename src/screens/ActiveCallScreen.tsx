import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

interface Props {
  callerName: string;
  callerEmoji: string;
  onHangUp: () => void;
}

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

export default function ActiveCallScreen({ callerName, callerEmoji, onHangUp }: Props) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const duration = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.status}>Snakker med</Text>
      <Text style={styles.emoji}>{callerEmoji}</Text>
      <Text style={styles.name}>{callerName}</Text>
      <Text style={styles.duration}>{duration}</Text>

      <TouchableOpacity style={styles.hangupButton} onPress={onHangUp}>
        <Text style={styles.hangupText}>📵 Legg på</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  status: {
    fontSize: 28,
    color: '#AAAACC',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 120,
    marginBottom: 16,
  },
  name: {
    fontSize: 56,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 40,
    color: '#FFD700',
    marginTop: 16,
    marginBottom: 64,
    letterSpacing: 3,
  },
  hangupButton: {
    backgroundColor: '#aa2200',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 60,
    alignItems: 'center',
  },
  hangupText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
