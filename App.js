// Entry point: sets up navigation between the two screens.
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventListScreen from './src/screens/EventListScreen';
import EventFormScreen from './src/screens/EventFormScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#4f46e5' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="Events" component={EventListScreen} />
        <Stack.Screen
          name="EventForm"
          component={EventFormScreen}
          options={({ route }) => ({ title: route.params?.event ? 'Edit event' : 'New event' })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
