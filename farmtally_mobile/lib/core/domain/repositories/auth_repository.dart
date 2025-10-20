import '../entities/result.dart';
import '../entities/user.dart';

abstract class AuthRepository {
  /// Login with email/phone and password
  Future<Result<AuthResult>> login({
    required String identifier, // email or phone
    required String password,
  });

  /// Logout current user
  Future<Result<void>> logout();

  /// Refresh authentication token
  Future<Result<AuthTokens>> refreshToken(String refreshToken);

  /// Get current user profile
  Future<Result<User>> getCurrentUser();

  /// Update user profile
  Future<Result<User>> updateProfile(Map<String, dynamic> profileData);

  /// Change password
  Future<Result<void>> changePassword({
    required String currentPassword,
    required String newPassword,
  });

  /// Register field manager (admin only)
  Future<Result<User>> registerFieldManager({
    required String email,
    required String firstName,
    required String lastName,
    required String phone,
    String? address,
    String? idNumber,
  });

  /// Verify field manager registration token
  Future<Result<RegistrationTokenData>> verifyRegistrationToken(String token);

  /// Complete field manager registration
  Future<Result<AuthResult>> completeFieldManagerRegistration({
    required String token,
    required String password,
    Map<String, dynamic>? additionalData,
  });

  /// Check if user is authenticated
  Future<bool> isAuthenticated();

  /// Get stored authentication tokens
  Future<AuthTokens?> getStoredTokens();

  /// Clear stored authentication data
  Future<void> clearAuthData();
}

class AuthResult {
  final User user;
  final AuthTokens tokens;

  const AuthResult({
    required this.user,
    required this.tokens,
  });
}

class AuthTokens {
  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;

  const AuthTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);
  bool get isExpiringSoon => DateTime.now().add(const Duration(minutes: 5)).isAfter(expiresAt);

  AuthTokens copyWith({
    String? accessToken,
    String? refreshToken,
    DateTime? expiresAt,
  }) {
    return AuthTokens(
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      expiresAt: expiresAt ?? this.expiresAt,
    );
  }
}

class RegistrationTokenData {
  final String email;
  final String firstName;
  final String lastName;
  final String organizationId;
  final String organizationName;
  final DateTime expiresAt;

  const RegistrationTokenData({
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.organizationId,
    required this.organizationName,
    required this.expiresAt,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}