import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { getAppointments, Appointment } from '../services/storage';

const DAYS = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
const MONTHS = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];

function getTimeOfDay(hour: number): { label: string; emoji: string } {
  if (hour >= 5 && hour < 10) return { label: 'Morgen', emoji: '🌅' };
  if (hour >= 10 && hour < 12) return { label: 'Formiddag', emoji: '☀️' };
  if (hour >= 12 && hour < 17) return { label: 'Ettermiddag', emoji: '🌤️' };
  if (hour >= 17 && hour < 21) return { label: 'Kveld', emoji: '🌆' };
  return { label: 'Natt', emoji: '🌙' };
}

export default function TodayScreen({ navigation }: any) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const { label, emoji } = getTimeOfDay(now.getHours());

  useEffect(() => {
    getAppointments().then(all => {
      setAppointments(all.filter(a => a.date === todayStr));
    });
  }, []);

  const dayName = DAYS[now.getDay()];
  const dateStr = `${dayName} ${now.getDate()}. ${MONTHS[now.getMonth()]}`;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Tilbake</Text>
      </TouchableOpacity>

      <Text style={styles.timeOfDay}>{emoji} {label}</Text>
      <Text style={styles.date}>{dateStr}</Text>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>📅 Dagens avtaler</Text>

      <ScrollView style={styles.list}>
        {appointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Ingen avtaler i dag</Text>
            <Text style={styles.emptySubtext}>Ha en god dag! 😊</Text>
          </View>
        ) : (
          appointments.map(apt => (
            <View key={apt.id} style={styles.appointmentCard}>
              <Text style={styles.aptTime}>{apt.time}</Text>
              <View style={styles.aptInfo}>
                <Text style={styles.aptTitle}>{apt.title}</Text>
                {apt.description ? (
                  <Text style={styles.aptDesc}>{apt.description}</Text>
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>🏠</Text>
          <Text style={styles.infoLabel}>Du er hjemme</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>📱</Text>
          <Text style={styles.infoLabel}>Appen er på</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a2e', padding: 20 },
  back: { marginBottom: 8 },
  backText: { color: '#FFD700', fontSize: 26 },
  timeOfDay: { fontSize: 48, color: '#FFD700', fontWeight: 'bold', textAlign: 'center', marginTop: 8 },
  date: { fontSize: 26, color: '#AAAACC', textAlign: 'center', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#2a2a5a', marginVertical: 16 },
  sectionTitle: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 12 },
  list: { flex: 1 },
  emptyCard: {
    backgroundColor: '#111133', borderRadius: 20, padding: 32,
    alignItems: 'center', marginTop: 16,
  },
  emptyText: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold' },
  emptySubtext: { color: '#AAAACC', fontSize: 22, marginTop: 8 },
  appointmentCard: {
    backgroundColor: '#1a1a4e', borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    borderLeftWidth: 6, borderLeftColor: '#FFD700',
  },
  aptTime: { fontSize: 30, color: '#FFD700', fontWeight: 'bold', marginRight: 20, minWidth: 70 },
  aptInfo: { flex: 1 },
  aptTitle: { fontSize: 26, color: '#FFFFFF', fontWeight: 'bold' },
  aptDesc: { fontSize: 18, color: '#AAAACC', marginTop: 4 },
  infoRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  infoCard: {
    flex: 1, backgroundColor: '#111133', borderRadius: 16,
    padding: 16, alignItems: 'center',
  },
  infoEmoji: { fontSize: 32 },
  infoLabel: { color: '#AAAACC', fontSize: 16, marginTop: 4 },
});
