import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { colors } from '../styles/colors';
import { CustomButton } from '../components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, Feather } from '@expo/vector-icons';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UploadIcon,
  CheckCircleIcon,
  StarIcon
} from '../components/icons';

import {
  getComplaintById,
  completeComplaint,
  assignComplaint,
  auth,
  uploadCompletionImage,
  getTechnicians,
  rateComplaint
} from '../firebase/index';

const ComplaintDetailScreen = ({ route, navigation }) => {
  const { complaintId, readOnly = false } = route.params || {};
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proofImage, setProofImage] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState(null);
  const [showTechModal, setShowTechModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = auth.currentUser;
  const [userRole, setUserRole] = useState(null);
  
  // Get user role
  useEffect(() => {
    const getUserRole = async () => {
      if (currentUser) {
        try {
          // Get user document from Firestore to determine role
          const { user, error } = await getUserById(currentUser.uid);
          if (error) {
            console.error('Error getting user role:', error);
            setUserRole('user'); // Default to 'user' role on error
            return;
          }
          
          if (user) {
            setUserRole(user.role || 'user');
          } else {
            setUserRole('user'); // Default to 'user' if no data found
          }
        } catch (error) {
          console.error('Error getting user role:', error);
        }
      }
    };
    
    getUserRole();
  }, [currentUser]);

  // Fetch complaint details
  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  // Fetch technicians if user is admin
  useEffect(() => {
    if (userRole === 'admin') {
      loadTechnicians();
    }
  }, [userRole]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const result = await getComplaintById(complaintId);
      
      if (result.complaint) {
        setComplaint(result.complaint);
      } else {
        Alert.alert('Error', result.error || 'Complaint not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      Alert.alert('Error', 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const result = await getTechnicians();
      
      if (Array.isArray(result)) {
        setTechnicians(result);
      } else if (result.error) {
        console.error('Error loading technicians:', result.error);
        Alert.alert('Error', 'Failed to load technicians');
      } else {
        console.error('Unexpected response format:', result);
      }
    } catch (error) {
      console.error('Error loading technicians:', error);
      Alert.alert('Error', 'Failed to load technicians');
    }
  };

  const pickImage = async () => {
    // Request permission to access the camera roll
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos to upload an image.");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your camera to take a photo.");
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
    }
  };

  const handleCompleteWork = async () => {
    if (!proofImage) {
      Alert.alert('Missing Photo', 'Please upload or take a photo as proof of completion.');
      return;
    }
    
    if (!completionNotes.trim()) {
      Alert.alert('Missing Notes', 'Please add notes about the completion.');
      return;
    }
    
    Alert.alert(
      'Complete Work',
      'Are you sure you want to mark this work as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              setSubmitting(true);
              
              // Upload proof image first
              const { downloadURL, error: uploadError } = await uploadCompletionImage(complaintId, proofImage);
              
              if (uploadError) {
                Alert.alert('Error', 'Failed to upload completion image');
                setSubmitting(false);
                return;
              }
              
              // Mark as complete with image and notes
              const result = await completeComplaint(complaintId, {
                completedBy: currentUser.uid,
                completedDescription: completionNotes,
                completedImage: downloadURL
              });
              
              if (result.error) {
                Alert.alert('Error', result.error || 'Failed to mark work as completed');
                setSubmitting(false);
                return;
              }
              
              setSubmitting(false);
              Alert.alert(
                'Success',
                'Work has been marked as completed successfully!',
                [
                  { 
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } catch (error) {
              console.error('Error completing work:', error);
              Alert.alert('Error', 'An unexpected error occurred');
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const handleAssignTechnician = async () => {
    if (!selectedTechId) {
      Alert.alert('Selection Required', 'Please select a technician to assign this complaint to.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Find the selected technician to get their details
      const selectedTech = technicians.find(tech => tech.id === selectedTechId);
      
      const result = await assignComplaint(
        complaintId, 
        selectedTechId,
        currentUser.uid // Admin who is assigning the technician
      );
      
      if (result.error) {
        Alert.alert('Error', result.error || 'Failed to assign technician');
        setSubmitting(false);
        return;
      }
      
      setSubmitting(false);
      setShowTechModal(false);
      
      Alert.alert(
        'Success',
        `Complaint assigned to ${selectedTech.name} successfully!`,
        [{ text: 'OK', onPress: () => fetchComplaintDetails() }]
      );
    } catch (error) {
      console.error('Error assigning technician:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      setSubmitting(false);
    }
  };

  const handleRateComplaint = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const result = await rateComplaint(complaintId, rating, feedback);
      
      if (result.error) {
        Alert.alert('Error', result.error || 'Failed to submit rating');
        setSubmitting(false);
        return;
      }
      
      setSubmitting(false);
      setShowRatingModal(false);
      
      Alert.alert(
        'Thank You',
        'Your feedback has been submitted successfully!',
        [{ text: 'OK', onPress: () => fetchComplaintDetails() }]
      );
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading complaint details...</Text>
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Complaint not found</Text>
        <CustomButton 
          title="Go Back" 
          onPress={() => navigation.goBack()} 
          variant="outline"
        />
      </View>
    );
  }

  const statusColor = 
    complaint.status === 'completed' ? colors.success : 
    complaint.status === 'in-progress' ? colors.accent : 
    colors.pending;

  const canComplete = userRole === 'technician' && complaint.status === 'in-progress' && 
                      complaint.technicianId === currentUser.uid;
  
  const canAssign = userRole === 'admin' && complaint.status === 'pending';
  
  const canRate = userRole === 'user' && complaint.status === 'completed' && 
                  complaint.userId === currentUser.uid && !complaint.rating;

  const renderTechnicianSelection = () => (
    <Modal visible={showTechModal} transparent animationType="fade" onRequestClose={() => setShowTechModal(false)}>
      <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setShowTechModal(false)}>
        <View style={styles.modalPanel}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Select Technician</Text>
          </View>
          <ScrollView style={styles.techListContainer}>
            {technicians.length > 0 ? technicians.map(tech => (
              <TouchableOpacity 
                key={tech.id} 
                style={[styles.techItem, selectedTechId === tech.id && styles.techItemActive]}
                onPress={() => setSelectedTechId(tech.id)}
              >
                <View style={styles.techInfo}>
                  <Text style={styles.techName}>{tech.name}</Text>
                  <Text style={styles.techDept}>{tech.department || 'General'}</Text>
                </View>
                {selectedTechId === tech.id && (
                  <CheckCircleIcon size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )) : (
              <Text style={styles.noTechText}>No technicians available</Text>
            )}
          </ScrollView>
          <View style={styles.modalActions}>
            <CustomButton 
              title="Cancel" 
              onPress={() => setShowTechModal(false)} 
              variant="outline"
              size="small"
              style={styles.modalButton}
            />
            <CustomButton 
              title="Assign" 
              onPress={handleAssignTechnician} 
              disabled={!selectedTechId || submitting}
              loading={submitting}
              size="small"
              style={styles.modalButton}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderRatingModal = () => (
    <Modal visible={showRatingModal} transparent animationType="fade" onRequestClose={() => setShowRatingModal(false)}>
      <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setShowRatingModal(false)}>
        <View style={styles.modalPanel}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Rate This Service</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>How would you rate the service?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity 
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <StarIcon 
                    size={36} 
                    color={star <= rating ? colors.warning : colors.border} 
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.feedbackLabel}>Additional Feedback (Optional)</Text>
            <TextInput
              style={styles.feedbackInput}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Tell us about your experience..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.modalActions}>
            <CustomButton 
              title="Cancel" 
              onPress={() => setShowRatingModal(false)} 
              variant="outline"
              size="small"
              style={styles.modalButton}
            />
            <CustomButton 
              title="Submit Rating" 
              onPress={handleRateComplaint} 
              disabled={rating === 0 || submitting}
              loading={submitting}
              size="small"
              style={styles.modalButton}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaint Details</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>
              {complaint?.title || ''}
            </Text>
            <View style={[styles.statusChip, { backgroundColor: statusColor }]}>
              <Text style={styles.statusChipText}>
                {complaint?.status === 'completed' ? 'Completed' : 
                 complaint?.status === 'in-progress' ? 'In Progress' : 
                 'Pending'}
              </Text>
            </View>
          </View>
          {complaint.type && (
            <View style={styles.typeBadgeContainer}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{complaint.type.toUpperCase()}</Text>
              </View>
              <Text style={styles.typeExplanation}>Requires {complaint.type} expertise</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <MapPinIcon size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{complaint.location}{complaint.place ? ` - ${complaint.place}` : ''}</Text>
          </View>
          <View style={styles.detailRow}>
            <CalendarIcon size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>Submitted: {complaint.date}</Text>
          </View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Department:</Text><Text style={styles.detailText}>{complaint.department || 'General'}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Reported by:</Text><Text style={styles.detailText}>{complaint.userId}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Technician:</Text><Text style={styles.detailText}>{complaint.technicianId || 'Unassigned'}</Text></View>
          {complaint.submittedAt && (
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Submitted:</Text><Text style={styles.detailText}>{new Date(complaint.submittedAt).toLocaleString()}</Text></View>
          )}
          {complaint.assignedAt && (
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Assigned:</Text><Text style={styles.detailText}>{new Date(complaint.assignedAt).toLocaleString()}</Text></View>
          )}
          {complaint.completedAt && (
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Completed:</Text><Text style={styles.detailText}>{new Date(complaint.completedAt).toLocaleString()}</Text></View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{complaint.description}</Text>
        </View>

        {complaint.image && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Submitted Photo</Text>
            <Image source={{ uri: complaint.image }} style={styles.complaintImage} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completion Proof</Text>
          {complaint.completedImage && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subSectionLabel}>Technician Submission</Text>
              <Image source={{ uri: complaint.completedImage }} style={styles.complaintImage} />
              {complaint.completedDescription && (
                <Text style={styles.techNote}>{complaint.completedDescription}</Text>
              )}
            </View>
          )}
          {!readOnly && proofImage && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subSectionLabel}>Your Upload</Text>
              <Image source={{ uri: proofImage }} style={styles.complaintImage} />
              <View style={styles.imageCaptionRow}>
                <Text style={styles.imageCaption}>Completion photo uploaded</Text>
                <TouchableOpacity onPress={pickImage}><Text style={styles.changePhotoText}>Change Photo</Text></TouchableOpacity>
              </View>
            </View>
          )}
          {!readOnly && !proofImage && (
            <View style={styles.uploadSection}>
              <Text style={styles.uploadText}>Upload a completion photo</Text>
              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                  <View style={styles.iconContainer}><Ionicons name="camera" size={28} color={colors.primary} /></View>
                  <Text style={styles.uploadButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                  <View style={styles.iconContainer}><Feather name="image" size={28} color={colors.primary} /></View>
                  <Text style={styles.uploadButtonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {readOnly && !complaint.completedImage && (
            <Text style={styles.noProofText}>No completion proof uploaded yet.</Text>
          )}
        </View>

        {canComplete && (
          <View style={styles.completionFormContainer}>
            <Text style={styles.completionFormTitle}>Mark as Completed</Text>
            <TextInput
              style={styles.completionNotes}
              value={completionNotes}
              onChangeText={setCompletionNotes}
              placeholder="Enter completion notes..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
            <CustomButton
              title="Mark as Completed"
              onPress={handleCompleteWork}
              icon={CheckCircleIcon}
              variant="success"
              size="large"
              disabled={!proofImage || !completionNotes || submitting}
              loading={submitting}
            />
          </View>
        )}
        
        {canAssign && (
          <View style={styles.actionButtonContainer}>
            <CustomButton
              title="Assign to Technician"
              onPress={() => setShowTechModal(true)}
              variant="primary"
              size="large"
              disabled={submitting}
            />
          </View>
        )}
        
        {canRate && (
          <View style={styles.actionButtonContainer}>
            <CustomButton
              title="Rate this Service"
              onPress={() => setShowRatingModal(true)}
              icon={StarIcon}
              variant="outline"
              size="large"
              disabled={submitting}
            />
          </View>
        )}
      </ScrollView>
      
      {renderTechnicianSelection()}
      {renderRatingModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 18,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.surface,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusChipText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  subSectionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600'
  },
  techNote: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  typeBadgeContainer: {
    marginBottom: 16,
  },
  typeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  typeExplanation: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  description: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  complaintImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  uploadSection: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
  },
  uploadText: {
    color: colors.textSecondary,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  uploadButton: {
    alignItems: 'center',
    width: 120,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  uploadButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  imageCaptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageCaption: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  changePhotoText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  noProofText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic'
  },
  completionFormContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  completionFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  completionNotes: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  actionButtonContainer: {
    marginTop: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalPanel: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: 16,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  techListContainer: {
    maxHeight: 300,
  },
  techItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  techItemActive: {
    backgroundColor: `${colors.primary}10`,
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  techDept: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  noTechText: {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  // Rating modal styles
  ratingContainer: {
    padding: 16,
  },
  ratingLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  feedbackLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default ComplaintDetailScreen;