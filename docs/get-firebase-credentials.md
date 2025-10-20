# How to Get Your Firebase Credentials

Based on your Firebase project `farmtally-app`, here's how to get the correct credentials:

## 🔑 Backend Credentials (Service Account)

### Step 1: Get Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/project/farmtally-app)
2. Click the gear icon ⚙️ → "Project settings"
3. Go to "Service accounts" tab
4. Click "Generate new private key"
5. Download the JSON file

### Step 2: Extract Values from JSON
The downloaded JSON file will look like this:
```json
{
  "type": "service_account",
  "project_id": "farmtally-app",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@farmtally-app.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

### Step 3: Update .env File
```env
FIREBASE_PROJECT_ID="farmtally-app"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@farmtally-app.iam.gserviceaccount.com"
```

## 📱 Mobile App Credentials

### Step 1: Get Server Key (for backend notifications)
1. In Firebase Console → Project settings
2. Go to "Cloud Messaging" tab
3. Copy the "Server key" (long string starting with "AAAA...")
4. Update your .env:
```env
FIREBASE_SERVER_KEY="AAAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Step 2: Get App Configuration
1. In Firebase Console, add your mobile apps if not already added:

#### For Android:
- Package name: `com.farmtally.mobile`
- Download `google-services.json`
- Place in `farmtally_mobile/android/app/`

#### For iOS:
- Bundle ID: `com.farmtally.mobile`
- Download `GoogleService-Info.plist`
- Add to `farmtally_mobile/ios/Runner/` in Xcode

### Step 3: Update Firebase Options
After adding your apps, get the configuration values:

1. Go to Project settings → General tab
2. Scroll down to "Your apps" section
3. Click on each app to see configuration

Update `farmtally_mobile/lib/firebase_options.dart` with actual values:

```dart
// Android values from google-services.json
static const FirebaseOptions android = FirebaseOptions(
  apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // current_key
  appId: '1:25397590033:android:xxxxxxxxxxxxxxxxxx', // mobilesdk_app_id
  messagingSenderId: '25397590033', // project_number
  projectId: 'farmtally-app', // project_id
  storageBucket: 'farmtally-app.appspot.com', // storage_bucket
);

// iOS values from GoogleService-Info.plist
static const FirebaseOptions ios = FirebaseOptions(
  apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // API_KEY
  appId: '1:25397590033:ios:xxxxxxxxxxxxxxxxxx', // GOOGLE_APP_ID
  messagingSenderId: '25397590033', // GCM_SENDER_ID
  projectId: 'farmtally-app', // PROJECT_ID
  storageBucket: 'farmtally-app.appspot.com', // STORAGE_BUCKET
  iosBundleId: 'com.farmtally.mobile', // BUNDLE_ID
);
```

## 🧪 Testing Your Configuration

### Test Backend
```bash
npm run dev
```
Look for: "Firebase Admin SDK initialized successfully"

### Test Flutter
```bash
cd farmtally_mobile
flutter pub get
flutter run
```
Look for: "Firebase initialized successfully"

## ⚠️ Security Notes

1. **Never commit** the service account JSON file to git
2. **Never commit** actual API keys to git
3. Use environment variables for all sensitive data
4. The values I provided are just examples - use your actual values

## 🔍 Common Issues

### "Firebase not initialized"
- Check that all environment variables are set correctly
- Verify the private key includes the full `-----BEGIN PRIVATE KEY-----` header

### "Invalid private key"
- Make sure the private key is properly escaped in .env
- Use double quotes around the entire key
- Keep the `\n` characters in the key

### "App not found"
- Verify you've added Android/iOS apps to your Firebase project
- Check package name/bundle ID matches exactly
- Ensure config files are in the correct locations

## 📞 Need Help?

If you're still having issues:
1. Double-check your Firebase project URL: https://console.firebase.google.com/project/farmtally-app
2. Verify you have the correct permissions on the Firebase project
3. Make sure you're using the service account from the correct project