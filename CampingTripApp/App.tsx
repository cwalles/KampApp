import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PackingChecklistScreen from './screens/packing/PackingChecklistScreen';

export type RootStackParamList = {
  PackingChecklist: { tripId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="PackingChecklist"
          component={PackingChecklistScreen}
          options={{ title: 'Packing Checklist' }}
        />
        {/* Next screens to add: TripHome, MealPlanner, Ledger, RoutePlanner */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
