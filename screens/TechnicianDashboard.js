import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { mockComplaints } from '../utils/mockData';
import { BellIcon, MapPinIcon, CalendarIcon, CheckCircleIcon } from '../components/icons';

const TechnicianDashboard = ({ navigation }) => {
  const [complaints] = useState(mockComplaints.filter(c => c.status === 'in-progress'));

  const navigateToDetail = (complaint) => {
    navigation.navigate('ComplaintDetail', { complaint });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assigned Work</Text>
        <BellIcon size={24} color={colors.text} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {complaints.map(complaint => (
          <TouchableOpacity key={complaint.id} activeOpacity={0.85} onPress={() => navigateToDetail(complaint)}>
            <Card>
              <View style={styles.complaintCard}>
                <Text style={styles.complaintTitle}>{complaint.title}</Text>
                {complaint.type ? (
                  <View style={styles.typeContainer}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)}</Text>
                    </View>
                  </View>
                ) : null}
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
                {complaint.image ? (
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>Issue Photo:</Text>
                    <Image source={{ uri: complaint.image }} style={styles.complaintImage} />
                  </View>
                ) : null}
                <View style={styles.viewDetailsContainer}>
                  <Text style={styles.viewDetailsText}>Tap to view details and complete this work</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
        {complaints.length === 0 && (
          <View style={styles.emptyState}>
            <CheckCircleIcon size={60} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No pending assignments</Text>
            <Text style={styles.emptyStateSubtext}>All assigned work has been completed!</Text>
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
  complaintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  imageContainer: {
    gap: 8,
  },
  imageLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  complaintImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  viewDetailsContainer: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetailsText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  typeContainer: {
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptyStateSubtext: { color: colors.textSecondary, fontSize: 14, marginTop: 8 },
});

export default TechnicianDashboard;
