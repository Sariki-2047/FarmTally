import '../../entities/result.dart';
import '../../entities/lorry.dart';
import '../../repositories/lorry_repository.dart';
import '../usecase.dart';

class GetLorryByIdUseCase implements UseCase<Lorry, GetLorryByIdParams> {
  final LorryRepository _lorryRepository;

  const GetLorryByIdUseCase(this._lorryRepository);

  @override
  Future<Result<Lorry>> call(GetLorryByIdParams params) async {
    if (params.id.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Lorry ID is required'),
      );
    }

    try {
      return await _lorryRepository.getLorryById(params.id);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get lorry: ${e.toString()}'),
      );
    }
  }
}

class GetLorryByIdParams {
  final String id;

  const GetLorryByIdParams({required this.id});
}