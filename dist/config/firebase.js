"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
class FirebaseService {
    static instance;
    app = null;
    constructor() { }
    static getInstance() {
        if (!FirebaseService.instance) {
            FirebaseService.instance = new FirebaseService();
        }
        return FirebaseService.instance;
    }
    initialize() {
        if (this.app) {
            return;
        }
        try {
            const serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            };
            this.app = firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
                projectId: process.env.FIREBASE_PROJECT_ID,
            });
            console.log('✅ Firebase Admin initialized');
        }
        catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            throw error;
        }
    }
    getApp() {
        if (!this.app) {
            throw new Error('Firebase not initialized. Call initialize() first.');
        }
        return this.app;
    }
    async sendPushNotification(tokens, title, body, data) {
        if (!this.app) {
            throw new Error('Firebase not initialized');
        }
        try {
            const messaging = firebase_admin_1.default.messaging();
            const results = [];
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
                }
                catch (error) {
                    results.push({ success: false, error });
                }
            }
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;
            console.log('Push notification sent:', successCount, 'successful,', failureCount, 'failed');
        }
        catch (error) {
            console.error('Error sending push notification:', error);
            throw error;
        }
    }
}
exports.default = FirebaseService;
//# sourceMappingURL=firebase.js.map