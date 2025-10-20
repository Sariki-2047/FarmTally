import '../../entities/result.dart';
import '../../repositories/auth_repository.dart';
import '../usecase.dart';

class LogoutUseCase implements NoParamsUseCase<void> {
  final AuthRepository _authRepository;

  const LogoutUseCase(this._authRepository);

  @override
  Future<Result<void>> call() async {
    try {
      return await _authRepository.logout();
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Logout failed: ${e.toString()}'),
      );
    }
  }
}