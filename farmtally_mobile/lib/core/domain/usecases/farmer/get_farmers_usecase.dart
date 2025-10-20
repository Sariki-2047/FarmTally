import '../../entities/result.dart';
import '../../entities/farmer.dart';
import '../../repositories/farmer_repository.dart';
import '../usecase.dart';

class GetFarmersUseCase implements UseCase<List<Farmer>, GetFarmersParams> {
  final FarmerRepository _farmerRepository;

  const GetFarmersUseCase(this._farmerRepository);

  @override
  Future<Result<List<Farmer>>> call(GetFarmersParams params) async {
    try {
      return await _farmerRepository.getFarmers(
        organizationId: params.organizationId,
        search: params.search,
        pagination: params.pagination,
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get farmers: ${e.toString()}'),
      );
    }
  }
}

class GetFarmersParams {
  final String? organizationId;
  final String? search;
  final PaginationParams? pagination;

  const GetFarmersParams({
    this.organizationId,
    this.search,
    this.pagination,
  });
}