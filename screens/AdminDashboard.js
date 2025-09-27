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
  UsersIcon,
  LayersIcon
} from '../components/icons';

export const AdminDashboard = ({ navigation }) => {
  const [complaints] = useState(mockComplaints);
  const [activeTab, setActiveTab] = useState('in-progress'); // 'in-progress' or 'completed'

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'in-progress').length,
    completed: complaints.filter(c => c.status === 'completed').length
  };
  
  // Group complaints by department
  const departmentGroups = complaints.reduce((acc, complaint) => {
    // Get department from the complaint
    const department = complaint.department || 'General';
    
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(complaint);
    return acc;
  }, {});

  // Filter complaints based on the active tab
  const displayedComplaints = complaints.filter(c => c.status === activeTab);

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

        {/* Department Statistics */}
        <Card style={styles.departmentCard}>
          <View style={styles.departmentHeader}>
            <LayersIcon size={24} color={colors.primary} />
            <Text style={styles.departmentTitle}>Department Overview</Text>
          </View>
          
          {Object.entries(departmentGroups).map(([department, deptComplaints]) => {
            const pending = deptComplaints.filter(c => c.status === 'in-progress').length;
            const completed = deptComplaints.filter(c => c.status === 'completed').length;
            
            return (
              <View key={department} style={styles.departmentRow}>
                <View style={styles.departmentInfo}>
                  <Text style={styles.departmentName}>{department}</Text>
                  <Text style={styles.departmentCount}>Total: {deptComplaints.length}</Text>
                </View>
                
                <View style={styles.statusBadges}>
                  <View style={styles.badgeContainer}>
                    <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
                    <Text style={styles.statusCount}>{pending}</Text>
                  </View>
                  
                  <View style={styles.badgeContainer}>
                    <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                    <Text style={styles.statusCount}>{completed}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Complaint Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'in-progress' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('in-progress')}
          >
            <ClockIcon 
              size={20} 
              color={activeTab === 'in-progress' ? colors.white : colors.textSecondary} 
            />
            <Text style={[
              styles.tabButtonText,
              activeTab === 'in-progress' && styles.activeTabButtonText
            ]}>
              In Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'completed' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('completed')}
          >
            <CheckCircleIcon 
              size={20} 
              color={activeTab === 'completed' ? colors.white : colors.textSecondary} 
            />
            <Text style={[
              styles.tabButtonText,
              activeTab === 'completed' && styles.activeTabButtonText
            ]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Complaints List (single source, cleaned) */}
        <Card>
          <View style={styles.complaintsList}>
            {displayedComplaints.length > 0 ? (
              displayedComplaints.map((complaint, index) => (
                <TouchableOpacity
                  key={complaint.id}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('ComplaintDetail', { complaint, readOnly: true })}
                  style={[
                  styles.adminComplaintRow,
                  index !== displayedComplaints.length - 1 && styles.borderBottom
                ]}
                >
                  <View style={styles.adminComplaintInfo}>
                    <View style={styles.complaintHeader}>
                      <Text style={styles.adminComplaintId}>#{complaint.id.toString().padStart(4, '0')}</Text>
                      <View style={[styles.adminStatusBadge, { backgroundColor: activeTab === 'in-progress' ? colors.accent : colors.success }]}>
                        <Text style={styles.adminStatusText}>{activeTab === 'in-progress' ? 'Pending' : 'Completed'}</Text>
                      </View>
                    </View>
                    <Text style={styles.adminComplaintTitle}>{complaint.title}</Text>
                    <Text style={styles.adminComplaintLocation}>{complaint.location}</Text>
                    <Text style={styles.departmentTag}>{complaint.department || 'General'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No {activeTab === 'in-progress' ? 'pending' : 'completed'} complaints found</Text>
              </View>
            )}
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
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionBadge: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  sectionBadgeText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  departmentTag: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  departmentCard: {
    marginBottom: 24,
  },
  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  departmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  departmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  departmentInfo: {
    flex: 1,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  departmentCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 15,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabButtonText: {
    color: colors.white,
  },
});