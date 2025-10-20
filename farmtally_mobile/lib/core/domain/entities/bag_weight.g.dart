// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bag_weight.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$BagWeightImpl _$$BagWeightImplFromJson(Map<String, dynamic> json) =>
    _$BagWeightImpl(
      id: json['id'] as String,
      deliveryId: json['deliveryId'] as String,
      weight: (json['weight'] as num).toDouble(),
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$BagWeightImplToJson(_$BagWeightImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'deliveryId': instance.deliveryId,
      'weight': instance.weight,
      'notes': instance.notes,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };
