// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'lorry_request.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

LorryRequest _$LorryRequestFromJson(Map<String, dynamic> json) {
  return _LorryRequest.fromJson(json);
}

/// @nodoc
mixin _$LorryRequest {
  String get id => throw _privateConstructorUsedError;
  String get fieldManagerId => throw _privateConstructorUsedError;
  String get organizationId => throw _privateConstructorUsedError;
  String get location => throw _privateConstructorUsedError;
  String get purpose => throw _privateConstructorUsedError;
  DateTime get requestedAt => throw _privateConstructorUsedError;
  String get urgency =>
      throw _privateConstructorUsedError; // 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  int get estFarmers => throw _privateConstructorUsedError;
  double get estWeightKg => throw _privateConstructorUsedError;
  String get status =>
      throw _privateConstructorUsedError; // 'PENDING', 'APPROVED', 'REJECTED', 'ASSIGNED', 'COMPLETED'
  String? get assignedLorryNumber => throw _privateConstructorUsedError;
  String? get assignedLorryId => throw _privateConstructorUsedError;
  String? get rejectionReason => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  DateTime? get approvedAt => throw _privateConstructorUsedError;
  String? get approvedBy => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this LorryRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LorryRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LorryRequestCopyWith<LorryRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LorryRequestCopyWith<$Res> {
  factory $LorryRequestCopyWith(
          LorryRequest value, $Res Function(LorryRequest) then) =
      _$LorryRequestCopyWithImpl<$Res, LorryRequest>;
  @useResult
  $Res call(
      {String id,
      String fieldManagerId,
      String organizationId,
      String location,
      String purpose,
      DateTime requestedAt,
      String urgency,
      int estFarmers,
      double estWeightKg,
      String status,
      String? assignedLorryNumber,
      String? assignedLorryId,
      String? rejectionReason,
      String? notes,
      DateTime? approvedAt,
      String? approvedBy,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class _$LorryRequestCopyWithImpl<$Res, $Val extends LorryRequest>
    implements $LorryRequestCopyWith<$Res> {
  _$LorryRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LorryRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? fieldManagerId = null,
    Object? organizationId = null,
    Object? location = null,
    Object? purpose = null,
    Object? requestedAt = null,
    Object? urgency = null,
    Object? estFarmers = null,
    Object? estWeightKg = null,
    Object? status = null,
    Object? assignedLorryNumber = freezed,
    Object? assignedLorryId = freezed,
    Object? rejectionReason = freezed,
    Object? notes = freezed,
    Object? approvedAt = freezed,
    Object? approvedBy = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      fieldManagerId: null == fieldManagerId
          ? _value.fieldManagerId
          : fieldManagerId // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      location: null == location
          ? _value.location
          : location // ignore: cast_nullable_to_non_nullable
              as String,
      purpose: null == purpose
          ? _value.purpose
          : purpose // ignore: cast_nullable_to_non_nullable
              as String,
      requestedAt: null == requestedAt
          ? _value.requestedAt
          : requestedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      urgency: null == urgency
          ? _value.urgency
          : urgency // ignore: cast_nullable_to_non_nullable
              as String,
      estFarmers: null == estFarmers
          ? _value.estFarmers
          : estFarmers // ignore: cast_nullable_to_non_nullable
              as int,
      estWeightKg: null == estWeightKg
          ? _value.estWeightKg
          : estWeightKg // ignore: cast_nullable_to_non_nullable
              as double,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      assignedLorryNumber: freezed == assignedLorryNumber
          ? _value.assignedLorryNumber
          : assignedLorryNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedLorryId: freezed == assignedLorryId
          ? _value.assignedLorryId
          : assignedLorryId // ignore: cast_nullable_to_non_nullable
              as String?,
      rejectionReason: freezed == rejectionReason
          ? _value.rejectionReason
          : rejectionReason // ignore: cast_nullable_to_non_nullable
              as String?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      approvedAt: freezed == approvedAt
          ? _value.approvedAt
          : approvedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      approvedBy: freezed == approvedBy
          ? _value.approvedBy
          : approvedBy // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$LorryRequestImplCopyWith<$Res>
    implements $LorryRequestCopyWith<$Res> {
  factory _$$LorryRequestImplCopyWith(
          _$LorryRequestImpl value, $Res Function(_$LorryRequestImpl) then) =
      __$$LorryRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String fieldManagerId,
      String organizationId,
      String location,
      String purpose,
      DateTime requestedAt,
      String urgency,
      int estFarmers,
      double estWeightKg,
      String status,
      String? assignedLorryNumber,
      String? assignedLorryId,
      String? rejectionReason,
      String? notes,
      DateTime? approvedAt,
      String? approvedBy,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class __$$LorryRequestImplCopyWithImpl<$Res>
    extends _$LorryRequestCopyWithImpl<$Res, _$LorryRequestImpl>
    implements _$$LorryRequestImplCopyWith<$Res> {
  __$$LorryRequestImplCopyWithImpl(
      _$LorryRequestImpl _value, $Res Function(_$LorryRequestImpl) _then)
      : super(_value, _then);

  /// Create a copy of LorryRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? fieldManagerId = null,
    Object? organizationId = null,
    Object? location = null,
    Object? purpose = null,
    Object? requestedAt = null,
    Object? urgency = null,
    Object? estFarmers = null,
    Object? estWeightKg = null,
    Object? status = null,
    Object? assignedLorryNumber = freezed,
    Object? assignedLorryId = freezed,
    Object? rejectionReason = freezed,
    Object? notes = freezed,
    Object? approvedAt = freezed,
    Object? approvedBy = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_$LorryRequestImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      fieldManagerId: null == fieldManagerId
          ? _value.fieldManagerId
          : fieldManagerId // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      location: null == location
          ? _value.location
          : location // ignore: cast_nullable_to_non_nullable
              as String,
      purpose: null == purpose
          ? _value.purpose
          : purpose // ignore: cast_nullable_to_non_nullable
              as String,
      requestedAt: null == requestedAt
          ? _value.requestedAt
          : requestedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      urgency: null == urgency
          ? _value.urgency
          : urgency // ignore: cast_nullable_to_non_nullable
              as String,
      estFarmers: null == estFarmers
          ? _value.estFarmers
          : estFarmers // ignore: cast_nullable_to_non_nullable
              as int,
      estWeightKg: null == estWeightKg
          ? _value.estWeightKg
          : estWeightKg // ignore: cast_nullable_to_non_nullable
              as double,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      assignedLorryNumber: freezed == assignedLorryNumber
          ? _value.assignedLorryNumber
          : assignedLorryNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedLorryId: freezed == assignedLorryId
          ? _value.assignedLorryId
          : assignedLorryId // ignore: cast_nullable_to_non_nullable
              as String?,
      rejectionReason: freezed == rejectionReason
          ? _value.rejectionReason
          : rejectionReason // ignore: cast_nullable_to_non_nullable
              as String?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      approvedAt: freezed == approvedAt
          ? _value.approvedAt
          : approvedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      approvedBy: freezed == approvedBy
          ? _value.approvedBy
          : approvedBy // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LorryRequestImpl implements _LorryRequest {
  const _$LorryRequestImpl(
      {required this.id,
      required this.fieldManagerId,
      required this.organizationId,
      required this.location,
      required this.purpose,
      required this.requestedAt,
      required this.urgency,
      required this.estFarmers,
      required this.estWeightKg,
      required this.status,
      this.assignedLorryNumber,
      this.assignedLorryId,
      this.rejectionReason,
      this.notes,
      this.approvedAt,
      this.approvedBy,
      required this.createdAt,
      required this.updatedAt});

  factory _$LorryRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$LorryRequestImplFromJson(json);

  @override
  final String id;
  @override
  final String fieldManagerId;
  @override
  final String organizationId;
  @override
  final String location;
  @override
  final String purpose;
  @override
  final DateTime requestedAt;
  @override
  final String urgency;
// 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  @override
  final int estFarmers;
  @override
  final double estWeightKg;
  @override
  final String status;
// 'PENDING', 'APPROVED', 'REJECTED', 'ASSIGNED', 'COMPLETED'
  @override
  final String? assignedLorryNumber;
  @override
  final String? assignedLorryId;
  @override
  final String? rejectionReason;
  @override
  final String? notes;
  @override
  final DateTime? approvedAt;
  @override
  final String? approvedBy;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'LorryRequest(id: $id, fieldManagerId: $fieldManagerId, organizationId: $organizationId, location: $location, purpose: $purpose, requestedAt: $requestedAt, urgency: $urgency, estFarmers: $estFarmers, estWeightKg: $estWeightKg, status: $status, assignedLorryNumber: $assignedLorryNumber, assignedLorryId: $assignedLorryId, rejectionReason: $rejectionReason, notes: $notes, approvedAt: $approvedAt, approvedBy: $approvedBy, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LorryRequestImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.fieldManagerId, fieldManagerId) ||
                other.fieldManagerId == fieldManagerId) &&
            (identical(other.organizationId, organizationId) ||
                other.organizationId == organizationId) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.purpose, purpose) || other.purpose == purpose) &&
            (identical(other.requestedAt, requestedAt) ||
                other.requestedAt == requestedAt) &&
            (identical(other.urgency, urgency) || other.urgency == urgency) &&
            (identical(other.estFarmers, estFarmers) ||
                other.estFarmers == estFarmers) &&
            (identical(other.estWeightKg, estWeightKg) ||
                other.estWeightKg == estWeightKg) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.assignedLorryNumber, assignedLorryNumber) ||
                other.assignedLorryNumber == assignedLorryNumber) &&
            (identical(other.assignedLorryId, assignedLorryId) ||
                other.assignedLorryId == assignedLorryId) &&
            (identical(other.rejectionReason, rejectionReason) ||
                other.rejectionReason == rejectionReason) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.approvedAt, approvedAt) ||
                other.approvedAt == approvedAt) &&
            (identical(other.approvedBy, approvedBy) ||
                other.approvedBy == approvedBy) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      fieldManagerId,
      organizationId,
      location,
      purpose,
      requestedAt,
      urgency,
      estFarmers,
      estWeightKg,
      status,
      assignedLorryNumber,
      assignedLorryId,
      rejectionReason,
      notes,
      approvedAt,
      approvedBy,
      createdAt,
      updatedAt);

  /// Create a copy of LorryRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LorryRequestImplCopyWith<_$LorryRequestImpl> get copyWith =>
      __$$LorryRequestImplCopyWithImpl<_$LorryRequestImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LorryRequestImplToJson(
      this,
    );
  }
}

