import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { getMedicationTimes, logMedicationTaken, getMedicationLogs, MedicationLog } from '../services/storage';

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

function getCurrentTimeStr() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function getNextDose(times: string[]): string {
  const now = getCurrentTimeStr();
  const next = times.find(t => t > now);
  return next ?? times[0];
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MedicationScreen({ navigation }: any) {
  const [times, setTimes] = useState<string[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [takenToday, setTakenToday] = useState<string[]>([]);
  const [justTaken, setJustTaken] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [t, l] = await Promise.all([getMedicationTimes(), getMedicationLogs()]);
    setTimes(t);
    setLogs(l);
    const today = new Date().toDateString();
    const todayLogs = l.filter(log => new Date(log.takenAt).toDateString() === today);
    setTakenToday(todayLogs.map(l => l.scheduledTime));
  }

  async function handleTake(scheduledTime: string) {
    await logMedicationTaken(scheduledTime);
    setJustTaken(true);
    setTakenToday(prev => [...prev, scheduledTime]);
    setTimeout(() => setJustTaken(false), 3000);
  }

  const allTakenToday = times.length > 0 && times.every(t => takenToday.includes(t));

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Tilbake</Text>
      </TouchableOpacity>

      <Text style={styles.title}>💊 Medisiner</Text>

      {justTaken && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✅ Bra! Medisinen er registrert.</Text>
        </View>
      )}

      {allTakenToday && !justTaken && (
        <View style={styles.doneBanner}>
          <Text style={styles.doneText}>🎉 Du har tatt alle medisiner i dag!</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Dagens doser</Text>
      {times.map(time => {
        const taken = takenToday.includes(time);
        return (
          <TouchableOpacity
            key={time}
            style={[styles.doseCard, taken && styles.doseCardTaken]}
            activeOpacity={taken ? 1 : 0.7}
            onPress={() => !taken && handleTake(time)}
          >
            <Text style={styles.doseTime}>{time}</Text>
            {taken ? (
              <Text style={styles.takenLabel}>✅ Tatt</Text>
            ) : (
              <Text style={styles.takeLabel}>Trykk når tatt</Text>
            )}
          </TouchableOpacity>
        );
      })}

      <Text style={styles.sectionTitle}>Siste inntak</Text>
      <ScrollView style={styles.logList}>
        {[...logs].reverse().slice(0, 5).map(log => (
          <View key={log.id} style={styles.logRow}>
            <Text style={styles.logText}>
              💊 Tatt kl. {formatTime(log.takenAt)} (planlagt {log.scheduledTime})
            </Text>
          </View>
        ))}
        {logs.length === 0 && (
          <Text style={styles.emptyLog}>Ingen inntak registrert ennå</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a2e', padding: 20 },
  back: { marginBottom: 8 },
  backText: { color: '#FFD700', fontSize: 26 },
  title: { fontSize: 44, color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  successBanner: { backgroundColor: '#004422', borderRadius: 16, padding: 20, marginBottom: 12 },
  successText: { color: '#00ff88', fontSize: 24, textAlign: 'center', fontWeight: 'bold' },
  doneBanner: { backgroundColor: '#003311', borderRadius: 16, padding: 20, marginBottom: 12 },
  doneText: { color: '#FFD700', fontSize: 22, textAlign: 'center' },
  sectionTitle: { color: '#AAAACC', fontSize: 20, marginTop: 16, marginBottom: 8 },
  doseCard: {
    backgroundColor: '#1a1a4e', borderRadius: 20, padding: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, borderWidth: 2, borderColor: '#FFD700',
  },
  doseCardTaken: { borderColor: '#00aa44', backgroundColor: '#0a2e0a' },
  doseTime: { fontSize: 36, color: '#FFFFFF', fontWeight: 'bold' },
  takeLabel: { fontSize: 20, color: '#FFD700' },
  takenLabel: { fontSize: 24, color: '#00ff88' },
  logList: { flex: 1, marginTop: 8 },
  logRow: { backgroundColor: '#111133', borderRadius: 12, padding: 14, marginBottom: 8 },
  logText: { color: '#AAAACC', fontSize: 18 },
  emptyLog: { color: '#555577', fontSize: 18, textAlign: 'center', marginTop: 16 },
});
