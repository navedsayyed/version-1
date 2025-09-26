import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import { mockComplaints } from '../utils/mockData';
import { 
  BellIcon, 
  ClockIcon, 
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon 
} from '../components/icons';

export const TechnicianDashboard = () => {
  const [activeTab, setActiveTab] = useState('incoming');
  const [complaints, setComplaints] = useState(mockComplaints);

  const solveComplaint = (complaintId) => {
    Alert.alert(
      'Solve Complaint',
      'Mark this complaint as solved?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark as Solved', 
          onPress: () => {
            setComplaints(prev => prev.map(c => 
              c.id === complaintId 
                ? { 
                    ...c, 
                    status: 'completed', 
                    completedImage: 'https://via.placeholder.com/300x200/1E1E1E/4CAF50?text=Fixed',
                    completedDescription: 'Issue resolved successfully. All systems working normally.',
                    completedAt: new Date().toISOString()
                  }
                : c
            ));
            Alert.alert('Success', 'Complaint marked as solved!');
          }
        }
      ]
    );
  };

  const renderIncomingComplaints = () => {
    const incomingComplaints = complaints.filter(c => c.status === 'in-progress');

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {incomingComplaints.map(complaint => (
          <Card key={complaint.id}>
            <View style={styles.complaintCard}>
              <Text style={styles.complaintTitle}>{complaint.title}</Text>
              <View style={styles.complaintDetails}>
                <View style={styles.detailRow}>
                  <MapPinIcon size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{complaint.location} - {complaint.place}</Text>
                </View>
                <View style={styles.detailRow}>
                  <CalendarIcon size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>Submitted: {complaint.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reported by:</Text>
                  <Text style={styles.detailText}>{complaint.userId}</Text>
                </View>
              </View>
              
              <Text style={styles.complaintDescription}>{complaint.description}</Text>
              
              {complaint.image && (
                <View style={styles.imageContainer}>
                  <Text style={styles.imageLabel}>Issue Photo:</Text>
                  <Image source={{ uri: complaint.image }} style={styles.complaintImage} />
                </View>
              )}

              <View style={styles.actionContainer}>
                <CustomButton
                  title="Mark as Solved"
                  onPress={() => solveComplaint(complaint.id)}
                  icon={CheckCircleIcon}
                  variant="success"
                  size="large"
                />
              </View>
            </View>
          </Card>
        ))}
        
        {incomingComplaints.length === 0 && (
          <View style={styles.emptyState}>
            <CheckCircleIcon size={60} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No pending complaints</Text>
            <Text style={styles.emptyStateSubtext}>All complaints have been resolved!</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderCompletedComplaints = () => {
    const completedComplaints = complaints.filter(c => c.status === 'completed');

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {completedComplaints.map(complaint => (
          <Card key={complaint.id}>
            <View style={styles.complaintCard}>
              <View style={styles.complaintHeader}>
                <Text style={styles.complaintTitle}>{complaint.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              </View>
              
              <View style={styles.complaintDetails}>
                <View style={styles.detailRow}>
                  <MapPinIcon size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{complaint.location} - {complaint.place}</Text>
                </View>
                <View style={styles.detailRow}>
                  <CalendarIcon size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>Completed: {complaint.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reported by:</Text>
                  <Text style={styles.detailText}>{complaint.userId}</Text>
                </View>
              </View>

              <Text style={styles.complaintDescription}>{complaint.description}</Text>

              <View style={styles.beforeAfterContainer}>
                <View style={styles.imageSection}>
                  <Text style={styles.imageLabel}>Before</Text>
                  <Image source={{ uri: complaint.image }} style={styles.beforeAfterImage} />
                </View>
                {complaint.completedImage && (
                  <View style={styles.imageSection}>
                    <Text style={styles.imageLabel}>After</Text>
                    <Image source={{ uri: complaint.completedImage }} style={styles.beforeAfterImage} />
                  </View>
                )}
              </View>

              {complaint.completedDescription && (
                <View style={styles.completedSection}>
                  <Text style={styles.completedLabel}>Work Completed:</Text>
                  <Text style={styles.completedDescription}>{complaint.completedDescription}</Text>
                </View>
              )}
            </View>
          </Card>
        ))}

        {completedComplaints.length === 0 && (
          <View style={styles.emptyState}>
            <ClockIcon size={60} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No completed complaints</Text>
            <Text style={styles.emptyStateSubtext}>Completed work will appear here</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Technician Dashboard</Text>
        <BellIcon size={24} color={colors.text} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'incoming' && styles.activeTab]}
          onPress={() => setActiveTab('incoming')}
          activeOpacity={0.8}
        >
          <ClockIcon size={20} color={activeTab === 'incoming' ? colors.text : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'incoming' && styles.activeTabText]}>Incoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.8}
        >
          <CheckCircleIcon size={20} color={activeTab === 'completed' ? colors.text : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'incoming' ? renderIncomingComplaints() : renderCompletedComplaints()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.text,
  },
  tabContent: {
    flex: 1,
    padding: 24,
  },
  complaintCard: {
    gap: 16,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  complaintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  complaintDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  complaintDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
  },
  imageContainer: {
    gap: 8,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  complaintImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  actionContainer: {
    marginTop: 8,
  },
  beforeAfterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  imageSection: {
    flex: 1,
    gap: 8,
  },
  beforeAfterImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  completedSection: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  completedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  completedDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});