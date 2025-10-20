// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'delivery_entry.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

DeliveryEntry _$DeliveryEntryFromJson(Map<String, dynamic> json) {
  return _DeliveryEntry.fromJson(json);
}

/// @nodoc
mixin _$DeliveryEntry {
  String get id => throw _privateConstructorUsedError;
  String get tripId => throw _privateConstructorUsedError;
  String get farmerId => throw _privateConstructorUsedError;
  String get farmerName => throw _privateConstructorUsedError;
  int get numberOfBags => throw _privateConstructorUsedError;
  List<BagWeight> get bagWeights => throw _privateConstructorUsedError;
  double get moisturePercent => throw _privateConstructorUsedError;
  String get qualityGrade => throw _privateConstructorUsedError;
  double get grossWeight => throw _privateConstructorUsedError;
  double get deductionFixedKg => throw _privateConstructorUsedError;
  double get netWeight => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this DeliveryEntry to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of DeliveryEntry
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $DeliveryEntryCopyWith<DeliveryEntry> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DeliveryEntryCopyWith<$Res> {
  factory $DeliveryEntryCopyWith(
          DeliveryEntry value, $Res Function(DeliveryEntry) then) =
      _$DeliveryEntryCopyWithImpl<$Res, DeliveryEntry>;
  @useResult
  $Res call(
      {String id,
      String tripId,
      String farmerId,
      String farmerName,
      int numberOfBags,
      List<BagWeight> bagWeights,
      double moisturePercent,
      String qualityGrade,
      double grossWeight,
      double deductionFixedKg,
      double netWeight,
      String? notes,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class _$DeliveryEntryCopyWithImpl<$Res, $Val extends DeliveryEntry>
    implements $DeliveryEntryCopyWith<$Res> {
  _$DeliveryEntryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of DeliveryEntry
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tripId = null,
    Object? farmerId = null,
    Object? farmerName = null,
    Object? numberOfBags = null,
    Object? bagWeights = null,
    Object? moisturePercent = null,
    Object? qualityGrade = null,
    Object? grossWeight = null,
    Object? deductionFixedKg = null,
    Object? netWeight = null,
    Object? notes = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
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
      numberOfBags: null == numberOfBags
          ? _value.numberOfBags
          : numberOfBags // ignore: cast_nullable_to_non_nullable
              as int,
      bagWeights: null == bagWeights
          ? _value.bagWeights
          : bagWeights // ignore: cast_nullable_to_non_nullable
              as List<BagWeight>,
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
      netWeight: null == netWeight
          ? _value.netWeight
          : netWeight // ignore: cast_nullable_to_non_nullable
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
abstract class _$$DeliveryEntryImplCopyWith<$Res>
    implements $DeliveryEntryCopyWith<$Res> {
  factory _$$DeliveryEntryImplCopyWith(
          _$DeliveryEntryImpl value, $Res Function(_$DeliveryEntryImpl) then) =
      __$$DeliveryEntryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String tripId,
      String farmerId,
      String farmerName,
      int numberOfBags,
      List<BagWeight> bagWeights,
      double moisturePercent,
      String qualityGrade,
      double grossWeight,
      double deductionFixedKg,
      double netWeight,
      String? notes,
      DateTime createdAt,
      DateTime updatedAt});
}

/// @nodoc
class __$$DeliveryEntryImplCopyWithImpl<$Res>
    extends _$DeliveryEntryCopyWithImpl<$Res, _$DeliveryEntryImpl>
    implements _$$DeliveryEntryImplCopyWith<$Res> {
  __$$DeliveryEntryImplCopyWithImpl(
      _$DeliveryEntryImpl _value, $Res Function(_$DeliveryEntryImpl) _then)
      : super(_value, _then);

  /// Create a copy of DeliveryEntry
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tripId = null,
    Object? farmerId = null,
    Object? farmerName = null,
    Object? numberOfBags = null,
    Object? bagWeights = null,
    Object? moisturePercent = null,
    Object? qualityGrade = null,
    Object? grossWeight = null,
    Object? deductionFixedKg = null,
    Object? netWeight = null,
    Object? notes = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(_$DeliveryEntryImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
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
      numberOfBags: null == numberOfBags
          ? _value.numberOfBags
          : numberOfBags // ignore: cast_nullable_to_non_nullable
              as int,
      bagWeights: null == bagWeights
          ? _value._bagWeights
          : bagWeights // ignore: cast_nullable_to_non_nullable
              as List<BagWeight>,
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
      netWeight: null == netWeight
          ? _value.netWeight
          : netWeight // ignore: cast_nullable_to_non_nullable
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
class _$DeliveryEntryImpl implements _DeliveryEntry {
  const _$DeliveryEntryImpl(
      {required this.id,
      required this.tripId,
      required this.farmerId,
      required this.farmerName,
      required this.numberOfBags,
      required final List<BagWeight> bagWeights,
      required this.moisturePercent,
      required this.qualityGrade,
      required this.grossWeight,
      required this.deductionFixedKg,
      required this.netWeight,
      this.notes,
      required this.createdAt,
      required this.updatedAt})
      : _bagWeights = bagWeights;

  factory _$DeliveryEntryImpl.fromJson(Map<String, dynamic> json) =>
      _$$DeliveryEntryImplFromJson(json);

  @override
  final String id;
  @override
  final String tripId;
  @override
  final String farmerId;
  @override
  final String farmerName;
  @override
  final int numberOfBags;
  final List<BagWeight> _bagWeights;
  @override
  List<BagWeight> get bagWeights {
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
  final double deductionFixedKg;
  @override
  final double netWeight;
  @override
  final String? notes;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'DeliveryEntry(id: $id, tripId: $tripId, farmerId: $farmerId, farmerName: $farmerName, numberOfBags: $numberOfBags, bagWeights: $bagWeights, moisturePercent: $moisturePercent, qualityGrade: $qualityGrade, grossWeight: $grossWeight, deductionFixedKg: $deductionFixedKg, netWeight: $netWeight, notes: $notes, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DeliveryEntryImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tripId, tripId) || other.tripId == tripId) &&
            (identical(other.farmerId, farmerId) ||
                other.farmerId == farmerId) &&
            (identical(other.farmerName, farmerName) ||
                other.farmerName == farmerName) &&
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
            (identical(other.netWeight, netWeight) ||
                other.netWeight == netWeight) &&
            (identical(other.notes, notes) || other.notes == notes) &&
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
      tripId,
      farmerId,
      farmerName,
      numberOfBags,
      const DeepCollectionEquality().hash(_bagWeights),
      moisturePercent,
      qualityGrade,
      grossWeight,
      deductionFixedKg,
      netWeight,
      notes,
      createdAt,
      updatedAt);

  /// Create a copy of DeliveryEntry
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$DeliveryEntryImplCopyWith<_$DeliveryEntryImpl> get copyWith =>
      __$$DeliveryEntryImplCopyWithImpl<_$DeliveryEntryImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DeliveryEntryImplToJson(
      this,
    );
  }
}

abstract class _DeliveryEntry implements DeliveryEntry {
  const factory _DeliveryEntry(
      {required final String id,
      required final String tripId,
      required final String farmerId,
      required final String farmerName,
      required final int numberOfBags,
      required final List<BagWeight> bagWeights,
      required final double moisturePercent,
      required final String qualityGrade,
      required final double grossWeight,
      required final double deductionFixedKg,
      required final double netWeight,
      final String? notes,
      required final DateTime createdAt,
      required final DateTime updatedAt}) = _$DeliveryEntryImpl;

  factory _DeliveryEntry.fromJson(Map<String, dynamic> json) =
      _$DeliveryEntryImpl.fromJson;

  @override
  String get id;
  @override
  String get tripId;
  @override
  String get farmerId;
  @override
  String get farmerName;
  @override
  int get numberOfBags;
  @override
  List<BagWeight> get bagWeights;
  @override
  double get moisturePercent;
  @override
  String get qualityGrade;
  @override
  double get grossWeight;
  @override
  double get deductionFixedKg;
  @override
  double get netWeight;
  @override
  String? get notes;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;

  /// Create a copy of DeliveryEntry
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$DeliveryEntryImplCopyWith<_$DeliveryEntryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
