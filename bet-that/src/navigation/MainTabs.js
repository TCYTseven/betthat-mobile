import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Pressable, StyleSheet, Text, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants';
import HomeScreen from '../screens/HomeScreen';
import MyBetsScreen from '../screens/MyBetsScreen';
import CreateBetWizard from '../screens/CreateBetWizard';
import JoinBetScreen from '../screens/JoinBetScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TestScreen from '../screens/TestScreen';

const Tab = createBottomTabNavigator();

const CreateTabButton = ({ children, onPress }) => (
  <Pressable onPress={onPress} style={styles.createButton}>
    <View style={styles.createButtonInner}>{children}</View>
  </Pressable>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.muted,
      tabBarStyle: styles.tabBar,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused, color }) => (
          <Feather name="home" size={22} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Join"
      component={JoinBetScreen}
      options={{
        tabBarIcon: ({ focused, color }) => (
          <Feather name="link" size={22} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Create"
      component={CreateBetWizard}
      options={{
        tabBarIcon: () => (
          <Feather name="plus" size={26} color="#FFFFFF" />
        ),
        tabBarButton: (props) => <CreateTabButton {...props} />,
      }}
    />
    <Tab.Screen
      name="MyBets"
      component={MyBetsScreen}
      options={{
        tabBarIcon: ({ focused, color }) => (
          <Feather name="grid" size={22} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused, color }) => (
          <Feather name="user" size={22} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Test"
      component={TestScreen}
      options={{
        tabBarIcon: ({ focused, color }) => (
          <Feather name="activity" size={22} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    paddingTop: 12,
    backgroundColor: COLORS.background,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  createButton: {
    top: -18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 0,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
});

export default MainTabs;
