import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

interface Props {
  callerName: string;
  callerRelation: string;
  callerEmoji: string;
  onAccept: () => void;
  onReject: () => void;
  autoAnswerSeconds?: number;
}

export default function IncomingCallScreen({
  callerName,
  callerRelation,
  callerEmoji,
  onAccept,
  onReject,
  autoAnswerSeconds = 8,
}: Props) {
  const [countdown, setCountdown] = useState(autoAnswerSeconds);

  useEffect(() => {
    if (countdown <= 0) {
      onAccept();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.ringing}>Innkommende anrop</Text>

      <Text style={styles.emoji}>{callerEmoji}</Text>
      <Text style={styles.name}>{callerName}</Text>
      <Text style={styles.relation}>{callerRelation}</Text>

      <Text style={styles.countdown}>
        Svarer automatisk om {countdown} sek...
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
          <Text style={styles.buttonText}>📞 Svar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
          <Text style={styles.buttonText}>❌ Avvis</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a2e0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  ringing: {
    fontSize: 28,
    color: '#AAFFAA',
    marginBottom: 32,
    letterSpacing: 2,
  },
  emoji: {
    fontSize: 120,
    marginBottom: 16,
  },
  name: {
    fontSize: 56,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  relation: {
    fontSize: 30,
    color: '#AAFFAA',
    marginBottom: 40,
  },
  countdown: {
    fontSize: 22,
    color: '#88CC88',
    marginBottom: 48,
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  acceptButton: {
    backgroundColor: '#00aa44',
    borderRadius: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#aa2200',
    borderRadius: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
