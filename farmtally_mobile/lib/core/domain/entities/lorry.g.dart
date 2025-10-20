// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'lorry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LorryImpl _$$LorryImplFromJson(Map<String, dynamic> json) => _$LorryImpl(
      id: json['id'] as String,
      organizationId: json['organizationId'] as String,
      registrationNumber: json['registrationNumber'] as String,
      driverName: json['driverName'] as String,
      driverPhone: json['driverPhone'] as String,
      capacity: (json['capacity'] as num).toDouble(),
      status: json['status'] as String? ?? 'AVAILABLE',
      currentLocation: json['currentLocation'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$LorryImplToJson(_$LorryImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'organizationId': instance.organizationId,
      'registrationNumber': instance.registrationNumber,
      'driverName': instance.driverName,
      'driverPhone': instance.driverPhone,
      'capacity': instance.capacity,
      'status': instance.status,
      'currentLocation': instance.currentLocation,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

_$LorryRequestImpl _$$LorryRequestImplFromJson(Map<String, dynamic> json) =>
    _$LorryRequestImpl(
      id: json['id'] as String,
      organizationId: json['organizationId'] as String,
      fieldManagerId: json['fieldManagerId'] as String,
      purpose: json['purpose'] as String,
      estimatedFarmers: (json['estimatedFarmers'] as num).toInt(),
      estimatedWeight: (json['estimatedWeight'] as num).toDouble(),
      urgency: json['urgency'] as String? ?? 'NORMAL',
      status: json['status'] as String? ?? 'PENDING',
      assignedLorryId: json['assignedLorryId'] as String?,
      notes: json['notes'] as String?,
      requestedDate: DateTime.parse(json['requestedDate'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      fieldManagerName: json['fieldManagerName'] as String?,
      assignedLorry: json['assignedLorry'] == null
          ? null
          : Lorry.fromJson(json['assignedLorry'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$LorryRequestImplToJson(_$LorryRequestImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'organizationId': instance.organizationId,
      'fieldManagerId': instance.fieldManagerId,
      'purpose': instance.purpose,
      'estimatedFarmers': instance.estimatedFarmers,
      'estimatedWeight': instance.estimatedWeight,
      'urgency': instance.urgency,
      'status': instance.status,
      'assignedLorryId': instance.assignedLorryId,
      'notes': instance.notes,
      'requestedDate': instance.requestedDate.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'fieldManagerName': instance.fieldManagerName,
      'assignedLorry': instance.assignedLorry,
    };

_$LorryTripImpl _$$LorryTripImplFromJson(Map<String, dynamic> json) =>
    _$LorryTripImpl(
      id: json['id'] as String,
      organizationId: json['organizationId'] as String,
      lorryId: json['lorryId'] as String,
      fieldManagerId: json['fieldManagerId'] as String,
      requestId: json['requestId'] as String?,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] == null
          ? null
          : DateTime.parse(json['endDate'] as String),
      status: json['status'] as String? ?? 'IN_PROGRESS',
      farmerCount: (json['farmerCount'] as num?)?.toInt() ?? 0,
      totalBags: (json['totalBags'] as num?)?.toInt() ?? 0,
      grossKg: (json['grossKg'] as num?)?.toDouble() ?? 0.0,
      netKg: (json['netKg'] as num?)?.toDouble() ?? 0.0,
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      lorry: json['lorry'] == null
          ? null
          : Lorry.fromJson(json['lorry'] as Map<String, dynamic>),
      fieldManagerName: json['fieldManagerName'] as String?,
      deliveries: (json['deliveries'] as List<dynamic>?)
          ?.map((e) => Delivery.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$LorryTripImplToJson(_$LorryTripImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'organizationId': instance.organizationId,
      'lorryId': instance.lorryId,
      'fieldManagerId': instance.fieldManagerId,
      'requestId': instance.requestId,
      'startDate': instance.startDate.toIso8601String(),
      'endDate': instance.endDate?.toIso8601String(),
      'status': instance.status,
      'farmerCount': instance.farmerCount,
      'totalBags': instance.totalBags,
      'grossKg': instance.grossKg,
      'netKg': instance.netKg,
      'notes': instance.notes,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'lorry': instance.lorry,
      'fieldManagerName': instance.fieldManagerName,
      'deliveries': instance.deliveries,
    };

_$DeliveryImpl _$$DeliveryImplFromJson(Map<String, dynamic> json) =>
    _$DeliveryImpl(
      id: json['id'] as String,
      organizationId: json['organizationId'] as String,
      tripId: json['tripId'] as String,
      farmerId: json['farmerId'] as String,
      farmerName: json['farmerName'] as String,
      farmerPhone: json['farmerPhone'] as String?,
      numberOfBags: (json['numberOfBags'] as num).toInt(),
      bagWeights: (json['bagWeights'] as List<dynamic>)
          .map((e) => (e as num).toDouble())
          .toList(),
      moisturePercent: (json['moisturePercent'] as num).toDouble(),
      qualityGrade: json['qualityGrade'] as String,
      grossWeight: (json['grossWeight'] as num).toDouble(),
      deductionFixedKg: (json['deductionFixedKg'] as num?)?.toDouble() ?? 0.0,
      qualityDeductionKg:
          (json['qualityDeductionKg'] as num?)?.toDouble() ?? 0.0,
      netWeight: (json['netWeight'] as num).toDouble(),
      status: json['status'] as String? ?? 'PENDING',
      notes: json['notes'] as String?,
      recordedAt: DateTime.parse(json['recordedAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$DeliveryImplToJson(_$DeliveryImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'organizationId': instance.organizationId,
      'tripId': instance.tripId,
      'farmerId': instance.farmerId,
      'farmerName': instance.farmerName,
      'farmerPhone': instance.farmerPhone,
      'numberOfBags': instance.numberOfBags,
      'bagWeights': instance.bagWeights,
      'moisturePercent': instance.moisturePercent,
      'qualityGrade': instance.qualityGrade,
      'grossWeight': instance.grossWeight,
      'deductionFixedKg': instance.deductionFixedKg,
      'qualityDeductionKg': instance.qualityDeductionKg,
      'netWeight': instance.netWeight,
      'status': instance.status,
      'notes': instance.notes,
      'recordedAt': instance.recordedAt.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };
