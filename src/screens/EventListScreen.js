// Home screen: search box, Upcoming / Past sections, delete with confirmation.
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, SectionList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadEvents, saveEvents } from '../storage';
import { cancelReminder } from '../notifications';
import { fmtDate, fmtTime, matchesSearch } from '../utils';

export default function EventListScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');

  // Reload whenever this screen comes back into focus (after add/edit).
  useFocusEffect(useCallback(() => { loadEvents().then(setEvents); }, []));

  const sections = useMemo(() => {
    const now = Date.now();
    const time = (e) => new Date(e.dateTime).getTime();
    const shown = events.filter((e) => matchesSearch(e, query));
    const upcoming = shown.filter((e) => time(e) >= now).sort((a, b) => time(a) - time(b));
    const past = shown.filter((e) => time(e) < now).sort((a, b) => time(b) - time(a));
    return [{ title: 'Upcoming', data: upcoming }, { title: 'Past', data: past }].filter((s) => s.data.length);
  }, [events, query]);

  const confirmDelete = (ev) =>
    Alert.alert('Delete event', `Delete “${ev.name}”? This can’t be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await cancelReminder(ev.notificationId);
          const next = events.filter((e) => e.id !== ev.id);
          await saveEvents(next);
          setEvents(next);
        },
      },
    ]);

  const renderItem = ({ item, section }) => (
    <TouchableOpacity
      style={[s.card, section.title === 'Past' && s.cardPast]}
      onPress={() => navigation.navigate('EventForm', { event: item })}
    >
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{item.name}</Text>
        <Text style={s.when}>{fmtDate(item.dateTime)} at {fmtTime(item.dateTime)}{item.notificationId ? '  🔔' : ''}</Text>
        {!!item.description && <Text style={s.desc} numberOfLines={2}>{item.description}</Text>}
      </View>
      <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={10}>
        <Text style={s.del}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={s.screen}>
      <TextInput
        style={s.search}
        placeholder="Search by name or date (e.g. 2026-11-02)"
        value={query}
        onChangeText={setQuery}
        clearButtonMode="while-editing"
      />
      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => <Text style={s.header}>{section.title}</Text>}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={s.empty}>
            {events.length === 0 ? 'No events yet. Tap + to add your first one.' : `No events match “${query}”.`}
          </Text>
        }
      />
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('EventForm')}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#eef1f6' },
  search: { margin: 12, padding: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#dde2ec' },
  header: { marginHorizontal: 16, marginTop: 8, marginBottom: 4, fontSize: 15, fontWeight: '700', color: '#4f46e5' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 5, padding: 14, borderRadius: 12 },
  cardPast: { opacity: 0.55 },
  name: { fontSize: 17, fontWeight: '600', color: '#1b2333' },
  when: { marginTop: 3, color: '#66708a' },
  desc: { marginTop: 4, color: '#3b4358' },
  del: { color: '#d93a3a', fontWeight: '600', marginLeft: 12 },
  empty: { textAlign: 'center', marginTop: 60, color: '#66708a', fontSize: 16, paddingHorizontal: 30 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 32, marginTop: -2 },
});
