// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TripImpl _$$TripImplFromJson(Map<String, dynamic> json) => _$TripImpl(
      id: json['id'] as String,
      lorryId: json['lorryId'] as String,
      lorryNumber: json['lorryNumber'] as String,
      fieldManagerId: json['fieldManagerId'] as String,
      organizationId: json['organizationId'] as String,
      route: json['route'] as String,
      scheduledAt: DateTime.parse(json['scheduledAt'] as String),
      status: json['status'] as String,
      farmerCount: (json['farmerCount'] as num).toInt(),
      totalBags: (json['totalBags'] as num).toInt(),
      grossKg: (json['grossKg'] as num).toDouble(),
      netKg: (json['netKg'] as num).toDouble(),
      deliveries: (json['deliveries'] as List<dynamic>?)
          ?.map((e) => DeliveryEntry.fromJson(e as Map<String, dynamic>))
          .toList(),
      notes: json['notes'] as String?,
      startedAt: json['startedAt'] == null
          ? null
          : DateTime.parse(json['startedAt'] as String),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$TripImplToJson(_$TripImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'lorryId': instance.lorryId,
      'lorryNumber': instance.lorryNumber,
      'fieldManagerId': instance.fieldManagerId,
      'organizationId': instance.organizationId,
      'route': instance.route,
      'scheduledAt': instance.scheduledAt.toIso8601String(),
      'status': instance.status,
      'farmerCount': instance.farmerCount,
      'totalBags': instance.totalBags,
      'grossKg': instance.grossKg,
      'netKg': instance.netKg,
      'deliveries': instance.deliveries,
      'notes': instance.notes,
      'startedAt': instance.startedAt?.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };
