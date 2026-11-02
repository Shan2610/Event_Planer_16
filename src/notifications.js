import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('events', {
      name: 'Event reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function scheduleReminder(event, minutesBefore) {
  const when = new Date(new Date(event.dateTime).getTime() - minutesBefore * 60000);
  if (when <= new Date()) return null;
  if (!(await ensurePermission())) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title: event.name, body: event.description || 'Your event is coming up.' },
    trigger: { date: when, channelId: 'events' },
  });
}

export async function cancelReminder(id) {
  if (!id) return;
  try { await Notifications.cancelScheduledNotificationAsync(id); } catch (e) { /* already gone */ }
}
