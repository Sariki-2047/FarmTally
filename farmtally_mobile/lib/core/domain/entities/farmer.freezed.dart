// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'farmer.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Farmer _$FarmerFromJson(Map<String, dynamic> json) {
  return _Farmer.fromJson(json);
}

/// @nodoc
mixin _$Farmer {
  String get id => throw _privateConstructorUsedError;
  String get organizationId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get phone => throw _privateConstructorUsedError;
  String? get village => throw _privateConstructorUsedError;
  String? get district => throw _privateConstructorUsedError;
  String? get address => throw _privateConstructorUsedError;
  String? get idNumber => throw _privateConstructorUsedError;
  double get totalWeightKg => throw _privateConstructorUsedError;
  int get totalDeliveries => throw _privateConstructorUsedError;
  DateTime? get lastDelivery => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt =>
      throw _privateConstructorUsedError; // Calculated fields
  double get averageDeliveryWeight => throw _privateConstructorUsedError;
  String get averageQualityGrade => throw _privateConstructorUsedError;
  double get totalEarnings => throw _privateConstructorUsedError;
  double get pendingPayments => throw _privateConstructorUsedError;

  /// Serializes this Farmer to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Farmer
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FarmerCopyWith<Farmer> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FarmerCopyWith<$Res> {
  factory $FarmerCopyWith(Farmer value, $Res Function(Farmer) then) =
      _$FarmerCopyWithImpl<$Res, Farmer>;
  @useResult
  $Res call(
      {String id,
      String organizationId,
      String name,
      String phone,
      String? village,
      String? district,
      String? address,
      String? idNumber,
      double totalWeightKg,
      int totalDeliveries,
      DateTime? lastDelivery,
      DateTime createdAt,
      DateTime updatedAt,
      double averageDeliveryWeight,
      String averageQualityGrade,
      double totalEarnings,
      double pendingPayments});
}

/// @nodoc
class _$FarmerCopyWithImpl<$Res, $Val extends Farmer>
    implements $FarmerCopyWith<$Res> {
  _$FarmerCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Farmer
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? organizationId = null,
    Object? name = null,
    Object? phone = null,
    Object? village = freezed,
    Object? district = freezed,
    Object? address = freezed,
    Object? idNumber = freezed,
    Object? totalWeightKg = null,
    Object? totalDeliveries = null,
    Object? lastDelivery = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? averageDeliveryWeight = null,
    Object? averageQualityGrade = null,
    Object? totalEarnings = null,
    Object? pendingPayments = null,
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
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      phone: null == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String,
      village: freezed == village
          ? _value.village
          : village // ignore: cast_nullable_to_non_nullable
              as String?,
      district: freezed == district
          ? _value.district
          : district // ignore: cast_nullable_to_non_nullable
              as String?,
      address: freezed == address
          ? _value.address
          : address // ignore: cast_nullable_to_non_nullable
              as String?,
      idNumber: freezed == idNumber
          ? _value.idNumber
          : idNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      totalWeightKg: null == totalWeightKg
          ? _value.totalWeightKg
          : totalWeightKg // ignore: cast_nullable_to_non_nullable
              as double,
      totalDeliveries: null == totalDeliveries
          ? _value.totalDeliveries
          : totalDeliveries // ignore: cast_nullable_to_non_nullable
              as int,
      lastDelivery: freezed == lastDelivery
          ? _value.lastDelivery
          : lastDelivery // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      averageDeliveryWeight: null == averageDeliveryWeight
          ? _value.averageDeliveryWeight
          : averageDeliveryWeight // ignore: cast_nullable_to_non_nullable
              as double,
      averageQualityGrade: null == averageQualityGrade
          ? _value.averageQualityGrade
          : averageQualityGrade // ignore: cast_nullable_to_non_nullable
              as String,
      totalEarnings: null == totalEarnings
          ? _value.totalEarnings
          : totalEarnings // ignore: cast_nullable_to_non_nullable
              as double,
      pendingPayments: null == pendingPayments
          ? _value.pendingPayments
          : pendingPayments // ignore: cast_nullable_to_non_nullable
              as double,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$FarmerImplCopyWith<$Res> implements $FarmerCopyWith<$Res> {
  factory _$$FarmerImplCopyWith(
          _$FarmerImpl value, $Res Function(_$FarmerImpl) then) =
      __$$FarmerImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String organizationId,
      String name,
      String phone,
      String? village,
      String? district,
      String? address,
      String? idNumber,
      double totalWeightKg,
      int totalDeliveries,
      DateTime? lastDelivery,
      DateTime createdAt,
      DateTime updatedAt,
      double averageDeliveryWeight,
      String averageQualityGrade,
      double totalEarnings,
      double pendingPayments});
}

