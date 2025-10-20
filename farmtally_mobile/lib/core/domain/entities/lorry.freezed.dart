// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'lorry.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Lorry _$LorryFromJson(Map<String, dynamic> json) {
  return _Lorry.fromJson(json);
}

/// @nodoc
mixin _$Lorry {
  String get id => throw _privateConstructorUsedError;
  String get organizationId => throw _privateConstructorUsedError;
  String get registrationNumber => throw _privateConstructorUsedError;
  String get driverName => throw _privateConstructorUsedError;
  String get driverPhone => throw _privateConstructorUsedError;
  double get capacity => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String? get currentLocation => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this Lorry to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Lorry
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LorryCopyWith<Lorry> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LorryCopyWith<$Res> {
  factory $LorryCopyWith(Lorry value, $Res Function(Lorry) then) =
      _$LorryCopyWithImpl<$Res, Lorry>;
  @useResult
  $Res call(
      {String id,
      String organizationId,
      String registrationNumber,
      String driverName,
      String driverPhone,
      double capacity,
      String status,
      String? currentLocation,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class _$LorryCopyWithImpl<$Res, $Val extends Lorry>
    implements $LorryCopyWith<$Res> {
  _$LorryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Lorry
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? organizationId = null,
    Object? registrationNumber = null,
    Object? driverName = null,
    Object? driverPhone = null,
    Object? capacity = null,
    Object? status = null,
    Object? currentLocation = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      registrationNumber: null == registrationNumber
          ? _value.registrationNumber
          : registrationNumber // ignore: cast_nullable_to_non_nullable
              as String,
      driverName: null == driverName
          ? _value.driverName
          : driverName // ignore: cast_nullable_to_non_nullable
              as String,
      driverPhone: null == driverPhone
          ? _value.driverPhone
          : driverPhone // ignore: cast_nullable_to_non_nullable
              as String,
      capacity: null == capacity
          ? _value.capacity
          : capacity // ignore: cast_nullable_to_non_nullable
              as double,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      currentLocation: freezed == currentLocation
          ? _value.currentLocation
          : currentLocation // ignore: cast_nullable_to_non_nullable
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
abstract class _$$LorryImplCopyWith<$Res> implements $LorryCopyWith<$Res> {
  factory _$$LorryImplCopyWith(
          _$LorryImpl value, $Res Function(_$LorryImpl) then) =
      __$$LorryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String organizationId,
      String registrationNumber,
      String driverName,
      String driverPhone,
      double capacity,
      String status,
      String? currentLocation,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class __$$LorryImplCopyWithImpl<$Res>
    extends _$LorryCopyWithImpl<$Res, _$LorryImpl>
    implements _$$LorryImplCopyWith<$Res> {
  __$$LorryImplCopyWithImpl(
      _$LorryImpl _value, $Res Function(_$LorryImpl) _then)
      : super(_value, _then);

  /// Create a copy of Lorry
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? organizationId = null,
    Object? registrationNumber = null,
    Object? driverName = null,
    Object? driverPhone = null,
    Object? capacity = null,
    Object? status = null,
    Object? currentLocation = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_$LorryImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      registrationNumber: null == registrationNumber
          ? _value.registrationNumber
          : registrationNumber // ignore: cast_nullable_to_non_nullable
              as String,
      driverName: null == driverName
          ? _value.driverName
          : driverName // ignore: cast_nullable_to_non_nullable
              as String,
      driverPhone: null == driverPhone
          ? _value.driverPhone
          : driverPhone // ignore: cast_nullable_to_non_nullable
              as String,
      capacity: null == capacity
          ? _value.capacity
          : capacity // ignore: cast_nullable_to_non_nullable
              as double,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      currentLocation: freezed == currentLocation
          ? _value.currentLocation
          : currentLocation // ignore: cast_nullable_to_non_nullable
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
class _$LorryImpl implements _Lorry {
  const _$LorryImpl(
      {required this.id,
      required this.organizationId,
      required this.registrationNumber,
      required this.driverName,
      required this.driverPhone,
      required this.capacity,
      this.status = 'AVAILABLE',
      this.currentLocation,
      required this.createdAt,
      required this.updatedAt});

  factory _$LorryImpl.fromJson(Map<String, dynamic> json) =>
      _$$LorryImplFromJson(json);

  @override
  final String id;
  @override
  final String organizationId;
  @override
  final String registrationNumber;
  @override
  final String driverName;
  @override
  final String driverPhone;
  @override
  final double capacity;
  @override
  @JsonKey()
  final String status;
  @override
  final String? currentLocation;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'Lorry(id: $id, organizationId: $organizationId, registrationNumber: $registrationNumber, driverName: $driverName, driverPhone: $driverPhone, capacity: $capacity, status: $status, currentLocation: $currentLocation, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LorryImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.organizationId, organizationId) ||
                other.organizationId == organizationId) &&
            (identical(other.registrationNumber, registrationNumber) ||
                other.registrationNumber == registrationNumber) &&
            (identical(other.driverName, driverName) ||
                other.driverName == driverName) &&
            (identical(other.driverPhone, driverPhone) ||
                other.driverPhone == driverPhone) &&
            (identical(other.capacity, capacity) ||
                other.capacity == capacity) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.currentLocation, currentLocation) ||
                other.currentLocation == currentLocation) &&
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
      organizationId,
      registrationNumber,
      driverName,
      driverPhone,
      capacity,
      status,
      currentLocation,
      createdAt,
      updatedAt);

  /// Create a copy of Lorry
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LorryImplCopyWith<_$LorryImpl> get copyWith =>
      __$$LorryImplCopyWithImpl<_$LorryImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LorryImplToJson(
      this,
    );
  }
}

abstract class _Lorry implements Lorry {
  const factory _Lorry(
      {required final String id,
      required final String organizationId,
      required final String registrationNumber,
      required final String driverName,
      required final String driverPhone,
      required final double capacity,
      final String status,
      final String? currentLocation,
      required final DateTime createdAt,
      required final DateTime updatedAt}) = _$LorryImpl;

  factory _Lorry.fromJson(Map<String, dynamic> json) = _$LorryImpl.fromJson;

  @override
  String get id;
  @override
  String get organizationId;
  @override
  String get registrationNumber;
  @override
  String get driverName;
  @override
  String get driverPhone;
  @override
  double get capacity;
  @override
  String get status;
  @override
  String? get currentLocation;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;

  /// Create a copy of Lorry
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LorryImplCopyWith<_$LorryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

LorryRequest _$LorryRequestFromJson(Map<String, dynamic> json) {
  return _LorryRequest.fromJson(json);
}

/// @nodoc
mixin _$LorryRequest {
  String get id => throw _privateConstructorUsedError;
  String get organizationId => throw _privateConstructorUsedError;
  String get fieldManagerId => throw _privateConstructorUsedError;
  String get purpose => throw _privateConstructorUsedError;
  int get estimatedFarmers => throw _privateConstructorUsedError;
  double get estimatedWeight => throw _privateConstructorUsedError;
  String get urgency => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String? get assignedLorryId => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  DateTime get requestedDate => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt =>
      throw _privateConstructorUsedError; // Related entities
  String? get fieldManagerName => throw _privateConstructorUsedError;
  Lorry? get assignedLorry => throw _privateConstructorUsedError;

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
      String organizationId,
      String fieldManagerId,
      String purpose,
      int estimatedFarmers,
      double estimatedWeight,
      String urgency,
      String status,
      String? assignedLorryId,
      String? notes,
      DateTime requestedDate,
      DateTime createdAt,
      DateTime updatedAt,
      String? fieldManagerName,
      Lorry? assignedLorry});

  $LorryCopyWith<$Res>? get assignedLorry;
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
    Object? organizationId = null,
    Object? fieldManagerId = null,
    Object? purpose = null,
    Object? estimatedFarmers = null,
    Object? estimatedWeight = null,
    Object? urgency = null,
    Object? status = null,
    Object? assignedLorryId = freezed,
    Object? notes = freezed,
    Object? requestedDate = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? fieldManagerName = freezed,
    Object? assignedLorry = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      fieldManagerId: null == fieldManagerId
          ? _value.fieldManagerId
          : fieldManagerId // ignore: cast_nullable_to_non_nullable
              as String,
      purpose: null == purpose
          ? _value.purpose
          : purpose // ignore: cast_nullable_to_non_nullable
              as String,
      estimatedFarmers: null == estimatedFarmers
          ? _value.estimatedFarmers
          : estimatedFarmers // ignore: cast_nullable_to_non_nullable
              as int,
      estimatedWeight: null == estimatedWeight
          ? _value.estimatedWeight
          : estimatedWeight // ignore: cast_nullable_to_non_nullable
              as double,
      urgency: null == urgency
          ? _value.urgency
          : urgency // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      assignedLorryId: freezed == assignedLorryId
          ? _value.assignedLorryId
          : assignedLorryId // ignore: cast_nullable_to_non_nullable
              as String?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      requestedDate: null == requestedDate
          ? _value.requestedDate
          : requestedDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      fieldManagerName: freezed == fieldManagerName
          ? _value.fieldManagerName
          : fieldManagerName // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedLorry: freezed == assignedLorry
          ? _value.assignedLorry
          : assignedLorry // ignore: cast_nullable_to_non_nullable
              as Lorry?,
    ) as $Val);
  }

  /// Create a copy of LorryRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $LorryCopyWith<$Res>? get assignedLorry {
    if (_value.assignedLorry == null) {
      return null;
    }

    return $LorryCopyWith<$Res>(_value.assignedLorry!, (value) {
      return _then(_value.copyWith(assignedLorry: value) as $Val);
    });
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
      String organizationId,
      String fieldManagerId,
      String purpose,
      int estimatedFarmers,
      double estimatedWeight,
      String urgency,
      String status,
      String? assignedLorryId,
      String? notes,
      DateTime requestedDate,
      DateTime createdAt,
      DateTime updatedAt,
      String? fieldManagerName,
      Lorry? assignedLorry});

  @override
  $LorryCopyWith<$Res>? get assignedLorry;
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
    Object? organizationId = null,
    Object? fieldManagerId = null,
    Object? purpose = null,
    Object? estimatedFarmers = null,
    Object? estimatedWeight = null,
    Object? urgency = null,
    Object? status = null,
    Object? assignedLorryId = freezed,
    Object? notes = freezed,
    Object? requestedDate = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? fieldManagerName = freezed,
    Object? assignedLorry = freezed,
  }) {
    return _then(_$LorryRequestImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      fieldManagerId: null == fieldManagerId
          ? _value.fieldManagerId
          : fieldManagerId // ignore: cast_nullable_to_non_nullable
              as String,
      purpose: null == purpose
          ? _value.purpose
          : purpose // ignore: cast_nullable_to_non_nullable
              as String,
      estimatedFarmers: null == estimatedFarmers
          ? _value.estimatedFarmers
          : estimatedFarmers // ignore: cast_nullable_to_non_nullable
              as int,
      estimatedWeight: null == estimatedWeight
          ? _value.estimatedWeight
          : estimatedWeight // ignore: cast_nullable_to_non_nullable
              as double,
      urgency: null == urgency
          ? _value.urgency
          : urgency // ignore: cast_nullable_to_non_nullable
              as String,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      assignedLorryId: freezed == assignedLorryId
          ? _value.assignedLorryId
          : assignedLorryId // ignore: cast_nullable_to_non_nullable
              as String?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      requestedDate: null == requestedDate
          ? _value.requestedDate
          : requestedDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      fieldManagerName: freezed == fieldManagerName
          ? _value.fieldManagerName
          : fieldManagerName // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedLorry: freezed == assignedLorry
          ? _value.assignedLorry
          : assignedLorry // ignore: cast_nullable_to_non_nullable
              as Lorry?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LorryRequestImpl implements _LorryRequest {
  const _$LorryRequestImpl(
      {required this.id,
      required this.organizationId,
      required this.fieldManagerId,
      required this.purpose,
      required this.estimatedFarmers,
      required this.estimatedWeight,
      this.urgency = 'NORMAL',
      this.status = 'PENDING',
      this.assignedLorryId,
      this.notes,
      required this.requestedDate,
      required this.createdAt,
      required this.updatedAt,
      this.fieldManagerName,
      this.assignedLorry});

  factory _$LorryRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$LorryRequestImplFromJson(json);

  @override
  final String id;
  @override
  final String organizationId;
  @override
  final String fieldManagerId;
  @override
  final String purpose;
  @override
  final int estimatedFarmers;
  @override
  final double estimatedWeight;
  @override
  @JsonKey()
  final String urgency;
  @override
  @JsonKey()
  final String status;
  @override
  final String? assignedLorryId;
  @override
  final String? notes;
  @override
  final DateTime requestedDate;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
// Related entities
  @override
  final String? fieldManagerName;
  @override
  final Lorry? assignedLorry;

  @override
  String toString() {
    return 'LorryRequest(id: $id, organizationId: $organizationId, fieldManagerId: $fieldManagerId, purpose: $purpose, estimatedFarmers: $estimatedFarmers, estimatedWeight: $estimatedWeight, urgency: $urgency, status: $status, assignedLorryId: $assignedLorryId, notes: $notes, requestedDate: $requestedDate, createdAt: $createdAt, updatedAt: $updatedAt, fieldManagerName: $fieldManagerName, assignedLorry: $assignedLorry)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LorryRequestImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.organizationId, organizationId) ||
                other.organizationId == organizationId) &&
            (identical(other.fieldManagerId, fieldManagerId) ||
                other.fieldManagerId == fieldManagerId) &&
            (identical(other.purpose, purpose) || other.purpose == purpose) &&
            (identical(other.estimatedFarmers, estimatedFarmers) ||
                other.estimatedFarmers == estimatedFarmers) &&
            (identical(other.estimatedWeight, estimatedWeight) ||
                other.estimatedWeight == estimatedWeight) &&
            (identical(other.urgency, urgency) || other.urgency == urgency) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.assignedLorryId, assignedLorryId) ||
                other.assignedLorryId == assignedLorryId) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.requestedDate, requestedDate) ||
                other.requestedDate == requestedDate) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.fieldManagerName, fieldManagerName) ||
                other.fieldManagerName == fieldManagerName) &&
            (identical(other.assignedLorry, assignedLorry) ||
                other.assignedLorry == assignedLorry));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      organizationId,
      fieldManagerId,
      purpose,
      estimatedFarmers,
      estimatedWeight,
      urgency,
      status,
      assignedLorryId,
      notes,
      requestedDate,
      createdAt,
      updatedAt,
      fieldManagerName,
      assignedLorry);

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
      required final String organizationId,
      required final String fieldManagerId,
      required final String purpose,
      required final int estimatedFarmers,
      required final double estimatedWeight,
      final String urgency,
      final String status,
      final String? assignedLorryId,
      final String? notes,
      required final DateTime requestedDate,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final String? fieldManagerName,
      final Lorry? assignedLorry}) = _$LorryRequestImpl;

  factory _LorryRequest.fromJson(Map<String, dynamic> json) =
      _$LorryRequestImpl.fromJson;

  @override
  String get id;
  @override
  String get organizationId;
  @override
  String get fieldManagerId;
  @override
  String get purpose;
  @override
  int get estimatedFarmers;
  @override
  double get estimatedWeight;
  @override
  String get urgency;
  @override
  String get status;
  @override
  String? get assignedLorryId;
  @override
  String? get notes;
  @override
  DateTime get requestedDate;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt; // Related entities
  @override
  String? get fieldManagerName;
  @override
  Lorry? get assignedLorry;

  /// Create a copy of LorryRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LorryRequestImplCopyWith<_$LorryRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

