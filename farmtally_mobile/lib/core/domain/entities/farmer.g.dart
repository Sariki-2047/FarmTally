// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'farmer.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$FarmerImpl _$$FarmerImplFromJson(Map<String, dynamic> json) => _$FarmerImpl(
      id: json['id'] as String,
      organizationId: json['organizationId'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String,
      village: json['village'] as String?,
      district: json['district'] as String?,
      address: json['address'] as String?,
      idNumber: json['idNumber'] as String?,
      totalWeightKg: (json['totalWeightKg'] as num?)?.toDouble() ?? 0.0,
      totalDeliveries: (json['totalDeliveries'] as num?)?.toInt() ?? 0,
      lastDelivery: json['lastDelivery'] == null
          ? null
          : DateTime.parse(json['lastDelivery'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      averageDeliveryWeight:
          (json['averageDeliveryWeight'] as num?)?.toDouble() ?? 0.0,
      averageQualityGrade: json['averageQualityGrade'] as String? ?? 'A',
      totalEarnings: (json['totalEarnings'] as num?)?.toDouble() ?? 0.0,
      pendingPayments: (json['pendingPayments'] as num?)?.toDouble() ?? 0.0,
    );

Map<String, dynamic> _$$FarmerImplToJson(_$FarmerImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'organizationId': instance.organizationId,
      'name': instance.name,
      'phone': instance.phone,
      'village': instance.village,
      'district': instance.district,
      'address': instance.address,
      'idNumber': instance.idNumber,
      'totalWeightKg': instance.totalWeightKg,
      'totalDeliveries': instance.totalDeliveries,
      'lastDelivery': instance.lastDelivery?.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'averageDeliveryWeight': instance.averageDeliveryWeight,
      'averageQualityGrade': instance.averageQualityGrade,
      'totalEarnings': instance.totalEarnings,
      'pendingPayments': instance.pendingPayments,
    };
