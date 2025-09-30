import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Alert, Modal, Image, TouchableOpacity, FlatList, Platform, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import QRScannerScreen from '../components/QRScannerScreen';
import { 
  BellIcon, 
  FileTextIcon, 
  CameraIcon, 
  UploadIcon, 
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon
} from '../components/icons';
import { 
  ad  return (
    <TouchableOpacity onPress={handlePress} style={[styles.tabBtn, isActive && styles.tabBtnActive]} activeOpacity={0.75}>
      <View>
        <Icon size={20} color={isActive ? colors.primary : colors.textSecondary} />
      </View>
      <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>{safeLabel}</Text>
    </TouchableOpacity>
  );aint, 
  getComplaints, 
  auth, 
  db,
  uploadComplaintImage,
  uploadMultipleComplaintImages
} from '../firebase/index';
import { doc, updateDoc } from 'firebase/firestore';

// CLEAN REWRITE OF USER DASHBOARD (fixing prior corruption & nesting issues)
// Key changes:
// 1. Removed corrupted preamble and stray JSX fragments
// 2. Dropdown moved to a single top-level Modal (no FlatList inside parent ScrollView)
// 3. Clear separation of Add Complaint vs My Complaints tabs
// 4. Simplified styles (removed duplicated style keys)
// 5. Guarded all optional resources & removed unused imports

