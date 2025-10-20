// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'trip.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Trip _$TripFromJson(Map<String, dynamic> json) {
  return _Trip.fromJson(json);
}

/// @nodoc
mixin _$Trip {
  String get id => throw _privateConstructorUsedError;
  String get lorryId => throw _privateConstructorUsedError;
  String get lorryNumber => throw _privateConstructorUsedError;
  String get fieldManagerId => throw _privateConstructorUsedError;
  String get organizationId => throw _privateConstructorUsedError;
  String get route => throw _privateConstructorUsedError;
  DateTime get scheduledAt => throw _privateConstructorUsedError;
  String get status =>
      throw _privateConstructorUsedError; // 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  int get farmerCount => throw _privateConstructorUsedError;
  int get totalBags => throw _privateConstructorUsedError;
  double get grossKg => throw _privateConstructorUsedError;
  double get netKg => throw _privateConstructorUsedError;
  List<DeliveryEntry>? get deliveries => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  DateTime? get startedAt => throw _privateConstructorUsedError;
  DateTime? get completedAt => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this Trip to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Trip
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TripCopyWith<Trip> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TripCopyWith<$Res> {
  factory $TripCopyWith(Trip value, $Res Function(Trip) then) =
      _$TripCopyWithImpl<$Res, Trip>;
  @useResult
  $Res call(
      {String id,
      String lorryId,
      String lorryNumber,
      String fieldManagerId,
      String organizationId,
      String route,
      DateTime scheduledAt,
      String status,
      int farmerCount,
      int totalBags,
      double grossKg,
      double netKg,
      List<DeliveryEntry>? deliveries,
      String? notes,
      DateTime? startedAt,
      DateTime? completedAt,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class _$TripCopyWithImpl<$Res, $Val extends Trip>
    implements $TripCopyWith<$Res> {
  _$TripCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Trip
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? lorryId = null,
    Object? lorryNumber = null,
    Object? fieldManagerId = null,
    Object? organizationId = null,
    Object? route = null,
    Object? scheduledAt = null,
    Object? status = null,
    Object? farmerCount = null,
    Object? totalBags = null,
    Object? grossKg = null,
    Object? netKg = null,
    Object? deliveries = freezed,
    Object? notes = freezed,
    Object? startedAt = freezed,
    Object? completedAt = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      lorryId: null == lorryId
          ? _value.lorryId
          : lorryId // ignore: cast_nullable_to_non_nullable
              as String,
      lorryNumber: null == lorryNumber
          ? _value.lorryNumber
          : lorryNumber // ignore: cast_nullable_to_non_nullable
              as String,
      fieldManagerId: null == fieldManagerId
          ? _value.fieldManagerId
          : fieldManagerId // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      route: null == route
          ? _value.route
          : route // ignore: cast_nullable_to_non_nullable
              as String,
      scheduledAt: null == scheduledAt
          ? _value.scheduledAt
          : scheduledAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
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
      deliveries: freezed == deliveries
          ? _value.deliveries
          : deliveries // ignore: cast_nullable_to_non_nullable
              as List<DeliveryEntry>?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      startedAt: freezed == startedAt
          ? _value.startedAt
          : startedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      completedAt: freezed == completedAt
          ? _value.completedAt
          : completedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
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
abstract class _$$TripImplCopyWith<$Res> implements $TripCopyWith<$Res> {
  factory _$$TripImplCopyWith(
          _$TripImpl value, $Res Function(_$TripImpl) then) =
      __$$TripImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String lorryId,
      String lorryNumber,
      String fieldManagerId,
      String organizationId,
      String route,
      DateTime scheduledAt,
      String status,
      int farmerCount,
      int totalBags,
      double grossKg,
      double netKg,
      List<DeliveryEntry>? deliveries,
      String? notes,
      DateTime? startedAt,
      DateTime? completedAt,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class __$$TripImplCopyWithImpl<$Res>
    extends _$TripCopyWithImpl<$Res, _$TripImpl>
    implements _$$TripImplCopyWith<$Res> {
  __$$TripImplCopyWithImpl(_$TripImpl _value, $Res Function(_$TripImpl) _then)
      : super(_value, _then);

  /// Create a copy of Trip
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? lorryId = null,
    Object? lorryNumber = null,
    Object? fieldManagerId = null,
    Object? organizationId = null,
    Object? route = null,
    Object? scheduledAt = null,
    Object? status = null,
    Object? farmerCount = null,
    Object? totalBags = null,
    Object? grossKg = null,
    Object? netKg = null,
    Object? deliveries = freezed,
    Object? notes = freezed,
    Object? startedAt = freezed,
    Object? completedAt = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_$TripImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      lorryId: null == lorryId
          ? _value.lorryId
          : lorryId // ignore: cast_nullable_to_non_nullable
              as String,
      lorryNumber: null == lorryNumber
          ? _value.lorryNumber
          : lorryNumber // ignore: cast_nullable_to_non_nullable
              as String,
      fieldManagerId: null == fieldManagerId
          ? _value.fieldManagerId
          : fieldManagerId // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      route: null == route
          ? _value.route
          : route // ignore: cast_nullable_to_non_nullable
              as String,
      scheduledAt: null == scheduledAt
          ? _value.scheduledAt
          : scheduledAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
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
      deliveries: freezed == deliveries
          ? _value._deliveries
          : deliveries // ignore: cast_nullable_to_non_nullable
              as List<DeliveryEntry>?,
      notes: freezed == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      startedAt: freezed == startedAt
          ? _value.startedAt
          : startedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      completedAt: freezed == completedAt
          ? _value.completedAt
          : completedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
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
class _$TripImpl implements _Trip {
  const _$TripImpl(
      {required this.id,
      required this.lorryId,
      required this.lorryNumber,
      required this.fieldManagerId,
      required this.organizationId,
      required this.route,
      required this.scheduledAt,
      required this.status,
      required this.farmerCount,
      required this.totalBags,
      required this.grossKg,
      required this.netKg,
      final List<DeliveryEntry>? deliveries,
      this.notes,
      this.startedAt,
      this.completedAt,
      required this.createdAt,
      required this.updatedAt})
      : _deliveries = deliveries;

  factory _$TripImpl.fromJson(Map<String, dynamic> json) =>
      _$$TripImplFromJson(json);

  @override
  final String id;
  @override
  final String lorryId;
  @override
  final String lorryNumber;
  @override
  final String fieldManagerId;
  @override
  final String organizationId;
  @override
  final String route;
  @override
  final DateTime scheduledAt;
  @override
  final String status;
// 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  @override
  final int farmerCount;
  @override
  final int totalBags;
  @override
  final double grossKg;
  @override
  final double netKg;
  final List<DeliveryEntry>? _deliveries;
  @override
  List<DeliveryEntry>? get deliveries {
    final value = _deliveries;
    if (value == null) return null;
    if (_deliveries is EqualUnmodifiableListView) return _deliveries;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? notes;
  @override
  final DateTime? startedAt;
  @override
  final DateTime? completedAt;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'Trip(id: $id, lorryId: $lorryId, lorryNumber: $lorryNumber, fieldManagerId: $fieldManagerId, organizationId: $organizationId, route: $route, scheduledAt: $scheduledAt, status: $status, farmerCount: $farmerCount, totalBags: $totalBags, grossKg: $grossKg, netKg: $netKg, deliveries: $deliveries, notes: $notes, startedAt: $startedAt, completedAt: $completedAt, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TripImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.lorryId, lorryId) || other.lorryId == lorryId) &&
            (identical(other.lorryNumber, lorryNumber) ||
                other.lorryNumber == lorryNumber) &&
            (identical(other.fieldManagerId, fieldManagerId) ||
                other.fieldManagerId == fieldManagerId) &&
            (identical(other.organizationId, organizationId) ||
                other.organizationId == organizationId) &&
            (identical(other.route, route) || other.route == route) &&
            (identical(other.scheduledAt, scheduledAt) ||
                other.scheduledAt == scheduledAt) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.farmerCount, farmerCount) ||
                other.farmerCount == farmerCount) &&
            (identical(other.totalBags, totalBags) ||
                other.totalBags == totalBags) &&
            (identical(other.grossKg, grossKg) || other.grossKg == grossKg) &&
            (identical(other.netKg, netKg) || other.netKg == netKg) &&
            const DeepCollectionEquality()
                .equals(other._deliveries, _deliveries) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.startedAt, startedAt) ||
                other.startedAt == startedAt) &&
            (identical(other.completedAt, completedAt) ||
                other.completedAt == completedAt) &&
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
      lorryId,
      lorryNumber,
      fieldManagerId,
      organizationId,
      route,
      scheduledAt,
      status,
      farmerCount,
      totalBags,
      grossKg,
      netKg,
      const DeepCollectionEquality().hash(_deliveries),
      notes,
      startedAt,
      completedAt,
      createdAt,
      updatedAt);

  /// Create a copy of Trip
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TripImplCopyWith<_$TripImpl> get copyWith =>
      __$$TripImplCopyWithImpl<_$TripImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TripImplToJson(
      this,
    );
  }
}

abstract class _Trip implements Trip {
  const factory _Trip(
      {required final String id,
      required final String lorryId,
      required final String lorryNumber,
      required final String fieldManagerId,
      required final String organizationId,
      required final String route,
      required final DateTime scheduledAt,
      required final String status,
      required final int farmerCount,
      required final int totalBags,
      required final double grossKg,
      required final double netKg,
      final List<DeliveryEntry>? deliveries,
      final String? notes,
      final DateTime? startedAt,
      final DateTime? completedAt,
      required final DateTime createdAt,
      required final DateTime updatedAt}) = _$TripImpl;

  factory _Trip.fromJson(Map<String, dynamic> json) = _$TripImpl.fromJson;

  @override
  String get id;
  @override
  String get lorryId;
  @override
  String get lorryNumber;
  @override
  String get fieldManagerId;
  @override
  String get organizationId;
  @override
  String get route;
  @override
  DateTime get scheduledAt;
  @override
  String get status; // 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  @override
  int get farmerCount;
  @override
  int get totalBags;
  @override
  double get grossKg;
  @override
  double get netKg;
  @override
  List<DeliveryEntry>? get deliveries;
  @override
  String? get notes;
  @override
  DateTime? get startedAt;
  @override
  DateTime? get completedAt;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;

  /// Create a copy of Trip
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TripImplCopyWith<_$TripImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
