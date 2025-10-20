import 'package:freezed_annotation/freezed_annotation.dart';

part 'farmer.freezed.dart';
part 'farmer.g.dart';

@freezed
class Farmer with _$Farmer {
  const factory Farmer({
    required String id,
    required String organizationId,
    required String name,
    required String phone,
    String? village,
    String? district,
    String? address,
    String? idNumber,
    @Default(0.0) double totalWeightKg,
    @Default(0) int totalDeliveries,
    DateTime? lastDelivery,
    required DateTime createdAt,
    required DateTime updatedAt,
    // Calculated fields
    @Default(0.0) double averageDeliveryWeight,
    @Default('A') String averageQualityGrade,
    @Default(0.0) double totalEarnings,
    @Default(0.0) double pendingPayments,
  }) = _Farmer;

  factory Farmer.fromJson(Map<String, dynamic> json) => _$FarmerFromJson(json);
}

extension FarmerExtension on Farmer {
  String get displayLocation {
    if (village != null && district != null) {
      return '$village, $district';
    } else if (village != null) {
      return village!;
    } else if (district != null) {
      return district!;
    }
    return 'Unknown Location';
  }

  bool get hasRecentDelivery {
    if (lastDelivery == null) return false;
    final daysSinceLastDelivery = DateTime.now().difference(lastDelivery!).inDays;
    return daysSinceLastDelivery <= 30; // Within last 30 days
  }

  String get performanceRating {
    if (totalDeliveries == 0) return 'New';
    if (totalDeliveries >= 50 && averageQualityGrade == 'A') return 'Excellent';
    if (totalDeliveries >= 20 && (averageQualityGrade == 'A' || averageQualityGrade == 'B')) return 'Good';
    if (totalDeliveries >= 10) return 'Average';
    return 'New';
  }

  double get averageDeliveryWeightPerTrip => totalDeliveries > 0 ? totalWeightKg / totalDeliveries : 0.0;
}