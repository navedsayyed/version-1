// Notification-related functions for firebase.js
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
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Add a new notification
export const addNotification = async (notificationData) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const newNotificationRef = await addDoc(notificationsRef, {
      ...notificationData,
      read: false,
      date: new Date().toISOString()
    });
    
    return { id: newNotificationRef.id };
  } catch (error) {
    console.error('Error adding notification:', error);
    return { error };
  }
};

// Get notifications for a specific user
export const getUserNotifications = async (userId, options = {}) => {
  try {
    const { unreadOnly = false, limit: limitCount = 20 } = options;
    
    const notificationsRef = collection(db, 'notifications');
    let q = query(
      notificationsRef, 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    if (unreadOnly) {
      q = query(q, where('read', '==', false));
    }
    
    if (limitCount > 0) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { error };
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { error };
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
    
    return { success: true, count: querySnapshot.size };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { error };
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { error };
  }
};

// Get unread notification count for a user
export const getUnreadNotificationCount = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    return { count: querySnapshot.size };
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return { error };
  }
};