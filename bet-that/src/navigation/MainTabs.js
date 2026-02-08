import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants';
import HomeScreen from '../screens/HomeScreen';
import MyBetsScreen from '../screens/MyBetsScreen';
import CreateBetWizard from '../screens/CreateBetWizard';
import ProfileScreen from '../screens/ProfileScreen';

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
      tabBarStyle: styles.tabBar,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <Feather
            name="home"
            size={22}
            color={focused ? COLORS.primary : COLORS.muted}
          />
        ),
      }}
    />
    <Tab.Screen
      name="MyBets"
      component={MyBetsScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <Feather
            name="grid"
            size={22}
            color={focused ? COLORS.primary : COLORS.muted}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Create"
      component={CreateBetWizard}
      options={{
        tabBarIcon: () => (
          <Feather name="plus" size={22} color="#FFFFFF" />
        ),
        tabBarButton: (props) => <CreateTabButton {...props} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <Feather
            name="user"
            size={22}
            color={focused ? COLORS.primary : COLORS.muted}
          />
        ),
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 70,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  createButton: {
    top: -18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonInner: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});

export default MainTabs;
