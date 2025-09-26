import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { currentUser } from '../utils/userData';
import { colors } from '../styles/colors';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    avatar: currentUser.avatar,
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleEditPress = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // In a real app, we would save changes to a server
    Alert.alert(
      "Success",
      "Profile updated successfully!",
      [{ text: "OK", onPress: () => setIsEditing(false) }]
    );
    // Update the currentUser data in a real implementation
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => {
            // Navigate to Login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } 
        }
      ]
    );
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfile({
        ...profile,
        avatar: result.assets[0].uri
      });
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
          <MaterialIcons name={isEditing ? "close" : "edit"} size={24} color="#00BFFF" />
          <Text style={styles.editButtonText}>{isEditing ? "Cancel" : "Edit"}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: profile.avatar }} 
          style={styles.avatar} 
        />
        {isEditing && (
          <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
            <MaterialIcons name="photo-camera" size={20} color="white" />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Full Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => setProfile({...profile, name: text})}
              placeholder="Enter your full name"
            />
          ) : (
            <Text style={styles.infoValue}>{profile.name}</Text>
          )}
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(text) => setProfile({...profile, email: text})}
              placeholder="Enter your email address"
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.infoValue}>{profile.email}</Text>
          )}
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Phone Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(text) => setProfile({...profile, phone: text})}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.infoValue}>{profile.phone}</Text>
          )}
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Department</Text>
          <Text style={styles.infoValue}>{currentUser.department}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>{currentUser.role}</Text>
        </View>
      </View>
      
      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="white" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      
      {/* Add extra space at bottom to prevent tab bar overlap */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollViewContent: {
    paddingBottom: 120, // Add more padding to ensure content is above tab bar
  },
  bottomSpacer: {
    height: 100, // Extra space at the bottom
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    marginLeft: 5,
    color: '#00BFFF',
    fontSize: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BFFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  changePhotoText: {
    color: 'white',
    marginLeft: 5,
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  saveButton: {
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;