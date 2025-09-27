import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { mockComplaints } from '../utils/mockData';
import { ClockIcon, CheckCircleIcon, FileTextIcon } from '../components/icons';

const AdminProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('in-progress');
  const complaints = mockComplaints;

  const filtered = complaints.filter(c => c.status === (activeTab === 'in-progress' ? 'in-progress' : 'completed'));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}> 
        <Text style={styles.headerTitle}>My Overview</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Toggle Tabs */}
        <View style={styles.tabSwitchWrapper}>
          <TouchableOpacity 
            style={[styles.switchTab, activeTab === 'in-progress' && styles.switchTabActive]}
            onPress={() => setActiveTab('in-progress')}
          >
            <ClockIcon size={18} color={activeTab === 'in-progress' ? colors.white : colors.textSecondary} />
            <Text style={[styles.switchTabText, activeTab === 'in-progress' && styles.switchTabTextActive]}>In Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.switchTab, activeTab === 'completed' && styles.switchTabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <CheckCircleIcon size={18} color={activeTab === 'completed' ? colors.white : colors.textSecondary} />
            <Text style={[styles.switchTabText, activeTab === 'completed' && styles.switchTabTextActive]}>Completed</Text>
          </TouchableOpacity>
        </View>

        {filtered.map(c => (
          <TouchableOpacity
            key={c.id}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ComplaintDetail', { complaint: c, readOnly: true })}
          >
          <Card style={styles.taskCard}>
            <View style={styles.taskHeaderRow}>
              <Text style={styles.taskTitle}>{c.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: c.status === 'completed' ? colors.success : colors.accent }]}>
                <Text style={styles.statusBadgeText}>{c.status === 'completed' ? 'Completed' : 'In Progress'}</Text>
              </View>
            </View>
            <View style={styles.metaRow}> 
              <Text style={styles.metaText}>📍 {c.location}</Text>
            </View>
            <View style={styles.metaRow}> 
              <Text style={styles.metaText}>📅 {formatDate(c.date)}</Text>
            </View>
            <Text style={styles.description}>{c.description}</Text>
          </Card>
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}> 
            <FileTextIcon size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nothing here</Text>
            <Text style={styles.emptySubtitle}>No {activeTab === 'in-progress' ? 'pending' : 'completed'} complaints.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, backgroundColor: colors.surface },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  content: { padding: 20 },
  tabSwitchWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  switchTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  switchTabActive: { backgroundColor: colors.primary },
  switchTabText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  switchTabTextActive: { color: colors.white },
  taskCard: { marginBottom: 14 },
  taskHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  taskTitle: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1, paddingRight: 10 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusBadgeText: { color: colors.white, fontWeight: '600', fontSize: 12 },
  metaRow: { marginBottom: 6 },
  metaText: { color: colors.textSecondary, fontSize: 13 },
  description: { marginTop: 8, color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary },
});

export default AdminProfileScreen;