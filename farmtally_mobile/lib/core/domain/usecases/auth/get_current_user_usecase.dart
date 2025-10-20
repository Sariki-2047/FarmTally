import '../../entities/result.dart';
import '../../entities/user.dart';
import '../../repositories/auth_repository.dart';
import '../usecase.dart';

class GetCurrentUserUseCase implements NoParamsUseCase<User> {
  final AuthRepository _authRepository;

  const GetCurrentUserUseCase(this._authRepository);

  @override
  Future<Result<User>> call() async {
    try {
      // Check if user is authenticated first
      final isAuthenticated = await _authRepository.isAuthenticated();
      if (!isAuthenticated) {
        return const Result.failure(
          Failure.authentication(message: 'User is not authenticated'),
        );
      }

      return await _authRepository.getCurrentUser();
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get current user: ${e.toString()}'),
      );
    }
  }
}