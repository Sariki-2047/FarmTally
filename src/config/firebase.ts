import admin from 'firebase-admin';

class FirebaseService {
  private static instance: FirebaseService;
  private app: admin.app.App | null = null;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public initialize(): void {
    if (this.app) {
      return; // Already initialized
    }

    try {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log('✅ Firebase Admin initialized');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      throw error;
    }
  }

  public getApp(): admin.app.App {
    if (!this.app) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return this.app;
  }

  public async sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<void> {
    if (!this.app) {
      throw new Error('Firebase not initialized');
    }

    try {
      const messaging = admin.messaging();
      const results = [];

      // Send to each token individually since sendMulticast might not be available
      for (const token of tokens) {
        try {
          const message = {
            notification: {
              title,
              body,
            },
            data: data || {},
            token,
          };

          const response = await messaging.send(message);
          results.push({ success: true, messageId: response });
        } catch (error) {
          results.push({ success: false, error });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      console.log('Push notification sent:', successCount, 'successful,', failureCount, 'failed');
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }
}

export default FirebaseService;