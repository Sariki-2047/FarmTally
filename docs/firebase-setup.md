# Firebase Configuration Guide

This guide will help you set up Firebase for the FarmTally project to enable push notifications and real-time features.

## Prerequisites

- Firebase account (free tier is sufficient for development)
- Node.js project (backend) already set up
- Flutter project (mobile app) already set up

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `farmtally-[your-suffix]`
4. Enable Google Analytics (optional but recommended)
5. Choose or create a Google Analytics account
6. Click "Create project"

## Step 2: Enable Firebase Services

### Cloud Messaging (FCM)
1. In Firebase Console, go to "Project Settings" > "Cloud Messaging"
2. Note down the "Server key" - you'll need this for backend configuration

### Authentication (Optional - for future use)
1. Go to "Authentication" > "Sign-in method"
2. Enable desired sign-in providers (Email/Password, Google, etc.)

## Step 3: Add Android App

1. In Firebase Console, click "Add app" > Android
2. Enter package name: `com.farmtally.mobile`
3. Enter app nickname: `FarmTally Mobile`
4. Download `google-services.json`
5. Place the file in `farmtally_mobile/android/app/`

### Update Android Configuration

Add to `farmtally_mobile/android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

Add to `farmtally_mobile/android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.4.0'
}
```

## Step 4: Add iOS App

1. In Firebase Console, click "Add app" > iOS
2. Enter bundle ID: `com.farmtally.mobile`
3. Enter app nickname: `FarmTally Mobile iOS`
4. Download `GoogleService-Info.plist`
5. Add the file to `farmtally_mobile/ios/Runner/` in Xcode

### Update iOS Configuration

Add to `farmtally_mobile/ios/Runner/Info.plist`:
```xml
<key>FirebaseAppDelegateProxyEnabled</key>
<false/>
```

## Step 5: Add Web App (Optional)

1. In Firebase Console, click "Add app" > Web
2. Enter app nickname: `FarmTally Web`
3. Copy the configuration object
4. Update `farmtally_mobile/lib/firebase_options.dart` with your values

## Step 6: Configure Backend Environment

Update your `.env` file with Firebase credentials:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_SERVER_KEY="your-server-key-from-cloud-messaging"
```

### Get Service Account Credentials

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the following values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

## Step 7: Update Flutter Firebase Options

Update `farmtally_mobile/lib/firebase_options.dart` with your actual Firebase configuration values from the Firebase Console.

## Step 8: Test Configuration

### Backend Test
```bash
npm run dev
```

Check console for "Firebase Admin SDK initialized successfully"

### Flutter Test
```bash
cd farmtally_mobile
flutter pub get
flutter run
```

Check console for "Firebase initialized successfully"

## Step 9: Test Notifications

### Using Backend API
```bash
# Send test notification
curl -X POST http://localhost:3000/api/v1/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test notification",
    "role": "field_manager"
  }'
```

### Using Firebase Console
1. Go to Firebase Console > Cloud Messaging
2. Click "Send your first message"
3. Enter title and body
4. Select your app
5. Send test message

## Troubleshooting

### Common Issues

1. **"Firebase not initialized"**
   - Check if Firebase.initializeApp() is called in main.dart
   - Verify firebase_options.dart has correct values

2. **"No FCM token received"**
   - Check app permissions for notifications
   - Verify google-services.json/GoogleService-Info.plist are in correct locations

3. **"Backend Firebase initialization failed"**
   - Check environment variables are set correctly
   - Verify service account JSON has correct permissions

4. **"Notifications not received"**
   - Check device notification settings
   - Verify FCM token is sent to backend
   - Check server key in backend configuration

### Debug Commands

```bash
# Check Firebase project
firebase projects:list

# Check FCM registration token (Android)
adb shell am start -a android.intent.action.VIEW -d "https://console.firebase.google.com/project/YOUR_PROJECT_ID/notification/compose"

# Check iOS push notification certificate
openssl x509 -in aps_development.cer -inform der -text -noout
```

## Security Notes

1. Never commit service account JSON files to version control
2. Use environment variables for all sensitive configuration
3. Restrict API keys to specific platforms in Firebase Console
4. Enable App Check for production apps
5. Use Firebase Security Rules for database access

## Production Considerations

1. Use separate Firebase projects for development and production
2. Set up proper monitoring and alerting
3. Configure message delivery reports
4. Implement proper error handling for failed notifications
5. Consider message batching for high-volume scenarios

## Next Steps

1. Implement notification handling in Flutter app
2. Add notification preferences for users
3. Set up topic-based messaging for organization-wide notifications
4. Implement notification analytics and tracking
5. Add support for rich notifications with images and actions