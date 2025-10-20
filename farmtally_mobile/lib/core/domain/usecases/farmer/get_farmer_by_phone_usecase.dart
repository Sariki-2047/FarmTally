import '../../entities/result.dart';
import '../../entities/farmer.dart';
import '../../repositories/farmer_repository.dart';
import '../usecase.dart';

class GetFarmerByPhoneUseCase implements UseCase<Farmer?, GetFarmerByPhoneParams> {
  final FarmerRepository _farmerRepository;

  const GetFarmerByPhoneUseCase(this._farmerRepository);

  @override
  Future<Result<Farmer?>> call(GetFarmerByPhoneParams params) async {
    // Validate input
    if (params.phone.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Phone number is required'),
      );
    }

    if (params.organizationId.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Organization ID is required'),
      );
    }

    // Validate phone number format
    final phoneRegex = RegExp(r'^\+?[\d\s\-\(\)]+$');
    if (!phoneRegex.hasMatch(params.phone) || params.phone.length < 10) {
      return const Result.failure(
        Failure.validation(message: 'Please enter a valid phone number'),
      );
    }

    try {
      return await _farmerRepository.getFarmerByPhone(
        phone: params.phone.trim(),
        organizationId: params.organizationId,
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get farmer by phone: ${e.toString()}'),
      );
    }
  }
}

class GetFarmerByPhoneParams {
  final String phone;
  final String organizationId;

  const GetFarmerByPhoneParams({
    required this.phone,
    required this.organizationId,
  });
}