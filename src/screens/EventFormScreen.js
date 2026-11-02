// Create / edit screen with validation and reminder choice.
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { loadEvents, saveEvents } from '../storage';
import { scheduleReminder, cancelReminder } from '../notifications';
import { validateEvent, fmtDate, fmtTime } from '../utils';

const REMINDERS = [
  { label: 'No reminder', value: null },
  { label: 'At event time', value: 0 },
  { label: '10 min before', value: 10 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
];

export default function EventFormScreen({ route, navigation }) {
  const editing = route.params?.event; // undefined when creating
  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [when, setWhen] = useState(editing ? new Date(editing.dateTime) : new Date(Date.now() + 3600000));
  const [remind, setRemind] = useState(editing?.remindMinutes ?? null);
  const [picker, setPicker] = useState(null); // 'date' | 'time' | null
  const [errors, setErrors] = useState({});

  const onPick = (e, d) => {
    const mode = picker;
    setPicker(null);
    if (e.type === 'dismissed' || !d) return;
    const next = new Date(when);
    if (mode === 'date') next.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
    else next.setHours(d.getHours(), d.getMinutes(), 0, 0);
    setWhen(next);
  };

  const onSave = async () => {
    const errs = validateEvent({ name, description, dateTime: when }, !editing);
    if (remind !== null && new Date(when.getTime() - remind * 60000) <= new Date()) {
      errs.remind = 'That reminder time has already passed.';
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const list = await loadEvents();
    if (editing) await cancelReminder(editing.notificationId);
    const event = {
      id: editing?.id ?? String(Date.now()),
      name: name.trim(),
      description: description.trim(),
      dateTime: when.toISOString(),
      remindMinutes: remind,
      notificationId: null,
    };
    if (remind !== null) {
      event.notificationId = await scheduleReminder(event, remind);
      if (!event.notificationId) {
        Alert.alert('Reminder not set', 'Allow notifications for this app to get reminders.');
      }
    }
    const next = editing ? list.map((e) => (e.id === event.id ? event : e)) : [...list, event];
    await saveEvents(next);
    navigation.goBack();
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={s.label}>Name</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholder="e.g. Team meeting" maxLength={80} />
      {!!errors.name && <Text style={s.err}>{errors.name}</Text>}

      <Text style={s.label}>Description</Text>
      <TextInput style={[s.input, { height: 90 }]} value={description} onChangeText={setDescription}
        placeholder="Optional details" multiline textAlignVertical="top" />
      {!!errors.description && <Text style={s.err}>{errors.description}</Text>}

      <Text style={s.label}>Date and time</Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={[s.input, s.pick]} onPress={() => setPicker('date')}><Text>{fmtDate(when)}</Text></TouchableOpacity>
        <TouchableOpacity style={[s.input, s.pick]} onPress={() => setPicker('time')}><Text>{fmtTime(when)}</Text></TouchableOpacity>
      </View>
      {!!errors.dateTime && <Text style={s.err}>{errors.dateTime}</Text>}
      {picker && <DateTimePicker value={when} mode={picker} is24Hour onChange={onPick} />}

      <Text style={s.label}>Reminder</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {REMINDERS.map((r) => (
          <TouchableOpacity key={r.label} onPress={() => setRemind(r.value)}
            style={[s.chip, remind === r.value && s.chipOn]}>
            <Text style={remind === r.value ? { color: '#fff' } : { color: '#1b2333' }}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {!!errors.remind && <Text style={s.err}>{errors.remind}</Text>}

      <TouchableOpacity style={s.save} onPress={onSave}>
        <Text style={s.saveText}>{editing ? 'Save changes' : 'Create event'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#eef1f6' },
  label: { marginTop: 14, marginBottom: 6, fontWeight: '600', color: '#1b2333' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#dde2ec' },
  pick: { flex: 1, marginRight: 8 },
  err: { color: '#d93a3a', marginTop: 4 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dde2ec', marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  save: { marginTop: 24, backgroundColor: '#4f46e5', padding: 15, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
