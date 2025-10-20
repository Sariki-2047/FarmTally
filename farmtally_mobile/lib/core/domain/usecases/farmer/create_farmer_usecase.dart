import '../../entities/result.dart';
import '../../entities/farmer.dart';
import '../../repositories/farmer_repository.dart';
import '../usecase.dart';

class CreateFarmerUseCase implements UseCase<Farmer, CreateFarmerParams> {
  final FarmerRepository _farmerRepository;

  const CreateFarmerUseCase(this._farmerRepository);

  @override
  Future<Result<Farmer>> call(CreateFarmerParams params) async {
    // Validate input
    if (params.name.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Farmer name is required'),
      );
    }

    if (params.phone.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Phone number is required'),
      );
    }

    // Validate phone number format
    final phoneRegex = RegExp(r'^\+?[\d\s\-\(\)]+$');
    if (!phoneRegex.hasMatch(params.phone) || params.phone.length < 10) {
      return const Result.failure(
        Failure.validation(message: 'Please enter a valid phone number'),
      );
    }

    // Validate name length
    if (params.name.trim().length < 2) {
      return const Result.failure(
        Failure.validation(message: 'Name must be at least 2 characters long'),
      );
    }

    if (params.name.trim().length > 100) {
      return const Result.failure(
        Failure.validation(message: 'Name must be less than 100 characters'),
      );
    }

    // Validate village and district if provided
    if (params.village != null && params.village!.trim().length > 100) {
      return const Result.failure(
        Failure.validation(message: 'Village name must be less than 100 characters'),
      );
    }

    if (params.district != null && params.district!.trim().length > 100) {
      return const Result.failure(
        Failure.validation(message: 'District name must be less than 100 characters'),
      );
    }

    if (params.address != null && params.address!.trim().length > 500) {
      return const Result.failure(
        Failure.validation(message: 'Address must be less than 500 characters'),
      );
    }

    try {
      return await _farmerRepository.createFarmer(
        name: params.name.trim(),
        phone: params.phone.trim(),
        village: params.village?.trim(),
        district: params.district?.trim(),
        address: params.address?.trim(),
        idNumber: params.idNumber?.trim(),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to create farmer: ${e.toString()}'),
      );
    }
  }
}

class CreateFarmerParams {
  final String name;
  final String phone;
  final String? village;
  final String? district;
  final String? address;
  final String? idNumber;

  const CreateFarmerParams({
    required this.name,
    required this.phone,
    this.village,
    this.district,
    this.address,
    this.idNumber,
  });
}