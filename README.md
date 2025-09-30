# Complaint Management App

A React Native app for managing complaints with Firebase integration.

## Environment Setup

This project uses environment variables for Firebase configuration. Follow these steps to set up:

1. Create a `.env` file in the root directory with the following variables:

```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

2. Replace the values with your Firebase project credentials.

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npx expo start
```

## Features

- User authentication (login, signup)
- Role-based access (User, Technician, Admin)
- Complaint submission and tracking
- Dashboard for different user roles
- Profile management
- Firebase integration for data storage and authentication

## Security Note

- The `.env` file contains sensitive information and is included in `.gitignore` to prevent it from being pushed to GitHub.
- Never commit your `.env` file to version control.