LorryTrip _$LorryTripFromJson(Map<String, dynamic> json) {
  return _LorryTrip.fromJson(json);
}

/// @nodoc
mixin _$LorryTrip {
  String get id => throw _privateConstructorUsedError;
  String get organizationId => throw _privateConstructorUsedError;
  String get lorryId => throw _privateConstructorUsedError;
  String get fieldManagerId => throw _privateConstructorUsedError;
  String? get requestId => throw _privateConstructorUsedError;
  DateTime get startDate => throw _privateConstructorUsedError;
  DateTime? get endDate => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  int get farmerCount => throw _privateConstructorUsedError;
  int get totalBags => throw _privateConstructorUsedError;
  double get grossKg => throw _privateConstructorUsedError;
  double get netKg => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt =>
      throw _privateConstructorUsedError; // Related entities
  Lorry? get lorry => throw _privateConstructorUsedError;
  String? get fieldManagerName => throw _privateConstructorUsedError;
  List<Delivery>? get deliveries => throw _privateConstructorUsedError;

  /// Serializes this LorryTrip to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LorryTrip
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LorryTripCopyWith<LorryTrip> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LorryTripCopyWith<$Res> {
  factory $LorryTripCopyWith(LorryTrip value, $Res Function(LorryTrip) then) =
      _$LorryTripCopyWithImpl<$Res, LorryTrip>;
  @useResult
  $Res call(
      {String id,
      String organizationId,
      String lorryId,
      String fieldManagerId,
      String? requestId,
      DateTime startDate,
      DateTime? endDate,
      String status,
      int farmerCount,
      int totalBags,
      double grossKg,
      double netKg,
      String? notes,
      DateTime createdAt,
      DateTime updatedAt,
      Lorry? lorry,
      String? fieldManagerName,
      List<Delivery>? deliveries});

  $LorryCopyWith<$Res>? get lorry;
}

/// @nodoc
class _$LorryTripCopyWithImpl<$Res, $Val extends LorryTrip>
    implements $LorryTripCopyWith<$Res> {
  _$LorryTripCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LorryTrip
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? organizationId = null,
    Object? lorryId = null,
    Object? fieldManagerId = null,
    Object? requestId = freezed,
    Object? startDate = null,
    Object? endDate = freezed,
    Object? status = null,
    Object? farmerCount = null,
    Object? totalBags = null,
    Object? grossKg = null,
    Object? netKg = null,
    Object? notes = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? lorry = freezed,
    Object? fieldManagerName = freezed,
    Object? deliveries = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      lorryId: null == lorryId
          ? _value.lorryId
          : lorryId // ignore: cast_nullable_to_non_nullable
              as String,
      fieldManagerId: null == fieldManagerId
          ? _value.fieldManagerId
          : fieldManagerId // ignore: cast_nullable_to_non_nullable
              as String,
      requestId: freezed == requestId
          ? _value.requestId
          : requestId // ignore: cast_nullable_to_non_nullable
              as String?,
      startDate: null == startDate
          ? _value.startDate
          : startDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      endDate: freezed == endDate
          ? _value.endDate
          : endDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      farmerCount: null == farmerCount
          ? _value.farmerCount
          : farmerCount // ignore: cast_nullable_to_non_nullable
              as int,
      totalBags: null == totalBags
          ? _value.totalBags
          : totalBags // ignore: cast_nullable_to_non_nullable
              as int,
      grossKg: null == grossKg
          ? _value.grossKg
          : grossKg // ignore: cast_nullable_to_non_nullable
              as double,
      netKg: null == netKg
          ? _value.netKg
          : netKg // ignore: cast_nullable_to_non_nullable
              as double,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      lorry: freezed == lorry
          ? _value.lorry
          : lorry // ignore: cast_nullable_to_non_nullable
              as Lorry?,
      fieldManagerName: freezed == fieldManagerName
          ? _value.fieldManagerName
          : fieldManagerName // ignore: cast_nullable_to_non_nullable
              as String?,
      deliveries: freezed == deliveries
          ? _value.deliveries
          : deliveries // ignore: cast_nullable_to_non_nullable
              as List<Delivery>?,
    ) as $Val);
  }

  /// Create a copy of LorryTrip
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $LorryCopyWith<$Res>? get lorry {
    if (_value.lorry == null) {
      return null;
    }

    return $LorryCopyWith<$Res>(_value.lorry!, (value) {
      return _then(_value.copyWith(lorry: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$LorryTripImplCopyWith<$Res>
    implements $LorryTripCopyWith<$Res> {
  factory _$$LorryTripImplCopyWith(
          _$LorryTripImpl value, $Res Function(_$LorryTripImpl) then) =
      __$$LorryTripImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String organizationId,
      String lorryId,
      String fieldManagerId,
      String? requestId,
      DateTime startDate,
      DateTime? endDate,
      String status,
      int farmerCount,
      int totalBags,
      double grossKg,
      double netKg,
      String? notes,
      DateTime createdAt,
      DateTime updatedAt,
      Lorry? lorry,
      String? fieldManagerName,
      List<Delivery>? deliveries});

  @override
  $LorryCopyWith<$Res>? get lorry;
}

/// @nodoc
class __$$LorryTripImplCopyWithImpl<$Res>
    extends _$LorryTripCopyWithImpl<$Res, _$LorryTripImpl>
    implements _$$LorryTripImplCopyWith<$Res> {
  __$$LorryTripImplCopyWithImpl(
      _$LorryTripImpl _value, $Res Function(_$LorryTripImpl) _then)
      : super(_value, _then);

  /// Create a copy of LorryTrip
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? organizationId = null,
    Object? lorryId = null,
    Object? fieldManagerId = null,
    Object? requestId = freezed,
    Object? startDate = null,
    Object? endDate = freezed,
    Object? status = null,
    Object? farmerCount = null,
    Object? totalBags = null,
    Object? grossKg = null,
    Object? netKg = null,
    Object? notes = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? lorry = freezed,
    Object? fieldManagerName = freezed,
    Object? deliveries = freezed,
  }) {
    return _then(_$LorryTripImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      lorryId: null == lorryId
          ? _value.lorryId
          : lorryId // ignore: cast_nullable_to_non_nullable
              as String,
      fieldManagerId: null == fieldManagerId
          ? _value.fieldManagerId
          : fieldManagerId // ignore: cast_nullable_to_non_nullable
              as String,
      requestId: freezed == requestId
          ? _value.requestId
          : requestId // ignore: cast_nullable_to_non_nullable
              as String?,
      startDate: null == startDate
          ? _value.startDate
          : startDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      endDate: freezed == endDate
          ? _value.endDate
          : endDate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      farmerCount: null == farmerCount
          ? _value.farmerCount
          : farmerCount // ignore: cast_nullable_to_non_nullable
              as int,
      totalBags: null == totalBags
          ? _value.totalBags
          : totalBags // ignore: cast_nullable_to_non_nullable
              as int,
      grossKg: null == grossKg
          ? _value.grossKg
          : grossKg // ignore: cast_nullable_to_non_nullable
              as double,
      netKg: null == netKg
          ? _value.netKg
          : netKg // ignore: cast_nullable_to_non_nullable
              as double,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      lorry: freezed == lorry
          ? _value.lorry
          : lorry // ignore: cast_nullable_to_non_nullable
              as Lorry?,
      fieldManagerName: freezed == fieldManagerName
          ? _value.fieldManagerName
          : fieldManagerName // ignore: cast_nullable_to_non_nullable
              as String?,
      deliveries: freezed == deliveries
          ? _value._deliveries
          : deliveries // ignore: cast_nullable_to_non_nullable
              as List<Delivery>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LorryTripImpl implements _LorryTrip {
  const _$LorryTripImpl(
      {required this.id,
      required this.organizationId,
      required this.lorryId,
      required this.fieldManagerId,
      this.requestId,
      required this.startDate,
      this.endDate,
      this.status = 'IN_PROGRESS',
      this.farmerCount = 0,
      this.totalBags = 0,
      this.grossKg = 0.0,
      this.netKg = 0.0,
      this.notes,
      required this.createdAt,
      required this.updatedAt,
      this.lorry,
      this.fieldManagerName,
      final List<Delivery>? deliveries})
      : _deliveries = deliveries;

  factory _$LorryTripImpl.fromJson(Map<String, dynamic> json) =>
      _$$LorryTripImplFromJson(json);

  @override
  final String id;
  @override
  final String organizationId;
  @override
  final String lorryId;
  @override
  final String fieldManagerId;
  @override
  final String? requestId;
  @override
  final DateTime startDate;
  @override
  final DateTime? endDate;
  @override
  @JsonKey()
  final String status;
  @override
  @JsonKey()
  final int farmerCount;
  @override
  @JsonKey()
  final int totalBags;
  @override
  @JsonKey()
  final double grossKg;
  @override
  @JsonKey()
  final double netKg;
  @override
  final String? notes;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
// Related entities
  @override
  final Lorry? lorry;
  @override
  final String? fieldManagerName;
  final List<Delivery>? _deliveries;
  @override
  List<Delivery>? get deliveries {
    final value = _deliveries;
    if (value == null) return null;
    if (_deliveries is EqualUnmodifiableListView) return _deliveries;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'LorryTrip(id: $id, organizationId: $organizationId, lorryId: $lorryId, fieldManagerId: $fieldManagerId, requestId: $requestId, startDate: $startDate, endDate: $endDate, status: $status, farmerCount: $farmerCount, totalBags: $totalBags, grossKg: $grossKg, netKg: $netKg, notes: $notes, createdAt: $createdAt, updatedAt: $updatedAt, lorry: $lorry, fieldManagerName: $fieldManagerName, deliveries: $deliveries)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LorryTripImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.organizationId, organizationId) ||
                other.organizationId == organizationId) &&
            (identical(other.lorryId, lorryId) || other.lorryId == lorryId) &&
            (identical(other.fieldManagerId, fieldManagerId) ||
                other.fieldManagerId == fieldManagerId) &&
            (identical(other.requestId, requestId) ||
                other.requestId == requestId) &&
            (identical(other.startDate, startDate) ||
                other.startDate == startDate) &&
            (identical(other.endDate, endDate) || other.endDate == endDate) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.farmerCount, farmerCount) ||
                other.farmerCount == farmerCount) &&
            (identical(other.totalBags, totalBags) ||
                other.totalBags == totalBags) &&
            (identical(other.grossKg, grossKg) || other.grossKg == grossKg) &&
            (identical(other.netKg, netKg) || other.netKg == netKg) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.lorry, lorry) || other.lorry == lorry) &&
            (identical(other.fieldManagerName, fieldManagerName) ||
                other.fieldManagerName == fieldManagerName) &&
            const DeepCollectionEquality()
                .equals(other._deliveries, _deliveries));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      organizationId,
      lorryId,
      fieldManagerId,
      requestId,
      startDate,
      endDate,
      status,
      farmerCount,
      totalBags,
      grossKg,
      netKg,
      notes,
      createdAt,
      updatedAt,
      lorry,
      fieldManagerName,
      const DeepCollectionEquality().hash(_deliveries));

  /// Create a copy of LorryTrip
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LorryTripImplCopyWith<_$LorryTripImpl> get copyWith =>
      __$$LorryTripImplCopyWithImpl<_$LorryTripImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LorryTripImplToJson(
      this,
    );
  }
}

