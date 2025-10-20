import '../entities/result.dart';
import '../entities/lorry.dart';
import '../usecases/usecase.dart';

abstract class LorryRepository {
  /// Get all lorries for organization
  Future<Result<List<Lorry>>> getLorries({
    String? organizationId,
    String? status,
    PaginationParams? pagination,
  });

  /// Get lorry by ID
  Future<Result<Lorry>> getLorryById(String id);

  /// Create new lorry
  Future<Result<Lorry>> createLorry({
    required String registrationNumber,
    required String driverName,
    required String driverPhone,
    required double capacity,
    String? currentLocation,
  });

  /// Update lorry
  Future<Result<Lorry>> updateLorry({
    required String id,
    String? registrationNumber,
    String? driverName,
    String? driverPhone,
    double? capacity,
    String? status,
    String? currentLocation,
  });

  /// Delete lorry
  Future<Result<void>> deleteLorry(String id);

  /// Update lorry status
  Future<Result<Lorry>> updateLorryStatus({
    required String id,
    required String status,
  });

  /// Get lorry requests
  Future<Result<List<LorryRequest>>> getLorryRequests({
    String? organizationId,
    String? fieldManagerId,
    String? status,
    PaginationParams? pagination,
  });

  /// Get lorry request by ID
  Future<Result<LorryRequest>> getLorryRequestById(String id);

  /// Create lorry request
  Future<Result<LorryRequest>> createLorryRequest({
    required String purpose,
    required int estimatedFarmers,
    required double estimatedWeight,
    required String urgency,
    required DateTime requestedDate,
    String? notes,
  });

  /// Update lorry request
  Future<Result<LorryRequest>> updateLorryRequest({
    required String id,
    String? purpose,
    int? estimatedFarmers,
    double? estimatedWeight,
    String? urgency,
    DateTime? requestedDate,
    String? notes,
  });

  /// Approve lorry request
  Future<Result<LorryRequest>> approveLorryRequest({
    required String requestId,
    required String lorryId,
  });

  /// Reject lorry request
  Future<Result<LorryRequest>> rejectLorryRequest({
    required String requestId,
    String? reason,
  });

  /// Get lorry trips
  Future<Result<List<LorryTrip>>> getLorryTrips({
    String? organizationId,
    String? lorryId,
    String? fieldManagerId,
    String? status,
    PaginationParams? pagination,
  });

  /// Get lorry trip by ID
  Future<Result<LorryTrip>> getLorryTripById(String id);

  /// Create lorry trip
  Future<Result<LorryTrip>> createLorryTrip({
    required String lorryId,
    String? requestId,
    required DateTime startDate,
    String? notes,
  });

  /// Update lorry trip
  Future<Result<LorryTrip>> updateLorryTrip({
    required String id,
    DateTime? endDate,
    String? status,
    String? notes,
  });

  /// Complete lorry trip
  Future<Result<LorryTrip>> completeLorryTrip({
    required String id,
    required DateTime endDate,
    String? notes,
  });

  /// Get deliveries for trip
  Future<Result<List<Delivery>>> getDeliveriesForTrip(String tripId);

  /// Add delivery to trip
  Future<Result<Delivery>> addDelivery({
    required String tripId,
    required String farmerId,
    required String farmerName,
    String? farmerPhone,
    required int numberOfBags,
    required List<double> bagWeights,
    required double moisturePercent,
    required String qualityGrade,
    required double grossWeight,
    double? deductionFixedKg,
    double? qualityDeductionKg,
    required double netWeight,
    String? notes,
  });

  /// Update delivery
  Future<Result<Delivery>> updateDelivery({
    required String id,
    int? numberOfBags,
    List<double>? bagWeights,
    double? moisturePercent,
    String? qualityGrade,
    double? grossWeight,
    double? deductionFixedKg,
    double? qualityDeductionKg,
    double? netWeight,
    String? status,
    String? notes,
  });

  /// Delete delivery
  Future<Result<void>> deleteDelivery(String id);

  /// Submit trip for processing
  Future<Result<LorryTrip>> submitTrip(String tripId);

  /// Get trip statistics
  Future<Result<TripStatistics>> getTripStatistics({
    String? organizationId,
    DateTime? startDate,
    DateTime? endDate,
  });
}

class TripStatistics {
  final int totalTrips;
  final int completedTrips;
  final int inProgressTrips;
  final double totalWeightKg;
  final double averageWeightPerTrip;
  final int totalFarmers;
  final int totalDeliveries;
  final Map<String, int> qualityGradeDistribution;

  const TripStatistics({
    required this.totalTrips,
    required this.completedTrips,
    required this.inProgressTrips,
    required this.totalWeightKg,
    required this.averageWeightPerTrip,
    required this.totalFarmers,
    required this.totalDeliveries,
    required this.qualityGradeDistribution,
  });
}