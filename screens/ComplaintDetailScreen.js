import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { CustomButton } from '../components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, Feather } from '@expo/vector-icons';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UploadIcon,
  CheckCircleIcon
} from '../components/icons';

const ComplaintDetailScreen = ({ route, navigation }) => {
  const { complaint } = route.params;
  const [proofImage, setProofImage] = useState(null);

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

  const handleSubmit = () => {
    if (!proofImage) {
      Alert.alert('Missing Photo', 'Please upload or take a photo as proof of completion.');
      return;
    }
    
    Alert.alert(
      'Complete Work',
      'Are you sure you want to mark this work as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // In a real app, we would send this data to a server
            // For this demo, we'll just show a success message and navigate back
            Alert.alert(
              'Success',
              'Work has been marked as completed successfully!',
              [
                { 
                  text: 'OK',
                  onPress: () => navigation.navigate('AssignedWork')
                }
              ]
            );
          }
        }
      ]
    );
  };

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
          <Text style={styles.sectionTitle}>{complaint.title}</Text>
          
          {complaint.type && (
            <View style={styles.typeBadgeContainer}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)}
                </Text>
              </View>
              <Text style={styles.typeExplanation}>
                This complaint requires {complaint.type} expertise
              </Text>
            </View>
          )}
          
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
          {proofImage ? (
            <View>
              <Image source={{ uri: proofImage }} style={styles.complaintImage} />
              <View style={styles.imageCaptionRow}>
                <Text style={styles.imageCaption}>Completion photo uploaded</Text>
                <TouchableOpacity onPress={pickImage}>
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.uploadSection}>
              <Text style={styles.uploadText}>Please upload a photo as proof of work completion</Text>
              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="camera" size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.uploadButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                  <View style={styles.iconContainer}>
                    <Feather name="image" size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.uploadButtonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        
        <CustomButton
          title="Mark as Completed"
          onPress={handleSubmit}
          icon={CheckCircleIcon}
          variant="success"
          size="large"
          disabled={!proofImage}
        />
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
});

export default ComplaintDetailScreen;