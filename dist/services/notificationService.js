"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationService {
    constructor() {
        this.firebaseService = firebase_1.default.getInstance();
    }
    /**
     * Send notification to a specific user
     */
    async sendToUser(userId, notification) {
        try {
            // Get user's FCM tokens from database
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { fcmTokens: true, email: true }
            });
            if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
                console.log(`No FCM tokens found for user ${userId}`);
                return;
            }
            // Send to all user's devices
            await this.firebaseService.sendMulticastNotification(user.fcmTokens, notification.title, notification.body, {
                type: notification.type,
                userId,
                ...notification.data
            });
            // Store notification in database
            await this.storeNotification(userId, notification);
        }
        catch (error) {
            console.error('Error sending notification to user:', error);
            throw error;
        }
    }
    /**
     * Send notification to all users in an organization with specific role
     */
    async sendToRole(organizationId, role, notification) {
        try {
            // Get all users with the specified role in the organization
            const users = await prisma.user.findMany({
                where: {
                    organizationId,
                    role: role
                },
                select: { id: true, fcmTokens: true }
            });
            const allTokens = users.flatMap(user => user.fcmTokens || []);
            if (allTokens.length === 0) {
                console.log(`No FCM tokens found for role ${role} in organization ${organizationId}`);
                return;
            }
            // Send to all tokens
            await this.firebaseService.sendMulticastNotification(allTokens, notification.title, notification.body, {
                type: notification.type,
                organizationId,
                role,
                ...notification.data
            });
            // Store notification for each user
            for (const user of users) {
                await this.storeNotification(user.id, notification);
            }
        }
        catch (error) {
            console.error('Error sending notification to role:', error);
            throw error;
        }
    }
    /**
     * Send notification using topic subscription
     */
    async sendToTopic(topic, notification) {
        try {
            await this.firebaseService.sendTopicNotification(topic, notification.title, notification.body, {
                type: notification.type,
                topic,
                ...notification.data
            });
        }
        catch (error) {
            console.error('Error sending topic notification:', error);
            throw error;
        }
    }
    /**
     * Subscribe user to organization topic
     */
    async subscribeUserToOrganization(userId, organizationId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { fcmTokens: true }
            });
            if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
                console.log(`No FCM tokens found for user ${userId}`);
                return;
            }
            const topic = `org_${organizationId}`;
            await this.firebaseService.subscribeToTopic(user.fcmTokens, topic);
        }
        catch (error) {
            console.error('Error subscribing user to organization topic:', error);
            throw error;
        }
    }
    /**
     * Store notification in database for history
     */
    async storeNotification(userId, notification) {
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    type: notification.type,
                    title: notification.title,
                    body: notification.body,
                    data: notification.data || {},
                    organizationId: notification.organizationId,
                    lorryId: notification.lorryId,
                    farmerId: notification.farmerId,
                    isRead: false,
                    createdAt: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error storing notification:', error);
            // Don't throw here as notification was sent successfully
        }
    }
    /**
     * Update user's FCM token
     */
    async updateUserFCMToken(userId, token) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { fcmTokens: true }
            });
            const currentTokens = user?.fcmTokens || [];
            // Add token if not already present
            if (!currentTokens.includes(token)) {
                const updatedTokens = [...currentTokens, token];
                await prisma.user.update({
                    where: { id: userId },
                    data: { fcmTokens: updatedTokens }
                });
            }
        }
        catch (error) {
            console.error('Error updating FCM token:', error);
            throw error;
        }
    }
    /**
     * Remove user's FCM token
     */
    async removeUserFCMToken(userId, token) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { fcmTokens: true }
            });
            if (user?.fcmTokens) {
                const updatedTokens = user.fcmTokens.filter(t => t !== token);
                await prisma.user.update({
                    where: { id: userId },
                    data: { fcmTokens: updatedTokens }
                });
            }
        }
        catch (error) {
            console.error('Error removing FCM token:', error);
            throw error;
        }
    }
    /**
     * Get user's notifications
     */
    async getUserNotifications(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [notifications, total] = await Promise.all([
                prisma.notification.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.notification.count({
                    where: { userId }
                })
            ]);
            return {
                notifications,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            console.error('Error getting user notifications:', error);
            throw error;
        }
    }
    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        try {
            await prisma.notification.updateMany({
                where: {
                    id: notificationId,
                    userId
                },
                data: { isRead: true }
            });
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }
    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId) {
        try {
            await prisma.notification.updateMany({
                where: {
                    userId,
                    isRead: false
                },
                data: { isRead: true }
            });
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
}
exports.NotificationService = NotificationService;
exports.default = NotificationService;
//# sourceMappingURL=notificationService.js.map