import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Alert, Modal, Image, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import { mockComplaints } from '../utils/mockData';
import { 
  BellIcon, 
  FileTextIcon, 
  UserIcon, 
  CameraIcon, 
  UploadIcon, 
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon 
} from '../components/icons';

export const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [complaints, setComplaints] = useState(mockComplaints);
  const [complaintForm, setComplaintForm] = useState({
    location: '',
    place: '',
    description: '',
    image: null
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [complaintsTab, setComplaintsTab] = useState('in-progress');

  const handleQRScan = () => {
    // Mock QR scan result
    setComplaintForm(prev => ({
      ...prev,
      location: 'Building A - Floor 2',
      place: 'Room 205'
    }));
    Alert.alert('QR Code Scanned', 'Location information has been auto-filled');
  };

  const handleImagePick = () => {
    setComplaintForm(prev => ({
      ...prev,
      image: 'https://via.placeholder.com/300x200/1E1E1E/00BCD4?text=Uploaded+Image'
    }));
    Alert.alert('Success', 'Image uploaded successfully');
  };

  const submitComplaint = () => {
    if (complaintForm.description && complaintForm.location && complaintForm.place) {
      const newComplaint = {
        id: complaints.length + 1,
        title: complaintForm.description.substring(0, 30) + '...',
        description: complaintForm.description,
        location: complaintForm.location,
        place: complaintForm.place,
        date: new Date().toISOString().split('T')[0],
        status: 'in-progress',
        userId: 'current.user@company.com',
        technicianId: null,
        image: complaintForm.image,
        completedImage: null,
        completedDescription: null
      };
      
      setComplaints(prev => [...prev, newComplaint]);
      setShowSuccess(true);
      setComplaintForm({ location: '', place: '', description: '', image: null });
      setTimeout(() => setShowSuccess(false), 2000);
    } else {
      Alert.alert('Error', 'Please fill all required fields');
    }
  };

  const renderAddComplaint = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Card>
        <Text style={styles.sectionTitle}>Scan QR Code</Text>
        <Text style={styles.sectionSubtitle}>Scan the QR code to auto-fill location details</Text>
        <CustomButton
          title="Scan QR Code"
          onPress={handleQRScan}
          icon={CameraIcon}
          variant="outline"
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Complaint Details</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Location *</Text>
          <TextInput
            style={styles.input}
            value={complaintForm.location}
            onChangeText={(text) => setComplaintForm(prev => ({ ...prev, location: text }))}
            placeholder="Building location"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Place *</Text>
          <TextInput
            style={styles.input}
            value={complaintForm.place}
            onChangeText={(text) => setComplaintForm(prev => ({ ...prev, place: text }))}
            placeholder="Specific place/room"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={complaintForm.description}
            onChangeText={(text) => setComplaintForm(prev => ({ ...prev, description: text }))}
            placeholder="Describe the issue in detail"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Photo</Text>
          <CustomButton
            title={complaintForm.image ? "Photo Added" : "Upload Photo"}
            onPress={handleImagePick}
            icon={UploadIcon}
            variant={complaintForm.image ? "success" : "outline"}
          />
          {complaintForm.image && (
            <Image source={{ uri: complaintForm.image }} style={styles.previewImage} />
          )}
        </View>

        <CustomButton
          title="Submit Complaint"
          onPress={submitComplaint}
          size="large"
          icon={FileTextIcon}
        />
      </Card>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <CheckCircleIcon size={60} color={colors.success} />
            <Text style={styles.successText}>Complaint Submitted!</Text>
            <Text style={styles.successSubtext}>Your complaint has been registered successfully</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  const renderMyComplaints = () => {
    const filteredComplaints = complaints.filter(c => 
      complaintsTab === 'in-progress' ? c.status === 'in-progress' : c.status === 'completed'
    );

    return (
      <View style={styles.tabContent}>
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.subTab, complaintsTab === 'in-progress' && styles.activeSubTab]}
            onPress={() => setComplaintsTab('in-progress')}
            activeOpacity={0.8}
          >
            <ClockIcon size={16} color={complaintsTab === 'in-progress' ? colors.text : colors.textSecondary} />
            <Text style={[styles.subTabText, complaintsTab === 'in-progress' && styles.activeSubTabText]}>
              In Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, complaintsTab === 'completed' && styles.activeSubTab]}
            onPress={() => setComplaintsTab('completed')}
            activeOpacity={0.8}
          >
            <CheckCircleIcon size={16} color={complaintsTab === 'completed' ? colors.text : colors.textSecondary} />
            <Text style={[styles.subTabText, complaintsTab === 'completed' && styles.activeSubTabText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredComplaints.map(complaint => (
            <Card key={complaint.id}>
              <View style={styles.complaintCard}>
                <View style={styles.complaintHeader}>
                  <Text style={styles.complaintTitle}>{complaint.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: complaint.status === 'completed' ? colors.success : colors.accent }]}>
                    <Text style={styles.statusText}>
                      {complaint.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.complaintDetails}>
                  <View style={styles.detailRow}>
                    <MapPinIcon size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{complaint.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <CalendarIcon size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{complaint.date}</Text>
                  </View>
                </View>

                <Text style={styles.complaintDescription}>{complaint.description}</Text>
                
                {complaint.image && (
                  <Image source={{ uri: complaint.image }} style={styles.complaintImage} />
                )}
              </View>
            </Card>
          ))}
          {filteredComplaints.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No {complaintsTab === 'in-progress' ? 'pending' : 'completed'} complaints found
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Dashboard</Text>
        <BellIcon size={24} color={colors.text} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.activeTab]}
          onPress={() => setActiveTab('add')}
          activeOpacity={0.8}
        >
          <FileTextIcon size={20} color={activeTab === 'add' ? colors.text : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>Add Complaint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
          activeOpacity={0.8}
        >
          <UserIcon size={20} color={activeTab === 'my' ? colors.text : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>My Complaints</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'add' ? renderAddComplaint() : renderMyComplaints()}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModal: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '80%',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  subTabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeSubTab: {
    backgroundColor: colors.primary,
  },
  subTabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeSubTabText: {
    color: colors.text,
  },
  complaintCard: {
    gap: 12,
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
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  complaintDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  complaintImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});