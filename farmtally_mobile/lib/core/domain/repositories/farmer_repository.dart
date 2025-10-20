import '../entities/result.dart';
import '../entities/farmer.dart';
import '../entities/lorry.dart';
import '../usecases/usecase.dart';

abstract class FarmerRepository {
  /// Get all farmers for organization
  Future<Result<List<Farmer>>> getFarmers({
    String? organizationId,
    String? search,
    PaginationParams? pagination,
  });

  /// Get farmer by ID
  Future<Result<Farmer>> getFarmerById(String id);

  /// Get farmer by phone number
  Future<Result<Farmer?>> getFarmerByPhone({
    required String phone,
    required String organizationId,
  });

  /// Create new farmer
  Future<Result<Farmer>> createFarmer({
    required String name,
    required String phone,
    String? village,
    String? district,
    String? address,
    String? idNumber,
  });

  /// Update farmer
  Future<Result<Farmer>> updateFarmer({
    required String id,
    String? name,
    String? phone,
    String? village,
    String? district,
    String? address,
    String? idNumber,
  });

  /// Delete farmer
  Future<Result<void>> deleteFarmer(String id);

  /// Get farmer deliveries
  Future<Result<List<Delivery>>> getFarmerDeliveries({
    required String farmerId,
    DateTime? startDate,
    DateTime? endDate,
    PaginationParams? pagination,
  });

  /// Get farmer statistics
  Future<Result<FarmerStatistics>> getFarmerStatistics({
    required String farmerId,
    DateTime? startDate,
    DateTime? endDate,
  });

  /// Get farmers by performance
  Future<Result<List<FarmerPerformance>>> getFarmersByPerformance({
    String? organizationId,
    DateTime? startDate,
    DateTime? endDate,
    String? sortBy, // 'weight', 'deliveries', 'quality'
    bool ascending = false,
  });

  /// Search farmers
  Future<Result<List<Farmer>>> searchFarmers({
    required String query,
    String? organizationId,
    PaginationParams? pagination,
  });

  /// Get farmer payment history
  Future<Result<List<FarmerPayment>>> getFarmerPayments({
    required String farmerId,
    DateTime? startDate,
    DateTime? endDate,
    PaginationParams? pagination,
  });

  /// Record farmer payment
  Future<Result<FarmerPayment>> recordPayment({
    required String farmerId,
    required double amount,
    required String type, // 'ADVANCE', 'SETTLEMENT'
    String? reference,
    String? notes,
    List<String>? deliveryIds,
  });

  /// Get farmer advance balance
  Future<Result<double>> getFarmerAdvanceBalance(String farmerId);

  /// Update farmer statistics (called after delivery)
  Future<Result<void>> updateFarmerStatistics({
    required String farmerId,
    required double weightKg,
    required String qualityGrade,
  });
}

class FarmerStatistics {
  final String farmerId;
  final int totalDeliveries;
  final double totalWeightKg;
  final double averageWeightPerDelivery;
  final Map<String, int> qualityGradeDistribution;
  final double totalEarnings;
  final double pendingPayments;
  final double advanceBalance;
  final DateTime? lastDeliveryDate;
  final String averageQualityGrade;

  const FarmerStatistics({
    required this.farmerId,
    required this.totalDeliveries,
    required this.totalWeightKg,
    required this.averageWeightPerDelivery,
    required this.qualityGradeDistribution,
    required this.totalEarnings,
    required this.pendingPayments,
    required this.advanceBalance,
    this.lastDeliveryDate,
    required this.averageQualityGrade,
  });
}

class FarmerPerformance {
  final Farmer farmer;
  final FarmerStatistics statistics;
  final String performanceRating;
  final double performanceScore;

  const FarmerPerformance({
    required this.farmer,
    required this.statistics,
    required this.performanceRating,
    required this.performanceScore,
  });
}

class FarmerPayment {
  final String id;
  final String farmerId;
  final double amount;
  final String type; // 'ADVANCE', 'SETTLEMENT'
  final String? reference;
  final String? notes;
  final List<String> deliveryIds;
  final DateTime createdAt;
  final String createdBy;

  const FarmerPayment({
    required this.id,
    required this.farmerId,
    required this.amount,
    required this.type,
    this.reference,
    this.notes,
    required this.deliveryIds,
    required this.createdAt,
    required this.createdBy,
  });

  bool get isAdvance => type == 'ADVANCE';
  bool get isSettlement => type == 'SETTLEMENT';
}