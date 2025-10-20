enum Environment {
  development,
  staging,
  production,
}

class AppConfig {
  static Environment _environment = Environment.development;
  
  static Environment get environment => _environment;
  
  static void setEnvironment(Environment env) {
    _environment = env;
  }
  
  static String get baseUrl {
    switch (_environment) {
      case Environment.development:
        return 'http://localhost:3000/api';
      case Environment.staging:
        return 'https://farmtally-staging.herokuapp.com/api';
      case Environment.production:
        return '/api'; // Use relative URL for production (same domain)
    }
  }
  
  static String get appName {
    switch (_environment) {
      case Environment.development:
        return 'FarmTally (Dev)';
      case Environment.staging:
        return 'FarmTally (Staging)';
      case Environment.production:
        return 'FarmTally';
    }
  }
  
  static bool get isDebug => _environment != Environment.production;
  
  static Duration get apiTimeout {
    switch (_environment) {
      case Environment.development:
        return const Duration(seconds: 30);
      case Environment.staging:
        return const Duration(seconds: 20);
      case Environment.production:
        return const Duration(seconds: 15);
    }
  }
  
  static int get maxRetries {
    switch (_environment) {
      case Environment.development:
        return 3;
      case Environment.staging:
        return 2;
      case Environment.production:
        return 1;
    }
  }
}