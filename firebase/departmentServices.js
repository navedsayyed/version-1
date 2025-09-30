// Department-related functions for firebase.js

// Add a new department
export const addDepartment = async (departmentData) => {
  try {
    const departmentsRef = collection(db, 'departments');
    const newDepartmentRef = await addDoc(departmentsRef, {
      ...departmentData,
      createdAt: new Date().toISOString()
    });
    
    return { id: newDepartmentRef.id };
  } catch (error) {
    console.error('Error adding department:', error);
    return { error };
  }
};

// Get a specific department by ID
export const getDepartmentById = async (departmentId) => {
  try {
    const departmentRef = doc(db, 'departments', departmentId);
    const departmentDoc = await getDoc(departmentRef);
    
    if (departmentDoc.exists()) {
      return { department: { id: departmentDoc.id, ...departmentDoc.data() } };
    } else {
      return { error: 'Department not found' };
    }
  } catch (error) {
    console.error('Error getting department:', error);
    return { error };
  }
};

// Update department details
export const updateDepartment = async (departmentId, data) => {
  try {
    const departmentRef = doc(db, 'departments', departmentId);
    await updateDoc(departmentRef, data);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating department:', error);
    return { error };
  }
};

// Delete a department
export const deleteDepartment = async (departmentId) => {
  try {
    // First check if there are any technicians assigned to this department
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'technician'), where('department', '==', departmentId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { error: 'Cannot delete department with assigned technicians' };
    }
    
    // Then check if there are any complaints assigned to this department
    const complaintsRef = collection(db, 'complaints');
    const q2 = query(complaintsRef, where('category', '==', departmentId));
    const complaintsSnapshot = await getDocs(q2);
    
    if (!complaintsSnapshot.empty) {
      return { error: 'Cannot delete department with existing complaints' };
    }
    
    // If safe to delete, proceed
    await deleteDoc(doc(db, 'departments', departmentId));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting department:', error);
    return { error };
  }
};