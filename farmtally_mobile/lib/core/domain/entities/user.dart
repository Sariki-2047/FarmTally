import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    String? email,
    String? phone,
    required String role,
    String? organizationId,
    required String firstName,
    required String lastName,
    String? address,
    String? idNumber,
    @Default('ACTIVE') String status,
    DateTime? lastLogin,
    required DateTime createdAt,
    required DateTime updatedAt,
    Organization? organization,
    @Default({}) Map<String, dynamic> preferences,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

extension UserExtension on User {
  String get displayName => '$firstName $lastName'.trim();
  String get initials => '${firstName.isNotEmpty ? firstName[0] : ''}${lastName.isNotEmpty ? lastName[0] : ''}'.toUpperCase();
  
  bool get isFarmAdmin => role == 'FARM_ADMIN';
  bool get isFieldManager => role == 'FIELD_MANAGER';
  bool get isFarmer => role == 'FARMER';
  bool get isActive => status == 'ACTIVE';
}

@freezed
class Organization with _$Organization {
  const factory Organization({
    required String id,
    required String name,
    required String code,
    required String ownerId,
    String? address,
    String? phone,
    String? email,
    @Default({}) Map<String, dynamic> settings,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Organization;

  factory Organization.fromJson(Map<String, dynamic> json) => _$OrganizationFromJson(json);
}

extension OrganizationExtension on Organization {
  String get currency => settings['currency']?.toString() ?? 'INR';
  String get timezone => settings['timezone']?.toString() ?? 'Asia/Kolkata';
  double get universalPricePerKg => (settings['universalPricePerKg'] ?? settings['pricePerKg'] ?? 0.0).toDouble();
  double get standardDeduction => (settings['standardDeduction'] ?? 0.05).toDouble();
}