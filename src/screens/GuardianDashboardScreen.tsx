import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, TextInput, Alert, Modal,
} from 'react-native';
import {
  getContacts, saveContacts, getAppointments, saveAppointments,
  getMedicationTimes, saveMedicationTimes, Contact, Appointment,
} from '../services/storage';

type Tab = 'kontakter' | 'avtaler' | 'medisin';

export default function GuardianDashboardScreen({ navigation, onLogout }: any) {
  const [tab, setTab] = useState<Tab>('kontakter');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medTimes, setMedTimes] = useState<string[]>([]);

  // Kontakt-modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [cName, setCName] = useState('');
  const [cRelation, setCRelation] = useState('');
  const [cEmoji, setCEmoji] = useState('👤');
  const [cIdentity, setCIdentity] = useState('');

  // Avtale-modal
  const [showAptModal, setShowAptModal] = useState(false);
  const [aptTitle, setAptTitle] = useState('');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('');
  const [aptDesc, setAptDesc] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const [c, a, m] = await Promise.all([getContacts(), getAppointments(), getMedicationTimes()]);
    setContacts(c);
    setAppointments(a);
    setMedTimes(m);
  }

  // Kontakter
  function openNewContact() {
    setEditContact(null);
    setCName(''); setCRelation(''); setCEmoji('👤'); setCIdentity('');
    setShowContactModal(true);
  }

  function openEditContact(c: Contact) {
    setEditContact(c);
    setCName(c.name); setCRelation(c.relation); setCEmoji(c.emoji); setCIdentity(c.identity);
    setShowContactModal(true);
  }

  async function saveContact() {
    if (!cName.trim()) return Alert.alert('Mangler navn');
    const id = editContact?.id ?? Date.now().toString();
    const updated = editContact
      ? contacts.map(c => c.id === id ? { id, name: cName, relation: cRelation, emoji: cEmoji, identity: cIdentity } : c)
      : [...contacts, { id, name: cName, relation: cRelation, emoji: cEmoji, identity: cIdentity }];
    await saveContacts(updated);
    setContacts(updated);
    setShowContactModal(false);
  }

  async function deleteContact(id: string) {
    Alert.alert('Slett kontakt', 'Er du sikker?', [
      { text: 'Avbryt' },
      { text: 'Slett', style: 'destructive', onPress: async () => {
        const updated = contacts.filter(c => c.id !== id);
        await saveContacts(updated);
        setContacts(updated);
      }},
    ]);
  }

  // Avtaler
  async function saveAppointment() {
    if (!aptTitle.trim() || !aptDate.trim() || !aptTime.trim()) {
      return Alert.alert('Fyll ut tittel, dato og tid');
    }
    const newApt: Appointment = {
      id: Date.now().toString(),
      title: aptTitle, date: aptDate, time: aptTime, description: aptDesc,
    };
    const updated = [...appointments, newApt].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    await saveAppointments(updated);
    setAppointments(updated);
    setAptTitle(''); setAptDate(''); setAptTime(''); setAptDesc('');
    setShowAptModal(false);
  }

  async function deleteAppointment(id: string) {
    const updated = appointments.filter(a => a.id !== id);
    await saveAppointments(updated);
    setAppointments(updated);
  }

  // Medisintider
  async function updateMedTime(index: number, value: string) {
    const updated = [...medTimes];
    updated[index] = value;
    setMedTimes(updated);
    await saveMedicationTimes(updated);
  }

  async function addMedTime() {
    const updated = [...medTimes, '08:00'];
    setMedTimes(updated);
    await saveMedicationTimes(updated);
  }

  async function removeMedTime(index: number) {
    const updated = medTimes.filter((_, i) => i !== index);
    setMedTimes(updated);
    await saveMedicationTimes(updated);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔐 Verge-panel</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>Lås</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['kontakter', 'avtaler', 'medisin'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'kontakter' ? '👥' : t === 'avtaler' ? '📅' : '💊'} {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* KONTAKTER */}
        {tab === 'kontakter' && (
          <>
            {contacts.map(c => (
              <View key={c.id} style={styles.row}>
                <Text style={styles.rowEmoji}>{c.emoji}</Text>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>{c.name}</Text>
                  <Text style={styles.rowSub}>{c.relation} · {c.identity}</Text>
                </View>
                <TouchableOpacity onPress={() => openEditContact(c)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteContact(c.id)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={openNewContact}>
              <Text style={styles.addBtnText}>+ Legg til kontakt</Text>
            </TouchableOpacity>
          </>
        )}

        {/* AVTALER */}
        {tab === 'avtaler' && (
          <>
            {appointments.map(a => (
              <View key={a.id} style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>{a.title}</Text>
                  <Text style={styles.rowSub}>{a.date} kl. {a.time}</Text>
                  {a.description ? <Text style={styles.rowDesc}>{a.description}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => deleteAppointment(a.id)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAptModal(true)}>
              <Text style={styles.addBtnText}>+ Legg til avtale</Text>
            </TouchableOpacity>
          </>
        )}

        {/* MEDISIN */}
        {tab === 'medisin' && (
          <>
            <Text style={styles.hint}>Trykk på et klokkeslett for å endre det</Text>
            {medTimes.map((t, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.rowEmoji}>💊</Text>
                <TextInput
                  style={styles.timeInput}
                  value={t}
                  onChangeText={v => updateMedTime(i, v)}
                  placeholder="HH:MM"
                  placeholderTextColor="#555577"
                  keyboardType="numbers-and-punctuation"
                />
                <TouchableOpacity onPress={() => removeMedTime(i)} style={styles.actionBtn}>
                  <Text style={styles.actionText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addMedTime}>
              <Text style={styles.addBtnText}>+ Legg til tidspunkt</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Kontakt-modal */}
      <Modal visible={showContactModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editContact ? 'Endre kontakt' : 'Ny kontakt'}</Text>
            <TextInput style={styles.input} placeholder="Navn" placeholderTextColor="#555" value={cName} onChangeText={setCName} />
            <TextInput style={styles.input} placeholder="Relasjon (f.eks. Sønn)" placeholderTextColor="#555" value={cRelation} onChangeText={setCRelation} />
            <TextInput style={styles.input} placeholder="Emoji (f.eks. 👨)" placeholderTextColor="#555" value={cEmoji} onChangeText={setCEmoji} />
            <TextInput style={styles.input} placeholder="Brukernavn for anrop (f.eks. hakon)" placeholderTextColor="#555" value={cIdentity} onChangeText={setCIdentity} autoCapitalize="none" />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowContactModal(false)}>
                <Text style={styles.cancelBtnText}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveContact}>
                <Text style={styles.saveBtnText}>Lagre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Avtale-modal */}
      <Modal visible={showAptModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Ny avtale</Text>
            <TextInput style={styles.input} placeholder="Tittel (f.eks. Lege)" placeholderTextColor="#555" value={aptTitle} onChangeText={setAptTitle} />
            <TextInput style={styles.input} placeholder="Dato (YYYY-MM-DD)" placeholderTextColor="#555" value={aptDate} onChangeText={setAptDate} keyboardType="numbers-and-punctuation" />
            <TextInput style={styles.input} placeholder="Tid (HH:MM)" placeholderTextColor="#555" value={aptTime} onChangeText={setAptTime} keyboardType="numbers-and-punctuation" />
            <TextInput style={styles.input} placeholder="Beskrivelse (valgfri)" placeholderTextColor="#555" value={aptDesc} onChangeText={setAptDesc} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAptModal(false)}>
                <Text style={styles.cancelBtnText}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveAppointment}>
                <Text style={styles.saveBtnText}>Lagre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f3a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a5a' },
  title: { fontSize: 28, color: '#FFD700', fontWeight: 'bold' },
  logout: { fontSize: 20, color: '#FF6666' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2a2a5a' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#FFD700' },
  tabText: { color: '#AAAACC', fontSize: 16 },
  tabTextActive: { color: '#FFD700', fontWeight: 'bold' },
  content: { padding: 16, gap: 10 },
  hint: { color: '#555577', fontSize: 14, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a4e', borderRadius: 14, padding: 14, gap: 10 },
  rowEmoji: { fontSize: 32 },
  rowInfo: { flex: 1 },
  rowName: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  rowSub: { color: '#AAAACC', fontSize: 14, marginTop: 2 },
  rowDesc: { color: '#8888AA', fontSize: 14, marginTop: 2 },
  actionBtn: { padding: 8 },
  actionText: { fontSize: 20 },
  addBtn: { backgroundColor: '#003322', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 2, borderColor: '#00aa44', marginTop: 8 },
  addBtnText: { color: '#00aa44', fontSize: 20, fontWeight: 'bold' },
  timeInput: { flex: 1, color: '#FFD700', fontSize: 28, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#FFD700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#1a1a4e', borderRadius: 20, padding: 24, gap: 12 },
  modalTitle: { color: '#FFD700', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#0a0a2e', borderRadius: 10, padding: 14, color: '#FFFFFF', fontSize: 18, borderWidth: 1, borderColor: '#3333aa' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: '#2a2a4a', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#AAAACC', fontSize: 18 },
  saveBtn: { flex: 1, backgroundColor: '#00aa44', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
