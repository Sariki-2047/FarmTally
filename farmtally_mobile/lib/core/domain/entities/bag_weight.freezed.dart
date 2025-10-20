// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'bag_weight.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

BagWeight _$BagWeightFromJson(Map<String, dynamic> json) {
  return _BagWeight.fromJson(json);
}

/// @nodoc
mixin _$BagWeight {
  String get id => throw _privateConstructorUsedError;
  String get deliveryId => throw _privateConstructorUsedError;
  double get weight => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this BagWeight to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of BagWeight
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BagWeightCopyWith<BagWeight> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BagWeightCopyWith<$Res> {
  factory $BagWeightCopyWith(BagWeight value, $Res Function(BagWeight) then) =
      _$BagWeightCopyWithImpl<$Res, BagWeight>;
  @useResult
  $Res call(
      {String id,
      String deliveryId,
      double weight,
      String? notes,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class _$BagWeightCopyWithImpl<$Res, $Val extends BagWeight>
    implements $BagWeightCopyWith<$Res> {
  _$BagWeightCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of BagWeight
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? deliveryId = null,
    Object? weight = null,
    Object? notes = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      deliveryId: null == deliveryId
          ? _value.deliveryId
          : deliveryId // ignore: cast_nullable_to_non_nullable
              as String,
      weight: null == weight
          ? _value.weight
          : weight // ignore: cast_nullable_to_non_nullable
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
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$BagWeightImplCopyWith<$Res>
    implements $BagWeightCopyWith<$Res> {
  factory _$$BagWeightImplCopyWith(
          _$BagWeightImpl value, $Res Function(_$BagWeightImpl) then) =
      __$$BagWeightImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String deliveryId,
      double weight,
      String? notes,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class __$$BagWeightImplCopyWithImpl<$Res>
    extends _$BagWeightCopyWithImpl<$Res, _$BagWeightImpl>
    implements _$$BagWeightImplCopyWith<$Res> {
  __$$BagWeightImplCopyWithImpl(
      _$BagWeightImpl _value, $Res Function(_$BagWeightImpl) _then)
      : super(_value, _then);

  /// Create a copy of BagWeight
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? deliveryId = null,
    Object? weight = null,
    Object? notes = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_$BagWeightImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      deliveryId: null == deliveryId
          ? _value.deliveryId
          : deliveryId // ignore: cast_nullable_to_non_nullable
              as String,
      weight: null == weight
          ? _value.weight
          : weight // ignore: cast_nullable_to_non_nullable
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
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$BagWeightImpl implements _BagWeight {
  const _$BagWeightImpl(
      {required this.id,
      required this.deliveryId,
      required this.weight,
      this.notes,
      required this.createdAt,
      required this.updatedAt});

  factory _$BagWeightImpl.fromJson(Map<String, dynamic> json) =>
      _$$BagWeightImplFromJson(json);

  @override
  final String id;
  @override
  final String deliveryId;
  @override
  final double weight;
  @override
  final String? notes;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'BagWeight(id: $id, deliveryId: $deliveryId, weight: $weight, notes: $notes, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BagWeightImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.deliveryId, deliveryId) ||
                other.deliveryId == deliveryId) &&
            (identical(other.weight, weight) || other.weight == weight) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, deliveryId, weight, notes, createdAt, updatedAt);

  /// Create a copy of BagWeight
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BagWeightImplCopyWith<_$BagWeightImpl> get copyWith =>
      __$$BagWeightImplCopyWithImpl<_$BagWeightImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BagWeightImplToJson(
      this,
    );
  }
}

abstract class _BagWeight implements BagWeight {
  const factory _BagWeight(
      {required final String id,
      required final String deliveryId,
      required final double weight,
      final String? notes,
      required final DateTime createdAt,
      required final DateTime updatedAt}) = _$BagWeightImpl;

  factory _BagWeight.fromJson(Map<String, dynamic> json) =
      _$BagWeightImpl.fromJson;

  @override
  String get id;
  @override
  String get deliveryId;
  @override
  double get weight;
  @override
  String? get notes;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;

  /// Create a copy of BagWeight
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BagWeightImplCopyWith<_$BagWeightImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
