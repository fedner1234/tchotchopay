import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/context/AuthContext';
import { LangProvider } from './src/context/LangContext';
import AppNavigator from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

// Publishable key — safe to include in client code (not the secret key)
const STRIPE_PK = 'pk_live_51U0wFAC4eLwVz6CMDQGr4RBg6l9muv0k0ZV3y8ESZSFVuwfPHhz7JPb6VsAwE4kxFvAcyZwDJX15gpJpvFJUSAcx00EqGDVqmI';

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <LangProvider>
        <AuthProvider>
          <StripeProvider publishableKey={STRIPE_PK} merchantIdentifier="merchant.com.tchotchopay">
            <StatusBar style="auto" />
            <AppNavigator />
          </StripeProvider>
        </AuthProvider>
      </LangProvider>
    </SafeAreaProvider>
  );
}
