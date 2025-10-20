export interface NotificationData {
    type: 'lorry_request' | 'lorry_approved' | 'lorry_rejected' | 'delivery_completed' | 'payment_processed' | 'advance_payment' | 'test';
    title: string;
    body: string;
    data?: Record<string, string>;
    userId?: string;
    organizationId?: string;
    lorryId?: string;
    farmerId?: string;
}
export declare class NotificationService {
    private firebaseService;
    constructor();
    /**
     * Send notification to a specific user
     */
    sendToUser(userId: string, notification: NotificationData): Promise<void>;
    /**
     * Send notification to all users in an organization with specific role
     */
    sendToRole(organizationId: string, role: string, notification: NotificationData): Promise<void>;
    /**
     * Send notification using topic subscription
     */
    sendToTopic(topic: string, notification: NotificationData): Promise<void>;
    /**
     * Subscribe user to organization topic
     */
    subscribeUserToOrganization(userId: string, organizationId: string): Promise<void>;
    /**
     * Store notification in database for history
     */
    private storeNotification;
    /**
     * Update user's FCM token
     */
    updateUserFCMToken(userId: string, token: string): Promise<void>;
    /**
     * Remove user's FCM token
     */
    removeUserFCMToken(userId: string, token: string): Promise<void>;
    /**
     * Get user's notifications
     */
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        notifications: {
            type: string;
            userId: string;
            id: string;
            organizationId: string | null;
            createdAt: Date;
            lorryId: string | null;
            farmerId: string | null;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            body: string;
            priority: import(".prisma/client").$Enums.NotificationPriority;
            title: string;
            channels: string[];
            isRead: boolean;
            readAt: Date | null;
            sentAt: Date | null;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Mark notification as read
     */
    markAsRead(notificationId: string, userId: string): Promise<void>;
    /**
     * Mark all notifications as read for a user
     */
    markAllAsRead(userId: string): Promise<void>;
}
export default NotificationService;
//# sourceMappingURL=notificationService.d.ts.map