import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useOnboarding } from '../context/OnboardingContext';
import MainTabs from './MainTabs';
import OnboardingScreen from '../screens/OnboardingScreen';
import BetDetailScreen from '../screens/BetDetailScreen';
import CreatorDashboardScreen from '../screens/CreatorDashboardScreen';
import ResolveOutcomeScreen from '../screens/ResolveOutcomeScreen';
import ResultsScreen from '../screens/ResultsScreen';
import CreateSuccessScreen from '../screens/CreateSuccessScreen';
import GuideScreen from '../screens/GuideScreen';
import JoinBetScreen from '../screens/JoinBetScreen';
import PoolDetailsScreen from '../screens/PoolDetailsScreen';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
  <View style={loadingStyles.container}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});

const RootNavigator = () => {
  const { hasOnboarded, isLoading } = useOnboarding();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: COLORS.primary,
        headerStyle: { backgroundColor: COLORS.background },
      }}
    >
      {isLoading && (
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ headerShown: false }}
        />
      )}
      {!isLoading && !hasOnboarded && (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      )}
      {!isLoading && hasOnboarded && (
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      )}
      <Stack.Screen
        name="CreateSuccess"
        component={CreateSuccessScreen}
        options={{ title: 'Share' }}
      />
      <Stack.Screen
        name="BetDetail"
        component={BetDetailScreen}
        options={{ title: 'Event' }}
      />
      <Stack.Screen
        name="JoinBet"
        component={JoinBetScreen}
        options={{ title: 'Join' }}
      />
      <Stack.Screen
        name="PoolDetails"
        component={PoolDetailsScreen}
        options={{ title: 'Pool' }}
      />
      <Stack.Screen
        name="CreatorDashboard"
        component={CreatorDashboardScreen}
        options={{ title: 'Creator' }}
      />
      <Stack.Screen
        name="ResolveOutcome"
        component={ResolveOutcomeScreen}
        options={{ title: 'Resolve' }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'Results' }}
      />
      <Stack.Screen
        name="Guide"
        component={GuideScreen}
        options={{ title: 'Guide' }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
