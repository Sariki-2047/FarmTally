import '../../entities/result.dart';
import '../../entities/lorry.dart';
import '../../repositories/lorry_repository.dart';
import '../usecase.dart';

class GetLorriesUseCase implements UseCase<List<Lorry>, GetLorriesParams> {
  final LorryRepository _lorryRepository;

  const GetLorriesUseCase(this._lorryRepository);

  @override
  Future<Result<List<Lorry>>> call(GetLorriesParams params) async {
    try {
      return await _lorryRepository.getLorries(
        organizationId: params.organizationId,
        status: params.status,
        pagination: params.pagination,
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get lorries: ${e.toString()}'),
      );
    }
  }
}

class GetLorriesParams {
  final String? organizationId;
  final String? status;
  final PaginationParams? pagination;

  const GetLorriesParams({
    this.organizationId,
    this.status,
    this.pagination,
  });
}