import 'package:freezed_annotation/freezed_annotation.dart';

part 'bag_weight.freezed.dart';
part 'bag_weight.g.dart';

@freezed
class BagWeight with _$BagWeight {
  const factory BagWeight({
    required String id,
    required String deliveryId,
    required double weight,
    String? notes,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _BagWeight;

  factory BagWeight.fromJson(Map<String, dynamic> json) => _$BagWeightFromJson(json);
}

extension BagWeightExtension on BagWeight {
  bool get isValid => weight > 0;
  String get displayWeight => '${weight.toStringAsFixed(2)} kg';
}