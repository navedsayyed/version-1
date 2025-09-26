import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { mockComplaints } from '../utils/mockData';
import { 
  CheckCircleIcon,
  MapPinIcon,
  CalendarIcon 
} from '../components/icons';

const CompletedWorkScreen = () => {
  const [completedComplaints, setCompletedComplaints] = useState(
    mockComplaints.filter(c => c.status === 'completed')
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Completed Work</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
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
            <CheckCircleIcon size={60} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No completed work</Text>
            <Text style={styles.emptyStateSubtext}>Completed work will appear here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Add padding at the bottom for the tab bar
  },
  complaintCard: {
    gap: 16,
    padding: 8,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    color: colors.textSecondary,
    fontSize: 14,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  complaintDescription: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  beforeAfterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  imageSection: {
    flex: 1,
  },
  imageLabel: {
    color: colors.textSecondary,
    marginBottom: 6,
    fontSize: 14,
  },
  beforeAfterImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  completedSection: {
    marginTop: 8,
  },
  completedLabel: {
    color: colors.textSecondary,
    marginBottom: 6,
    fontSize: 14,
  },
  completedDescription: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
});

export default CompletedWorkScreen;