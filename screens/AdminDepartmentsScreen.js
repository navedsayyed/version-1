import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { Card } from '../components/Card';
import { mockComplaints, mockUsers } from '../utils/mockData';
import { 
  LayersIcon,
  FileTextIcon, 
  CheckCircleIcon,
  ClockIcon
} from '../components/icons';

const AdminDepartmentsScreen = () => {
  const [complaints] = useState(mockComplaints);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Get unique departments from complaints
  const departments = [...new Set(complaints.map(c => c.department || 'General'))];

  // Group complaints by department
  const departmentGroups = complaints.reduce((acc, complaint) => {
    const department = complaint.department || 'General';
    
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(complaint);
    return acc;
  }, {});

  // Department stats
  const getDepartmentStats = (deptComplaints) => {
    return {
      total: deptComplaints.length,
      pending: deptComplaints.filter(c => c.status === 'in-progress').length,
      completed: deptComplaints.filter(c => c.status === 'completed').length
    };
  };

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
        <Text style={styles.headerTitle}>Department Management</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Department Selection */}
        <Card>
          <Text style={styles.sectionTitle}>Departments</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.departmentScroll}
            contentContainerStyle={styles.departmentScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.departmentChip,
                !selectedDepartment && styles.activeDepartmentChip
              ]}
              onPress={() => setSelectedDepartment(null)}
            >
              <Text style={[
                styles.departmentChipText,
                !selectedDepartment && styles.activeDepartmentChipText
              ]}>All</Text>
            </TouchableOpacity>
            
            {departments.map(department => (
              <TouchableOpacity
                key={department}
                style={[
                  styles.departmentChip,
                  selectedDepartment === department && styles.activeDepartmentChip
                ]}
                onPress={() => setSelectedDepartment(department)}
              >
                <Text style={[
                  styles.departmentChipText,
                  selectedDepartment === department && styles.activeDepartmentChipText
                ]}>{department}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {/* Statistics Cards */}
        {selectedDepartment ? (
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <FileTextIcon size={32} color={colors.primary} />
              <Text style={styles.statNumber}>{getDepartmentStats(departmentGroups[selectedDepartment]).total}</Text>
              <Text style={styles.statLabel}>Total Complaints</Text>
            </Card>
            <Card style={styles.statCard}>
              <ClockIcon size={32} color={colors.accent} />
              <Text style={styles.statNumber}>{getDepartmentStats(departmentGroups[selectedDepartment]).pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card>
            <Card style={styles.statCard}>
              <CheckCircleIcon size={32} color={colors.success} />
              <Text style={styles.statNumber}>{getDepartmentStats(departmentGroups[selectedDepartment]).completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Card>
          </View>
        ) : (
          <View>
            {Object.entries(departmentGroups).map(([department, deptComplaints]) => {
              const stats = getDepartmentStats(deptComplaints);
              
              return (
                <Card key={department} style={styles.departmentCard}>
                  <View style={styles.departmentHeader}>
                    <View style={styles.departmentTitleContainer}>
                      <LayersIcon size={24} color={colors.primary} style={styles.departmentIcon} />
                      <Text style={styles.departmentTitle}>{department}</Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => setSelectedDepartment(department)}
                    >
                      <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.departmentStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.total}</Text>
                      <Text style={styles.statName}>Total</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.accent }]}>{stats.pending}</Text>
                      <Text style={styles.statName}>Pending</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.success }]}>{stats.completed}</Text>
                      <Text style={styles.statName}>Completed</Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Department Complaints */}
        {selectedDepartment && (
          <Card>
            <Text style={styles.sectionTitle}>{selectedDepartment} Complaints</Text>
            <View style={styles.complaintsList}>
              {departmentGroups[selectedDepartment].map((complaint) => (
                <View 
                  key={complaint.id} 
                  style={styles.complaintRow}
                >
                  <View style={styles.complaintInfo}>
                    <Text style={styles.complaintTitle}>{complaint.title}</Text>
                    <Text style={styles.complaintLocation}>{complaint.location}</Text>
                    <Text style={styles.complaintDate}>
                      Reported: {formatDate(complaint.submittedAt)}
                    </Text>
                  </View>
                  
                  <View style={styles.complaintStatus}>
                    <View style={[
                      styles.statusIndicator, 
                      { backgroundColor: getStatusColor(complaint.status) }
                    ]} />
                    <Text style={styles.statusText}>
                      {getStatusText(complaint.status)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  departmentScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  departmentScrollContent: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  departmentChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    marginRight: 8,
  },
  departmentChipText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeDepartmentChip: {
    backgroundColor: colors.primary,
  },
  activeDepartmentChipText: {
    color: colors.white,
  },
  departmentCard: {
    marginBottom: 16,
  },
  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  departmentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  departmentIcon: {
    marginRight: 8,
  },
  departmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  viewButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  departmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  complaintsList: {
    marginTop: 8,
  },
  complaintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  complaintInfo: {
    flex: 1,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  complaintLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  complaintDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  complaintStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});

export default AdminDepartmentsScreen;