export const UserDashboard = ({ navigation }) => {
  /* -------------------------------- State -------------------------------- */
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'list'
  const [complaints, setComplaints] = useState([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [complaintsTab, setComplaintsTab] = useState('pending'); // inner tab
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);

  const [complaintForm, setComplaintForm] = useState({
    title: '',
    location: '',
    place: '',
    description: '',
    image: null,
    class: '',
    floor: '',
    department: '',
    type: ''
  });

  /* -------------------------- Complaint Type List ------------------------ */
  const complaintTypes = [
    { label: 'Electrical', value: 'electrical', category: 'Infrastructure' },
    { label: 'Plumbing', value: 'plumbing', category: 'Infrastructure' },
    { label: 'Lighting', value: 'lighting', category: 'Infrastructure' },
    { label: 'Air Conditioning', value: 'ac', category: 'Infrastructure' },
    { label: 'Heating', value: 'heating', category: 'Infrastructure' },
    { label: 'Internet/Network', value: 'network', category: 'Infrastructure' },
    { label: 'Power Outage', value: 'power', category: 'Infrastructure' },
    { label: 'Cleanliness', value: 'cleanliness', category: 'Maintenance' },
    { label: 'Furniture Repair', value: 'furniture', category: 'Maintenance' },
    { label: 'Wall/Paint Damage', value: 'wall', category: 'Maintenance' },
    { label: 'Ceiling Damage', value: 'ceiling', category: 'Maintenance' },
    { label: 'Floor Damage', value: 'floor', category: 'Maintenance' },
    { label: 'Window/Glass', value: 'window', category: 'Maintenance' },
    { label: 'Door Issues', value: 'door', category: 'Maintenance' },
    { label: 'Computer/IT', value: 'computer', category: 'Equipment' },
    { label: 'Projector/Display', value: 'projector', category: 'Equipment' },
    { label: 'Lab Equipment', value: 'lab', category: 'Equipment' },
    { label: 'Teaching Equipment', value: 'teaching', category: 'Equipment' },
    { label: 'Security', value: 'security', category: 'Safety' },
    { label: 'Fire Hazard', value: 'fire', category: 'Safety' },
    { label: 'Hazardous Materials', value: 'hazmat', category: 'Safety' },
    { label: 'Pest Control', value: 'pest', category: 'Safety' },
    { label: 'Other', value: 'other', category: 'Other' }
  ];

  /* -------------------------- Fetch complaints on mount and tab change ------------------------ */
  useEffect(() => {
    fetchUserComplaints();
  }, [complaintsTab]);

  const fetchUserComplaints = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to view complaints');
        navigation.navigate('Login');
        return;
      }
      
      // Get complaints for the current user
      const status = complaintsTab === 'completed' ? 'completed' : complaintsTab === 'in-progress' ? 'in-progress' : 'pending';
      try {
        const result = await getComplaints({ 
          userId: currentUser.uid,
          status: status
        });
        
        if (result?.error) {
          console.error('Error getting complaints:', result.error);
          Alert.alert('Error', 'Failed to load complaints. Please try again later.');
          setComplaints([]);
        } else if (result?.complaints) {
          setComplaints(Array.isArray(result.complaints) ? result.complaints : []);
        } else {
          setComplaints([]);
        }
      } catch (fetchError) {
        console.error('Error in getComplaints:', fetchError);
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      Alert.alert('Error', 'Failed to load complaints');
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------- Permissions on mount ----------------------- */
  useEffect(() => {
    (async () => {
      try {
        const cam = await ImagePicker.requestCameraPermissionsAsync();
        const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cam.status !== 'granted' || lib.status !== 'granted') {
          Alert.alert('Permission required', 'Camera & gallery permissions are needed for photos.');
        }
      } catch (e) { console.log('Permission error', e); }
    })();
  }, []);

  /* ------------------------------- Handlers ------------------------------ */
  const handleSetField = (field, value) => {
    if (field) {
      setComplaintForm(p => ({ ...p, [field]: value === undefined ? '' : value }));
    }
  };

  const handleQRScan = () => {
    // Check camera permissions before showing scanner
    (async () => {
      try {
        const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
        if (!cameraStatus.granted) {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Camera Permission', 'Camera access is required to scan QR codes');
            return;
          }
        }
        setShowQRScanner(true);
      } catch (error) {
        console.error('Permission check error:', error);
        Alert.alert('Error', 'Failed to check camera permissions');
      }
    })();
  };

  const handleScanComplete = (qrData) => {
    // Guard against null or undefined QR data
    if (!qrData) {
      Alert.alert('Error', 'Invalid QR code data');
      setShowQRScanner(false);
      return;
    }
    
    const upd = {
      class: (qrData?.class || '').toString(),
      floor: (qrData?.floor || '').toString(),
      department: (qrData?.department || '').toString(),
      location: `Building ${(qrData?.building || 'A').toString()} - Floor ${(qrData?.floor || '1').toString()}`,
      place: `${(qrData?.department || 'General').toString()} - Room ${(qrData?.class || '101').toString()}`
    };
    
    setComplaintForm(p => ({ ...p, ...upd }));
    Alert.alert('QR Scanned', `${upd.location}\n${upd.place}`);
    setShowQRScanner(false);
  };

  const takePhoto = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ 
        quality: 0.7,
        allowsMultipleSelection: true
      });
      
      if (res && !res.canceled && res.assets && Array.isArray(res.assets)) {
        // Filter out any invalid assets
        const validAssets = res.assets.filter(asset => asset && typeof asset.uri === 'string');
        if (validAssets.length > 0) {
          const selectedImages = validAssets.map(asset => asset.uri);
          
          // Safely handle existing images array
          const currentImages = Array.isArray(images) ? images : [];
          setImages(currentImages => [...currentImages, ...selectedImages]);
          
          if (selectedImages.length > 0) {
            handleSetField('image', selectedImages[0]); // Set the first image as the main one
          }
        }
      }
      
      setShowPhotoOptions(false);
    } catch (e) { 
      console.error('Camera error:', e);
      Alert.alert('Error', 'Camera failed'); 
      setShowPhotoOptions(false);
    }
  };

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ 
        quality: 0.7,
        allowsMultipleSelection: true,
        selectionLimit: 5
      });
      
      if (res && !res.canceled && res.assets && Array.isArray(res.assets)) {
        // Filter out any invalid assets
        const validAssets = res.assets.filter(asset => asset && typeof asset.uri === 'string');
        if (validAssets.length > 0) {
          const selectedImages = validAssets.map(asset => asset.uri);
          
          // Safely handle existing images array
          const currentImages = Array.isArray(images) ? images : [];
          
          // Check if adding these would exceed the limit
          if (currentImages.length + selectedImages.length > 5) {
            Alert.alert('Limit Reached', 'Maximum 5 images allowed');
            const remainingSlots = Math.max(0, 5 - currentImages.length);
            if (remainingSlots > 0) {
              setImages([...currentImages, ...selectedImages.slice(0, remainingSlots)]);
              if (currentImages.length === 0 && selectedImages.length > 0) {
                handleSetField('image', selectedImages[0]); // Set the first image as the main one
              }
            }
          } else {
            setImages([...currentImages, ...selectedImages]);
            if (currentImages.length === 0 && selectedImages.length > 0) {
              handleSetField('image', selectedImages[0]); // Set the first image as the main one
            }
          }
        }
      }
      
      setShowPhotoOptions(false);
    } catch (e) { 
      console.error('Image picker error:', e);
      Alert.alert('Error', 'Image pick failed'); 
      setShowPhotoOptions(false);
    }
  };

  const submitComplaint = async () => {
    try {
      setIsLoading(true);
      
      // Safely extract values with fallbacks to empty string
      const title = complaintForm?.title || '';
      const type = complaintForm?.type || '';
      const description = complaintForm?.description || '';
      const location = complaintForm?.location || '';
      const place = complaintForm?.place || '';
      
      if (!title || !type || !description || !location || !place) {
        Alert.alert('Missing Fields', 'Fill Title, Type, Location, Place, Description');
        setIsLoading(false);
        return;
      }
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to submit a complaint');
        navigation.navigate('Login');
        setIsLoading(false);
        return;
      }
      
      // Create the complaint data
      const complaintData = {
        title,
        type,
        description,
        location,
        place,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        department: complaintForm.department || null,
        class: complaintForm.class || null,
        floor: complaintForm.floor || null,
      };
      
      // Add complaint to Firestore
      const { complaintId, error } = await addComplaint(complaintData);
      
      if (error) {
        Alert.alert('Error', 'Failed to submit complaint');
        setIsLoading(false);
        return;
      }
      
      // Upload images if any
      if (Array.isArray(images) && images.length > 0) {
        try {
          const { downloadURLs, error: uploadError } = await uploadMultipleComplaintImages(complaintId, images);
          
          if (uploadError) {
            console.error('Error uploading images:', uploadError);
            // We don't want to fail the complaint submission if image upload fails
            // Just show a warning
            Alert.alert('Warning', 'Complaint saved but images failed to upload');
          } else if (Array.isArray(downloadURLs) && downloadURLs.length > 0) {
            // Update complaint with image URLs
            await updateDoc(doc(db, 'complaints', complaintId), {
              images: downloadURLs
            });
          }
        } catch (uploadErr) {
          console.error('Error in image upload process:', uploadErr);
          Alert.alert('Warning', 'Complaint saved but there was an issue with image uploads');
        }
      }
      
      setIsLoading(false);
      setShowSuccess(true);
      setComplaintForm({ title: '', location: '', place: '', description: '', image: null, class: '', floor: '', department: '', type: '' });
      setImages([]);
      
      setTimeout(() => {
        setShowSuccess(false);
        // Switch to the list tab to see the new complaint
        setActiveTab('list');
        setComplaintsTab('pending');
        fetchUserComplaints();
      }, 1500);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', 'Failed to submit complaint');
      setIsLoading(false);
    }
  };

  /* ---------------------------- Render Sections -------------------------- */
  const AddComplaintTab = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.sectionTitle}>Location (QR Optional)</Text>
        <CustomButton title="Scan QR Code" icon={CameraIcon} variant="outline" onPress={handleQRScan} />
        {(complaintForm.department || complaintForm.floor || complaintForm.class) && (
          <View style={styles.scannedBox}>
            {complaintForm.department ? <Text style={styles.scannedLine}>Dept: {complaintForm.department}</Text> : null}
            {complaintForm.floor ? <Text style={styles.scannedLine}>Floor: {complaintForm.floor}</Text> : null}
            {complaintForm.class ? <Text style={styles.scannedLine}>Room: {complaintForm.class}</Text> : null}
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Complaint Details</Text>
        <Field label="Title *">
          <TextInput style={styles.input} value={complaintForm.title || ''} onChangeText={v => handleSetField('title', v)} placeholder="Short title" placeholderTextColor={colors.textSecondary} />
        </Field>

        <Field label="Complaint Type *">
          <TouchableOpacity style={[styles.dropdownSelector, complaintForm.type && styles.dropdownSelectorActive]} onPress={() => setShowTypeDropdown(true)}>
            <Text style={[styles.dropdownText, !complaintForm.type && styles.placeholder]}>
              {complaintForm.type ? complaintTypes.find(t => t.value === complaintForm.type)?.label : 'Select type'}
            </Text>
            <View><Feather name="chevron-down" size={18} color={complaintForm.type ? colors.primary : colors.textSecondary} /></View>
          </TouchableOpacity>
        </Field>

        <Field label="Location *">
          <TextInput style={styles.input} value={complaintForm.location || ''} onChangeText={v => handleSetField('location', v)} placeholder="Building & Floor" placeholderTextColor={colors.textSecondary} />
        </Field>
        <Field label="Place *">
          <TextInput style={styles.input} value={complaintForm.place || ''} onChangeText={v => handleSetField('place', v)} placeholder="Dept / Room" placeholderTextColor={colors.textSecondary} />
        </Field>
        <Field label="Description *">
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={complaintForm.description} 
            onChangeText={v => handleSetField('description', v)} 
            multiline={true}
            textAlignVertical="top"
            placeholder="Describe the issue" 
            placeholderTextColor={colors.textSecondary} 
          />
        </Field>

        <Field label="Photos (optional)">
          <View style={styles.imageGallery}>
            {images.length > 0 ? (
              <>
                <ScrollView horizontal style={styles.imagePreviewScroll}>
                  {images.map((uri, index) => (
                    <View key={index} style={styles.imagePreviewContainer}>
                      <Image source={{ uri }} style={styles.preview} />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => {
                          const newImages = [...images];
                          newImages.splice(index, 1);
                          setImages(newImages);
                          if (index === 0 && newImages.length > 0) {
                            handleSetField('image', newImages[0]);
                          } else if (newImages.length === 0) {
                            handleSetField('image', null);
                          }
                        }}
                      >
                        <Text style={styles.removeImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.imageCountBadge}>
                  <Text style={styles.imageCountText}>{images.length} photo{images.length !== 1 ? 's' : ''}</Text>
                </View>
                <CustomButton title="Add More Photos" variant="outline" size="small" onPress={() => setShowPhotoOptions(true)} />
              </>
            ) : (
              <CustomButton title="Add Photos" icon={UploadIcon} variant="outline" onPress={() => setShowPhotoOptions(true)} />
            )}
          </View>
        </Field>

        <CustomButton 
          title="Submit Complaint" 
          icon={CheckCircleIcon} 
          size="large" 
          onPress={submitComplaint} 
          disabled={isLoading}
          loading={isLoading}
        />
      </Card>
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const filteredComplaints = complaints;
  
  const MyComplaintsTab = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.innerTabs}>
        {['pending', 'in-progress', 'completed'].map(k => (
          <TouchableOpacity 
            key={k} 
            style={[styles.innerTabBtn, complaintsTab === k && styles.innerTabBtnActive]} 
            onPress={() => {
              if (k !== complaintsTab) {
                setComplaintsTab(k);
                setIsLoading(true);
                // Prevent rapid tab changes
                setTimeout(() => {
                  fetchUserComplaints();
                }, 100);
              }
            }}
          >
            <Text style={[styles.innerTabText, complaintsTab === k && styles.innerTabTextActive]}>
              {k === 'in-progress' ? 'In Progress' : k === 'completed' ? 'Completed' : 'Pending'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.listContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading complaints...</Text>
          </View>
        ) : filteredComplaints.length ? filteredComplaints.map(c => (
          <TouchableOpacity 
            key={c.id} 
            onPress={() => navigation.navigate('ComplaintDetail', { complaintId: c.id })}
          >
            <Card style={styles.cCard}>
              <View style={styles.cHeader}>
                <Text style={styles.cTitle}>{c.title}</Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: 
                    c.status === 'completed' ? colors.success : 
                    c.status === 'in-progress' ? colors.accent : 
                    colors.pending 
                }]}>
                  <Text style={styles.statusBadgeText}>
                    {c.status === 'completed' ? 'Completed' : 
                     c.status === 'in-progress' ? 'In Progress' : 'Pending'}
                  </Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <MapPinIcon size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {c.location ? c.location : 'Unknown'}{c.place ? ` - ${c.place}` : ''}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <CalendarIcon size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {c.date ? new Date(c.date).toLocaleDateString() : 'No date'}
                </Text>
              </View>
              <Text numberOfLines={3} style={styles.cDesc}>{c.description}</Text>
              {c.images && c.images.length > 0 ? (
                <View style={styles.complaintImagesContainer}>
                  {c.images.slice(0, 3).map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.complaintImageThumb} />
                  ))}
                  {c.images.length > 3 && (
                    <View style={styles.moreImagesOverlay}>
                      <Text style={styles.moreImagesText}>+{c.images.length - 3}</Text>
                    </View>
                  )}
                </View>
              ) : null}
            </Card>
          </TouchableOpacity>
        )) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No complaints found.</Text>
            {complaintsTab !== 'pending' && (
              <CustomButton 
                title="Create New Complaint" 
                variant="outline" 
                size="small" 
                onPress={() => setActiveTab('add')} 
              />
            )}
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );

  /* ------------------------------- Dropdown ------------------------------- */
  const renderDropdownModal = () => (
    <Modal visible={showTypeDropdown} transparent animationType="fade" onRequestClose={() => setShowTypeDropdown(false)}>
      <TouchableOpacity activeOpacity={1} style={styles.ddOverlay} onPress={() => setShowTypeDropdown(false)}>
        <View style={styles.ddPanel}>
          <View style={styles.ddHeader}><Text style={styles.ddHeaderText}>Select Complaint Type</Text></View>
          <FlatList
            data={Array.isArray(complaintTypes) ? complaintTypes : []}
            keyExtractor={(item) => item?.value || String(Math.random())}
            renderItem={({ item, index }) => {
              if (!item) return null;
              
              const prev = index > 0 ? complaintTypes[index - 1] : null;
              const showCat = !prev || prev?.category !== item?.category;
              const currentCategory = item?.category || 'Other';
              const currentLabel = item?.label || '';
              const currentType = complaintForm?.type || '';
              const currentValue = item?.value || '';
              
              return (
                <>
                  {showCat && <Text style={styles.ddCategory}>{currentCategory}</Text>}
                  <TouchableOpacity 
                    style={[styles.ddItem, currentType === currentValue && styles.ddItemActive]} 
                    onPress={() => { 
                      handleSetField('type', currentValue); 
                      setShowTypeDropdown(false); 
                    }}
                  >
                    <Text style={[styles.ddItemText, currentType === currentValue && styles.ddItemTextActive]}>
                      {currentLabel}
                    </Text>
                    {currentType === currentValue && <View><Feather name="check" size={16} color={colors.primary} /></View>}
                  </TouchableOpacity>
                </>
              );
            }}
            style={{ maxHeight: 320 }}
          />
          <TouchableOpacity style={styles.ddCloseBtn} onPress={() => setShowTypeDropdown(false)}>
            <Text style={styles.ddCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  /* ------------------------------- Main UI -------------------------------- */
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>User Dashboard</Text>
        <BellIcon size={22} color={colors.text} />
      </View>
      <View style={styles.tabBar}>
        <TabButton 
          active={activeTab==='add'} 
          onPress={() => {
            setActiveTab('add');
            // Make sure the form is reset if we have any stale data
            if (!complaintForm) {
              setComplaintForm({
                title: '',
                location: '',
                place: '',
                description: '',
                image: null,
                class: '',
                floor: '',
                department: '',
                type: ''
              });
            }
          }} 
          label="New Complaint" 
          icon={FileTextIcon} 
        />
        <TabButton 
          active={activeTab==='list'} 
          onPress={() => {
            setActiveTab('list');
            // Refresh complaints when switching to list tab
            fetchUserComplaints();
          }} 
          label="My Complaints" 
          icon={ClockIcon} 
        />
      </View>
      {activeTab === 'add' ? <AddComplaintTab /> : <MyComplaintsTab />}

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.centerOverlay}>
          <View style={styles.successBox}>
            <CheckCircleIcon size={56} color={colors.success} />
            <Text style={styles.successTitle}>Submitted!</Text>
            <Text style={styles.successMsg}>Complaint recorded.</Text>
          </View>
        </View>
      </Modal>

      {/* Photo Options */}
      <Modal visible={showPhotoOptions} transparent animationType="fade">
        <View style={styles.centerOverlay}>
          <View style={styles.photoSheet}>
            <Text style={styles.photoTitle}>Add Photo</Text>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}><CameraIcon size={22} color={colors.primary} /><Text style={styles.photoBtnText}>Take Photo</Text></TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}><UploadIcon size={22} color={colors.secondary} /><Text style={styles.photoBtnText}>From Gallery</Text></TouchableOpacity>
            <TouchableOpacity style={styles.photoCancel} onPress={() => setShowPhotoOptions(false)}><Text style={styles.photoCancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Scanner */}
      <Modal visible={showQRScanner} animationType="slide">
        <QRScannerScreen onScan={handleScanComplete} onClose={() => setShowQRScanner(false)} />
      </Modal>

      {renderDropdownModal()}
    </View>
  );
};

