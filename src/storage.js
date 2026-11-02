// Saves and loads the event list on the device (AsyncStorage, stored as JSON).
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@events';

export async function loadEvents() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return []; // corrupted or unreadable data must never crash the app
  }
}

export async function saveEvents(list) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}
