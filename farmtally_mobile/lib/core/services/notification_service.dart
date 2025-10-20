// Simplified notification service for web compatibility
class NotificationService {
  static NotificationService? _instance;
  static NotificationService get instance => _instance ??= NotificationService._();
  
  NotificationService._();

  Future<void> initialize() async {
    // Simplified initialization for web
    print('Notification service initialized (web mode)');
  }

  Future<void> subscribeToTopics(String role, String organizationId) async {
    // No-op for web
    print('Subscribed to topics for role: $role, org: $organizationId');
  }

  Future<void> unsubscribeFromTopics(String role, String organizationId) async {
    // No-op for web
    print('Unsubscribed from topics');
  }

  Future<String?> getFCMToken() async {
    // Return null for web
    return null;
  }

  // Show local notification (web compatible)
  Future<void> showLocalNotification({
    required int id,
    required String title,
    required String body,
    String? channelId,
    Map<String, dynamic>? data,
  }) async {
    // For web, we could use browser notifications API
    // For now, just log the notification
    print('Notification: $title - $body');
  }

  // Show notification for lorry assignment
  Future<void> showLorryAssignmentNotification({
    required String lorryName,
    required String managerName,
  }) async {
    await showLocalNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: 'Lorry Assigned',
      body: '$lorryName has been assigned to $managerName',
      channelId: 'lorry_updates',
      data: {'type': 'lorry_assignment'},
    );
  }

  // Show notification for delivery completion
  Future<void> showDeliveryCompletionNotification({
    required String farmerName,
    required double finalAmount,
  }) async {
    await showLocalNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: 'Delivery Completed',
      body: 'Delivery for $farmerName completed. Final amount: ₹${finalAmount.toStringAsFixed(2)}',
      channelId: 'delivery_updates',
      data: {'type': 'delivery_completion'},
    );
  }

  // Show notification for report generation
  Future<void> showReportGeneratedNotification({
    required String reportType,
    required String farmerName,
  }) async {
    await showLocalNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: 'Report Generated',
      body: '$reportType report for $farmerName is ready',
      channelId: 'reports',
      data: {'type': 'report_generated'},
    );
  }

  // Clear all notifications
  Future<void> clearAllNotifications() async {
    // No-op for web
  }

  // Clear specific notification
  Future<void> clearNotification(int id) async {
    // No-op for web
  }
}