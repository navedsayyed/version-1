import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// Import environment variables from .env file
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} from '@env';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

// Import AsyncStorage for auth persistence
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication Functions
export const loginUser = async (email, password) => {
  try {
    // First authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Then get the user data from Firestore to get role information
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    
    if (userDoc.exists()) {
      // Combine auth user and Firestore data
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        ...userDoc.data()
      };
      return { user: userData };
    } else {
      // No user data found in Firestore - create default user profile
      const defaultUserData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || email.split('@')[0],
        role: 'user',
        name: userCredential.user.displayName || email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      
      // Save default user data in Firestore
      try {
        await setDoc(doc(db, "users", userCredential.user.uid), defaultUserData);
        return { user: defaultUserData };
      } catch (setDocError) {
        console.error("Error creating default user profile:", setDocError);
        return { user: defaultUserData }; // Return user anyway, even if saving failed
      }
    }
  } catch (error) {
    return { error };
  }
};

export const registerUser = async (email, password, name, role, department = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    // Save additional user data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      email,
      role, // 'admin', 'user', 'technician'
      department,
      phone: '',
      avatar: '',
      createdAt: new Date().toISOString()
    });
    
    return { user: userCredential.user };
  } catch (error) {
    return { error };
  }
};

export const logoutUser = () => {
  return signOut(auth);
};

export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const updateUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    
    // If name is updated, also update auth profile
    if (data.name && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: data.name
      });
    }
    
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Complaints Functions
export const addComplaint = async (complaintData) => {
  try {
    const complaintsRef = collection(db, 'complaints');
    const newComplaintRef = await addDoc(complaintsRef, {
      ...complaintData,
      date: new Date().toISOString(),
      status: 'in-progress',
      technicianId: null,
      assignedAt: null,
      completedAt: null,
      completedImage: null,
      completedDescription: null
    });
    
    return { id: newComplaintRef.id };
  } catch (error) {
    return { error };
  }
};

export const getComplaints = async () => {
  try {
    const complaintsRef = collection(db, 'complaints');
    const querySnapshot = await getDocs(complaintsRef);
    
    const complaints = [];
    querySnapshot.forEach((doc) => {
      complaints.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return complaints;
  } catch (error) {
    return { error };
  }
};

export const getUserComplaints = async (userId) => {
  try {
    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, where("userId", "==", userId), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    const complaints = [];
    querySnapshot.forEach((doc) => {
      complaints.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return complaints;
  } catch (error) {
    return { error };
  }
};

export const getTechnicianComplaints = async (technicianId) => {
  try {
    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, where("technicianId", "==", technicianId), orderBy("assignedAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const complaints = [];
    querySnapshot.forEach((doc) => {
      complaints.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return complaints;
  } catch (error) {
    return { error };
  }
};

export const assignComplaint = async (complaintId, technicianId) => {
  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    await updateDoc(complaintRef, {
      technicianId,
      assignedAt: new Date().toISOString(),
      status: 'in-progress'
    });
    
    return { success: true };
  } catch (error) {
    return { error };
  }
};

export const completeComplaint = async (complaintId, completionData) => {
  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    await updateDoc(complaintRef, {
      ...completionData,
      completedAt: new Date().toISOString(),
      status: 'completed'
    });
    
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Storage Functions
export const uploadImage = async (uri, path) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(storageRef);
    return { downloadURL };
  } catch (error) {
    return { error };
  }
};

export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { user: { id: userDoc.id, ...userDoc.data() } };
    } else {
      return { error: 'User not found' };
    }
  } catch (error) {
    return { error };
  }
};

export const getTechnicians = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("role", "==", "technician"));
    const querySnapshot = await getDocs(q);
    
    const technicians = [];
    querySnapshot.forEach((doc) => {
      technicians.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return technicians;
  } catch (error) {
    return { error };
  }
};

export const getDepartments = async () => {
  try {
    const departmentsRef = collection(db, 'departments');
    const querySnapshot = await getDocs(departmentsRef);
    
    const departments = [];
    querySnapshot.forEach((doc) => {
      departments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return departments;
  } catch (error) {
    return { error };
  }
};

export { auth, db, storage };