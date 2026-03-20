import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DAYS_NO = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
const MONTHS_NO = [
  'januar', 'februar', 'mars', 'april', 'mai', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'desember',
];

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 10) return 'God morgen';
  if (hour >= 10 && hour < 12) return 'God formiddag';
  if (hour >= 12 && hour < 18) return 'God ettermiddag';
  return 'God kveld';
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatDate(date: Date): string {
  const day = DAYS_NO[date.getDay()];
  const d = date.getDate();
  const month = MONTHS_NO[date.getMonth()];
  return `${day} ${d}. ${month}`;
}

export default function HomeScreen() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting(now.getHours())}</Text>
      <Text style={styles.clock}>{formatTime(now)}</Text>
      <Text style={styles.date}>{formatDate(now)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  greeting: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  clock: {
    fontSize: 96,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 4,
  },
  date: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
