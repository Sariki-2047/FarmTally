import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/auth/presentation/pages/field_manager_registration_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';
import '../../features/lorry/presentation/pages/lorry_list_page_new.dart';
import '../../features/lorry/presentation/pages/lorry_detail_page.dart';
import '../../features/delivery/presentation/pages/delivery_entry_page.dart';
import '../../features/farmer/presentation/pages/farmer_list_page_fixed.dart';
import '../../features/reports/presentation/pages/reports_page.dart';
import '../../features/lorry_request/presentation/pages/lorry_request_list_page.dart';
import '../../features/admin/presentation/widgets/admin_app_shell.dart';
import '../../features/admin/presentation/pages/admin_dashboard_page.dart';
import '../../features/admin/presentation/pages/lorry_management_page.dart';
import '../../features/admin/presentation/pages/lorry_requests_page.dart';
import '../../features/admin/presentation/pages/field_managers_page.dart';
import '../../features/admin/presentation/pages/farmers_page.dart';
import '../../features/admin/presentation/pages/admin_reports_page.dart';
import '../../features/admin/presentation/pages/admin_settings_page.dart';
// Removed admin_test_page.dart import - file deleted during cleanup
import '../../features/admin/presentation/pages/lorry_detail_page.dart' as admin;
import '../../features/field_manager/presentation/widgets/fm_app_shell.dart';
import '../../features/field_manager/presentation/pages/fm_dashboard_page_stub.dart';
import '../../features/field_manager/presentation/pages/fm_stub_pages.dart';
import '../presentation/providers/auth_provider.dart';
import '../widgets/main_layout.dart';

// Helper class to refresh GoRouter when auth state changes
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<AuthState> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen(
      (AuthState _) => notifyListeners(),
    );
  }

  late final StreamSubscription<AuthState> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

