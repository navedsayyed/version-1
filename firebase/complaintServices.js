// Complaint-related functions for firebase.js
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  query, 
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { addNotification } from './notificationServices';

// Add a new complaint
export const addComplaint = async (complaintData) => {
  try {
    const complaintsRef = collection(db, 'complaints');
    
    // Format the complaint data
    const formattedComplaint = {
      ...complaintData,
      date: new Date().toISOString(),
      status: 'pending',
      technicianId: null,
      assignedAt: null,
      completedAt: null,
      completedImage: null,
      completedDescription: null,
      rating: null,
      feedback: null
    };
    
    // Add the complaint
    const newComplaintRef = await addDoc(complaintsRef, formattedComplaint);
    const complaintId = newComplaintRef.id;
    
    // Notify admin users about the new complaint
    const usersRef = collection(db, 'users');
    const adminQuery = query(usersRef, where('role', '==', 'admin'));
    const adminSnapshot = await getDocs(adminQuery);
    
    adminSnapshot.forEach(async (userDoc) => {
      await addNotification({
        userId: userDoc.id,
        title: 'New Complaint',
        message: `A new complaint has been submitted: ${complaintData.title}`,
        type: 'new_complaint',
        complaintId: complaintId
      });
    });
    
    return { id: complaintId };
  } catch (error) {
    console.error('Error adding complaint:', error);
    return { error };
  }
};

