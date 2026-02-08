import React from 'react';
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
import { LoadingSpinner } from '../components/common';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { hasOnboarded, isLoading } = useOnboarding();

  if (isLoading) {
    return <LoadingSpinner label="Getting Bet That ready..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { color: COLORS.text },
        headerTintColor: COLORS.primary,
        headerStyle: { backgroundColor: COLORS.background },
      }}
    >
      {!hasOnboarded ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : (
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
