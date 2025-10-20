import admin from 'firebase-admin';
declare class FirebaseService {
    private static instance;
    private app;
    private constructor();
    static getInstance(): FirebaseService;
    initialize(): void;
    getApp(): admin.app.App;
    sendPushNotification(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<void>;
}
export default FirebaseService;
//# sourceMappingURL=firebase.d.ts.map