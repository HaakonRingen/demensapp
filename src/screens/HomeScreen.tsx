import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

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

export default function HomeScreen({ navigation }: any) {
  const [now, setNow] = useState(new Date());
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDateTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (next >= 5) {
      setTapCount(0);
      navigation.navigate('GuardianPin');
      return;
    }
    tapTimer.current = setTimeout(() => setTapCount(0), 2000);
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = getTimeOfDay(now.getHours());
  const dayName = DAYS[now.getDay()];
  const dateStr = `${dayName} ${now.getDate()}. ${MONTHS[now.getMonth()]}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.clock}>{timeStr}</Text>
      <TouchableOpacity onPress={handleDateTap} activeOpacity={1}>
        <Text style={styles.date}>{dateStr}</Text>
      </TouchableOpacity>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.bigButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Text style={styles.buttonIcon}>📞</Text>
          <Text style={styles.buttonText}>Ring noen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bigButton, styles.buttonBlue]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Medication')}
        >
          <Text style={styles.buttonIcon}>💊</Text>
          <Text style={styles.buttonText}>Medisiner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bigButton, styles.buttonPurple]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Today')}
        >
          <Text style={styles.buttonIcon}>📅</Text>
          <Text style={styles.buttonText}>Dagens plan</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  greeting: {
    fontSize: 48,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  clock: {
    fontSize: 120,
    color: '#FFFFFF',
    fontWeight: '200',
    letterSpacing: 4,
  },
  date: {
    fontSize: 36,
    color: '#AAAACC',
    marginTop: 8,
    marginBottom: 48,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: 20,
  },
  bigButton: {
    backgroundColor: '#00aa44',
    borderRadius: 32,
    paddingVertical: 40,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  buttonBlue: {
    backgroundColor: '#1a55cc',
  },
  buttonPurple: {
    backgroundColor: '#6622aa',
  },
  buttonIcon: {
    fontSize: 52,
  },
  buttonText: {
    fontSize: 46,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
