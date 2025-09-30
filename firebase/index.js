// Firebase services index file
import { 
  auth, 
  db, 
  storage, 
  loginUser, 
  registerUser, 
  logoutUser, 
  resetPassword,
  updateUserProfile,
  getUserById,
  getTechnicians
} from './firebase';

// Import complaint services
import {
  addComplaint,
  getComplaints,
  getComplaintById,
  assignComplaint,
  completeComplaint,
  rateComplaint,
  deleteComplaint,
  getComplaintStatistics
} from './complaintServices';

// Import department services
import {
  addDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} from './departmentServices';

// Import notification services
import {
  addNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount
} from './notificationServices';

// Import storage services
import {
  uploadProfileImage,
  uploadComplaintImage,
  uploadCompletionImage,
  uploadImage,
  deleteImage,
  uploadMultipleComplaintImages
} from './storageServices';

// Re-export everything
export {
  // Firebase core
  auth,
  db,
  storage,
  
  // Authentication
  loginUser,
  registerUser,
  logoutUser,
  resetPassword,
  updateUserProfile,
  getUserById,
  getTechnicians,
  
  // Complaints
  addComplaint,
  getComplaints,
  getComplaintById,
  assignComplaint,
  completeComplaint,
  rateComplaint,
  deleteComplaint,
  getComplaintStatistics,
  
  // Departments
  addDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  
  // Notifications
  addNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  
  // Storage
  uploadProfileImage,
  uploadComplaintImage,
  uploadCompletionImage,
  uploadImage,
  deleteImage,
  uploadMultipleComplaintImages
};