import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ContactsScreen from '../screens/ContactsScreen';
import IncomingCallScreen from '../screens/IncomingCallScreen';
import ActiveCallScreen from '../screens/ActiveCallScreen';
import GuardianPinScreen from '../screens/GuardianPinScreen';
import GuardianDashboardScreen from '../screens/GuardianDashboardScreen';
import MedicationScreen from '../screens/MedicationScreen';
import TodayScreen from '../screens/TodayScreen';
import { useVoice } from '../hooks/useVoice';

const Stack = createStackNavigator();

// Kontakter – identity = app-bruker, phone = vanlig telefonnummer
export const CONTACTS = [
  { id: '1', name: 'Håkon', relation: 'Sønn', emoji: '👨', identity: 'hakon' },
  { id: '2', name: 'Halvor', relation: 'Sønn', emoji: '👦', phone: '+4790225009' },
];

export default function AppNavigator() {
  const [guardianUnlocked, setGuardianUnlocked] = useState(false);
  const { callState, makeCall, acceptCall, rejectCall, hangUp } = useVoice();

  // Finn kontaktinfo basert på identity
  const callerContact = callState.status === 'incoming' || callState.status === 'active' || callState.status === 'connecting'
    ? CONTACTS.find(c => c.identity === (callState.status === 'incoming' ? callState.callerIdentity : callState.remoteIdentity))
    : null;

  // Vis innkommende anrop over alt annet
  if (callState.status === 'incoming') {
    return (
      <IncomingCallScreen
        callerName={callerContact?.name ?? callState.callerIdentity}
        callerRelation={callerContact?.relation ?? 'Ukjent'}
        callerEmoji={callerContact?.emoji ?? '👤'}
        autoAnswerSeconds={8}
        onAccept={() => acceptCall(callState.callId, callState.callerIdentity, callState.invite)}
        onReject={() => rejectCall()}
      />
    );
  }

  // Vis aktiv samtale over alt annet
  if (callState.status === 'active' || callState.status === 'connecting') {
    return (
      <ActiveCallScreen
        callerName={callerContact?.name ?? callState.remoteIdentity}
        callerEmoji={callerContact?.emoji ?? '👤'}
        connecting={callState.status === 'connecting'}
        onHangUp={hangUp}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Contacts">
          {(props) => (
            <ContactsScreen
              {...props}
              onCall={(to) => makeCall(to)}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Medication" component={MedicationScreen} />
        <Stack.Screen name="Today" component={TodayScreen} />
        <Stack.Screen name="GuardianPin">
          {(props) => (
            <GuardianPinScreen
              {...props}
              onSuccess={() => {
                setGuardianUnlocked(true);
                props.navigation.replace('GuardianDashboard');
              }}
              onCancel={() => props.navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="GuardianDashboard">
          {(props) => (
            <GuardianDashboardScreen
              {...props}
              onLogout={() => {
                setGuardianUnlocked(false);
                props.navigation.navigate('Home');
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