// Get all complaints with optional filters and pagination
export const getComplaints = async (options = {}) => {
  try {
    const {
      status,
      userId,
      technicianId,
      category,
      priority,
      limit: limitCount = 20,
      startAfterDoc = null
    } = options;
    
    const complaintsRef = collection(db, 'complaints');
    
    // Start building the query
    let queryConstraints = [];
    
    // Add filters if provided
    if (status) queryConstraints.push(where('status', '==', status));
    if (userId) queryConstraints.push(where('userId', '==', userId));
    if (technicianId) queryConstraints.push(where('technicianId', '==', technicianId));
    if (category) queryConstraints.push(where('category', '==', category));
    if (priority) queryConstraints.push(where('priority', '==', priority));
    
    // Always order by date, descending
    queryConstraints.push(orderBy('date', 'desc'));
    
    // Apply limit
    if (limitCount > 0) queryConstraints.push(limit(limitCount));
    
    // Apply pagination if a start document is provided
    if (startAfterDoc) {
      queryConstraints.push(startAfter(startAfterDoc));
    }
    
    const q = query(complaintsRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const complaints = [];
    querySnapshot.forEach((doc) => {
      complaints.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // If we have results and the number equals the limit, there might be more
    const hasMore = complaints.length === limitCount;
    
    // Return the last document for pagination
    const lastDoc = complaints.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
    
    return { 
      complaints, 
      hasMore, 
      lastDoc
    };
  } catch (error) {
    console.error('Error getting complaints:', error);
    return { error };
  }
};

// Get a specific complaint by ID
export const getComplaintById = async (complaintId) => {
  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    const complaintDoc = await getDoc(complaintRef);
    
    if (complaintDoc.exists()) {
      return { complaint: { id: complaintDoc.id, ...complaintDoc.data() } };
    } else {
      return { error: 'Complaint not found' };
    }
  } catch (error) {
    console.error('Error getting complaint:', error);
    return { error };
  }
};

// Assign a complaint to a technician
export const assignComplaint = async (complaintId, technicianId, adminId) => {
  try {
    // Get technician details first
    const technicianRef = doc(db, 'users', technicianId);
    const technicianDoc = await getDoc(technicianRef);
    
    if (!technicianDoc.exists()) {
      return { error: 'Technician not found' };
    }
    
    const technicianData = technicianDoc.data();
    
    // Make sure this is a technician
    if (technicianData.role !== 'technician') {
      return { error: 'User is not a technician' };
    }
    
    // Update the complaint
    const complaintRef = doc(db, 'complaints', complaintId);
    await updateDoc(complaintRef, {
      technicianId,
      assignedAt: new Date().toISOString(),
      status: 'in-progress'
    });
    
    // Get complaint details for notification
    const complaintDoc = await getDoc(complaintRef);
    const complaintData = complaintDoc.data();
    
    // Notify the technician
    await addNotification({
      userId: technicianId,
      title: 'New Assignment',
      message: `You've been assigned to handle a complaint: ${complaintData.title}`,
      type: 'assignment',
      complaintId: complaintId
    });
    
    // Notify the user who submitted the complaint
    await addNotification({
      userId: complaintData.userId,
      title: 'Complaint Update',
      message: `Your complaint "${complaintData.title}" has been assigned to a technician.`,
      type: 'complaint_update',
      complaintId: complaintId
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error assigning complaint:', error);
    return { error };
  }
};

// Mark a complaint as completed
export const completeComplaint = async (complaintId, completionData) => {
  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    const complaintDoc = await getDoc(complaintRef);
    
    if (!complaintDoc.exists()) {
      return { error: 'Complaint not found' };
    }
    
    const complaintData = complaintDoc.data();
    
    // Update the complaint
    await updateDoc(complaintRef, {
      ...completionData,
      completedAt: new Date().toISOString(),
      status: 'completed'
    });
    
    // Notify the user
    await addNotification({
      userId: complaintData.userId,
      title: 'Complaint Completed',
      message: `Your complaint "${complaintData.title}" has been marked as completed. Please review and provide feedback.`,
      type: 'completion',
      complaintId: complaintId
    });
    
    // Notify admins
    const usersRef = collection(db, 'users');
    const adminQuery = query(usersRef, where('role', '==', 'admin'));
    const adminSnapshot = await getDocs(adminQuery);
    
    adminSnapshot.forEach(async (userDoc) => {
      await addNotification({
        userId: userDoc.id,
        title: 'Complaint Completed',
        message: `Complaint "${complaintData.title}" has been marked as completed.`,
        type: 'completion',
        complaintId: complaintId
      });
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error completing complaint:', error);
    return { error };
  }
};

// Rate and provide feedback for a completed complaint
export const rateComplaint = async (complaintId, rating, feedback) => {
  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    const complaintDoc = await getDoc(complaintRef);
    
    if (!complaintDoc.exists()) {
      return { error: 'Complaint not found' };
    }
    
    const complaintData = complaintDoc.data();
    
    if (complaintData.status !== 'completed') {
      return { error: 'Complaint is not completed yet' };
    }
    
    // Update with rating and feedback
    await updateDoc(complaintRef, {
      rating,
      feedback
    });
    
    // Notify the technician
    if (complaintData.technicianId) {
      await addNotification({
        userId: complaintData.technicianId,
        title: 'Complaint Rated',
        message: `Your completed complaint "${complaintData.title}" has received a rating of ${rating}/5.`,
        type: 'rating',
        complaintId: complaintId
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error rating complaint:', error);
    return { error };
  }
};

// Delete a complaint (admin only)
export const deleteComplaint = async (complaintId) => {
  try {
    // Get complaint data for notifications
    const complaintRef = doc(db, 'complaints', complaintId);
    const complaintDoc = await getDoc(complaintRef);
    
    if (!complaintDoc.exists()) {
      return { error: 'Complaint not found' };
    }
    
    const complaintData = complaintDoc.data();
    
    // Delete the complaint
    await deleteDoc(complaintRef);
    
    // If complaint was assigned, notify technician
    if (complaintData.technicianId) {
      await addNotification({
        userId: complaintData.technicianId,
        title: 'Complaint Removed',
        message: `The complaint "${complaintData.title}" that was assigned to you has been removed.`,
        type: 'complaint_removed',
        complaintId: null
      });
    }
    
    // Notify the user who submitted the complaint
    await addNotification({
      userId: complaintData.userId,
      title: 'Complaint Removed',
      message: `Your complaint "${complaintData.title}" has been removed by an administrator.`,
      type: 'complaint_removed',
      complaintId: null
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return { error };
  }
};

// Get complaint statistics (for admin dashboard)
export const getComplaintStatistics = async () => {
  try {
    const complaintsRef = collection(db, 'complaints');
    
    // Get total count by status
    const pendingQuery = query(complaintsRef, where('status', '==', 'pending'));
    const inProgressQuery = query(complaintsRef, where('status', '==', 'in-progress'));
    const completedQuery = query(complaintsRef, where('status', '==', 'completed'));
    
    const [pendingSnapshot, inProgressSnapshot, completedSnapshot] = await Promise.all([
      getDocs(pendingQuery),
      getDocs(inProgressQuery),
      getDocs(completedQuery)
    ]);
    
    // Get count by department/category
    const departmentsRef = collection(db, 'departments');
    const departmentsSnapshot = await getDocs(departmentsRef);
    
    const departmentStats = [];
    const departmentPromises = [];
    
    departmentsSnapshot.forEach((deptDoc) => {
      const deptData = deptDoc.data();
      const deptId = deptDoc.id;
      
      const deptQuery = query(complaintsRef, where('category', '==', deptId));
      const promise = getDocs(deptQuery).then(snapshot => {
        departmentStats.push({
          id: deptId,
          name: deptData.name,
          count: snapshot.size
        });
      });
      
      departmentPromises.push(promise);
    });
    
    await Promise.all(departmentPromises);
    
    // Calculate average rating for completed complaints
    const completedComplaints = [];
    let totalRating = 0;
    let ratedCount = 0;
    
    completedSnapshot.forEach(doc => {
      const data = doc.data();
      completedComplaints.push({ id: doc.id, ...data });
      
      if (data.rating) {
        totalRating += data.rating;
        ratedCount++;
      }
    });
    
    const averageRating = ratedCount > 0 ? totalRating / ratedCount : 0;
    
    return {
      counts: {
        pending: pendingSnapshot.size,
        inProgress: inProgressSnapshot.size,
        completed: completedSnapshot.size,
        total: pendingSnapshot.size + inProgressSnapshot.size + completedSnapshot.size
      },
      departmentStats,
      averageRating
    };
  } catch (error) {
    console.error('Error getting complaint statistics:', error);
    return { error };
  }
};