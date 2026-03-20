import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const CONTACTS = [
  { id: '1', name: 'Håkon', relation: 'Sønn', emoji: '👨', identity: 'hakon' },
  { id: '2', name: 'Kari', relation: 'Datter', emoji: '👩', identity: 'kari' },
];

interface Props {
  navigation: any;
  onLogout: () => void;
}

export default function GuardianDashboardScreen({ navigation, onLogout }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verge-panel</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>Lås</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Godkjente kontakter</Text>
        {CONTACTS.map(c => (
          <View key={c.id} style={styles.contactRow}>
            <Text style={styles.contactEmoji}>{c.emoji}</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{c.name}</Text>
              <Text style={styles.contactRelation}>{c.relation}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editText}>Endre</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addText}>+ Legg til kontakt</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Innstillinger</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Auto-svar etter</Text>
          <Text style={styles.settingValue}>8 sekunder</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>PIN-kode</Text>
          <TouchableOpacity>
            <Text style={styles.settingValue}>Endre →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Bruker-ID</Text>
          <Text style={styles.settingValue}>bruker_ola</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f3a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, borderBottomWidth: 1, borderBottomColor: '#2a2a5a',
  },
  title: { fontSize: 32, color: '#FFD700', fontWeight: 'bold' },
  logout: { fontSize: 20, color: '#FF6666' },
  content: { padding: 24, gap: 12 },
  section: { fontSize: 22, color: '#AAAACC', marginTop: 24, marginBottom: 8 },
  contactRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a4e', borderRadius: 16, padding: 16, gap: 16,
  },
  contactEmoji: { fontSize: 40 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  contactRelation: { fontSize: 16, color: '#AAAACC' },
  editBtn: {
    backgroundColor: '#2a2a6a', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  editText: { color: '#FFD700', fontSize: 16 },
  addButton: {
    backgroundColor: '#003322', borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 2, borderColor: '#00aa44',
  },
  addText: { color: '#00aa44', fontSize: 22, fontWeight: 'bold' },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1a1a4e', borderRadius: 16, padding: 20,
  },
  settingLabel: { fontSize: 20, color: '#FFFFFF' },
  settingValue: { fontSize: 20, color: '#FFD700' },
});