// Route Names
class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String dashboard = '/dashboard';
  static const String lorries = '/lorries';
  static const String lorryDetail = '/lorries/:id';
  static const String deliveryEntry = '/lorries/:lorryId/delivery/:farmerId';
  static const String farmers = '/farmers';
  static const String reports = '/reports';
}

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.splash,
    redirect: (context, state) {
      // Get the current authentication state directly
      final authState = ref.read(authNotifierProvider);
      final isLoggedIn = authState.isAuthenticated;
      
      final currentPath = state.uri.toString();
      final isOnLoginPage = currentPath == AppRoutes.login;
      final isOnSplashPage = currentPath == AppRoutes.splash;
      final isOnAdminRoute = currentPath.contains('/app/admin') || currentPath.contains('/admin-test');
      
      print('🔍 Router Debug: isLoggedIn=$isLoggedIn, currentPath="$currentPath"');
      print('🔍 User: ${authState.user?.email}, Tokens: ${authState.tokens != null}');
      print('🔍 Admin Route: $isOnAdminRoute');
      
      // Allow splash page to handle initial routing
      if (isOnSplashPage) {
        return null;
      }
      
      // If not logged in and not on login page, redirect to login
      if (!isLoggedIn && !isOnLoginPage) {
        print('🔄 Redirecting to login (not authenticated)');
        return AppRoutes.login;
      }
      
      // If logged in and on login page, redirect based on user role
      if (isLoggedIn && isOnLoginPage) {
        final user = authState.user;
        if (user != null && user.role == 'FARM_ADMIN') {
          print('🔄 Redirecting to admin dashboard (farm admin)');
          return '/app/admin/dashboard';
        } else if (user != null && user.role == 'FIELD_MANAGER') {
          print('🔄 Redirecting to field manager dashboard');
          return '/app/fm/dashboard';
        } else {
          print('🔄 Redirecting to dashboard (authenticated)');
          return AppRoutes.dashboard;
        }
      }
      
      // Redirect users from regular dashboard to role-specific dashboard
      if (isLoggedIn && currentPath == AppRoutes.dashboard) {
        final user = authState.user;
        if (user != null && user.role == 'FARM_ADMIN') {
          print('🔄 Redirecting admin user to admin dashboard');
          return '/app/admin/dashboard';
        } else if (user != null && user.role == 'FIELD_MANAGER') {
          print('🔄 Redirecting field manager to FM dashboard');
          return '/app/fm/dashboard';
        }
      }
      
      // Allow all other routes (including admin routes) if logged in
      return null;
    },
    refreshListenable: GoRouterRefreshStream(ref.watch(authNotifierProvider.notifier).stream),
    routes: [
      // Splash Screen
      GoRoute(
        path: AppRoutes.splash,
        name: 'splash',
        builder: (context, state) => const SplashPage(),
      ),
      
      // Authentication
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      
      // Field Manager Registration
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) {
          final token = state.uri.queryParameters['token'];
          return FieldManagerRegistrationPage(token: token);
        },
      ),
      
      // Dashboard
      GoRoute(
        path: AppRoutes.dashboard,
        name: 'dashboard',
        builder: (context, state) => MainLayout(
          currentRoute: AppRoutes.dashboard,
          child: const DashboardPage(),
        ),
      ),
      
      // Lorries
      GoRoute(
        path: AppRoutes.lorries,
        name: 'lorries',
        builder: (context, state) => MainLayout(
          currentRoute: AppRoutes.lorries,
          child: const LorryListPageNew(),
        ),
        routes: [
          GoRoute(
            path: ':id',
            name: 'lorry-detail',
            builder: (context, state) {
              final lorryId = state.pathParameters['id']!;
              return MainLayout(
                currentRoute: AppRoutes.lorries,
                child: LorryDetailPage(lorryId: lorryId),
              );
            },
            routes: [
              GoRoute(
                path: 'delivery/:farmerId',
                name: 'delivery-entry',
                builder: (context, state) {
                  final lorryId = state.pathParameters['id']!;
                  final farmerId = state.pathParameters['farmerId']!;
                  return MainLayout(
                    currentRoute: '/delivery-entry',
                    child: DeliveryEntryPage(
                      lorryId: lorryId,
                      farmerId: farmerId,
                    ),
                  );
                },
              ),
            ],
          ),
        ],
      ),
      
      // Farmers
      GoRoute(
        path: AppRoutes.farmers,
        name: 'farmers',
        builder: (context, state) => MainLayout(
          currentRoute: AppRoutes.farmers,
          child: const FarmerListPageFixed(),
        ),
      ),
      
      // Reports
      GoRoute(
        path: AppRoutes.reports,
        name: 'reports',
        builder: (context, state) => MainLayout(
          currentRoute: AppRoutes.reports,
          child: const ReportsPage(),
        ),
      ),
      
      // Lorry Requests
      GoRoute(
        path: '/lorry-requests',
        name: 'lorry-requests',
        builder: (context, state) => MainLayout(
          currentRoute: '/lorry-requests',
          child: const LorryRequestListPage(),
        ),
      ),
      
      // Delivery Entry (standalone)
      GoRoute(
        path: '/delivery-entry',
        name: 'delivery-entry-standalone',
        builder: (context, state) => MainLayout(
          currentRoute: '/delivery-entry',
          child: const DeliveryEntryPage(),
        ),
      ),
      
      // Admin Test Page - Removed during cleanup
      
      // Admin Routes
      ShellRoute(
        builder: (context, state, child) => AdminAppShell(child: child),
        routes: [
          GoRoute(
            path: '/app/admin/dashboard',
            name: 'admin-dashboard',
            builder: (context, state) => const AdminDashboardPage(),
          ),
          GoRoute(
            path: '/app/admin/lorry-management',
            name: 'admin-lorry-management',
            builder: (context, state) => const LorryManagementPage(),
            routes: [
              GoRoute(
                path: '/:lorryId',
                name: 'admin-lorry-detail',
                builder: (context, state) {
                  final lorryId = state.pathParameters['lorryId']!;
                  return admin.LorryDetailPage(lorryId: lorryId);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/app/admin/lorry-requests',
            name: 'admin-lorry-requests',
            builder: (context, state) => const LorryRequestsPage(),
          ),
          GoRoute(
            path: '/app/admin/field-managers',
            name: 'admin-field-managers',
            builder: (context, state) => const FieldManagersPage(),
          ),
          GoRoute(
            path: '/app/admin/farmers',
            name: 'admin-farmers',
            builder: (context, state) => const FarmersPage(),
          ),
          GoRoute(
            path: '/app/admin/reports',
            name: 'admin-reports',
            builder: (context, state) => const AdminReportsPage(),
          ),
          GoRoute(
            path: '/app/admin/settings',
            name: 'admin-settings',
            builder: (context, state) => const AdminSettingsPage(),
          ),
        ],
      ),
      
      // Field Manager Routes
      ShellRoute(
        builder: (context, state, child) => FmAppShell(child: child),
        routes: [
          GoRoute(
            path: '/app/fm/dashboard',
            name: 'fm-dashboard',
            builder: (context, state) => const FmDashboardPageStub(),
          ),
          GoRoute(
            path: '/app/fm/my-lorries',
            name: 'fm-my-lorries',
            builder: (context, state) => const FmMyLorriesPageStub(),
          ),
          GoRoute(
            path: '/app/fm/my-lorries/:tripId',
            name: 'fm-trip-detail',
            builder: (context, state) {
              final tripId = state.pathParameters['tripId']!;
              return FmTripDetailPage(tripId: tripId);
            },
          ),
          GoRoute(
            path: '/app/fm/lorry-requests',
            name: 'fm-lorry-requests',
            builder: (context, state) => const FmLorryRequestsPage(),
          ),
          GoRoute(
            path: '/app/fm/farmers',
            name: 'fm-farmers',
            builder: (context, state) => const FmFarmersPage(),
          ),
          GoRoute(
            path: '/app/fm/reports',
            name: 'fm-reports',
            builder: (context, state) => const FmReportsPage(),
          ),
        ],
      ),
    ],
    
    // Error handling
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              state.uri.toString(),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go(AppRoutes.dashboard),
              child: const Text('Go to Dashboard'),
            ),
          ],
        ),
      ),
    ),
  );
});

// Navigation Extensions
extension AppRouterExtension on GoRouter {
  void goToLorryDetail(String lorryId) {
    go('/lorries/$lorryId');
  }
  
  void goToDeliveryEntry(String lorryId, String farmerId) {
    go('/lorries/$lorryId/delivery/$farmerId');
  }
}