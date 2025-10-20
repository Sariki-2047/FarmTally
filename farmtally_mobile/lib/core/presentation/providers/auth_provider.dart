import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/entities/user.dart';
import '../../domain/entities/result.dart';
import '../../domain/entities/failure.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/auth/login_usecase.dart';
import '../../domain/usecases/auth/logout_usecase.dart';
import '../../domain/usecases/auth/get_current_user_usecase.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../services/api_service.dart';
import '../../services/database_service.dart';
import '../../domain/services/sync_service.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

// Auth State
class AuthState {
  final User? user;
  final AuthTokens? tokens;
  final bool isLoading;
  final String? error;
  final bool isInitialized;

  const AuthState({
    this.user,
    this.tokens,
    this.isLoading = false,
    this.error,
    this.isInitialized = false,
  });

  AuthState copyWith({
    User? user,
    AuthTokens? tokens,
    bool? isLoading,
    String? error,
    bool? isInitialized,
  }) {
    return AuthState(
      user: user ?? this.user,
      tokens: tokens ?? this.tokens,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isInitialized: isInitialized ?? this.isInitialized,
    );
  }

  bool get isAuthenticated => user != null && tokens != null && !tokens!.isExpired;
}

// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final LoginUseCase _loginUseCase;
  final LogoutUseCase _logoutUseCase;
  final GetCurrentUserUseCase _getCurrentUserUseCase;
  final AuthRepository _authRepository;

  final StreamController<AuthState> _streamController = StreamController<AuthState>.broadcast();

  AuthNotifier({
    required LoginUseCase loginUseCase,
    required LogoutUseCase logoutUseCase,
    required GetCurrentUserUseCase getCurrentUserUseCase,
    required AuthRepository authRepository,
  })  : _loginUseCase = loginUseCase,
        _logoutUseCase = logoutUseCase,
        _getCurrentUserUseCase = getCurrentUserUseCase,
        _authRepository = authRepository,
        super(const AuthState()) {
    _initialize();
  }

  Stream<AuthState> get stream => _streamController.stream;

  @override
  set state(AuthState value) {
    super.state = value;
    _streamController.add(value);
  }

  @override
  void dispose() {
    _streamController.close();
    super.dispose();
  }

  Future<void> _initialize() async {
    try {
      print('🔐 Initializing auth state...');
      
      // Check if user is authenticated
      final isAuthenticated = await _authRepository.isAuthenticated();
      if (isAuthenticated) {
        final result = await _getCurrentUserUseCase.call();
        result.when(
          success: (user) {
            print('🔐 User loaded from storage: ${user.email}');
            state = state.copyWith(
              user: user,
              tokens: null, // Will be loaded separately if needed
              isInitialized: true,
            );
          },
          failure: (failure) {
            print('🔐 Failed to load user: ${failure.userMessage}');
            state = state.copyWith(
              error: failure.userMessage,
              isInitialized: true,
            );
          },
        );
      } else {
        print('🔐 No authenticated user found');
        state = state.copyWith(isInitialized: true);
      }
    } catch (e) {
      print('🔐 Error initializing auth: $e');
      state = state.copyWith(
        error: 'Failed to initialize authentication',
        isInitialized: true,
      );
    }
  }

  Future<bool> login(String identifier, String password) async {
    print('🔐 Starting login for: $identifier');
    state = state.copyWith(isLoading: true, error: null);

    try {
      final params = LoginParams(identifier: identifier, password: password);
      final result = await _loginUseCase.call(params);

      return result.when(
        success: (authResult) {
          print('🔐 Login successful for: ${authResult.user.email}');
          state = state.copyWith(
            user: authResult.user,
            tokens: authResult.tokens,
            isLoading: false,
            error: null,
          );
          return true;
        },
        failure: (failure) {
          print('🔐 Login failed: ${failure.userMessage}');
          state = state.copyWith(
            isLoading: false,
            error: failure.userMessage,
          );
          return false;
        },
      );
    } catch (e) {
      print('🔐 Login error: $e');
      state = state.copyWith(
        isLoading: false,
        error: 'An unexpected error occurred during login',
      );
      return false;
    }
  }

  Future<void> logout() async {
    print('🔐 Logging out user');
    state = state.copyWith(isLoading: true);

    try {
      final result = await _logoutUseCase.call();
      result.when(
        success: (_) {
          print('🔐 Logout successful');
          state = const AuthState(isInitialized: true);
        },
        failure: (failure) {
          print('🔐 Logout failed: ${failure.userMessage}');
          // Still clear the state even if API call failed
          state = AuthState(
            error: failure.userMessage,
            isInitialized: true,
          );
        },
      );
    } catch (e) {
      print('🔐 Logout error: $e');
      // Still clear the state even if there was an error
      state = const AuthState(
        error: 'Logout completed with errors',
        isInitialized: true,
      );
    }
  }

  Future<void> refreshUser() async {
    if (!state.isAuthenticated) return;

    try {
      final result = await _getCurrentUserUseCase.call();
      result.when(
        success: (user) {
          state = state.copyWith(user: user);
        },
        failure: (failure) {
          print('🔐 Failed to refresh user: ${failure.userMessage}');
          // Don't update error state for background refresh
        },
      );
    } catch (e) {
      print('🔐 Error refreshing user: $e');
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Repository Provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    apiService: ref.watch(apiServiceProvider),
    databaseService: ref.watch(databaseServiceProvider),
    sharedPreferences: ref.watch(sharedPreferencesProvider),
  );
});

// Use Case Providers
final loginUseCaseProvider = Provider<LoginUseCase>((ref) {
  return LoginUseCase(ref.watch(authRepositoryProvider));
});

final logoutUseCaseProvider = Provider<LogoutUseCase>((ref) {
  return LogoutUseCase(ref.watch(authRepositoryProvider));
});

final getCurrentUserUseCaseProvider = Provider<GetCurrentUserUseCase>((ref) {
  return GetCurrentUserUseCase(ref.watch(authRepositoryProvider));
});

// Auth Notifier Provider
final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    loginUseCase: ref.watch(loginUseCaseProvider),
    logoutUseCase: ref.watch(logoutUseCaseProvider),
    getCurrentUserUseCase: ref.watch(getCurrentUserUseCaseProvider),
    authRepository: ref.watch(authRepositoryProvider),
  );
});

// Convenience Providers
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authNotifierProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authNotifierProvider).isAuthenticated;
});

final userRoleProvider = Provider<String?>((ref) {
  return ref.watch(currentUserProvider)?.role;
});

final organizationProvider = Provider<Organization?>((ref) {
  return ref.watch(currentUserProvider)?.organization;
});

final authLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authNotifierProvider).isLoading;
});

final authErrorProvider = Provider<String?>((ref) {
  return ref.watch(authNotifierProvider).error;
});

final authInitializedProvider = Provider<bool>((ref) {
  return ref.watch(authNotifierProvider).isInitialized;
});

// Required providers
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

final databaseServiceProvider = Provider<DatabaseService>((ref) {
  return DatabaseService.instance;
});

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden in main.dart');
});

final syncServiceProvider = Provider<SyncService>((ref) {
  return SyncServiceImpl(
    databaseService: ref.watch(databaseServiceProvider),
    apiService: ref.watch(apiServiceProvider),
    connectivity: Connectivity(),
  );
});