abstract class _LorryRequest implements LorryRequest {
  const factory _LorryRequest(
      {required final String id,
      required final String fieldManagerId,
      required final String organizationId,
      required final String location,
      required final String purpose,
      required final DateTime requestedAt,
      required final String urgency,
      required final int estFarmers,
      required final double estWeightKg,
      required final String status,
      final String? assignedLorryNumber,
      final String? assignedLorryId,
      final String? rejectionReason,
      final String? notes,
      final DateTime? approvedAt,
      final String? approvedBy,
      required final DateTime createdAt,
      required final DateTime updatedAt}) = _$LorryRequestImpl;

  factory _LorryRequest.fromJson(Map<String, dynamic> json) =
      _$LorryRequestImpl.fromJson;

  @override
  String get id;
  @override
  String get fieldManagerId;
  @override
  String get organizationId;
  @override
  String get location;
  @override
  String get purpose;
  @override
  DateTime get requestedAt;
  @override
  String get urgency; // 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  @override
  int get estFarmers;
  @override
  double get estWeightKg;
  @override
  String
      get status; // 'PENDING', 'APPROVED', 'REJECTED', 'ASSIGNED', 'COMPLETED'
  @override
  String? get assignedLorryNumber;
  @override
  String? get assignedLorryId;
  @override
  String? get rejectionReason;
  @override
  String? get notes;
  @override
  DateTime? get approvedAt;
  @override
  String? get approvedBy;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;

  /// Create a copy of LorryRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LorryRequestImplCopyWith<_$LorryRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
