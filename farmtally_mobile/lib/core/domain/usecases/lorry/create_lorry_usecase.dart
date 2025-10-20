import '../../entities/result.dart';
import '../../entities/lorry.dart';
import '../../repositories/lorry_repository.dart';
import '../usecase.dart';

class CreateLorryUseCase implements UseCase<Lorry, CreateLorryParams> {
  final LorryRepository _lorryRepository;

  const CreateLorryUseCase(this._lorryRepository);

  @override
  Future<Result<Lorry>> call(CreateLorryParams params) async {
    // Validate input
    if (params.registrationNumber.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Registration number is required'),
      );
    }

    if (params.driverName.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Driver name is required'),
      );
    }

    if (params.driverPhone.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Driver phone is required'),
      );
    }

    if (params.capacity <= 0) {
      return const Result.failure(
        Failure.validation(message: 'Capacity must be greater than 0'),
      );
    }

    // Validate phone number format (basic)
    final phoneRegex = RegExp(r'^\+?[\d\s\-\(\)]+$');
    if (!phoneRegex.hasMatch(params.driverPhone) || params.driverPhone.length < 10) {
      return const Result.failure(
        Failure.validation(message: 'Please enter a valid phone number'),
      );
    }

    try {
      return await _lorryRepository.createLorry(
        registrationNumber: params.registrationNumber.trim().toUpperCase(),
        driverName: params.driverName.trim(),
        driverPhone: params.driverPhone.trim(),
        capacity: params.capacity,
        currentLocation: params.currentLocation?.trim(),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to create lorry: ${e.toString()}'),
      );
    }
  }
}

class CreateLorryParams {
  final String registrationNumber;
  final String driverName;
  final String driverPhone;
  final double capacity;
  final String? currentLocation;

  const CreateLorryParams({
    required this.registrationNumber,
    required this.driverName,
    required this.driverPhone,
    required this.capacity,
    this.currentLocation,
  });
}