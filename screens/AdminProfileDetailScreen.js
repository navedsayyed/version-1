import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../styles/colors';

// Mock admin data (could be moved to a centralized auth/user context later)
const currentAdmin = {
  id: 'admin001',
  name: 'System Admin',
  email: 'admin@example.com',
  phone: '+1 (555) 000-1111',
  department: 'Administration',
  role: 'admin',
  joinedDate: '2024-01-15',
  managedDepartments: ['IT', 'Electrical', 'Plumbing'],
  avatar: 'https://randomuser.me/api/portraits/men/12.jpg'
};

const AdminProfileDetailScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    name: currentAdmin.name,
    email: currentAdmin.email,
    phone: currentAdmin.phone,
    avatar: currentAdmin.avatar,
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleEditPress = () => setIsEditing(!isEditing);

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => setIsEditing(false) }
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } }
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfile(p => ({ ...p, avatar: result.assets[0].uri }));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Profile</Text>
        <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
          <MaterialIcons name={isEditing ? 'close' : 'edit'} size={22} color={colors.primary} />
          <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        {isEditing && (
          <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
            <MaterialIcons name="photo-camera" size={18} color="white" />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoCard}>
        <Field label="Full Name" value={profile.name} editable={isEditing} onChange={t => setProfile(p => ({ ...p, name: t }))} />
        <Field label="Email" value={profile.email} editable={isEditing} keyboardType="email-address" onChange={t => setProfile(p => ({ ...p, email: t }))} />
        <Field label="Phone" value={profile.phone} editable={isEditing} keyboardType="phone-pad" onChange={t => setProfile(p => ({ ...p, phone: t }))} />
        <StaticField label="Department" value={currentAdmin.department} />
        <StaticField label="Role" value={currentAdmin.role} />
        <StaticField label="Joined Date" value={currentAdmin.joinedDate} />
        <StaticField label="Managed Departments" value={currentAdmin.managedDepartments.join(', ')} />
      </View>

      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={22} color="white" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

const Field = ({ label, value, editable, onChange, keyboardType }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {editable ? (
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={label}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType || 'default'}
      />
    ) : (
      <Text style={styles.fieldValue}>{value}</Text>
    )}
  </View>
);

const StaticField = ({ label, value }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  editButton: { flexDirection: 'row', alignItems: 'center' },
  editButtonText: { marginLeft: 6, color: colors.primary, fontSize: 16, fontWeight: '600' },
  avatarSection: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.card, borderWidth: 3, borderColor: colors.primary },
  changePhotoButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 22, marginTop: 12 },
  changePhotoText: { color: 'white', marginLeft: 6, fontWeight: '600' },
  infoCard: { backgroundColor: colors.card, marginHorizontal: 20, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  fieldValue: { fontSize: 16, color: colors.text, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, fontSize: 16, color: colors.text, backgroundColor: colors.surface },
  saveButton: { backgroundColor: colors.success, marginHorizontal: 20, marginTop: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { backgroundColor: colors.error, marginHorizontal: 20, marginTop: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  logoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});

export default AdminProfileDetailScreen;
