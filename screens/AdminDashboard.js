import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { mockComplaints } from '../utils/mockData';
import { 
  BellIcon, 
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon
} from '../components/icons';

export const AdminDashboard = () => {
  const [complaints] = useState(mockComplaints);
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'in-progress').length,
    completed: complaints.filter(c => c.status === 'completed').length
  };

  const filteredComplaints = filterStatus === 'all' 
    ? complaints 
    : complaints.filter(c => filterStatus === 'in-progress' ? c.status === 'in-progress' : c.status === 'completed');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    return status === 'completed' ? colors.success : colors.accent;
  };

  const getStatusText = (status) => {
    return status === 'completed' ? 'Completed' : 'Pending';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <BellIcon size={24} color={colors.text} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <FileTextIcon size={32} color={colors.primary} />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Complaints</Text>
          </Card>
          <Card style={styles.statCard}>
            <ClockIcon size={32} color={colors.accent} />
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
          <Card style={styles.statCard}>
            <CheckCircleIcon size={32} color={colors.success} />
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
        </View>

        {/* Complaints List */}
        <Card>
          <View style={styles.filterContainer}>
            <Text style={styles.sectionTitle}>All Complaints</Text>
            <View style={styles.filterButtons}>
              {[
                { key: 'all', label: 'All', count: stats.total },
                { key: 'in-progress', label: 'Pending', count: stats.pending },
                { key: 'completed', label: 'Completed', count: stats.completed }
              ].map(filter => (
                <TouchableOpacity
                  key={filter.key}
                  style={[styles.filterButton, filterStatus === filter.key && styles.activeFilterButton]}
                  onPress={() => setFilterStatus(filter.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterButtonText, filterStatus === filter.key && styles.activeFilterButtonText]}>
                    {filter.label} ({filter.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.complaintsList}>
            {filteredComplaints.map((complaint, index) => (
              <View key={complaint.id} style={[
                styles.adminComplaintRow,
                index !== filteredComplaints.length - 1 && styles.borderBottom
              ]}>
                <View style={styles.adminComplaintInfo}>
                  <View style={styles.complaintHeader}>
                    <Text style={styles.adminComplaintId}>
                      #{complaint.id.toString().padStart(4, '0')}
                    </Text>
                    <View style={[
                      styles.adminStatusBadge, 
                      { backgroundColor: getStatusColor(complaint.status) }
                    ]}>
                      <Text style={styles.adminStatusText}>
                        {getStatusText(complaint.status)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.adminComplaintTitle}>{complaint.title}</Text>
                  <Text style={styles.adminComplaintLocation}>{complaint.location}</Text>
                  
                  <View style={styles.adminComplaintDetails}>
                    <View style={styles.detailGroup}>
                      <Text style={styles.detailLabel}>Reported by:</Text>
                      <Text style={styles.adminDetailText}>{complaint.userId}</Text>
                    </View>
                    
                    {complaint.technicianId && (
                      <View style={styles.detailGroup}>
                        <Text style={styles.detailLabel}>Assigned to:</Text>
                        <Text style={styles.adminDetailText}>{complaint.technicianId}</Text>
                      </View>
                    )}
                    
                    <View style={styles.detailGroup}>
                      <Text style={styles.detailLabel}>Date:</Text>
                      <Text style={styles.adminDetailText}>{formatDate(complaint.date)}</Text>
                    </View>
                    
                    {complaint.status === 'completed' && complaint.completedAt && (
                      <View style={styles.detailGroup}>
                        <Text style={styles.detailLabel}>Completed:</Text>
                        <Text style={styles.adminDetailText}>{formatDate(complaint.completedAt)}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {filteredComplaints.length === 0 && (
            <View style={styles.emptyState}>
              <FileTextIcon size={60} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No complaints found</Text>
              <Text style={styles.emptyStateSubtext}>
                {filterStatus === 'all' 
                  ? 'No complaints have been submitted yet' 
                  : `No ${filterStatus === 'in-progress' ? 'pending' : 'completed'} complaints`
                }
              </Text>
            </View>
          )}
        </Card>

        {/* Summary Analytics */}
        <Card>
          <Text style={styles.sectionTitle}>Analytics Overview</Text>
          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsRow}>
              <Text style={styles.analyticsLabel}>Completion Rate:</Text>
              <Text style={styles.analyticsValue}>
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </Text>
            </View>
            <View style={styles.analyticsRow}>
              <Text style={styles.analyticsLabel}>Average Resolution Time:</Text>
              <Text style={styles.analyticsValue}>2.5 hours</Text>
            </View>
            <View style={styles.analyticsRow}>
              <Text style={styles.analyticsLabel}>Most Common Issue:</Text>
              <Text style={styles.analyticsValue}>HVAC Problems</Text>
            </View>
            <View style={styles.analyticsRow}>
              <Text style={styles.analyticsLabel}>Top Technician:</Text>
              <Text style={styles.analyticsValue}>tech.smith@company.com</Text>
            </View>
          </View>
        </Card>
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
  content: {
    flex: 1,
    padding: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: colors.text,
  },
  complaintsList: {
    gap: 0,
  },
  adminComplaintRow: {
    paddingVertical: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  adminComplaintInfo: {
    flex: 1,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adminComplaintId: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  adminStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  adminStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  adminComplaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  adminComplaintLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  adminComplaintDetails: {
    gap: 6,
  },
  detailGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    width: 100,
  },
  adminDetailText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
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
  analyticsContainer: {
    gap: 12,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  analyticsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  analyticsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});