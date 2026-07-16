import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TripListScreen from './screens/trip/TripListScreen';
import TripHomeScreen from './screens/trip/TripHomeScreen';
import PackingChecklistScreen from './screens/packing/PackingChecklistScreen';

export type RootStackParamList = {
  TripList: { familyId: string };
  TripHome: { tripId: string };
  PackingChecklist: { tripId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="TripList"
          component={TripListScreen}
          // TODO: replace with the signed-in user's real familyId once
          // auth/family setup exists.
          initialParams={{ familyId: 'demo-family' }}
          options={{ title: 'My Trips' }}
        />
        <Stack.Screen
          name="TripHome"
          component={TripHomeScreen}
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
