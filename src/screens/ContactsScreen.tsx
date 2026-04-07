import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { CONTACTS } from '../navigation/AppNavigator';

interface Props {
  navigation: any;
  onCall: (to: string) => void;
}

export default function ContactsScreen({ navigation, onCall }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Tilbake</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Ring til</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {CONTACTS.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={styles.contactCard}
            activeOpacity={0.7}
            onPress={() => onCall(contact.phone ?? contact.identity ?? '')}
          >
            <Text style={styles.emoji}>{contact.emoji}</Text>
            <Text style={styles.name}>{contact.name}</Text>
            <Text style={styles.relation}>{contact.relation}</Text>
            <View style={styles.callButton}>
              <Text style={styles.callText}>📞 Ring</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a2e',
  },
  backButton: {
    padding: 20,
  },
  backText: {
    color: '#FFD700',
    fontSize: 28,
  },
  title: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingBottom: 40,
    gap: 16,
  },
  contactCard: {
    backgroundColor: '#1a1a4e',
    borderRadius: 24,
    width: 160,
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#3333aa',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  relation: {
    fontSize: 18,
    color: '#AAAACC',
    marginBottom: 16,
    textAlign: 'center',
  },
  callButton: {
    backgroundColor: '#00aa44',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  callText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