/* ----------------------------- Reusable Components ----------------------------- */
const Field = ({ label, children }) => {
  // Defensive null check for the label
  const safeLabel = label || '';
  
  return (
    <View style={styles.field}> 
      <Text style={styles.fieldLabel}>{safeLabel}</Text>
      {children}
    </View>
  );
};

const TabButton = ({ active, onPress, label, icon: Icon }) => {
  // Defensive null checks
  const safeLabel = label || '';
  const isActive = Boolean(active);
  const handlePress = typeof onPress === 'function' ? onPress : () => {};
  
  // If no icon is provided, render just the text
  if (!Icon) {
    return (
      <TouchableOpacity onPress={handlePress} style={[styles.tabBtn, isActive && styles.tabBtnActive]} activeOpacity={0.75}>
        <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>{safeLabel}</Text>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity onPress={handlePress} style={[styles.tabBtn, isActive && styles.tabBtnActive]} activeOpacity={0.75}>
      <View>
        <Icon size={18} color={isActive ? colors.primary : colors.textSecondary} />
      </View>
      <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>{safeLabel}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pending: {
    backgroundColor: colors.warning, // Add this color to your colors object
  },
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.surface },
  topTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBtn: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabBtnText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  tabBtnTextActive: { color: colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 160, gap: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, fontSize: 15, color: colors.text },
  textArea: { 
    height: 120, 
    textAlignVertical: 'top', 
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 120
  },
  dropdownSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14 },
  dropdownSelectorActive: { borderColor: colors.primary },
  dropdownText: { fontSize: 15, color: colors.text },
  placeholder: { color: colors.textSecondary },
  preview: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12, marginTop: 4 },
  innerTabs: { flexDirection: 'row', margin: 16, marginBottom: 0, backgroundColor: colors.surface, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  innerTabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  innerTabBtnActive: { backgroundColor: colors.primaryTransparent },
  innerTabText: { fontSize: 13, color: colors.textSecondary },
  innerTabTextActive: { color: colors.primary, fontWeight: '600' },
  listContent: { padding: 16, paddingBottom: 140, gap: 16 },
  cCard: { gap: 10 },
  cHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  cTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontWeight: '600', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  cDesc: { fontSize: 13, lineHeight: 18, color: colors.text },
  cImage: { width: '100%', height: 160, borderRadius: 10 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.textSecondary },
  scannedBox: { marginTop: 12, backgroundColor: colors.primaryTransparent, padding: 12, borderRadius: 10 },
  scannedLine: { fontSize: 12, color: colors.text },
  centerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  successBox: { backgroundColor: colors.surface, padding: 28, borderRadius: 22, alignItems: 'center', width: '75%' },
  successTitle: { fontSize: 20, fontWeight: '700', marginTop: 12, color: colors.text },
  successMsg: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  photoSheet: { backgroundColor: colors.surface, padding: 22, width: '80%', borderRadius: 20 },
  photoTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: colors.text },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  photoBtnText: { fontSize: 15, color: colors.text },
  photoCancel: { marginTop: 12, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  photoCancelText: { color: colors.danger, fontWeight: '600' },
  ddOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, justifyContent: 'center' },
  ddPanel: { backgroundColor: colors.surface, borderRadius: 16, paddingBottom: 8, overflow: 'hidden', maxHeight: '80%' },
  ddHeader: { padding: 14, backgroundColor: colors.primary },
  ddHeaderText: { color: '#fff', fontWeight: '600', fontSize: 16, textAlign: 'center' },
  ddCategory: { paddingHorizontal: 16, paddingTop: 14, fontSize: 11, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase' },
  ddItem: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  ddItemActive: { backgroundColor: colors.primaryTransparent },
  ddItemText: { fontSize: 15, color: colors.text },
  ddItemTextActive: { color: colors.primary, fontWeight: '600' },
  ddCloseBtn: { padding: 14, alignItems: 'center' },
  ddCloseText: { fontSize: 15, fontWeight: '600', color: colors.primary },
});
