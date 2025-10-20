// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delivery_entry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$DeliveryEntryImpl _$$DeliveryEntryImplFromJson(Map<String, dynamic> json) =>
    _$DeliveryEntryImpl(
      id: json['id'] as String,
      tripId: json['tripId'] as String,
      farmerId: json['farmerId'] as String,
      farmerName: json['farmerName'] as String,
      numberOfBags: (json['numberOfBags'] as num).toInt(),
      bagWeights: (json['bagWeights'] as List<dynamic>)
          .map((e) => BagWeight.fromJson(e as Map<String, dynamic>))
          .toList(),
      moisturePercent: (json['moisturePercent'] as num).toDouble(),
      qualityGrade: json['qualityGrade'] as String,
      grossWeight: (json['grossWeight'] as num).toDouble(),
      deductionFixedKg: (json['deductionFixedKg'] as num).toDouble(),
      netWeight: (json['netWeight'] as num).toDouble(),
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$DeliveryEntryImplToJson(_$DeliveryEntryImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tripId': instance.tripId,
      'farmerId': instance.farmerId,
      'farmerName': instance.farmerName,
      'numberOfBags': instance.numberOfBags,
      'bagWeights': instance.bagWeights,
      'moisturePercent': instance.moisturePercent,
      'qualityGrade': instance.qualityGrade,
      'grossWeight': instance.grossWeight,
      'deductionFixedKg': instance.deductionFixedKg,
      'netWeight': instance.netWeight,
      'notes': instance.notes,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };
