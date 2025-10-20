import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/entities/result.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../services/api_service.dart';
import '../../services/database_service.dart';
import '../../utils/app_constants.dart';

class AuthRepositoryImpl implements AuthRepository {
  final ApiService _apiService;
  final DatabaseService _databaseService;
  final SharedPreferences _sharedPreferences;

  AuthRepositoryImpl({
    required ApiService apiService,
    required DatabaseService databaseService,
    required SharedPreferences sharedPreferences,
  })  : _apiService = apiService,
        _databaseService = databaseService,
        _sharedPreferences = sharedPreferences;

  @override
  Future<Result<AuthResult>> login({
    required String identifier,
    required String password,
  }) async {
    try {
      final loginData = <String, dynamic>{
        'password': password,
      };

      if (identifier.contains('@')) {
        loginData['email'] = identifier;
      } else {
        loginData['phone'] = identifier;
      }

      final response = await _apiService.post('/auth/login', loginData);

      if (response['success'] == true) {
        final userData = response['data']['user'] as Map<String, dynamic>;
        final tokensData = response['data']['tokens'] as Map<String, dynamic>;

        // Convert API response to domain entities
        final user = User.fromJson(userData);
        final tokens = AuthTokens(
          accessToken: tokensData['accessToken'],
          refreshToken: tokensData['refreshToken'],
          expiresAt: DateTime.now().add(const Duration(hours: 8)),
        );

        // Store authentication data
        await _storeAuthData(user, tokens);

        // Set API token for future requests
        _apiService.setAuthToken(tokens.accessToken);

        // Save user to local database
        await _databaseService.saveUser(user);

        // Save organization if present
        if (user.organization != null) {
          await _databaseService.saveOrganization(user.organization!);
        }

        return Result.success(AuthResult(user: user, tokens: tokens));
      } else {
        return Result.failure(
          Failure.server(
            message: response['message'] ?? 'Login failed',
            code: response['code'],
          ),
        );
      }
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Login failed: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<void>> logout() async {
    try {
      // Try to call logout API if tokens exist
      final tokens = await getStoredTokens();
      if (tokens != null) {
        try {
          await _apiService.post('/auth/logout', {});
        } catch (e) {
          // Continue with logout even if API call fails
          print('Logout API call failed: $e');
        }
      }

      // Clear stored data
      await clearAuthData();

      // Clear API token
      _apiService.clearAuthToken();

      return const Result.success(null);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Logout failed: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<AuthTokens>> refreshToken(String refreshToken) async {
    try {
      final response = await _apiService.post('/auth/refresh-token', {
        'refreshToken': refreshToken,
      });

      if (response['success'] == true) {
        final tokensData = response['data']['tokens'] as Map<String, dynamic>;

        final newTokens = AuthTokens(
          accessToken: tokensData['accessToken'],
          refreshToken: tokensData['refreshToken'],
          expiresAt: DateTime.now().add(const Duration(hours: 8)),
        );

        // Update stored tokens
        await _storeTokens(newTokens);

        // Set new API token
        _apiService.setAuthToken(newTokens.accessToken);

        return Result.success(newTokens);
      } else {
        return Result.failure(
          Failure.authentication(
            message: response['message'] ?? 'Token refresh failed',
          ),
        );
      }
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Token refresh failed: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<User>> getCurrentUser() async {
    try {
      // First try to get from local database
      final userJson = _sharedPreferences.getString(AppConstants.userDataKey);
      if (userJson != null) {
        final userData = json.decode(userJson) as Map<String, dynamic>;
        final user = User.fromJson(userData);
        return Result.success(user);
      }

      // If not in local storage, try API
      final response = await _apiService.get('/auth/profile');

      if (response['success'] == true) {
        final userData = response['data']['user'] as Map<String, dynamic>;
        final user = User.fromJson(userData);

        // Store user data
        await _storeUser(user);

        return Result.success(user);
      } else {
        return Result.failure(
          Failure.server(
            message: response['message'] ?? 'Failed to get user profile',
          ),
        );
      }
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get current user: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<User>> updateProfile(Map<String, dynamic> profileData) async {
    try {
      final response = await _apiService.put('/auth/profile', profileData);

      if (response['success'] == true) {
        final userData = response['data']['user'] as Map<String, dynamic>;
        final user = User.fromJson(userData);

        // Update stored user data
        await _storeUser(user);

        return Result.success(user);
      } else {
        return Result.failure(
          Failure.server(
            message: response['message'] ?? 'Failed to update profile',
          ),
        );
      }
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to update profile: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<void>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _apiService.post('/auth/change-password', {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });

      if (response['success'] == true) {
        return const Result.success(null);
      } else {
        return Result.failure(
          Failure.server(
            message: response['message'] ?? 'Failed to change password',
          ),
        );
      }
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to change password: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<User>> registerFieldManager({
    required String email,
    required String firstName,
    required String lastName,
    required String phone,
    String? address,
    String? idNumber,
  }) async {
    try {
      final response = await _apiService.post('/auth/register-field-manager', {
        'email': email,
        'firstName': firstName,
        'lastName': lastName,
        'phone': phone,
        'address': address,
        'idNumber': idNumber,
      });

      if (response['success'] == true) {
        final userData = response['data']['user'] as Map<String, dynamic>;
        final user = User.fromJson(userData);
        return Result.success(user);
      } else {
        return Result.failure(
          Failure.server(
            message: response['message'] ?? 'Failed to register field manager',
          ),
        );
      }
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to register field manager: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<RegistrationTokenData>> verifyRegistrationToken(String token) async {
    try {
      final response = await _apiService.post('/auth/verify-registration-token', {
        'token': token,
      });

      if (response['success'] == true) {
        final data = response['data'] as Map<String, dynamic>;
        final tokenData = RegistrationTokenData(
          email: data['email'],
          firstName: data['firstName'],
          lastName: data['lastName'],
          organizationId: data['organizationId'],
          organizationName: data['organizationName'],
          expiresAt: DateTime.parse(data['expiresAt']),
        );
        return Result.success(tokenData);
      } else {
        return Result.failure(
          Failure.server(
            message: response['message'] ?? 'Invalid registration token',
          ),
        );
      }
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to verify registration token: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<AuthResult>> completeFieldManagerRegistration({
    required String token,
    required String password,
    Map<String, dynamic>? additionalData,
  }) async {
    try {
      final requestData = {
        'token': token,
        'password': password,
        ...?additionalData,
      };

      final response = await _apiService.post('/auth/complete-registration', requestData);

      if (response['success'] == true) {
        final userData = response['data']['user'] as Map<String, dynamic>;
        final tokensData = response['data']['tokens'] as Map<String, dynamic>;

        final user = User.fromJson(userData);
        final tokens = AuthTokens(
          accessToken: tokensData['accessToken'],
          refreshToken: tokensData['refreshToken'],
          expiresAt: DateTime.now().add(const Duration(hours: 8)),
        );

        // Store authentication data
        await _storeAuthData(user, tokens);

        // Set API token
        _apiService.setAuthToken(tokens.accessToken);

        return Result.success(AuthResult(user: user, tokens: tokens));
      } else {
        return Result.failure(
          Failure.server(
            message: response['message'] ?? 'Registration completion failed',
          ),
        );
      }
    } on ApiException catch (e) {
      return Result.failure(_mapApiExceptionToFailure(e));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to complete registration: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<bool> isAuthenticated() async {
    try {
      final tokens = await getStoredTokens();
      final userJson = _sharedPreferences.getString(AppConstants.userDataKey);
      
      return tokens != null && !tokens.isExpired && userJson != null;
    } catch (e) {
      return false;
    }
  }

  @override
  Future<AuthTokens?> getStoredTokens() async {
    try {
      final accessToken = _sharedPreferences.getString(AppConstants.accessTokenKey);
      final refreshToken = _sharedPreferences.getString(AppConstants.refreshTokenKey);

      if (accessToken != null && refreshToken != null) {
        return AuthTokens(
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiresAt: DateTime.now().add(const Duration(hours: 8)), // Default expiry
        );
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> clearAuthData() async {
    await _sharedPreferences.remove(AppConstants.userDataKey);
    await _sharedPreferences.remove(AppConstants.accessTokenKey);
    await _sharedPreferences.remove(AppConstants.refreshTokenKey);
    await _sharedPreferences.remove(AppConstants.organizationDataKey);
  }

  // Private helper methods
  Future<void> _storeAuthData(User user, AuthTokens tokens) async {
    await _storeUser(user);
    await _storeTokens(tokens);
  }

  Future<void> _storeUser(User user) async {
    await _sharedPreferences.setString(
      AppConstants.userDataKey,
      json.encode(user.toJson()),
    );
  }

  Future<void> _storeTokens(AuthTokens tokens) async {
    await _sharedPreferences.setString(AppConstants.accessTokenKey, tokens.accessToken);
    await _sharedPreferences.setString(AppConstants.refreshTokenKey, tokens.refreshToken);
  }

  Failure _mapApiExceptionToFailure(ApiException exception) {
    switch (exception.type) {
      case ApiExceptionType.network:
        return Failure.network(message: exception.message);
      case ApiExceptionType.timeout:
        return Failure.timeout(message: exception.message);
      case ApiExceptionType.unauthorized:
        return Failure.authentication(message: exception.message);
      case ApiExceptionType.forbidden:
        return Failure.authorization(message: exception.message);
      case ApiExceptionType.notFound:
        return Failure.notFound(message: exception.message);
      case ApiExceptionType.validation:
        return Failure.validation(message: exception.message);
      case ApiExceptionType.serverError:
        return Failure.server(
          message: exception.message,
          statusCode: exception.statusCode,
        );
      default:
        return Failure.unknown(message: exception.message);
    }
  }
}