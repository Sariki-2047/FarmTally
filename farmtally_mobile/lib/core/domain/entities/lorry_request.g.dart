// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'lorry_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LorryRequestImpl _$$LorryRequestImplFromJson(Map<String, dynamic> json) =>
    _$LorryRequestImpl(
      id: json['id'] as String,
      fieldManagerId: json['fieldManagerId'] as String,
      organizationId: json['organizationId'] as String,
      location: json['location'] as String,
      purpose: json['purpose'] as String,
      requestedAt: DateTime.parse(json['requestedAt'] as String),
      urgency: json['urgency'] as String,
      estFarmers: (json['estFarmers'] as num).toInt(),
      estWeightKg: (json['estWeightKg'] as num).toDouble(),
      status: json['status'] as String,
      assignedLorryNumber: json['assignedLorryNumber'] as String?,
      assignedLorryId: json['assignedLorryId'] as String?,
      rejectionReason: json['rejectionReason'] as String?,
      notes: json['notes'] as String?,
      approvedAt: json['approvedAt'] == null
          ? null
          : DateTime.parse(json['approvedAt'] as String),
      approvedBy: json['approvedBy'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$LorryRequestImplToJson(_$LorryRequestImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'fieldManagerId': instance.fieldManagerId,
      'organizationId': instance.organizationId,
      'location': instance.location,
      'purpose': instance.purpose,
      'requestedAt': instance.requestedAt.toIso8601String(),
      'urgency': instance.urgency,
      'estFarmers': instance.estFarmers,
      'estWeightKg': instance.estWeightKg,
      'status': instance.status,
      'assignedLorryNumber': instance.assignedLorryNumber,
      'assignedLorryId': instance.assignedLorryId,
      'rejectionReason': instance.rejectionReason,
      'notes': instance.notes,
      'approvedAt': instance.approvedAt?.toIso8601String(),
      'approvedBy': instance.approvedBy,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };
