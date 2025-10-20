# Get Firebase Server Key for Cloud Messaging

You have Firebase Cloud Messaging API V1 enabled, which is great! Now you need to get the server key for sending notifications from your backend.

## Method 1: Legacy Server Key (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/project/farmtally-app)
2. Click the gear icon ⚙️ → "Project settings"
3. Go to "Cloud Messaging" tab
4. Look for "Server key" under "Project credentials"
5. Copy the key (it starts with "AAAA...")

If you don't see the server key, you might need to enable the legacy API:

## Method 2: Enable Legacy Server Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=farmtally-app)
2. Make sure "Firebase Cloud Messaging API" is enabled
3. Go back to Firebase Console → Project Settings → Cloud Messaging
4. You should now see the "Server key"

## Method 3: Using Service Account (Alternative)

If you prefer to use the service account for notifications (more secure), you can modify the backend to use OAuth2 instead of the server key. This is already supported by our Firebase service.

## Update Your .env

Once you get the server key, update your `.env` file:

```env
FIREBASE_SERVER_KEY="AAAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

The key should be a long string starting with "AAAA".

## Test the Configuration

After updating the server key, test your backend:

```bash
npm run dev
```

You should see: `"Firebase Admin SDK initialized successfully"`

## Note

The service account credentials you provided are perfect and will work for most Firebase operations. The server key is specifically needed for the legacy FCM HTTP API, but our implementation can work with just the service account if needed.