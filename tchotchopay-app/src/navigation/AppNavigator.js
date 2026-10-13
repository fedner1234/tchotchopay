import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

// Screens
import OnboardingScreen  from '../screens/OnboardingScreen';
import LoginScreen       from '../screens/LoginScreen';
import SignUpScreen      from '../screens/SignUpScreen';
import HomeScreen        from '../screens/HomeScreen';
import SendMoneyScreen   from '../screens/SendMoneyScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import WalletScreen      from '../screens/WalletScreen';
import TopUpScreen       from '../screens/TopUpScreen';
import QRPayScreen       from '../screens/QRPayScreen';
import ProfileScreen     from '../screens/ProfileScreen';

// Agent screens
import AgentHomeScreen  from '../screens/AgentHomeScreen';
import AgentLoadScreen  from '../screens/AgentLoadScreen';
import AgentFloatScreen from '../screens/AgentFloatScreen';

const Icon = ({ label, focused }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{label}</Text>
);

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const BRAND = { primary: '#1055CC', inactive: '#9CA3AF', bg: '#ffffff', green: '#10B981' };

// ── Regular user tabs (Home | Send | Market | Profile) ──────────────────
function MainTabs({ isAgent }) {
  const { t } = useLang();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND.primary,
        tabBarInactiveTintColor: BRAND.inactive,
        tabBarStyle: {
          backgroundColor: BRAND.bg,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 4,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t.home || 'Home',
          tabBarIcon: ({ focused }) => <Icon label="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Send"
        component={SendMoneyScreen}
        options={{
          tabBarLabel: t.send || 'Send',
          tabBarIcon: ({ focused }) => <Icon label="💸" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          tabBarLabel: t.market || 'Market',
          tabBarIcon: ({ focused }) => <Icon label="🛒" focused={focused} />,
        }}
      />

      {/* Agent tab — only appears when user is an approved agent */}
      {isAgent && (
        <Tab.Screen
          name="AgentHome"
          component={AgentHomeScreen}
          options={{
            tabBarLabel: 'Agent',
            tabBarIcon: ({ focused }) => <Icon label="🏪" focused={focused} />,
            tabBarActiveTintColor: BRAND.green,
          }}
        />
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t.profile || 'Profile',
          tabBarIcon: ({ focused }) => <Icon label="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ── Main stack — tabs + screens reachable via navigation.navigate() ──────
function MainStack() {
  const { user } = useAuth();

  // Agent flag: true when user has is_agent=true OR agent_status='active' in their profile
  // The login function should return this from Supabase agent_floats check
  const isAgent = !!(user?.is_agent || user?.agent_status === 'active');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tabs */}
      <Stack.Screen name="Tabs">
        {() => <MainTabs isAgent={isAgent} />}
      </Stack.Screen>

      {/* Standard screens */}
      <Stack.Screen name="Wallet"  component={WalletScreen} />
      <Stack.Screen name="TopUp"   component={TopUpScreen} />
      <Stack.Screen name="QRPay"   component={QRPayScreen} />

      {/* Agent screens — always registered so navigation.navigate() works */}
      <Stack.Screen name="AgentLoad"  component={AgentLoadScreen} />
      <Stack.Screen name="AgentFloat" component={AgentFloatScreen} />
    </Stack.Navigator>
  );
}

// ── Root navigator ───────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020B2D' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login"      component={LoginScreen} />
            <Stack.Screen name="SignUp"     component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
