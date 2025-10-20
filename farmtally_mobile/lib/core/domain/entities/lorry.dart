import 'package:freezed_annotation/freezed_annotation.dart';

part 'lorry.freezed.dart';
part 'lorry.g.dart';

@freezed
class Lorry with _$Lorry {
  const factory Lorry({
    required String id,
    required String organizationId,
    required String registrationNumber,
    required String driverName,
    required String driverPhone,
    required double capacity,
    @Default('AVAILABLE') String status,
    String? currentLocation,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Lorry;

  factory Lorry.fromJson(Map<String, dynamic> json) => _$LorryFromJson(json);
}

extension LorryExtension on Lorry {
  bool get isAvailable => status == 'AVAILABLE';
  bool get isAssigned => status == 'ASSIGNED';
  bool get isLoading => status == 'LOADING';
  bool get isSubmitted => status == 'SUBMITTED';
  bool get isSentToDealer => status == 'SENT_TO_DEALER';
}

@freezed
class LorryRequest with _$LorryRequest {
  const factory LorryRequest({
    required String id,
    required String organizationId,
    required String fieldManagerId,
    required String purpose,
    required int estimatedFarmers,
    required double estimatedWeight,
    @Default('NORMAL') String urgency,
    @Default('PENDING') String status,
    String? assignedLorryId,
    String? notes,
    required DateTime requestedDate,
    required DateTime createdAt,
    required DateTime updatedAt,
    // Related entities
    String? fieldManagerName,
    Lorry? assignedLorry,
  }) = _LorryRequest;

  factory LorryRequest.fromJson(Map<String, dynamic> json) => _$LorryRequestFromJson(json);
}

extension LorryRequestExtension on LorryRequest {
  bool get isPending => status == 'PENDING';
  bool get isApproved => status == 'APPROVED';
  bool get isRejected => status == 'REJECTED';
  bool get isCompleted => status == 'COMPLETED';
  
  bool get isUrgent => urgency == 'HIGH';
  bool get isNormal => urgency == 'NORMAL';
  bool get isLow => urgency == 'LOW';
}

@freezed
class LorryTrip with _$LorryTrip {
  const factory LorryTrip({
    required String id,
    required String organizationId,
    required String lorryId,
    required String fieldManagerId,
    String? requestId,
    required DateTime startDate,
    DateTime? endDate,
    @Default('IN_PROGRESS') String status,
    @Default(0) int farmerCount,
    @Default(0) int totalBags,
    @Default(0.0) double grossKg,
    @Default(0.0) double netKg,
    String? notes,
    required DateTime createdAt,
    required DateTime updatedAt,
    // Related entities
    Lorry? lorry,
    String? fieldManagerName,
    List<Delivery>? deliveries,
  }) = _LorryTrip;

  factory LorryTrip.fromJson(Map<String, dynamic> json) => _$LorryTripFromJson(json);
}

extension LorryTripExtension on LorryTrip {
  bool get isInProgress => status == 'IN_PROGRESS';
  bool get isCompleted => status == 'COMPLETED';
  bool get isCancelled => status == 'CANCELLED';
  
  double get averageBagWeight => totalBags > 0 ? grossKg / totalBags : 0.0;
  double get deductionPercentage => grossKg > 0 ? ((grossKg - netKg) / grossKg) * 100 : 0.0;
}

@freezed
class Delivery with _$Delivery {
  const factory Delivery({
    required String id,
    required String organizationId,
    required String tripId,
    required String farmerId,
    required String farmerName,
    String? farmerPhone,
    required int numberOfBags,
    required List<double> bagWeights,
    required double moisturePercent,
    required String qualityGrade,
    required double grossWeight,
    @Default(0.0) double deductionFixedKg,
    @Default(0.0) double qualityDeductionKg,
    required double netWeight,
    @Default('PENDING') String status,
    String? notes,
    required DateTime recordedAt,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Delivery;

  factory Delivery.fromJson(Map<String, dynamic> json) => _$DeliveryFromJson(json);
}

extension DeliveryExtension on Delivery {
  bool get isPending => status == 'PENDING';
  bool get isApproved => status == 'APPROVED';
  bool get isRejected => status == 'REJECTED';
  
  double get averageBagWeight => numberOfBags > 0 ? grossWeight / numberOfBags : 0.0;
  double get totalDeduction => deductionFixedKg + qualityDeductionKg;
  double get deductionPercentage => grossWeight > 0 ? (totalDeduction / grossWeight) * 100 : 0.0;
  
  bool get isGradeA => qualityGrade == 'A';
  bool get isGradeB => qualityGrade == 'B';
  bool get isGradeC => qualityGrade == 'C';
  bool get isGradeD => qualityGrade == 'D';
}