abstract class _LorryTrip implements LorryTrip {
  const factory _LorryTrip(
      {required final String id,
      required final String organizationId,
      required final String lorryId,
      required final String fieldManagerId,
      final String? requestId,
      required final DateTime startDate,
      final DateTime? endDate,
      final String status,
      final int farmerCount,
      final int totalBags,
      final double grossKg,
      final double netKg,
      final String? notes,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final Lorry? lorry,
      final String? fieldManagerName,
      final List<Delivery>? deliveries}) = _$LorryTripImpl;

  factory _LorryTrip.fromJson(Map<String, dynamic> json) =
      _$LorryTripImpl.fromJson;

  @override
  String get id;
  @override
  String get organizationId;
  @override
  String get lorryId;
  @override
  String get fieldManagerId;
  @override
  String? get requestId;
  @override
  DateTime get startDate;
  @override
  DateTime? get endDate;
  @override
  String get status;
  @override
  int get farmerCount;
  @override
  int get totalBags;
  @override
  double get grossKg;
  @override
  double get netKg;
  @override
  String? get notes;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt; // Related entities
  @override
  Lorry? get lorry;
  @override
  String? get fieldManagerName;
  @override
  List<Delivery>? get deliveries;

  /// Create a copy of LorryTrip
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LorryTripImplCopyWith<_$LorryTripImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

Delivery _$DeliveryFromJson(Map<String, dynamic> json) {
  return _Delivery.fromJson(json);
}

/// @nodoc
mixin _$Delivery {
  String get id => throw _privateConstructorUsedError;
  String get organizationId => throw _privateConstructorUsedError;
  String get tripId => throw _privateConstructorUsedError;
  String get farmerId => throw _privateConstructorUsedError;
  String get farmerName => throw _privateConstructorUsedError;
  String? get farmerPhone => throw _privateConstructorUsedError;
  int get numberOfBags => throw _privateConstructorUsedError;
  List<double> get bagWeights => throw _privateConstructorUsedError;
  double get moisturePercent => throw _privateConstructorUsedError;
  String get qualityGrade => throw _privateConstructorUsedError;
  double get grossWeight => throw _privateConstructorUsedError;
  double get deductionFixedKg => throw _privateConstructorUsedError;
  double get qualityDeductionKg => throw _privateConstructorUsedError;
  double get netWeight => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  DateTime get recordedAt => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this Delivery to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Delivery
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $DeliveryCopyWith<Delivery> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DeliveryCopyWith<$Res> {
  factory $DeliveryCopyWith(Delivery value, $Res Function(Delivery) then) =
      _$DeliveryCopyWithImpl<$Res, Delivery>;
  @useResult
  $Res call(
      {String id,
      String organizationId,
      String tripId,
      String farmerId,
      String farmerName,
      String? farmerPhone,
      int numberOfBags,
      List<double> bagWeights,
      double moisturePercent,
      String qualityGrade,
      double grossWeight,
      double deductionFixedKg,
      double qualityDeductionKg,
      double netWeight,
      String status,
      String? notes,
      DateTime recordedAt,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class _$DeliveryCopyWithImpl<$Res, $Val extends Delivery>
    implements $DeliveryCopyWith<$Res> {
  _$DeliveryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Delivery
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? organizationId = null,
    Object? tripId = null,
    Object? farmerId = null,
    Object? farmerName = null,
    Object? farmerPhone = freezed,
    Object? numberOfBags = null,
    Object? bagWeights = null,
    Object? moisturePercent = null,
    Object? qualityGrade = null,
    Object? grossWeight = null,
    Object? deductionFixedKg = null,
    Object? qualityDeductionKg = null,
    Object? netWeight = null,
    Object? status = null,
    Object? notes = freezed,
    Object? recordedAt = null,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      tripId: null == tripId
          ? _value.tripId
          : tripId // ignore: cast_nullable_to_non_nullable
              as String,
      farmerId: null == farmerId
          ? _value.farmerId
          : farmerId // ignore: cast_nullable_to_non_nullable
              as String,
      farmerName: null == farmerName
          ? _value.farmerName
          : farmerName // ignore: cast_nullable_to_non_nullable
              as String,
      farmerPhone: freezed == farmerPhone
          ? _value.farmerPhone
          : farmerPhone // ignore: cast_nullable_to_non_nullable
              as String?,
      numberOfBags: null == numberOfBags
          ? _value.numberOfBags
          : numberOfBags // ignore: cast_nullable_to_non_nullable
              as int,
      bagWeights: null == bagWeights
          ? _value.bagWeights
          : bagWeights // ignore: cast_nullable_to_non_nullable
              as List<double>,
      moisturePercent: null == moisturePercent
          ? _value.moisturePercent
          : moisturePercent // ignore: cast_nullable_to_non_nullable
              as double,
      qualityGrade: null == qualityGrade
          ? _value.qualityGrade
          : qualityGrade // ignore: cast_nullable_to_non_nullable
              as String,
      grossWeight: null == grossWeight
          ? _value.grossWeight
          : grossWeight // ignore: cast_nullable_to_non_nullable
              as double,
      deductionFixedKg: null == deductionFixedKg
          ? _value.deductionFixedKg
          : deductionFixedKg // ignore: cast_nullable_to_non_nullable
              as double,
      qualityDeductionKg: null == qualityDeductionKg
          ? _value.qualityDeductionKg
          : qualityDeductionKg // ignore: cast_nullable_to_non_nullable
              as double,
      netWeight: null == netWeight
          ? _value.netWeight
          : netWeight // ignore: cast_nullable_to_non_nullable
              as double,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      recordedAt: null == recordedAt
          ? _value.recordedAt
          : recordedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
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
abstract class _$$DeliveryImplCopyWith<$Res>
    implements $DeliveryCopyWith<$Res> {
  factory _$$DeliveryImplCopyWith(
          _$DeliveryImpl value, $Res Function(_$DeliveryImpl) then) =
      __$$DeliveryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String organizationId,
      String tripId,
      String farmerId,
      String farmerName,
      String? farmerPhone,
      int numberOfBags,
      List<double> bagWeights,
      double moisturePercent,
      String qualityGrade,
      double grossWeight,
      double deductionFixedKg,
      double qualityDeductionKg,
      double netWeight,
      String status,
      String? notes,
      DateTime recordedAt,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class __$$DeliveryImplCopyWithImpl<$Res>
    extends _$DeliveryCopyWithImpl<$Res, _$DeliveryImpl>
    implements _$$DeliveryImplCopyWith<$Res> {
  __$$DeliveryImplCopyWithImpl(
      _$DeliveryImpl _value, $Res Function(_$DeliveryImpl) _then)
      : super(_value, _then);

  /// Create a copy of Delivery
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? organizationId = null,
    Object? tripId = null,
    Object? farmerId = null,
    Object? farmerName = null,
    Object? farmerPhone = freezed,
    Object? numberOfBags = null,
    Object? bagWeights = null,
    Object? moisturePercent = null,
    Object? qualityGrade = null,
    Object? grossWeight = null,
    Object? deductionFixedKg = null,
    Object? qualityDeductionKg = null,
    Object? netWeight = null,
    Object? status = null,
    Object? notes = freezed,
    Object? recordedAt = null,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_$DeliveryImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      tripId: null == tripId
          ? _value.tripId
          : tripId // ignore: cast_nullable_to_non_nullable
              as String,
      farmerId: null == farmerId
          ? _value.farmerId
          : farmerId // ignore: cast_nullable_to_non_nullable
              as String,
      farmerName: null == farmerName
          ? _value.farmerName
          : farmerName // ignore: cast_nullable_to_non_nullable
              as String,
      farmerPhone: freezed == farmerPhone
          ? _value.farmerPhone
          : farmerPhone // ignore: cast_nullable_to_non_nullable
              as String?,
      numberOfBags: null == numberOfBags
          ? _value.numberOfBags
          : numberOfBags // ignore: cast_nullable_to_non_nullable
              as int,
      bagWeights: null == bagWeights
          ? _value._bagWeights
          : bagWeights // ignore: cast_nullable_to_non_nullable
              as List<double>,
      moisturePercent: null == moisturePercent
          ? _value.moisturePercent
          : moisturePercent // ignore: cast_nullable_to_non_nullable
              as double,
      qualityGrade: null == qualityGrade
          ? _value.qualityGrade
          : qualityGrade // ignore: cast_nullable_to_non_nullable
              as String,
      grossWeight: null == grossWeight
          ? _value.grossWeight
          : grossWeight // ignore: cast_nullable_to_non_nullable
              as double,
      deductionFixedKg: null == deductionFixedKg
          ? _value.deductionFixedKg
          : deductionFixedKg // ignore: cast_nullable_to_non_nullable
              as double,
      qualityDeductionKg: null == qualityDeductionKg
          ? _value.qualityDeductionKg
          : qualityDeductionKg // ignore: cast_nullable_to_non_nullable
              as double,
      netWeight: null == netWeight
          ? _value.netWeight
          : netWeight // ignore: cast_nullable_to_non_nullable
              as double,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      recordedAt: null == recordedAt
          ? _value.recordedAt
          : recordedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
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
class _$DeliveryImpl implements _Delivery {
  const _$DeliveryImpl(
      {required this.id,
      required this.organizationId,
      required this.tripId,
      required this.farmerId,
      required this.farmerName,
      this.farmerPhone,
      required this.numberOfBags,
      required final List<double> bagWeights,
      required this.moisturePercent,
      required this.qualityGrade,
      required this.grossWeight,
      this.deductionFixedKg = 0.0,
      this.qualityDeductionKg = 0.0,
      required this.netWeight,
      this.status = 'PENDING',
      this.notes,
      required this.recordedAt,
      required this.createdAt,
      required this.updatedAt})
      : _bagWeights = bagWeights;

  factory _$DeliveryImpl.fromJson(Map<String, dynamic> json) =>
      _$$DeliveryImplFromJson(json);

  @override
  final String id;
  @override
  final String organizationId;
  @override
  final String tripId;
  @override
  final String farmerId;
  @override
  final String farmerName;
  @override
  final String? farmerPhone;
  @override
  final int numberOfBags;
  final List<double> _bagWeights;
  @override
  List<double> get bagWeights {
    if (_bagWeights is EqualUnmodifiableListView) return _bagWeights;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_bagWeights);
  }

  @override
  final double moisturePercent;
  @override
  final String qualityGrade;
  @override
  final double grossWeight;
  @override
  @JsonKey()
  final double deductionFixedKg;
  @override
  @JsonKey()
  final double qualityDeductionKg;
  @override
  final double netWeight;
  @override
  @JsonKey()
  final String status;
  @override
  final String? notes;
  @override
  final DateTime recordedAt;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'Delivery(id: $id, organizationId: $organizationId, tripId: $tripId, farmerId: $farmerId, farmerName: $farmerName, farmerPhone: $farmerPhone, numberOfBags: $numberOfBags, bagWeights: $bagWeights, moisturePercent: $moisturePercent, qualityGrade: $qualityGrade, grossWeight: $grossWeight, deductionFixedKg: $deductionFixedKg, qualityDeductionKg: $qualityDeductionKg, netWeight: $netWeight, status: $status, notes: $notes, recordedAt: $recordedAt, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DeliveryImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.organizationId, organizationId) ||
                other.organizationId == organizationId) &&
            (identical(other.tripId, tripId) || other.tripId == tripId) &&
            (identical(other.farmerId, farmerId) ||
                other.farmerId == farmerId) &&
            (identical(other.farmerName, farmerName) ||
                other.farmerName == farmerName) &&
            (identical(other.farmerPhone, farmerPhone) ||
                other.farmerPhone == farmerPhone) &&
            (identical(other.numberOfBags, numberOfBags) ||
                other.numberOfBags == numberOfBags) &&
            const DeepCollectionEquality()
                .equals(other._bagWeights, _bagWeights) &&
            (identical(other.moisturePercent, moisturePercent) ||
                other.moisturePercent == moisturePercent) &&
            (identical(other.qualityGrade, qualityGrade) ||
                other.qualityGrade == qualityGrade) &&
            (identical(other.grossWeight, grossWeight) ||
                other.grossWeight == grossWeight) &&
            (identical(other.deductionFixedKg, deductionFixedKg) ||
                other.deductionFixedKg == deductionFixedKg) &&
            (identical(other.qualityDeductionKg, qualityDeductionKg) ||
                other.qualityDeductionKg == qualityDeductionKg) &&
            (identical(other.netWeight, netWeight) ||
                other.netWeight == netWeight) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.recordedAt, recordedAt) ||
                other.recordedAt == recordedAt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        organizationId,
        tripId,
        farmerId,
        farmerName,
        farmerPhone,
        numberOfBags,
        const DeepCollectionEquality().hash(_bagWeights),
        moisturePercent,
        qualityGrade,
        grossWeight,
        deductionFixedKg,
        qualityDeductionKg,
        netWeight,
        status,
        notes,
        recordedAt,
        createdAt,
        updatedAt
      ]);

  /// Create a copy of Delivery
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$DeliveryImplCopyWith<_$DeliveryImpl> get copyWith =>
      __$$DeliveryImplCopyWithImpl<_$DeliveryImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DeliveryImplToJson(
      this,
    );
  }
}

abstract class _Delivery implements Delivery {
  const factory _Delivery(
      {required final String id,
      required final String organizationId,
      required final String tripId,
      required final String farmerId,
      required final String farmerName,
      final String? farmerPhone,
      required final int numberOfBags,
      required final List<double> bagWeights,
      required final double moisturePercent,
      required final String qualityGrade,
      required final double grossWeight,
      final double deductionFixedKg,
      final double qualityDeductionKg,
      required final double netWeight,
      final String status,
      final String? notes,
      required final DateTime recordedAt,
      required final DateTime createdAt,
      required final DateTime updatedAt}) = _$DeliveryImpl;

  factory _Delivery.fromJson(Map<String, dynamic> json) =
      _$DeliveryImpl.fromJson;

  @override
  String get id;
  @override
  String get organizationId;
  @override
  String get tripId;
  @override
  String get farmerId;
  @override
  String get farmerName;
  @override
  String? get farmerPhone;
  @override
  int get numberOfBags;
  @override
  List<double> get bagWeights;
  @override
  double get moisturePercent;
  @override
  String get qualityGrade;
  @override
  double get grossWeight;
  @override
  double get deductionFixedKg;
  @override
  double get qualityDeductionKg;
  @override
  double get netWeight;
  @override
  String get status;
  @override
  String? get notes;
  @override
  DateTime get recordedAt;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;

  /// Create a copy of Delivery
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$DeliveryImplCopyWith<_$DeliveryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
