import '../../entities/result.dart';
import '../../entities/lorry.dart';
import '../../repositories/lorry_repository.dart';
import '../../repositories/farmer_repository.dart';
import '../usecase.dart';

class AddDeliveryUseCase implements UseCase<Delivery, AddDeliveryParams> {
  final LorryRepository _lorryRepository;
  final FarmerRepository _farmerRepository;

  const AddDeliveryUseCase(this._lorryRepository, this._farmerRepository);

  @override
  Future<Result<Delivery>> call(AddDeliveryParams params) async {
    // Validate input
    if (params.tripId.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Trip ID is required'),
      );
    }

    if (params.farmerId.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Farmer ID is required'),
      );
    }

    if (params.farmerName.trim().isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Farmer name is required'),
      );
    }

    if (params.numberOfBags <= 0) {
      return const Result.failure(
        Failure.validation(message: 'Number of bags must be greater than 0'),
      );
    }

    if (params.bagWeights.isEmpty) {
      return const Result.failure(
        Failure.validation(message: 'Bag weights are required'),
      );
    }

    if (params.bagWeights.length != params.numberOfBags) {
      return const Result.failure(
        Failure.validation(message: 'Number of bag weights must match number of bags'),
      );
    }

    if (params.bagWeights.any((weight) => weight <= 0)) {
      return const Result.failure(
        Failure.validation(message: 'All bag weights must be greater than 0'),
      );
    }

    if (params.moisturePercent < 0 || params.moisturePercent > 100) {
      return const Result.failure(
        Failure.validation(message: 'Moisture percentage must be between 0 and 100'),
      );
    }

    final validGrades = ['A', 'B', 'C', 'D'];
    if (!validGrades.contains(params.qualityGrade)) {
      return const Result.failure(
        Failure.validation(message: 'Quality grade must be A, B, C, or D'),
      );
    }

    if (params.grossWeight <= 0) {
      return const Result.failure(
        Failure.validation(message: 'Gross weight must be greater than 0'),
      );
    }

    if (params.netWeight <= 0) {
      return const Result.failure(
        Failure.validation(message: 'Net weight must be greater than 0'),
      );
    }

    if (params.netWeight > params.grossWeight) {
      return const Result.failure(
        Failure.validation(message: 'Net weight cannot be greater than gross weight'),
      );
    }

    // Validate phone number if provided
    if (params.farmerPhone != null && params.farmerPhone!.isNotEmpty) {
      final phoneRegex = RegExp(r'^\+?[\d\s\-\(\)]+$');
      if (!phoneRegex.hasMatch(params.farmerPhone!) || params.farmerPhone!.length < 10) {
        return const Result.failure(
          Failure.validation(message: 'Please enter a valid phone number'),
        );
      }
    }

    try {
      // Add the delivery
      final deliveryResult = await _lorryRepository.addDelivery(
        tripId: params.tripId,
        farmerId: params.farmerId,
        farmerName: params.farmerName.trim(),
        farmerPhone: params.farmerPhone?.trim(),
        numberOfBags: params.numberOfBags,
        bagWeights: params.bagWeights,
        moisturePercent: params.moisturePercent,
        qualityGrade: params.qualityGrade,
        grossWeight: params.grossWeight,
        deductionFixedKg: params.deductionFixedKg ?? 0.0,
        qualityDeductionKg: params.qualityDeductionKg ?? 0.0,
        netWeight: params.netWeight,
        notes: params.notes?.trim(),
      );

      if (deliveryResult.isSuccess) {
        // Update farmer statistics
        await _farmerRepository.updateFarmerStatistics(
          farmerId: params.farmerId,
          weightKg: params.netWeight,
          qualityGrade: params.qualityGrade,
        );
      }

      return deliveryResult;
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to add delivery: ${e.toString()}'),
      );
    }
  }
}

class AddDeliveryParams {
  final String tripId;
  final String farmerId;
  final String farmerName;
  final String? farmerPhone;
  final int numberOfBags;
  final List<double> bagWeights;
  final double moisturePercent;
  final String qualityGrade;
  final double grossWeight;
  final double? deductionFixedKg;
  final double? qualityDeductionKg;
  final double netWeight;
  final String? notes;

  const AddDeliveryParams({
    required this.tripId,
    required this.farmerId,
    required this.farmerName,
    this.farmerPhone,
    required this.numberOfBags,
    required this.bagWeights,
    required this.moisturePercent,
    required this.qualityGrade,
    required this.grossWeight,
    this.deductionFixedKg,
    this.qualityDeductionKg,
    required this.netWeight,
    this.notes,
  });
}