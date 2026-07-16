import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TripHomeScreen from './screens/trip/TripHomeScreen';
import PackingChecklistScreen from './screens/packing/PackingChecklistScreen';

export type RootStackParamList = {
  TripHome: { tripId: string };
  PackingChecklist: { tripId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="TripHome"
          component={TripHomeScreen}
          // TODO: replace with a real tripId once a trip list/join flow exists.
          initialParams={{ tripId: 'demo-trip' }}
          options={{ title: 'Trip' }}
        />
        <Stack.Screen
          name="PackingChecklist"
          component={PackingChecklistScreen}
          options={{ title: 'Packing Checklist' }}
        />
        {/* Next screens to add: MealPlanner, Ledger, RoutePlanner */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
