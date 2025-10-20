import '../../entities/result.dart';
import '../../repositories/auth_repository.dart';
import '../usecase.dart';

class LoginUseCase implements UseCase<AuthResult, LoginParams> {
  final AuthRepository _authRepository;

  const LoginUseCase(this._authRepository);

  @override
  Future<Result<AuthResult>> call(LoginParams params) async {
    // Validate input
    if (params.identifier.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Email or phone number is required'),
      );
    }

    if (params.password.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Password is required'),
      );
    }

    if (params.password.length < 6) {
      return const Result.failure(
        Failure.validation(message: 'Password must be at least 6 characters'),
      );
    }

    // Validate email or phone format
    final identifier = params.identifier.trim();
    if (identifier.contains('@')) {
      // Email validation
      final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
      if (!emailRegex.hasMatch(identifier)) {
        return const Result.failure(
          Failure.validation(message: 'Please enter a valid email address'),
        );
      }
    } else {
      // Phone validation (basic)
      final phoneRegex = RegExp(r'^\+?[\d\s\-\(\)]+$');
      if (!phoneRegex.hasMatch(identifier) || identifier.length < 10) {
        return const Result.failure(
          Failure.validation(message: 'Please enter a valid phone number'),
        );
      }
    }

    try {
      return await _authRepository.login(
        identifier: identifier,
        password: params.password,
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Login failed: ${e.toString()}'),
      );
    }
  }
}

class LoginParams {
  final String identifier; // email or phone
  final String password;

  const LoginParams({
    required this.identifier,
    required this.password,
  });
}