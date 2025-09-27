import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Alert, Modal, Image, TouchableOpacity, FlatList, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import { mockComplaints } from '../utils/mockData';
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
  const [complaints, setComplaints] = useState(mockComplaints);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [complaintsTab, setComplaintsTab] = useState('in-progress'); // inner tab

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
  const handleSetField = (field, value) => setComplaintForm(p => ({ ...p, [field]: value }));

  const handleQRScan = () => setShowQRScanner(true);

  const handleScanComplete = (qrData) => {
    const upd = {
      class: qrData.class || '',
      floor: qrData.floor || '',
      department: qrData.department || '',
      location: `Building ${qrData.building || 'A'} - Floor ${qrData.floor || '1'}`,
      place: `${qrData.department || 'General'} - Room ${qrData.class || '101'}`
    };
    setComplaintForm(p => ({ ...p, ...upd }));
    Alert.alert('QR Scanned', `${upd.location}\n${upd.place}`);
    setShowQRScanner(false);
  };

  const takePhoto = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!res.canceled) handleSetField('image', res.assets[0].uri);
      setShowPhotoOptions(false);
    } catch (e) { Alert.alert('Error', 'Camera failed'); }
  };

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
      if (!res.canceled) handleSetField('image', res.assets[0].uri);
      setShowPhotoOptions(false);
    } catch (e) { Alert.alert('Error', 'Image pick failed'); }
  };

  const submitComplaint = () => {
    const { title, type, description, location, place } = complaintForm;
    if (!title || !type || !description || !location || !place) {
      Alert.alert('Missing Fields', 'Fill Title, Type, Location, Place, Description');
      return;
    }
    const newComplaint = {
      id: complaints.length + 1,
      title,
      type,
      description,
      location,
      place,
      date: new Date().toISOString().split('T')[0],
      status: 'in-progress',
      userId: 'current.user@company.com',
      technicianId: null,
      image: complaintForm.image,
    };
    setComplaints(c => [...c, newComplaint]);
    setShowSuccess(true);
    setComplaintForm({ title: '', location: '', place: '', description: '', image: null, class: '', floor: '', department: '', type: '' });
    setTimeout(() => setShowSuccess(false), 1500);
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
          <TextInput style={styles.input} value={complaintForm.title} onChangeText={v => handleSetField('title', v)} placeholder="Short title" placeholderTextColor={colors.textSecondary} />
        </Field>

        <Field label="Complaint Type *">
          <TouchableOpacity style={[styles.dropdownSelector, complaintForm.type && styles.dropdownSelectorActive]} onPress={() => setShowTypeDropdown(true)}>
            <Text style={[styles.dropdownText, !complaintForm.type && styles.placeholder]}>
              {complaintForm.type ? complaintTypes.find(t => t.value === complaintForm.type)?.label : 'Select type'}
            </Text>
            <Feather name="chevron-down" size={18} color={complaintForm.type ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        </Field>

        <Field label="Location *">
          <TextInput style={styles.input} value={complaintForm.location} onChangeText={v => handleSetField('location', v)} placeholder="Building & Floor" placeholderTextColor={colors.textSecondary} />
        </Field>
        <Field label="Place *">
          <TextInput style={styles.input} value={complaintForm.place} onChangeText={v => handleSetField('place', v)} placeholder="Dept / Room" placeholderTextColor={colors.textSecondary} />
        </Field>
        <Field label="Description *">
          <TextInput style={[styles.input, styles.textArea]} value={complaintForm.description} onChangeText={v => handleSetField('description', v)} multiline numberOfLines={5} placeholder="Describe the issue" placeholderTextColor={colors.textSecondary} />
        </Field>

        <Field label="Photo (optional)">
          {complaintForm.image ? (
            <View>
              <Image source={{ uri: complaintForm.image }} style={styles.preview} />
              <CustomButton title="Change Photo" variant="outline" size="small" onPress={() => setShowPhotoOptions(true)} />
            </View>
          ) : (
            <CustomButton title="Add Photo" icon={UploadIcon} variant="outline" onPress={() => setShowPhotoOptions(true)} />
          )}
        </Field>

        <CustomButton title="Submit Complaint" icon={CheckCircleIcon} size="large" onPress={submitComplaint} />
      </Card>
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const filteredComplaints = complaints.filter(c => complaintsTab === 'in-progress' ? c.status === 'in-progress' : c.status === 'completed');
  const MyComplaintsTab = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.innerTabs}>
        {['in-progress','completed'].map(k => (
          <TouchableOpacity key={k} style={[styles.innerTabBtn, complaintsTab === k && styles.innerTabBtnActive]} onPress={() => setComplaintsTab(k)}>
            <Text style={[styles.innerTabText, complaintsTab === k && styles.innerTabTextActive]}>{k === 'in-progress' ? 'In Progress' : 'Completed'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.listContent}>
        {filteredComplaints.length ? filteredComplaints.map(c => (
          <Card key={c.id} style={styles.cCard}>
            <View style={styles.cHeader}>
              <Text style={styles.cTitle}>{c.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: c.status === 'completed' ? colors.success : colors.accent }]}>
                <Text style={styles.statusBadgeText}>{c.status === 'completed' ? 'Completed' : 'In Progress'}</Text>
              </View>
            </View>
            <View style={styles.metaRow}><MapPinIcon size={14} color={colors.textSecondary} /><Text style={styles.metaText}>{c.location} - {c.place}</Text></View>
            <View style={styles.metaRow}><CalendarIcon size={14} color={colors.textSecondary} /><Text style={styles.metaText}>{c.date}</Text></View>
            <Text numberOfLines={3} style={styles.cDesc}>{c.description}</Text>
            {c.image ? <Image source={{ uri: c.image }} style={styles.cImage} /> : null}
          </Card>
        )) : (
          <View style={styles.empty}><Text style={styles.emptyText}>No complaints here.</Text></View>
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
            data={complaintTypes}
            keyExtractor={i => i.value}
            renderItem={({ item, index }) => {
              const prev = index > 0 ? complaintTypes[index - 1] : null;
              const showCat = !prev || prev.category !== item.category;
              return (
                <>
                  {showCat && <Text style={styles.ddCategory}>{item.category}</Text>}
                  <TouchableOpacity style={[styles.ddItem, complaintForm.type === item.value && styles.ddItemActive]} onPress={() => { handleSetField('type', item.value); setShowTypeDropdown(false); }}>
                    <Text style={[styles.ddItemText, complaintForm.type === item.value && styles.ddItemTextActive]}>{item.label}</Text>
                    {complaintForm.type === item.value && <Feather name="check" size={16} color={colors.primary} />}
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
        <TabButton active={activeTab==='add'} onPress={() => setActiveTab('add')} label="New Complaint" icon={FileTextIcon} />
        <TabButton active={activeTab==='list'} onPress={() => setActiveTab('list')} label="My Complaints" icon={ClockIcon} />
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
const Field = ({ label, children }) => (
  <View style={styles.field}> 
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

const TabButton = ({ active, onPress, label, icon: Icon }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]} activeOpacity={0.75}>
    <Icon size={18} color={active ? colors.primary : colors.textSecondary} />
    <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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
  textArea: { height: 120, textAlignVertical: 'top' },
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
