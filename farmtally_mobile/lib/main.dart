import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/app/app_router.dart';
import 'core/app/app_theme.dart';
import 'core/presentation/providers/auth_provider.dart';
import 'core/services/database_service.dart';
import 'core/services/notification_service.dart';
import 'core/utils/app_constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Log environment configuration
  debugPrint('🚀 FarmTally Mobile App Starting...');
  debugPrint('📡 API_BASE_URL: ${AppConstants.baseUrl}');
  debugPrint('📱 App Version: ${AppConstants.appVersion}');
  
  // Initialize SharedPreferences
  final sharedPreferences = await SharedPreferences.getInstance();
  
  // Initialize core services
  await DatabaseService.instance.initialize();
  await NotificationService.instance.initialize();
  
  debugPrint('✅ Core services initialized');
  
  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(sharedPreferences),
      ],
      child: const FarmTallyApp(),
    ),
  );
}

class FarmTallyApp extends ConsumerWidget {
  const FarmTallyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    
    return MaterialApp.router(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      
      // Theme
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      
      // Localization
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en', 'US'),
        Locale('hi', 'IN'),
      ],
      
      // Routing
      routerConfig: router,
    );
  }
}