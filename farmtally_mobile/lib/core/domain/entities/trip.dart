import 'package:freezed_annotation/freezed_annotation.dart';
import 'delivery_entry.dart';

part 'trip.freezed.dart';
part 'trip.g.dart';

@freezed
class Trip with _$Trip {
  const factory Trip({
    required String id,
    required String lorryId,
    required String lorryNumber,
    required String fieldManagerId,
    required String organizationId,
    required String route,
    required DateTime scheduledAt,
    required String status, // 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    required int farmerCount,
    required int totalBags,
    required double grossKg,
    required double netKg,
    List<DeliveryEntry>? deliveries,
    String? notes,
    DateTime? startedAt,
    DateTime? completedAt,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Trip;

  factory Trip.fromJson(Map<String, dynamic> json) => _$TripFromJson(json);
}

extension TripExtension on Trip {
  bool get isScheduled => status == 'SCHEDULED';
  bool get isInProgress => status == 'IN_PROGRESS';
  bool get isCompleted => status == 'COMPLETED';
  bool get isCancelled => status == 'CANCELLED';
  
  String get statusDisplay {
    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }
  
  double get averageBagWeight => totalBags > 0 ? grossKg / totalBags : 0.0;
  int get deliveryCount => deliveries?.length ?? 0;
}