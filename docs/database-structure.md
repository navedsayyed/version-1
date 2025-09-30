# Firebase Database Structure

This document outlines the Firestore database structure for the Complaint Management App.

## Collections

### users
Stores user information for authentication and profiles.

```
users/{userId}
{
  name: string,
  email: string,
  role: string,         // "user", "technician", or "admin"
  department: string,   // only for technicians
  phone: string,
  avatar: string,       // URL to profile image in storage
  createdAt: timestamp
}
```

### complaints
Stores complaint data submitted by users.

```
complaints/{complaintId}
{
  title: string,
  description: string,
  location: string,
  category: string,     // e.g., "Electrical", "Plumbing", "IT", etc.
  priority: string,     // "low", "medium", "high", "urgent"
  images: array,        // URLs to images in storage
  status: string,       // "pending", "in-progress", "completed", "rejected"
  userId: string,       // Reference to the user who submitted the complaint
  technicianId: string, // Reference to the assigned technician (null if unassigned)
  date: timestamp,      // When the complaint was submitted
  assignedAt: timestamp,// When the complaint was assigned to a technician
  completedAt: timestamp,// When the complaint was marked as completed
  completedImage: string,// URL to completion evidence image
  completedDescription: string, // Description of the resolution
  rating: number,       // User rating after completion (1-5)
  feedback: string      // User feedback after completion
}
```

### departments
Stores information about different departments.

```
departments/{departmentId}
{
  name: string,
  description: string,
  icon: string,        // Icon name for UI display
  color: string       // Color code for UI display
}
```

### notifications
Stores notifications for users.

```
notifications/{notificationId}
{
  userId: string,      // User to notify
  title: string,
  message: string,
  read: boolean,
  date: timestamp,
  type: string,        // "complaint_update", "assignment", "feedback_request", etc.
  complaintId: string  // Reference to related complaint (if applicable)
}
```

## Security Rules

Basic security rules for Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Complaints
    match /complaints/{complaintId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (
        resource.data.userId == request.auth.uid || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ["admin", "technician"]
      );
    }
    
    // Departments
    match /departments/{departmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Indexes

The following composite indexes should be created:

1. complaints: userId (ascending) + date (descending)
2. complaints: technicianId (ascending) + status (ascending) + date (descending)
3. complaints: status (ascending) + date (descending)
4. complaints: category (ascending) + status (ascending) + date (descending)

## Storage Structure

Cloud Storage is organized as follows:

```
/user-avatars/{userId}.jpg     - User profile images
/complaints/{complaintId}/{timestamp}.jpg - Complaint images
/completions/{complaintId}/{timestamp}.jpg - Completion evidence images
```