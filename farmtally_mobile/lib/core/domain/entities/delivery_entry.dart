import 'package:freezed_annotation/freezed_annotation.dart';
import 'bag_weight.dart';

part 'delivery_entry.freezed.dart';
part 'delivery_entry.g.dart';

@freezed
class DeliveryEntry with _$DeliveryEntry {
  const factory DeliveryEntry({
    required String id,
    required String tripId,
    required String farmerId,
    required String farmerName,
    required int numberOfBags,
    required List<BagWeight> bagWeights,
    required double moisturePercent,
    required String qualityGrade,
    required double grossWeight,
    required double deductionFixedKg,
    required double netWeight,
    String? notes,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _DeliveryEntry;

  factory DeliveryEntry.fromJson(Map<String, dynamic> json) => _$DeliveryEntryFromJson(json);
}

extension DeliveryEntryExtension on DeliveryEntry {
  double get totalBagWeight => bagWeights.fold(0.0, (sum, bag) => sum + bag.weight);
  double get averageBagWeight => numberOfBags > 0 ? totalBagWeight / numberOfBags : 0.0;
  bool get isComplete => bagWeights.length == numberOfBags;
  String get displayWeight => '${netWeight.toStringAsFixed(2)} kg';
}