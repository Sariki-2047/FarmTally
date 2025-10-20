class AppConstants {
  // App Info
  static const String appName = 'FarmTally';
  static const String appVersion = '1.0.0';
  
  // API Configuration - Single source of truth
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:3000',
  );
  static const String apiVersion = 'v1';
  
  // API Endpoints
  static String get apiBaseUrl => '$baseUrl/api/$apiVersion';
  
  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String organizationDataKey = 'organization_data';
  
  // Database
  static const String databaseName = 'farmtally.db';
  static const int databaseVersion = 1;
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // File Upload
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png', 'webp'];
  static const List<String> allowedDocumentTypes = ['pdf'];
  
  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration syncTimeout = Duration(minutes: 5);
  
  // Offline Sync
  static const Duration syncInterval = Duration(minutes: 15);
  static const int maxRetryAttempts = 3;
  
  // UI Constants
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  static const double borderRadius = 12.0;
  
  // Validation
  static const int minPasswordLength = 8;
  static const int maxNameLength = 100;
  static const int maxDescriptionLength = 500;
  
  // Roles
  static const String farmAdminRole = 'FARM_ADMIN';
  static const String fieldManagerRole = 'FIELD_MANAGER';
  static const String farmerRole = 'FARMER';
  
  // Delivery Status
  static const String pendingStatus = 'PENDING';
  static const String inProgressStatus = 'IN_PROGRESS';
  static const String completedStatus = 'COMPLETED';
  static const String cancelledStatus = 'CANCELLED';
  
  // Lorry Status (Updated to match backend)
  static const String availableStatus = 'AVAILABLE';
  static const String assignedStatus = 'ASSIGNED';
  static const String loadingStatus = 'LOADING';
  static const String submittedStatus = 'SUBMITTED';
  static const String sentToDealerStatus = 'SENT_TO_DEALER';
}