import '../../entities/result.dart';
import '../../entities/lorry.dart';
import '../../repositories/lorry_repository.dart';
import '../usecase.dart';

class CreateLorryRequestUseCase implements UseCase<LorryRequest, CreateLorryRequestParams> {
  final LorryRepository _lorryRepository;

  const CreateLorryRequestUseCase(this._lorryRepository);

  @override
  Future<Result<LorryRequest>> call(CreateLorryRequestParams params) async {
    // Validate input
    if (params.purpose.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Purpose is required'),
      );
    }

    if (params.estimatedFarmers <= 0) {
      return const Result.failure(
        Failure.validation(message: 'Estimated farmers must be greater than 0'),
      );
    }

    if (params.estimatedWeight <= 0) {
      return const Result.failure(
        Failure.validation(message: 'Estimated weight must be greater than 0'),
      );
    }

    if (params.requestedDate.isBefore(DateTime.now().subtract(const Duration(days: 1)))) {
      return const Result.failure(
        Failure.validation(message: 'Requested date cannot be in the past'),
      );
    }

    final validUrgencies = ['LOW', 'NORMAL', 'HIGH'];
    if (!validUrgencies.contains(params.urgency)) {
      return const Result.failure(
        Failure.validation(message: 'Invalid urgency level'),
      );
    }

    try {
      return await _lorryRepository.createLorryRequest(
        purpose: params.purpose.trim(),
        estimatedFarmers: params.estimatedFarmers,
        estimatedWeight: params.estimatedWeight,
        urgency: params.urgency,
        requestedDate: params.requestedDate,
        notes: params.notes?.trim(),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to create lorry request: ${e.toString()}'),
      );
    }
  }
}

class CreateLorryRequestParams {
  final String purpose;
  final int estimatedFarmers;
  final double estimatedWeight;
  final String urgency;
  final DateTime requestedDate;
  final String? notes;

  const CreateLorryRequestParams({
    required this.purpose,
    required this.estimatedFarmers,
    required this.estimatedWeight,
    required this.urgency,
    required this.requestedDate,
    this.notes,
  });
}