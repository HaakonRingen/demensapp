import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ContactsScreen from '../screens/ContactsScreen';
import IncomingCallScreen from '../screens/IncomingCallScreen';
import ActiveCallScreen from '../screens/ActiveCallScreen';
import GuardianPinScreen from '../screens/GuardianPinScreen';
import GuardianDashboardScreen from '../screens/GuardianDashboardScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [guardianUnlocked, setGuardianUnlocked] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="IncomingCall" component={IncomingCallScreen} />
        <Stack.Screen name="ActiveCall" component={ActiveCallScreen} />
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
