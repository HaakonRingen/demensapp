import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DAYS = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
const MONTHS = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];

function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 10) return 'God morgen';
  if (hour >= 10 && hour < 12) return 'God formiddag';
  if (hour >= 12 && hour < 18) return 'God ettermiddag';
  return 'God kveld';
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export default function HomeScreen() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = getTimeOfDay(now.getHours());
  const dayName = DAYS[now.getDay()];
  const dateStr = `${dayName} ${now.getDate()}. ${MONTHS[now.getMonth()]}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.clock}>{timeStr}</Text>
      <Text style={styles.date}>{dateStr}</Text>
    </View>
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
  greeting: {
    fontSize: 42,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  clock: {
    fontSize: 96,
    color: '#FFFFFF',
    fontWeight: '200',
    letterSpacing: 4,
  },
  date: {
    fontSize: 32,
    color: '#AAAACC',
    marginTop: 16,
    textAlign: 'center',
  },
});
