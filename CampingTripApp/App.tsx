import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { useSession } from './hooks/useSession';
import { useFamily } from './hooks/useFamily';
import SignInScreen from './screens/auth/SignInScreen';
import SignUpScreen from './screens/auth/SignUpScreen';
import CreateFamilyScreen from './screens/family/CreateFamilyScreen';
import TripListScreen from './screens/trip/TripListScreen';
import TripHomeScreen from './screens/trip/TripHomeScreen';
import PackingChecklistScreen from './screens/packing/PackingChecklistScreen';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  CreateFamily: undefined;
  TripList: { familyId: string };
  TripHome: { tripId: string };
  PackingChecklist: { tripId: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: 'Sign In' }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ title: 'Sign Up' }}
      />
    </AuthStack.Navigator>
  );
}

function AuthenticatedNavigator({ userId }: { userId: string }) {
  const { family, loading, createFamily } = useFamily(userId);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <AppStack.Navigator>
      {!family ? (
        <AppStack.Screen
          name="CreateFamily"
          options={{ title: 'Set up your family' }}
        >
          {() => <CreateFamilyScreen createFamily={createFamily} />}
        </AppStack.Screen>
      ) : (
        <>
          <AppStack.Screen
            name="TripList"
            component={TripListScreen}
            initialParams={{ familyId: family.id }}
            options={{ title: 'My Trips' }}
          />
          <AppStack.Screen
            name="TripHome"
            component={TripHomeScreen}
            options={{ title: 'Trip' }}
          />
          <AppStack.Screen
            name="PackingChecklist"
            component={PackingChecklistScreen}
            options={{ title: 'Packing Checklist' }}
          />
        </>
      )}
      {/* Next screens to add: MealPlanner, Ledger, RoutePlanner */}
    </AppStack.Navigator>
  );
}

export default function App() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? (
        <AuthenticatedNavigator userId={session.user.id} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
