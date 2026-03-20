import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Contact {
  id: string;
  name: string;
  relation: string;
  emoji: string;
  identity: string;
}

export interface Appointment {
  id: string;
  title: string;
  time: string; // "HH:MM"
  date: string; // "YYYY-MM-DD"
  description: string;
}

export interface MedicationLog {
  id: string;
  takenAt: string; // ISO string
  scheduledTime: string;
}

const KEYS = {
  contacts: 'contacts',
  appointments: 'appointments',
  medicationLogs: 'medication_logs',
  medicationTimes: 'medication_times',
};

// Kontakter
export async function getContacts(): Promise<Contact[]> {
  const raw = await AsyncStorage.getItem(KEYS.contacts);
  return raw ? JSON.parse(raw) : defaultContacts;
}

export async function saveContacts(contacts: Contact[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.contacts, JSON.stringify(contacts));
}

// Avtaler
export async function getAppointments(): Promise<Appointment[]> {
  const raw = await AsyncStorage.getItem(KEYS.appointments);
  return raw ? JSON.parse(raw) : [];
}

export async function saveAppointments(appointments: Appointment[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.appointments, JSON.stringify(appointments));
}

// Medisinlogg
export async function getMedicationLogs(): Promise<MedicationLog[]> {
  const raw = await AsyncStorage.getItem(KEYS.medicationLogs);
  return raw ? JSON.parse(raw) : [];
}

export async function logMedicationTaken(scheduledTime: string): Promise<void> {
  const logs = await getMedicationLogs();
  logs.push({ id: Date.now().toString(), takenAt: new Date().toISOString(), scheduledTime });
  await AsyncStorage.setItem(KEYS.medicationLogs, JSON.stringify(logs));
}

export async function getMedicationTimes(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.medicationTimes);
  return raw ? JSON.parse(raw) : ['08:00', '12:00', '20:00'];
}

export async function saveMedicationTimes(times: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.medicationTimes, JSON.stringify(times));
}

const defaultContacts: Contact[] = [
  { id: '1', name: 'Håkon', relation: 'Sønn', emoji: '👨', identity: 'hakon' },
  { id: '2', name: 'Kari', relation: 'Datter', emoji: '👩', identity: 'kari' },
  { id: '3', name: 'Per', relation: 'Barnebarn', emoji: '👦', identity: 'per' },
  { id: '4', name: 'Lege Olsen', relation: 'Fastlege', emoji: '👨‍⚕️', identity: 'lege_olsen' },
];
