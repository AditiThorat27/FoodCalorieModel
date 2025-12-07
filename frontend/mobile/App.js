import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { initDB } from './services/db';
import { COLORS } from './constants/theme';

import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import ResultScreen from './screens/ResultScreen';

import SettingsScreen from './screens/SettingsScreen';

// Placeholder screens for now
import LogsScreen from './screens/LogsScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Scan') iconName = focused ? 'camera' : 'camera-outline';
          else if (route.name === 'Logs') iconName = focused ? 'journal' : 'journal-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Scan" component={CameraScreen} options={{ tabBarStyle: { display: 'none' } }} />
      <Tab.Screen name="Logs" component={LogsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initDB();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await SecureStore.getItemAsync('token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  };

  if (isLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Auth">
              {props => <AuthScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Result" component={ResultScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