/// @nodoc
class __$$FarmerImplCopyWithImpl<$Res>
    extends _$FarmerCopyWithImpl<$Res, _$FarmerImpl>
    implements _$$FarmerImplCopyWith<$Res> {
  __$$FarmerImplCopyWithImpl(
      _$FarmerImpl _value, $Res Function(_$FarmerImpl) _then)
      : super(_value, _then);

  /// Create a copy of Farmer
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? organizationId = null,
    Object? name = null,
    Object? phone = null,
    Object? village = freezed,
    Object? district = freezed,
    Object? address = freezed,
    Object? idNumber = freezed,
    Object? totalWeightKg = null,
    Object? totalDeliveries = null,
    Object? lastDelivery = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? averageDeliveryWeight = null,
    Object? averageQualityGrade = null,
    Object? totalEarnings = null,
    Object? pendingPayments = null,
  }) {
    return _then(_$FarmerImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      organizationId: null == organizationId
          ? _value.organizationId
          : organizationId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      phone: null == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String,
      village: freezed == village
          ? _value.village
          : village // ignore: cast_nullable_to_non_nullable
              as String?,
      district: freezed == district
          ? _value.district
          : district // ignore: cast_nullable_to_non_nullable
              as String?,
      address: freezed == address
          ? _value.address
          : address // ignore: cast_nullable_to_non_nullable
              as String?,
      idNumber: freezed == idNumber
          ? _value.idNumber
          : idNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      totalWeightKg: null == totalWeightKg
          ? _value.totalWeightKg
          : totalWeightKg // ignore: cast_nullable_to_non_nullable
              as double,
      totalDeliveries: null == totalDeliveries
          ? _value.totalDeliveries
          : totalDeliveries // ignore: cast_nullable_to_non_nullable
              as int,
      lastDelivery: freezed == lastDelivery
          ? _value.lastDelivery
          : lastDelivery // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      averageDeliveryWeight: null == averageDeliveryWeight
          ? _value.averageDeliveryWeight
          : averageDeliveryWeight // ignore: cast_nullable_to_non_nullable
              as double,
      averageQualityGrade: null == averageQualityGrade
          ? _value.averageQualityGrade
          : averageQualityGrade // ignore: cast_nullable_to_non_nullable
              as String,
      totalEarnings: null == totalEarnings
          ? _value.totalEarnings
          : totalEarnings // ignore: cast_nullable_to_non_nullable
              as double,
      pendingPayments: null == pendingPayments
          ? _value.pendingPayments
          : pendingPayments // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$FarmerImpl implements _Farmer {
  const _$FarmerImpl(
      {required this.id,
      required this.organizationId,
      required this.name,
      required this.phone,
      this.village,
      this.district,
      this.address,
      this.idNumber,
      this.totalWeightKg = 0.0,
      this.totalDeliveries = 0,
      this.lastDelivery,
      required this.createdAt,
      required this.updatedAt,
      this.averageDeliveryWeight = 0.0,
      this.averageQualityGrade = 'A',
      this.totalEarnings = 0.0,
      this.pendingPayments = 0.0});

  factory _$FarmerImpl.fromJson(Map<String, dynamic> json) =>
      _$$FarmerImplFromJson(json);

  @override
  final String id;
  @override
  final String organizationId;
  @override
  final String name;
  @override
  final String phone;
  @override
  final String? village;
  @override
  final String? district;
  @override
  final String? address;
  @override
  final String? idNumber;
  @override
  @JsonKey()
  final double totalWeightKg;
  @override
  @JsonKey()
  final int totalDeliveries;
  @override
  final DateTime? lastDelivery;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
// Calculated fields
  @override
  @JsonKey()
  final double averageDeliveryWeight;
  @override
  @JsonKey()
  final String averageQualityGrade;
  @override
  @JsonKey()
  final double totalEarnings;
  @override
  @JsonKey()
  final double pendingPayments;

  @override
  String toString() {
    return 'Farmer(id: $id, organizationId: $organizationId, name: $name, phone: $phone, village: $village, district: $district, address: $address, idNumber: $idNumber, totalWeightKg: $totalWeightKg, totalDeliveries: $totalDeliveries, lastDelivery: $lastDelivery, createdAt: $createdAt, updatedAt: $updatedAt, averageDeliveryWeight: $averageDeliveryWeight, averageQualityGrade: $averageQualityGrade, totalEarnings: $totalEarnings, pendingPayments: $pendingPayments)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FarmerImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.organizationId, organizationId) ||
                other.organizationId == organizationId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.village, village) || other.village == village) &&
            (identical(other.district, district) ||
                other.district == district) &&
            (identical(other.address, address) || other.address == address) &&
            (identical(other.idNumber, idNumber) ||
                other.idNumber == idNumber) &&
            (identical(other.totalWeightKg, totalWeightKg) ||
                other.totalWeightKg == totalWeightKg) &&
            (identical(other.totalDeliveries, totalDeliveries) ||
                other.totalDeliveries == totalDeliveries) &&
            (identical(other.lastDelivery, lastDelivery) ||
                other.lastDelivery == lastDelivery) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.averageDeliveryWeight, averageDeliveryWeight) ||
                other.averageDeliveryWeight == averageDeliveryWeight) &&
            (identical(other.averageQualityGrade, averageQualityGrade) ||
                other.averageQualityGrade == averageQualityGrade) &&
            (identical(other.totalEarnings, totalEarnings) ||
                other.totalEarnings == totalEarnings) &&
            (identical(other.pendingPayments, pendingPayments) ||
                other.pendingPayments == pendingPayments));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      organizationId,
      name,
      phone,
      village,
      district,
      address,
      idNumber,
      totalWeightKg,
      totalDeliveries,
      lastDelivery,
      createdAt,
      updatedAt,
      averageDeliveryWeight,
      averageQualityGrade,
      totalEarnings,
      pendingPayments);

  /// Create a copy of Farmer
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FarmerImplCopyWith<_$FarmerImpl> get copyWith =>
      __$$FarmerImplCopyWithImpl<_$FarmerImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FarmerImplToJson(
      this,
    );
  }
}

abstract class _Farmer implements Farmer {
  const factory _Farmer(
      {required final String id,
      required final String organizationId,
      required final String name,
      required final String phone,
      final String? village,
      final String? district,
      final String? address,
      final String? idNumber,
      final double totalWeightKg,
      final int totalDeliveries,
      final DateTime? lastDelivery,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final double averageDeliveryWeight,
      final String averageQualityGrade,
      final double totalEarnings,
      final double pendingPayments}) = _$FarmerImpl;

  factory _Farmer.fromJson(Map<String, dynamic> json) = _$FarmerImpl.fromJson;

  @override
  String get id;
  @override
  String get organizationId;
  @override
  String get name;
  @override
  String get phone;
  @override
  String? get village;
  @override
  String? get district;
  @override
  String? get address;
  @override
  String? get idNumber;
  @override
  double get totalWeightKg;
  @override
  int get totalDeliveries;
  @override
  DateTime? get lastDelivery;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt; // Calculated fields
  @override
  double get averageDeliveryWeight;
  @override
  String get averageQualityGrade;
  @override
  double get totalEarnings;
  @override
  double get pendingPayments;

  /// Create a copy of Farmer
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FarmerImplCopyWith<_$FarmerImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
