// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $UsersTable extends Users with TableInfo<$UsersTable, User> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $UsersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _emailMeta = const VerificationMeta('email');
  @override
  late final GeneratedColumn<String> email = GeneratedColumn<String>(
      'email', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _phoneMeta = const VerificationMeta('phone');
  @override
  late final GeneratedColumn<String> phone = GeneratedColumn<String>(
      'phone', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _roleMeta = const VerificationMeta('role');
  @override
  late final GeneratedColumn<String> role = GeneratedColumn<String>(
      'role', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _organizationIdMeta =
      const VerificationMeta('organizationId');
  @override
  late final GeneratedColumn<String> organizationId = GeneratedColumn<String>(
      'organization_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _firstNameMeta =
      const VerificationMeta('firstName');
  @override
  late final GeneratedColumn<String> firstName = GeneratedColumn<String>(
      'first_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _lastNameMeta =
      const VerificationMeta('lastName');
  @override
  late final GeneratedColumn<String> lastName = GeneratedColumn<String>(
      'last_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _addressMeta =
      const VerificationMeta('address');
  @override
  late final GeneratedColumn<String> address = GeneratedColumn<String>(
      'address', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _idNumberMeta =
      const VerificationMeta('idNumber');
  @override
  late final GeneratedColumn<String> idNumber = GeneratedColumn<String>(
      'id_number', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('ACTIVE'));
  static const VerificationMeta _lastLoginMeta =
      const VerificationMeta('lastLogin');
  @override
  late final GeneratedColumn<DateTime> lastLogin = GeneratedColumn<DateTime>(
      'last_login', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _profileJsonMeta =
      const VerificationMeta('profileJson');
  @override
  late final GeneratedColumn<String> profileJson = GeneratedColumn<String>(
      'profile_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('{}'));
  static const VerificationMeta _preferencesJsonMeta =
      const VerificationMeta('preferencesJson');
  @override
  late final GeneratedColumn<String> preferencesJson = GeneratedColumn<String>(
      'preferences_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('{}'));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        email,
        phone,
        role,
        organizationId,
        firstName,
        lastName,
        address,
        idNumber,
        status,
        lastLogin,
        createdAt,
        updatedAt,
        profileJson,
        preferencesJson
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'users';
  @override
  VerificationContext validateIntegrity(Insertable<User> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('email')) {
      context.handle(
          _emailMeta, email.isAcceptableOrUnknown(data['email']!, _emailMeta));
    }
    if (data.containsKey('phone')) {
      context.handle(
          _phoneMeta, phone.isAcceptableOrUnknown(data['phone']!, _phoneMeta));
    }
    if (data.containsKey('role')) {
      context.handle(
          _roleMeta, role.isAcceptableOrUnknown(data['role']!, _roleMeta));
    } else if (isInserting) {
      context.missing(_roleMeta);
    }
    if (data.containsKey('organization_id')) {
      context.handle(
          _organizationIdMeta,
          organizationId.isAcceptableOrUnknown(
              data['organization_id']!, _organizationIdMeta));
    }
    if (data.containsKey('first_name')) {
      context.handle(_firstNameMeta,
          firstName.isAcceptableOrUnknown(data['first_name']!, _firstNameMeta));
    } else if (isInserting) {
      context.missing(_firstNameMeta);
    }
    if (data.containsKey('last_name')) {
      context.handle(_lastNameMeta,
          lastName.isAcceptableOrUnknown(data['last_name']!, _lastNameMeta));
    } else if (isInserting) {
      context.missing(_lastNameMeta);
    }
    if (data.containsKey('address')) {
      context.handle(_addressMeta,
          address.isAcceptableOrUnknown(data['address']!, _addressMeta));
    }
    if (data.containsKey('id_number')) {
      context.handle(_idNumberMeta,
          idNumber.isAcceptableOrUnknown(data['id_number']!, _idNumberMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('last_login')) {
      context.handle(_lastLoginMeta,
          lastLogin.isAcceptableOrUnknown(data['last_login']!, _lastLoginMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    }
    if (data.containsKey('profile_json')) {
      context.handle(
          _profileJsonMeta,
          profileJson.isAcceptableOrUnknown(
              data['profile_json']!, _profileJsonMeta));
    }
    if (data.containsKey('preferences_json')) {
      context.handle(
          _preferencesJsonMeta,
          preferencesJson.isAcceptableOrUnknown(
              data['preferences_json']!, _preferencesJsonMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  User map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return User(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      email: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}email']),
      phone: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}phone']),
      role: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}role'])!,
      organizationId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}organization_id']),
      firstName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}first_name'])!,
      lastName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_name'])!,
      address: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}address']),
      idNumber: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id_number']),
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      lastLogin: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}last_login']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      profileJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}profile_json'])!,
      preferencesJson: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}preferences_json'])!,
    );
  }

  @override
  $UsersTable createAlias(String alias) {
    return $UsersTable(attachedDatabase, alias);
  }
}

class User extends DataClass implements Insertable<User> {
  final String id;
  final String? email;
  final String? phone;
  final String role;
  final String? organizationId;
  final String firstName;
  final String lastName;
  final String? address;
  final String? idNumber;
  final String status;
  final DateTime? lastLogin;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String profileJson;
  final String preferencesJson;
  const User(
      {required this.id,
      this.email,
      this.phone,
      required this.role,
      this.organizationId,
      required this.firstName,
      required this.lastName,
      this.address,
      this.idNumber,
      required this.status,
      this.lastLogin,
      required this.createdAt,
      required this.updatedAt,
      required this.profileJson,
      required this.preferencesJson});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    if (!nullToAbsent || email != null) {
      map['email'] = Variable<String>(email);
    }
    if (!nullToAbsent || phone != null) {
      map['phone'] = Variable<String>(phone);
    }
    map['role'] = Variable<String>(role);
    if (!nullToAbsent || organizationId != null) {
      map['organization_id'] = Variable<String>(organizationId);
    }
    map['first_name'] = Variable<String>(firstName);
    map['last_name'] = Variable<String>(lastName);
    if (!nullToAbsent || address != null) {
      map['address'] = Variable<String>(address);
    }
    if (!nullToAbsent || idNumber != null) {
      map['id_number'] = Variable<String>(idNumber);
    }
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || lastLogin != null) {
      map['last_login'] = Variable<DateTime>(lastLogin);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['profile_json'] = Variable<String>(profileJson);
    map['preferences_json'] = Variable<String>(preferencesJson);
    return map;
  }

  UsersCompanion toCompanion(bool nullToAbsent) {
    return UsersCompanion(
      id: Value(id),
      email:
          email == null && nullToAbsent ? const Value.absent() : Value(email),
      phone:
          phone == null && nullToAbsent ? const Value.absent() : Value(phone),
      role: Value(role),
      organizationId: organizationId == null && nullToAbsent
          ? const Value.absent()
          : Value(organizationId),
      firstName: Value(firstName),
      lastName: Value(lastName),
      address: address == null && nullToAbsent
          ? const Value.absent()
          : Value(address),
      idNumber: idNumber == null && nullToAbsent
          ? const Value.absent()
          : Value(idNumber),
      status: Value(status),
      lastLogin: lastLogin == null && nullToAbsent
          ? const Value.absent()
          : Value(lastLogin),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      profileJson: Value(profileJson),
      preferencesJson: Value(preferencesJson),
    );
  }

  factory User.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return User(
      id: serializer.fromJson<String>(json['id']),
      email: serializer.fromJson<String?>(json['email']),
      phone: serializer.fromJson<String?>(json['phone']),
      role: serializer.fromJson<String>(json['role']),
      organizationId: serializer.fromJson<String?>(json['organizationId']),
      firstName: serializer.fromJson<String>(json['firstName']),
      lastName: serializer.fromJson<String>(json['lastName']),
      address: serializer.fromJson<String?>(json['address']),
      idNumber: serializer.fromJson<String?>(json['idNumber']),
      status: serializer.fromJson<String>(json['status']),
      lastLogin: serializer.fromJson<DateTime?>(json['lastLogin']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      profileJson: serializer.fromJson<String>(json['profileJson']),
      preferencesJson: serializer.fromJson<String>(json['preferencesJson']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'email': serializer.toJson<String?>(email),
      'phone': serializer.toJson<String?>(phone),
      'role': serializer.toJson<String>(role),
      'organizationId': serializer.toJson<String?>(organizationId),
      'firstName': serializer.toJson<String>(firstName),
      'lastName': serializer.toJson<String>(lastName),
      'address': serializer.toJson<String?>(address),
      'idNumber': serializer.toJson<String?>(idNumber),
      'status': serializer.toJson<String>(status),
      'lastLogin': serializer.toJson<DateTime?>(lastLogin),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'profileJson': serializer.toJson<String>(profileJson),
      'preferencesJson': serializer.toJson<String>(preferencesJson),
    };
  }

  User copyWith(
          {String? id,
          Value<String?> email = const Value.absent(),
          Value<String?> phone = const Value.absent(),
          String? role,
          Value<String?> organizationId = const Value.absent(),
          String? firstName,
          String? lastName,
          Value<String?> address = const Value.absent(),
          Value<String?> idNumber = const Value.absent(),
          String? status,
          Value<DateTime?> lastLogin = const Value.absent(),
          DateTime? createdAt,
          DateTime? updatedAt,
          String? profileJson,
          String? preferencesJson}) =>
      User(
        id: id ?? this.id,
        email: email.present ? email.value : this.email,
        phone: phone.present ? phone.value : this.phone,
        role: role ?? this.role,
        organizationId:
            organizationId.present ? organizationId.value : this.organizationId,
        firstName: firstName ?? this.firstName,
        lastName: lastName ?? this.lastName,
        address: address.present ? address.value : this.address,
        idNumber: idNumber.present ? idNumber.value : this.idNumber,
        status: status ?? this.status,
        lastLogin: lastLogin.present ? lastLogin.value : this.lastLogin,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        profileJson: profileJson ?? this.profileJson,
        preferencesJson: preferencesJson ?? this.preferencesJson,
      );
  User copyWithCompanion(UsersCompanion data) {
    return User(
      id: data.id.present ? data.id.value : this.id,
      email: data.email.present ? data.email.value : this.email,
      phone: data.phone.present ? data.phone.value : this.phone,
      role: data.role.present ? data.role.value : this.role,
      organizationId: data.organizationId.present
          ? data.organizationId.value
          : this.organizationId,
      firstName: data.firstName.present ? data.firstName.value : this.firstName,
      lastName: data.lastName.present ? data.lastName.value : this.lastName,
      address: data.address.present ? data.address.value : this.address,
      idNumber: data.idNumber.present ? data.idNumber.value : this.idNumber,
      status: data.status.present ? data.status.value : this.status,
      lastLogin: data.lastLogin.present ? data.lastLogin.value : this.lastLogin,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      profileJson:
          data.profileJson.present ? data.profileJson.value : this.profileJson,
      preferencesJson: data.preferencesJson.present
          ? data.preferencesJson.value
          : this.preferencesJson,
    );
  }

  @override
  String toString() {
    return (StringBuffer('User(')
          ..write('id: $id, ')
          ..write('email: $email, ')
          ..write('phone: $phone, ')
          ..write('role: $role, ')
          ..write('organizationId: $organizationId, ')
          ..write('firstName: $firstName, ')
          ..write('lastName: $lastName, ')
          ..write('address: $address, ')
          ..write('idNumber: $idNumber, ')
          ..write('status: $status, ')
          ..write('lastLogin: $lastLogin, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('profileJson: $profileJson, ')
          ..write('preferencesJson: $preferencesJson')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      email,
      phone,
      role,
      organizationId,
      firstName,
      lastName,
      address,
      idNumber,
      status,
      lastLogin,
      createdAt,
      updatedAt,
      profileJson,
      preferencesJson);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is User &&
          other.id == this.id &&
          other.email == this.email &&
          other.phone == this.phone &&
          other.role == this.role &&
          other.organizationId == this.organizationId &&
          other.firstName == this.firstName &&
          other.lastName == this.lastName &&
          other.address == this.address &&
          other.idNumber == this.idNumber &&
          other.status == this.status &&
          other.lastLogin == this.lastLogin &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.profileJson == this.profileJson &&
          other.preferencesJson == this.preferencesJson);
}

class UsersCompanion extends UpdateCompanion<User> {
  final Value<String> id;
  final Value<String?> email;
  final Value<String?> phone;
  final Value<String> role;
  final Value<String?> organizationId;
  final Value<String> firstName;
  final Value<String> lastName;
  final Value<String?> address;
  final Value<String?> idNumber;
  final Value<String> status;
  final Value<DateTime?> lastLogin;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<String> profileJson;
  final Value<String> preferencesJson;
  final Value<int> rowid;
  const UsersCompanion({
    this.id = const Value.absent(),
    this.email = const Value.absent(),
    this.phone = const Value.absent(),
    this.role = const Value.absent(),
    this.organizationId = const Value.absent(),
    this.firstName = const Value.absent(),
    this.lastName = const Value.absent(),
    this.address = const Value.absent(),
    this.idNumber = const Value.absent(),
    this.status = const Value.absent(),
    this.lastLogin = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.profileJson = const Value.absent(),
    this.preferencesJson = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  UsersCompanion.insert({
    required String id,
    this.email = const Value.absent(),
    this.phone = const Value.absent(),
    required String role,
    this.organizationId = const Value.absent(),
    required String firstName,
    required String lastName,
    this.address = const Value.absent(),
    this.idNumber = const Value.absent(),
    this.status = const Value.absent(),
    this.lastLogin = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.profileJson = const Value.absent(),
    this.preferencesJson = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        role = Value(role),
        firstName = Value(firstName),
        lastName = Value(lastName);
  static Insertable<User> custom({
    Expression<String>? id,
    Expression<String>? email,
    Expression<String>? phone,
    Expression<String>? role,
    Expression<String>? organizationId,
    Expression<String>? firstName,
    Expression<String>? lastName,
    Expression<String>? address,
    Expression<String>? idNumber,
    Expression<String>? status,
    Expression<DateTime>? lastLogin,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<String>? profileJson,
    Expression<String>? preferencesJson,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (email != null) 'email': email,
      if (phone != null) 'phone': phone,
      if (role != null) 'role': role,
      if (organizationId != null) 'organization_id': organizationId,
      if (firstName != null) 'first_name': firstName,
      if (lastName != null) 'last_name': lastName,
      if (address != null) 'address': address,
      if (idNumber != null) 'id_number': idNumber,
      if (status != null) 'status': status,
      if (lastLogin != null) 'last_login': lastLogin,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (profileJson != null) 'profile_json': profileJson,
      if (preferencesJson != null) 'preferences_json': preferencesJson,
      if (rowid != null) 'rowid': rowid,
    });
  }

  UsersCompanion copyWith(
      {Value<String>? id,
      Value<String?>? email,
      Value<String?>? phone,
      Value<String>? role,
      Value<String?>? organizationId,
      Value<String>? firstName,
      Value<String>? lastName,
      Value<String?>? address,
      Value<String?>? idNumber,
      Value<String>? status,
      Value<DateTime?>? lastLogin,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<String>? profileJson,
      Value<String>? preferencesJson,
      Value<int>? rowid}) {
    return UsersCompanion(
      id: id ?? this.id,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      organizationId: organizationId ?? this.organizationId,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      address: address ?? this.address,
      idNumber: idNumber ?? this.idNumber,
      status: status ?? this.status,
      lastLogin: lastLogin ?? this.lastLogin,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      profileJson: profileJson ?? this.profileJson,
      preferencesJson: preferencesJson ?? this.preferencesJson,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (email.present) {
      map['email'] = Variable<String>(email.value);
    }
    if (phone.present) {
      map['phone'] = Variable<String>(phone.value);
    }
    if (role.present) {
      map['role'] = Variable<String>(role.value);
    }
    if (organizationId.present) {
      map['organization_id'] = Variable<String>(organizationId.value);
    }
    if (firstName.present) {
      map['first_name'] = Variable<String>(firstName.value);
    }
    if (lastName.present) {
      map['last_name'] = Variable<String>(lastName.value);
    }
    if (address.present) {
      map['address'] = Variable<String>(address.value);
    }
    if (idNumber.present) {
      map['id_number'] = Variable<String>(idNumber.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (lastLogin.present) {
      map['last_login'] = Variable<DateTime>(lastLogin.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (profileJson.present) {
      map['profile_json'] = Variable<String>(profileJson.value);
    }
    if (preferencesJson.present) {
      map['preferences_json'] = Variable<String>(preferencesJson.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('UsersCompanion(')
          ..write('id: $id, ')
          ..write('email: $email, ')
          ..write('phone: $phone, ')
          ..write('role: $role, ')
          ..write('organizationId: $organizationId, ')
          ..write('firstName: $firstName, ')
          ..write('lastName: $lastName, ')
          ..write('address: $address, ')
          ..write('idNumber: $idNumber, ')
          ..write('status: $status, ')
          ..write('lastLogin: $lastLogin, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('profileJson: $profileJson, ')
          ..write('preferencesJson: $preferencesJson, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $OrganizationsTable extends Organizations
    with TableInfo<$OrganizationsTable, Organization> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $OrganizationsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _codeMeta = const VerificationMeta('code');
  @override
  late final GeneratedColumn<String> code = GeneratedColumn<String>(
      'code', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _ownerIdMeta =
      const VerificationMeta('ownerId');
  @override
  late final GeneratedColumn<String> ownerId = GeneratedColumn<String>(
      'owner_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _addressMeta =
      const VerificationMeta('address');
  @override
  late final GeneratedColumn<String> address = GeneratedColumn<String>(
      'address', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _phoneMeta = const VerificationMeta('phone');
  @override
  late final GeneratedColumn<String> phone = GeneratedColumn<String>(
      'phone', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _emailMeta = const VerificationMeta('email');
  @override
  late final GeneratedColumn<String> email = GeneratedColumn<String>(
      'email', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _settingsJsonMeta =
      const VerificationMeta('settingsJson');
  @override
  late final GeneratedColumn<String> settingsJson = GeneratedColumn<String>(
      'settings_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('{}'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        name,
        code,
        ownerId,
        address,
        phone,
        email,
        settingsJson,
        createdAt,
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'organizations';
  @override
  VerificationContext validateIntegrity(Insertable<Organization> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('code')) {
      context.handle(
          _codeMeta, code.isAcceptableOrUnknown(data['code']!, _codeMeta));
    } else if (isInserting) {
      context.missing(_codeMeta);
    }
    if (data.containsKey('owner_id')) {
      context.handle(_ownerIdMeta,
          ownerId.isAcceptableOrUnknown(data['owner_id']!, _ownerIdMeta));
    } else if (isInserting) {
      context.missing(_ownerIdMeta);
    }
    if (data.containsKey('address')) {
      context.handle(_addressMeta,
          address.isAcceptableOrUnknown(data['address']!, _addressMeta));
    }
    if (data.containsKey('phone')) {
      context.handle(
          _phoneMeta, phone.isAcceptableOrUnknown(data['phone']!, _phoneMeta));
    }
    if (data.containsKey('email')) {
      context.handle(
          _emailMeta, email.isAcceptableOrUnknown(data['email']!, _emailMeta));
    }
    if (data.containsKey('settings_json')) {
      context.handle(
          _settingsJsonMeta,
          settingsJson.isAcceptableOrUnknown(
              data['settings_json']!, _settingsJsonMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Organization map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Organization(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      code: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}code'])!,
      ownerId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}owner_id'])!,
      address: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}address']),
      phone: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}phone']),
      email: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}email']),
      settingsJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}settings_json'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $OrganizationsTable createAlias(String alias) {
    return $OrganizationsTable(attachedDatabase, alias);
  }
}

class Organization extends DataClass implements Insertable<Organization> {
  final String id;
  final String name;
  final String code;
  final String ownerId;
  final String? address;
  final String? phone;
  final String? email;
  final String settingsJson;
  final DateTime createdAt;
  final DateTime updatedAt;
  const Organization(
      {required this.id,
      required this.name,
      required this.code,
      required this.ownerId,
      this.address,
      this.phone,
      this.email,
      required this.settingsJson,
      required this.createdAt,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    map['code'] = Variable<String>(code);
    map['owner_id'] = Variable<String>(ownerId);
    if (!nullToAbsent || address != null) {
      map['address'] = Variable<String>(address);
    }
    if (!nullToAbsent || phone != null) {
      map['phone'] = Variable<String>(phone);
    }
    if (!nullToAbsent || email != null) {
      map['email'] = Variable<String>(email);
    }
    map['settings_json'] = Variable<String>(settingsJson);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  OrganizationsCompanion toCompanion(bool nullToAbsent) {
    return OrganizationsCompanion(
      id: Value(id),
      name: Value(name),
      code: Value(code),
      ownerId: Value(ownerId),
      address: address == null && nullToAbsent
          ? const Value.absent()
          : Value(address),
      phone:
          phone == null && nullToAbsent ? const Value.absent() : Value(phone),
      email:
          email == null && nullToAbsent ? const Value.absent() : Value(email),
      settingsJson: Value(settingsJson),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory Organization.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Organization(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      code: serializer.fromJson<String>(json['code']),
      ownerId: serializer.fromJson<String>(json['ownerId']),
      address: serializer.fromJson<String?>(json['address']),
      phone: serializer.fromJson<String?>(json['phone']),
      email: serializer.fromJson<String?>(json['email']),
      settingsJson: serializer.fromJson<String>(json['settingsJson']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'code': serializer.toJson<String>(code),
      'ownerId': serializer.toJson<String>(ownerId),
      'address': serializer.toJson<String?>(address),
      'phone': serializer.toJson<String?>(phone),
      'email': serializer.toJson<String?>(email),
      'settingsJson': serializer.toJson<String>(settingsJson),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  Organization copyWith(
          {String? id,
          String? name,
          String? code,
          String? ownerId,
          Value<String?> address = const Value.absent(),
          Value<String?> phone = const Value.absent(),
          Value<String?> email = const Value.absent(),
          String? settingsJson,
          DateTime? createdAt,
          DateTime? updatedAt}) =>
      Organization(
        id: id ?? this.id,
        name: name ?? this.name,
        code: code ?? this.code,
        ownerId: ownerId ?? this.ownerId,
        address: address.present ? address.value : this.address,
        phone: phone.present ? phone.value : this.phone,
        email: email.present ? email.value : this.email,
        settingsJson: settingsJson ?? this.settingsJson,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  Organization copyWithCompanion(OrganizationsCompanion data) {
    return Organization(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      code: data.code.present ? data.code.value : this.code,
      ownerId: data.ownerId.present ? data.ownerId.value : this.ownerId,
      address: data.address.present ? data.address.value : this.address,
      phone: data.phone.present ? data.phone.value : this.phone,
      email: data.email.present ? data.email.value : this.email,
      settingsJson: data.settingsJson.present
          ? data.settingsJson.value
          : this.settingsJson,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Organization(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('code: $code, ')
          ..write('ownerId: $ownerId, ')
          ..write('address: $address, ')
          ..write('phone: $phone, ')
          ..write('email: $email, ')
          ..write('settingsJson: $settingsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, code, ownerId, address, phone,
      email, settingsJson, createdAt, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Organization &&
          other.id == this.id &&
          other.name == this.name &&
          other.code == this.code &&
          other.ownerId == this.ownerId &&
          other.address == this.address &&
          other.phone == this.phone &&
          other.email == this.email &&
          other.settingsJson == this.settingsJson &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class OrganizationsCompanion extends UpdateCompanion<Organization> {
  final Value<String> id;
  final Value<String> name;
  final Value<String> code;
  final Value<String> ownerId;
  final Value<String?> address;
  final Value<String?> phone;
  final Value<String?> email;
  final Value<String> settingsJson;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const OrganizationsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.code = const Value.absent(),
    this.ownerId = const Value.absent(),
    this.address = const Value.absent(),
    this.phone = const Value.absent(),
    this.email = const Value.absent(),
    this.settingsJson = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  OrganizationsCompanion.insert({
    required String id,
    required String name,
    required String code,
    required String ownerId,
    this.address = const Value.absent(),
    this.phone = const Value.absent(),
    this.email = const Value.absent(),
    this.settingsJson = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        name = Value(name),
        code = Value(code),
        ownerId = Value(ownerId);
  static Insertable<Organization> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? code,
    Expression<String>? ownerId,
    Expression<String>? address,
    Expression<String>? phone,
    Expression<String>? email,
    Expression<String>? settingsJson,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (code != null) 'code': code,
      if (ownerId != null) 'owner_id': ownerId,
      if (address != null) 'address': address,
      if (phone != null) 'phone': phone,
      if (email != null) 'email': email,
      if (settingsJson != null) 'settings_json': settingsJson,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  OrganizationsCompanion copyWith(
      {Value<String>? id,
      Value<String>? name,
      Value<String>? code,
      Value<String>? ownerId,
      Value<String?>? address,
      Value<String?>? phone,
      Value<String?>? email,
      Value<String>? settingsJson,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? rowid}) {
    return OrganizationsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      ownerId: ownerId ?? this.ownerId,
      address: address ?? this.address,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      settingsJson: settingsJson ?? this.settingsJson,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (code.present) {
      map['code'] = Variable<String>(code.value);
    }
    if (ownerId.present) {
      map['owner_id'] = Variable<String>(ownerId.value);
    }
    if (address.present) {
      map['address'] = Variable<String>(address.value);
    }
    if (phone.present) {
      map['phone'] = Variable<String>(phone.value);
    }
    if (email.present) {
      map['email'] = Variable<String>(email.value);
    }
    if (settingsJson.present) {
      map['settings_json'] = Variable<String>(settingsJson.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('OrganizationsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('code: $code, ')
          ..write('ownerId: $ownerId, ')
          ..write('address: $address, ')
          ..write('phone: $phone, ')
          ..write('email: $email, ')
          ..write('settingsJson: $settingsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LorriesTable extends Lorries with TableInfo<$LorriesTable, Lorry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LorriesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _organizationIdMeta =
      const VerificationMeta('organizationId');
  @override
  late final GeneratedColumn<String> organizationId = GeneratedColumn<String>(
      'organization_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _registrationNumberMeta =
      const VerificationMeta('registrationNumber');
  @override
  late final GeneratedColumn<String> registrationNumber =
      GeneratedColumn<String>('registration_number', aliasedName, false,
          type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _driverNameMeta =
      const VerificationMeta('driverName');
  @override
  late final GeneratedColumn<String> driverName = GeneratedColumn<String>(
      'driver_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _driverPhoneMeta =
      const VerificationMeta('driverPhone');
  @override
  late final GeneratedColumn<String> driverPhone = GeneratedColumn<String>(
      'driver_phone', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _capacityMeta =
      const VerificationMeta('capacity');
  @override
  late final GeneratedColumn<double> capacity = GeneratedColumn<double>(
      'capacity', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('AVAILABLE'));
  static const VerificationMeta _currentLocationMeta =
      const VerificationMeta('currentLocation');
  @override
  late final GeneratedColumn<String> currentLocation = GeneratedColumn<String>(
      'current_location', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        organizationId,
        registrationNumber,
        driverName,
        driverPhone,
        capacity,
        status,
        currentLocation,
        createdAt,
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'lorries';
  @override
  VerificationContext validateIntegrity(Insertable<Lorry> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('organization_id')) {
      context.handle(
          _organizationIdMeta,
          organizationId.isAcceptableOrUnknown(
              data['organization_id']!, _organizationIdMeta));
    } else if (isInserting) {
      context.missing(_organizationIdMeta);
    }
    if (data.containsKey('registration_number')) {
      context.handle(
          _registrationNumberMeta,
          registrationNumber.isAcceptableOrUnknown(
              data['registration_number']!, _registrationNumberMeta));
    } else if (isInserting) {
      context.missing(_registrationNumberMeta);
    }
    if (data.containsKey('driver_name')) {
      context.handle(
          _driverNameMeta,
          driverName.isAcceptableOrUnknown(
              data['driver_name']!, _driverNameMeta));
    } else if (isInserting) {
      context.missing(_driverNameMeta);
    }
    if (data.containsKey('driver_phone')) {
      context.handle(
          _driverPhoneMeta,
          driverPhone.isAcceptableOrUnknown(
              data['driver_phone']!, _driverPhoneMeta));
    } else if (isInserting) {
      context.missing(_driverPhoneMeta);
    }
    if (data.containsKey('capacity')) {
      context.handle(_capacityMeta,
          capacity.isAcceptableOrUnknown(data['capacity']!, _capacityMeta));
    } else if (isInserting) {
      context.missing(_capacityMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('current_location')) {
      context.handle(
          _currentLocationMeta,
          currentLocation.isAcceptableOrUnknown(
              data['current_location']!, _currentLocationMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Lorry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Lorry(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      organizationId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}organization_id'])!,
      registrationNumber: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}registration_number'])!,
      driverName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}driver_name'])!,
      driverPhone: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}driver_phone'])!,
      capacity: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}capacity'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      currentLocation: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}current_location']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $LorriesTable createAlias(String alias) {
    return $LorriesTable(attachedDatabase, alias);
  }
}

class Lorry extends DataClass implements Insertable<Lorry> {
  final String id;
  final String organizationId;
  final String registrationNumber;
  final String driverName;
  final String driverPhone;
  final double capacity;
  final String status;
  final String? currentLocation;
  final DateTime createdAt;
  final DateTime updatedAt;
  const Lorry(
      {required this.id,
      required this.organizationId,
      required this.registrationNumber,
      required this.driverName,
      required this.driverPhone,
      required this.capacity,
      required this.status,
      this.currentLocation,
      required this.createdAt,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['organization_id'] = Variable<String>(organizationId);
    map['registration_number'] = Variable<String>(registrationNumber);
    map['driver_name'] = Variable<String>(driverName);
    map['driver_phone'] = Variable<String>(driverPhone);
    map['capacity'] = Variable<double>(capacity);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || currentLocation != null) {
      map['current_location'] = Variable<String>(currentLocation);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  LorriesCompanion toCompanion(bool nullToAbsent) {
    return LorriesCompanion(
      id: Value(id),
      organizationId: Value(organizationId),
      registrationNumber: Value(registrationNumber),
      driverName: Value(driverName),
      driverPhone: Value(driverPhone),
      capacity: Value(capacity),
      status: Value(status),
      currentLocation: currentLocation == null && nullToAbsent
          ? const Value.absent()
          : Value(currentLocation),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory Lorry.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Lorry(
      id: serializer.fromJson<String>(json['id']),
      organizationId: serializer.fromJson<String>(json['organizationId']),
      registrationNumber:
          serializer.fromJson<String>(json['registrationNumber']),
      driverName: serializer.fromJson<String>(json['driverName']),
      driverPhone: serializer.fromJson<String>(json['driverPhone']),
      capacity: serializer.fromJson<double>(json['capacity']),
      status: serializer.fromJson<String>(json['status']),
      currentLocation: serializer.fromJson<String?>(json['currentLocation']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'organizationId': serializer.toJson<String>(organizationId),
      'registrationNumber': serializer.toJson<String>(registrationNumber),
      'driverName': serializer.toJson<String>(driverName),
      'driverPhone': serializer.toJson<String>(driverPhone),
      'capacity': serializer.toJson<double>(capacity),
      'status': serializer.toJson<String>(status),
      'currentLocation': serializer.toJson<String?>(currentLocation),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  Lorry copyWith(
          {String? id,
          String? organizationId,
          String? registrationNumber,
          String? driverName,
          String? driverPhone,
          double? capacity,
          String? status,
          Value<String?> currentLocation = const Value.absent(),
          DateTime? createdAt,
          DateTime? updatedAt}) =>
      Lorry(
        id: id ?? this.id,
        organizationId: organizationId ?? this.organizationId,
        registrationNumber: registrationNumber ?? this.registrationNumber,
        driverName: driverName ?? this.driverName,
        driverPhone: driverPhone ?? this.driverPhone,
        capacity: capacity ?? this.capacity,
        status: status ?? this.status,
        currentLocation: currentLocation.present
            ? currentLocation.value
            : this.currentLocation,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  Lorry copyWithCompanion(LorriesCompanion data) {
    return Lorry(
      id: data.id.present ? data.id.value : this.id,
      organizationId: data.organizationId.present
          ? data.organizationId.value
          : this.organizationId,
      registrationNumber: data.registrationNumber.present
          ? data.registrationNumber.value
          : this.registrationNumber,
      driverName:
          data.driverName.present ? data.driverName.value : this.driverName,
      driverPhone:
          data.driverPhone.present ? data.driverPhone.value : this.driverPhone,
      capacity: data.capacity.present ? data.capacity.value : this.capacity,
      status: data.status.present ? data.status.value : this.status,
      currentLocation: data.currentLocation.present
          ? data.currentLocation.value
          : this.currentLocation,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Lorry(')
          ..write('id: $id, ')
          ..write('organizationId: $organizationId, ')
          ..write('registrationNumber: $registrationNumber, ')
          ..write('driverName: $driverName, ')
          ..write('driverPhone: $driverPhone, ')
          ..write('capacity: $capacity, ')
          ..write('status: $status, ')
          ..write('currentLocation: $currentLocation, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
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
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Lorry &&
          other.id == this.id &&
          other.organizationId == this.organizationId &&
          other.registrationNumber == this.registrationNumber &&
          other.driverName == this.driverName &&
          other.driverPhone == this.driverPhone &&
          other.capacity == this.capacity &&
          other.status == this.status &&
          other.currentLocation == this.currentLocation &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class LorriesCompanion extends UpdateCompanion<Lorry> {
  final Value<String> id;
  final Value<String> organizationId;
  final Value<String> registrationNumber;
  final Value<String> driverName;
  final Value<String> driverPhone;
  final Value<double> capacity;
  final Value<String> status;
  final Value<String?> currentLocation;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const LorriesCompanion({
    this.id = const Value.absent(),
    this.organizationId = const Value.absent(),
    this.registrationNumber = const Value.absent(),
    this.driverName = const Value.absent(),
    this.driverPhone = const Value.absent(),
    this.capacity = const Value.absent(),
    this.status = const Value.absent(),
    this.currentLocation = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LorriesCompanion.insert({
    required String id,
    required String organizationId,
    required String registrationNumber,
    required String driverName,
    required String driverPhone,
    required double capacity,
    this.status = const Value.absent(),
    this.currentLocation = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        organizationId = Value(organizationId),
        registrationNumber = Value(registrationNumber),
        driverName = Value(driverName),
        driverPhone = Value(driverPhone),
        capacity = Value(capacity);
  static Insertable<Lorry> custom({
    Expression<String>? id,
    Expression<String>? organizationId,
    Expression<String>? registrationNumber,
    Expression<String>? driverName,
    Expression<String>? driverPhone,
    Expression<double>? capacity,
    Expression<String>? status,
    Expression<String>? currentLocation,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (organizationId != null) 'organization_id': organizationId,
      if (registrationNumber != null) 'registration_number': registrationNumber,
      if (driverName != null) 'driver_name': driverName,
      if (driverPhone != null) 'driver_phone': driverPhone,
      if (capacity != null) 'capacity': capacity,
      if (status != null) 'status': status,
      if (currentLocation != null) 'current_location': currentLocation,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LorriesCompanion copyWith(
      {Value<String>? id,
      Value<String>? organizationId,
      Value<String>? registrationNumber,
      Value<String>? driverName,
      Value<String>? driverPhone,
      Value<double>? capacity,
      Value<String>? status,
      Value<String?>? currentLocation,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? rowid}) {
    return LorriesCompanion(
      id: id ?? this.id,
      organizationId: organizationId ?? this.organizationId,
      registrationNumber: registrationNumber ?? this.registrationNumber,
      driverName: driverName ?? this.driverName,
      driverPhone: driverPhone ?? this.driverPhone,
      capacity: capacity ?? this.capacity,
      status: status ?? this.status,
      currentLocation: currentLocation ?? this.currentLocation,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (organizationId.present) {
      map['organization_id'] = Variable<String>(organizationId.value);
    }
    if (registrationNumber.present) {
      map['registration_number'] = Variable<String>(registrationNumber.value);
    }
    if (driverName.present) {
      map['driver_name'] = Variable<String>(driverName.value);
    }
    if (driverPhone.present) {
      map['driver_phone'] = Variable<String>(driverPhone.value);
    }
    if (capacity.present) {
      map['capacity'] = Variable<double>(capacity.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (currentLocation.present) {
      map['current_location'] = Variable<String>(currentLocation.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LorriesCompanion(')
          ..write('id: $id, ')
          ..write('organizationId: $organizationId, ')
          ..write('registrationNumber: $registrationNumber, ')
          ..write('driverName: $driverName, ')
          ..write('driverPhone: $driverPhone, ')
          ..write('capacity: $capacity, ')
          ..write('status: $status, ')
          ..write('currentLocation: $currentLocation, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $FarmersTable extends Farmers with TableInfo<$FarmersTable, Farmer> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $FarmersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _organizationIdMeta =
      const VerificationMeta('organizationId');
  @override
  late final GeneratedColumn<String> organizationId = GeneratedColumn<String>(
      'organization_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _phoneMeta = const VerificationMeta('phone');
  @override
  late final GeneratedColumn<String> phone = GeneratedColumn<String>(
      'phone', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _villageMeta =
      const VerificationMeta('village');
  @override
  late final GeneratedColumn<String> village = GeneratedColumn<String>(
      'village', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _districtMeta =
      const VerificationMeta('district');
  @override
  late final GeneratedColumn<String> district = GeneratedColumn<String>(
      'district', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _addressMeta =
      const VerificationMeta('address');
  @override
  late final GeneratedColumn<String> address = GeneratedColumn<String>(
      'address', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _idNumberMeta =
      const VerificationMeta('idNumber');
  @override
  late final GeneratedColumn<String> idNumber = GeneratedColumn<String>(
      'id_number', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _totalWeightKgMeta =
      const VerificationMeta('totalWeightKg');
  @override
  late final GeneratedColumn<double> totalWeightKg = GeneratedColumn<double>(
      'total_weight_kg', aliasedName, false,
      type: DriftSqlType.double,
      requiredDuringInsert: false,
      defaultValue: const Constant(0.0));
  static const VerificationMeta _totalDeliveriesMeta =
      const VerificationMeta('totalDeliveries');
  @override
  late final GeneratedColumn<int> totalDeliveries = GeneratedColumn<int>(
      'total_deliveries', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _lastDeliveryMeta =
      const VerificationMeta('lastDelivery');
  @override
  late final GeneratedColumn<DateTime> lastDelivery = GeneratedColumn<DateTime>(
      'last_delivery', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
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
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'farmers';
  @override
  VerificationContext validateIntegrity(Insertable<Farmer> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('organization_id')) {
      context.handle(
          _organizationIdMeta,
          organizationId.isAcceptableOrUnknown(
              data['organization_id']!, _organizationIdMeta));
    } else if (isInserting) {
      context.missing(_organizationIdMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('phone')) {
      context.handle(
          _phoneMeta, phone.isAcceptableOrUnknown(data['phone']!, _phoneMeta));
    } else if (isInserting) {
      context.missing(_phoneMeta);
    }
    if (data.containsKey('village')) {
      context.handle(_villageMeta,
          village.isAcceptableOrUnknown(data['village']!, _villageMeta));
    }
    if (data.containsKey('district')) {
      context.handle(_districtMeta,
          district.isAcceptableOrUnknown(data['district']!, _districtMeta));
    }
    if (data.containsKey('address')) {
      context.handle(_addressMeta,
          address.isAcceptableOrUnknown(data['address']!, _addressMeta));
    }
    if (data.containsKey('id_number')) {
      context.handle(_idNumberMeta,
          idNumber.isAcceptableOrUnknown(data['id_number']!, _idNumberMeta));
    }
    if (data.containsKey('total_weight_kg')) {
      context.handle(
          _totalWeightKgMeta,
          totalWeightKg.isAcceptableOrUnknown(
              data['total_weight_kg']!, _totalWeightKgMeta));
    }
    if (data.containsKey('total_deliveries')) {
      context.handle(
          _totalDeliveriesMeta,
          totalDeliveries.isAcceptableOrUnknown(
              data['total_deliveries']!, _totalDeliveriesMeta));
    }
    if (data.containsKey('last_delivery')) {
      context.handle(
          _lastDeliveryMeta,
          lastDelivery.isAcceptableOrUnknown(
              data['last_delivery']!, _lastDeliveryMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Farmer map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Farmer(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      organizationId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}organization_id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      phone: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}phone'])!,
      village: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}village']),
      district: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}district']),
      address: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}address']),
      idNumber: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id_number']),
      totalWeightKg: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}total_weight_kg'])!,
      totalDeliveries: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}total_deliveries'])!,
      lastDelivery: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}last_delivery']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $FarmersTable createAlias(String alias) {
    return $FarmersTable(attachedDatabase, alias);
  }
}

class Farmer extends DataClass implements Insertable<Farmer> {
  final String id;
  final String organizationId;
  final String name;
  final String phone;
  final String? village;
  final String? district;
  final String? address;
  final String? idNumber;
  final double totalWeightKg;
  final int totalDeliveries;
  final DateTime? lastDelivery;
  final DateTime createdAt;
  final DateTime updatedAt;
  const Farmer(
      {required this.id,
      required this.organizationId,
      required this.name,
      required this.phone,
      this.village,
      this.district,
      this.address,
      this.idNumber,
      required this.totalWeightKg,
      required this.totalDeliveries,
      this.lastDelivery,
      required this.createdAt,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['organization_id'] = Variable<String>(organizationId);
    map['name'] = Variable<String>(name);
    map['phone'] = Variable<String>(phone);
    if (!nullToAbsent || village != null) {
      map['village'] = Variable<String>(village);
    }
    if (!nullToAbsent || district != null) {
      map['district'] = Variable<String>(district);
    }
    if (!nullToAbsent || address != null) {
      map['address'] = Variable<String>(address);
    }
    if (!nullToAbsent || idNumber != null) {
      map['id_number'] = Variable<String>(idNumber);
    }
    map['total_weight_kg'] = Variable<double>(totalWeightKg);
    map['total_deliveries'] = Variable<int>(totalDeliveries);
    if (!nullToAbsent || lastDelivery != null) {
      map['last_delivery'] = Variable<DateTime>(lastDelivery);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  FarmersCompanion toCompanion(bool nullToAbsent) {
    return FarmersCompanion(
      id: Value(id),
      organizationId: Value(organizationId),
      name: Value(name),
      phone: Value(phone),
      village: village == null && nullToAbsent
          ? const Value.absent()
          : Value(village),
      district: district == null && nullToAbsent
          ? const Value.absent()
          : Value(district),
      address: address == null && nullToAbsent
          ? const Value.absent()
          : Value(address),
      idNumber: idNumber == null && nullToAbsent
          ? const Value.absent()
          : Value(idNumber),
      totalWeightKg: Value(totalWeightKg),
      totalDeliveries: Value(totalDeliveries),
      lastDelivery: lastDelivery == null && nullToAbsent
          ? const Value.absent()
          : Value(lastDelivery),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory Farmer.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Farmer(
      id: serializer.fromJson<String>(json['id']),
      organizationId: serializer.fromJson<String>(json['organizationId']),
      name: serializer.fromJson<String>(json['name']),
      phone: serializer.fromJson<String>(json['phone']),
      village: serializer.fromJson<String?>(json['village']),
      district: serializer.fromJson<String?>(json['district']),
      address: serializer.fromJson<String?>(json['address']),
      idNumber: serializer.fromJson<String?>(json['idNumber']),
      totalWeightKg: serializer.fromJson<double>(json['totalWeightKg']),
      totalDeliveries: serializer.fromJson<int>(json['totalDeliveries']),
      lastDelivery: serializer.fromJson<DateTime?>(json['lastDelivery']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'organizationId': serializer.toJson<String>(organizationId),
      'name': serializer.toJson<String>(name),
      'phone': serializer.toJson<String>(phone),
      'village': serializer.toJson<String?>(village),
      'district': serializer.toJson<String?>(district),
      'address': serializer.toJson<String?>(address),
      'idNumber': serializer.toJson<String?>(idNumber),
      'totalWeightKg': serializer.toJson<double>(totalWeightKg),
      'totalDeliveries': serializer.toJson<int>(totalDeliveries),
      'lastDelivery': serializer.toJson<DateTime?>(lastDelivery),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  Farmer copyWith(
          {String? id,
          String? organizationId,
          String? name,
          String? phone,
          Value<String?> village = const Value.absent(),
          Value<String?> district = const Value.absent(),
          Value<String?> address = const Value.absent(),
          Value<String?> idNumber = const Value.absent(),
          double? totalWeightKg,
          int? totalDeliveries,
          Value<DateTime?> lastDelivery = const Value.absent(),
          DateTime? createdAt,
          DateTime? updatedAt}) =>
      Farmer(
        id: id ?? this.id,
        organizationId: organizationId ?? this.organizationId,
        name: name ?? this.name,
        phone: phone ?? this.phone,
        village: village.present ? village.value : this.village,
        district: district.present ? district.value : this.district,
        address: address.present ? address.value : this.address,
        idNumber: idNumber.present ? idNumber.value : this.idNumber,
        totalWeightKg: totalWeightKg ?? this.totalWeightKg,
        totalDeliveries: totalDeliveries ?? this.totalDeliveries,
        lastDelivery:
            lastDelivery.present ? lastDelivery.value : this.lastDelivery,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  Farmer copyWithCompanion(FarmersCompanion data) {
    return Farmer(
      id: data.id.present ? data.id.value : this.id,
      organizationId: data.organizationId.present
          ? data.organizationId.value
          : this.organizationId,
      name: data.name.present ? data.name.value : this.name,
      phone: data.phone.present ? data.phone.value : this.phone,
      village: data.village.present ? data.village.value : this.village,
      district: data.district.present ? data.district.value : this.district,
      address: data.address.present ? data.address.value : this.address,
      idNumber: data.idNumber.present ? data.idNumber.value : this.idNumber,
      totalWeightKg: data.totalWeightKg.present
          ? data.totalWeightKg.value
          : this.totalWeightKg,
      totalDeliveries: data.totalDeliveries.present
          ? data.totalDeliveries.value
          : this.totalDeliveries,
      lastDelivery: data.lastDelivery.present
          ? data.lastDelivery.value
          : this.lastDelivery,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Farmer(')
          ..write('id: $id, ')
          ..write('organizationId: $organizationId, ')
          ..write('name: $name, ')
          ..write('phone: $phone, ')
          ..write('village: $village, ')
          ..write('district: $district, ')
          ..write('address: $address, ')
          ..write('idNumber: $idNumber, ')
          ..write('totalWeightKg: $totalWeightKg, ')
          ..write('totalDeliveries: $totalDeliveries, ')
          ..write('lastDelivery: $lastDelivery, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
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
      updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Farmer &&
          other.id == this.id &&
          other.organizationId == this.organizationId &&
          other.name == this.name &&
          other.phone == this.phone &&
          other.village == this.village &&
          other.district == this.district &&
          other.address == this.address &&
          other.idNumber == this.idNumber &&
          other.totalWeightKg == this.totalWeightKg &&
          other.totalDeliveries == this.totalDeliveries &&
          other.lastDelivery == this.lastDelivery &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class FarmersCompanion extends UpdateCompanion<Farmer> {
  final Value<String> id;
  final Value<String> organizationId;
  final Value<String> name;
  final Value<String> phone;
  final Value<String?> village;
  final Value<String?> district;
  final Value<String?> address;
  final Value<String?> idNumber;
  final Value<double> totalWeightKg;
  final Value<int> totalDeliveries;
  final Value<DateTime?> lastDelivery;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const FarmersCompanion({
    this.id = const Value.absent(),
    this.organizationId = const Value.absent(),
    this.name = const Value.absent(),
    this.phone = const Value.absent(),
    this.village = const Value.absent(),
    this.district = const Value.absent(),
    this.address = const Value.absent(),
    this.idNumber = const Value.absent(),
    this.totalWeightKg = const Value.absent(),
    this.totalDeliveries = const Value.absent(),
    this.lastDelivery = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  FarmersCompanion.insert({
    required String id,
    required String organizationId,
    required String name,
    required String phone,
    this.village = const Value.absent(),
    this.district = const Value.absent(),
    this.address = const Value.absent(),
    this.idNumber = const Value.absent(),
    this.totalWeightKg = const Value.absent(),
    this.totalDeliveries = const Value.absent(),
    this.lastDelivery = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        organizationId = Value(organizationId),
        name = Value(name),
        phone = Value(phone);
  static Insertable<Farmer> custom({
    Expression<String>? id,
    Expression<String>? organizationId,
    Expression<String>? name,
    Expression<String>? phone,
    Expression<String>? village,
    Expression<String>? district,
    Expression<String>? address,
    Expression<String>? idNumber,
    Expression<double>? totalWeightKg,
    Expression<int>? totalDeliveries,
    Expression<DateTime>? lastDelivery,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (organizationId != null) 'organization_id': organizationId,
      if (name != null) 'name': name,
      if (phone != null) 'phone': phone,
      if (village != null) 'village': village,
      if (district != null) 'district': district,
      if (address != null) 'address': address,
      if (idNumber != null) 'id_number': idNumber,
      if (totalWeightKg != null) 'total_weight_kg': totalWeightKg,
      if (totalDeliveries != null) 'total_deliveries': totalDeliveries,
      if (lastDelivery != null) 'last_delivery': lastDelivery,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  FarmersCompanion copyWith(
      {Value<String>? id,
      Value<String>? organizationId,
      Value<String>? name,
      Value<String>? phone,
      Value<String?>? village,
      Value<String?>? district,
      Value<String?>? address,
      Value<String?>? idNumber,
      Value<double>? totalWeightKg,
      Value<int>? totalDeliveries,
      Value<DateTime?>? lastDelivery,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? rowid}) {
    return FarmersCompanion(
      id: id ?? this.id,
      organizationId: organizationId ?? this.organizationId,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      village: village ?? this.village,
      district: district ?? this.district,
      address: address ?? this.address,
      idNumber: idNumber ?? this.idNumber,
      totalWeightKg: totalWeightKg ?? this.totalWeightKg,
      totalDeliveries: totalDeliveries ?? this.totalDeliveries,
      lastDelivery: lastDelivery ?? this.lastDelivery,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (organizationId.present) {
      map['organization_id'] = Variable<String>(organizationId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (phone.present) {
      map['phone'] = Variable<String>(phone.value);
    }
    if (village.present) {
      map['village'] = Variable<String>(village.value);
    }
    if (district.present) {
      map['district'] = Variable<String>(district.value);
    }
    if (address.present) {
      map['address'] = Variable<String>(address.value);
    }
    if (idNumber.present) {
      map['id_number'] = Variable<String>(idNumber.value);
    }
    if (totalWeightKg.present) {
      map['total_weight_kg'] = Variable<double>(totalWeightKg.value);
    }
    if (totalDeliveries.present) {
      map['total_deliveries'] = Variable<int>(totalDeliveries.value);
    }
    if (lastDelivery.present) {
      map['last_delivery'] = Variable<DateTime>(lastDelivery.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('FarmersCompanion(')
          ..write('id: $id, ')
          ..write('organizationId: $organizationId, ')
          ..write('name: $name, ')
          ..write('phone: $phone, ')
          ..write('village: $village, ')
          ..write('district: $district, ')
          ..write('address: $address, ')
          ..write('idNumber: $idNumber, ')
          ..write('totalWeightKg: $totalWeightKg, ')
          ..write('totalDeliveries: $totalDeliveries, ')
          ..write('lastDelivery: $lastDelivery, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LorryRequestsTable extends LorryRequests
    with TableInfo<$LorryRequestsTable, LorryRequest> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LorryRequestsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _organizationIdMeta =
      const VerificationMeta('organizationId');
  @override
  late final GeneratedColumn<String> organizationId = GeneratedColumn<String>(
      'organization_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _fieldManagerIdMeta =
      const VerificationMeta('fieldManagerId');
  @override
  late final GeneratedColumn<String> fieldManagerId = GeneratedColumn<String>(
      'field_manager_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _purposeMeta =
      const VerificationMeta('purpose');
  @override
  late final GeneratedColumn<String> purpose = GeneratedColumn<String>(
      'purpose', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _estimatedFarmersMeta =
      const VerificationMeta('estimatedFarmers');
  @override
  late final GeneratedColumn<int> estimatedFarmers = GeneratedColumn<int>(
      'estimated_farmers', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _estimatedWeightMeta =
      const VerificationMeta('estimatedWeight');
  @override
  late final GeneratedColumn<double> estimatedWeight = GeneratedColumn<double>(
      'estimated_weight', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _urgencyMeta =
      const VerificationMeta('urgency');
  @override
  late final GeneratedColumn<String> urgency = GeneratedColumn<String>(
      'urgency', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('NORMAL'));
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('PENDING'));
  static const VerificationMeta _assignedLorryIdMeta =
      const VerificationMeta('assignedLorryId');
  @override
  late final GeneratedColumn<String> assignedLorryId = GeneratedColumn<String>(
      'assigned_lorry_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _notesMeta = const VerificationMeta('notes');
  @override
  late final GeneratedColumn<String> notes = GeneratedColumn<String>(
      'notes', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _requestedDateMeta =
      const VerificationMeta('requestedDate');
  @override
  late final GeneratedColumn<DateTime> requestedDate =
      GeneratedColumn<DateTime>('requested_date', aliasedName, false,
          type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
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
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'lorry_requests';
  @override
  VerificationContext validateIntegrity(Insertable<LorryRequest> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('organization_id')) {
      context.handle(
          _organizationIdMeta,
          organizationId.isAcceptableOrUnknown(
              data['organization_id']!, _organizationIdMeta));
    } else if (isInserting) {
      context.missing(_organizationIdMeta);
    }
    if (data.containsKey('field_manager_id')) {
      context.handle(
          _fieldManagerIdMeta,
          fieldManagerId.isAcceptableOrUnknown(
              data['field_manager_id']!, _fieldManagerIdMeta));
    } else if (isInserting) {
      context.missing(_fieldManagerIdMeta);
    }
    if (data.containsKey('purpose')) {
      context.handle(_purposeMeta,
          purpose.isAcceptableOrUnknown(data['purpose']!, _purposeMeta));
    } else if (isInserting) {
      context.missing(_purposeMeta);
    }
    if (data.containsKey('estimated_farmers')) {
      context.handle(
          _estimatedFarmersMeta,
          estimatedFarmers.isAcceptableOrUnknown(
              data['estimated_farmers']!, _estimatedFarmersMeta));
    } else if (isInserting) {
      context.missing(_estimatedFarmersMeta);
    }
    if (data.containsKey('estimated_weight')) {
      context.handle(
          _estimatedWeightMeta,
          estimatedWeight.isAcceptableOrUnknown(
              data['estimated_weight']!, _estimatedWeightMeta));
    } else if (isInserting) {
      context.missing(_estimatedWeightMeta);
    }
    if (data.containsKey('urgency')) {
      context.handle(_urgencyMeta,
          urgency.isAcceptableOrUnknown(data['urgency']!, _urgencyMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('assigned_lorry_id')) {
      context.handle(
          _assignedLorryIdMeta,
          assignedLorryId.isAcceptableOrUnknown(
              data['assigned_lorry_id']!, _assignedLorryIdMeta));
    }
    if (data.containsKey('notes')) {
      context.handle(
          _notesMeta, notes.isAcceptableOrUnknown(data['notes']!, _notesMeta));
    }
    if (data.containsKey('requested_date')) {
      context.handle(
          _requestedDateMeta,
          requestedDate.isAcceptableOrUnknown(
              data['requested_date']!, _requestedDateMeta));
    } else if (isInserting) {
      context.missing(_requestedDateMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LorryRequest map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LorryRequest(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      organizationId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}organization_id'])!,
      fieldManagerId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}field_manager_id'])!,
      purpose: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}purpose'])!,
      estimatedFarmers: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}estimated_farmers'])!,
      estimatedWeight: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}estimated_weight'])!,
      urgency: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}urgency'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      assignedLorryId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}assigned_lorry_id']),
      notes: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}notes']),
      requestedDate: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}requested_date'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $LorryRequestsTable createAlias(String alias) {
    return $LorryRequestsTable(attachedDatabase, alias);
  }
}

class LorryRequest extends DataClass implements Insertable<LorryRequest> {
  final String id;
  final String organizationId;
  final String fieldManagerId;
  final String purpose;
  final int estimatedFarmers;
  final double estimatedWeight;
  final String urgency;
  final String status;
  final String? assignedLorryId;
  final String? notes;
  final DateTime requestedDate;
  final DateTime createdAt;
  final DateTime updatedAt;
  const LorryRequest(
      {required this.id,
      required this.organizationId,
      required this.fieldManagerId,
      required this.purpose,
      required this.estimatedFarmers,
      required this.estimatedWeight,
      required this.urgency,
      required this.status,
      this.assignedLorryId,
      this.notes,
      required this.requestedDate,
      required this.createdAt,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['organization_id'] = Variable<String>(organizationId);
    map['field_manager_id'] = Variable<String>(fieldManagerId);
    map['purpose'] = Variable<String>(purpose);
    map['estimated_farmers'] = Variable<int>(estimatedFarmers);
    map['estimated_weight'] = Variable<double>(estimatedWeight);
    map['urgency'] = Variable<String>(urgency);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || assignedLorryId != null) {
      map['assigned_lorry_id'] = Variable<String>(assignedLorryId);
    }
    if (!nullToAbsent || notes != null) {
      map['notes'] = Variable<String>(notes);
    }
    map['requested_date'] = Variable<DateTime>(requestedDate);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  LorryRequestsCompanion toCompanion(bool nullToAbsent) {
    return LorryRequestsCompanion(
      id: Value(id),
      organizationId: Value(organizationId),
      fieldManagerId: Value(fieldManagerId),
      purpose: Value(purpose),
      estimatedFarmers: Value(estimatedFarmers),
      estimatedWeight: Value(estimatedWeight),
      urgency: Value(urgency),
      status: Value(status),
      assignedLorryId: assignedLorryId == null && nullToAbsent
          ? const Value.absent()
          : Value(assignedLorryId),
      notes:
          notes == null && nullToAbsent ? const Value.absent() : Value(notes),
      requestedDate: Value(requestedDate),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory LorryRequest.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LorryRequest(
      id: serializer.fromJson<String>(json['id']),
      organizationId: serializer.fromJson<String>(json['organizationId']),
      fieldManagerId: serializer.fromJson<String>(json['fieldManagerId']),
      purpose: serializer.fromJson<String>(json['purpose']),
      estimatedFarmers: serializer.fromJson<int>(json['estimatedFarmers']),
      estimatedWeight: serializer.fromJson<double>(json['estimatedWeight']),
      urgency: serializer.fromJson<String>(json['urgency']),
      status: serializer.fromJson<String>(json['status']),
      assignedLorryId: serializer.fromJson<String?>(json['assignedLorryId']),
      notes: serializer.fromJson<String?>(json['notes']),
      requestedDate: serializer.fromJson<DateTime>(json['requestedDate']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'organizationId': serializer.toJson<String>(organizationId),
      'fieldManagerId': serializer.toJson<String>(fieldManagerId),
      'purpose': serializer.toJson<String>(purpose),
      'estimatedFarmers': serializer.toJson<int>(estimatedFarmers),
      'estimatedWeight': serializer.toJson<double>(estimatedWeight),
      'urgency': serializer.toJson<String>(urgency),
      'status': serializer.toJson<String>(status),
      'assignedLorryId': serializer.toJson<String?>(assignedLorryId),
      'notes': serializer.toJson<String?>(notes),
      'requestedDate': serializer.toJson<DateTime>(requestedDate),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  LorryRequest copyWith(
          {String? id,
          String? organizationId,
          String? fieldManagerId,
          String? purpose,
          int? estimatedFarmers,
          double? estimatedWeight,
          String? urgency,
          String? status,
          Value<String?> assignedLorryId = const Value.absent(),
          Value<String?> notes = const Value.absent(),
          DateTime? requestedDate,
          DateTime? createdAt,
          DateTime? updatedAt}) =>
      LorryRequest(
        id: id ?? this.id,
        organizationId: organizationId ?? this.organizationId,
        fieldManagerId: fieldManagerId ?? this.fieldManagerId,
        purpose: purpose ?? this.purpose,
        estimatedFarmers: estimatedFarmers ?? this.estimatedFarmers,
        estimatedWeight: estimatedWeight ?? this.estimatedWeight,
        urgency: urgency ?? this.urgency,
        status: status ?? this.status,
        assignedLorryId: assignedLorryId.present
            ? assignedLorryId.value
            : this.assignedLorryId,
        notes: notes.present ? notes.value : this.notes,
        requestedDate: requestedDate ?? this.requestedDate,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  LorryRequest copyWithCompanion(LorryRequestsCompanion data) {
    return LorryRequest(
      id: data.id.present ? data.id.value : this.id,
      organizationId: data.organizationId.present
          ? data.organizationId.value
          : this.organizationId,
      fieldManagerId: data.fieldManagerId.present
          ? data.fieldManagerId.value
          : this.fieldManagerId,
      purpose: data.purpose.present ? data.purpose.value : this.purpose,
      estimatedFarmers: data.estimatedFarmers.present
          ? data.estimatedFarmers.value
          : this.estimatedFarmers,
      estimatedWeight: data.estimatedWeight.present
          ? data.estimatedWeight.value
          : this.estimatedWeight,
      urgency: data.urgency.present ? data.urgency.value : this.urgency,
      status: data.status.present ? data.status.value : this.status,
      assignedLorryId: data.assignedLorryId.present
          ? data.assignedLorryId.value
          : this.assignedLorryId,
      notes: data.notes.present ? data.notes.value : this.notes,
      requestedDate: data.requestedDate.present
          ? data.requestedDate.value
          : this.requestedDate,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LorryRequest(')
          ..write('id: $id, ')
          ..write('organizationId: $organizationId, ')
          ..write('fieldManagerId: $fieldManagerId, ')
          ..write('purpose: $purpose, ')
          ..write('estimatedFarmers: $estimatedFarmers, ')
          ..write('estimatedWeight: $estimatedWeight, ')
          ..write('urgency: $urgency, ')
          ..write('status: $status, ')
          ..write('assignedLorryId: $assignedLorryId, ')
          ..write('notes: $notes, ')
          ..write('requestedDate: $requestedDate, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
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
      updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LorryRequest &&
          other.id == this.id &&
          other.organizationId == this.organizationId &&
          other.fieldManagerId == this.fieldManagerId &&
          other.purpose == this.purpose &&
          other.estimatedFarmers == this.estimatedFarmers &&
          other.estimatedWeight == this.estimatedWeight &&
          other.urgency == this.urgency &&
          other.status == this.status &&
          other.assignedLorryId == this.assignedLorryId &&
          other.notes == this.notes &&
          other.requestedDate == this.requestedDate &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class LorryRequestsCompanion extends UpdateCompanion<LorryRequest> {
  final Value<String> id;
  final Value<String> organizationId;
  final Value<String> fieldManagerId;
  final Value<String> purpose;
  final Value<int> estimatedFarmers;
  final Value<double> estimatedWeight;
  final Value<String> urgency;
  final Value<String> status;
  final Value<String?> assignedLorryId;
  final Value<String?> notes;
  final Value<DateTime> requestedDate;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const LorryRequestsCompanion({
    this.id = const Value.absent(),
    this.organizationId = const Value.absent(),
    this.fieldManagerId = const Value.absent(),
    this.purpose = const Value.absent(),
    this.estimatedFarmers = const Value.absent(),
    this.estimatedWeight = const Value.absent(),
    this.urgency = const Value.absent(),
    this.status = const Value.absent(),
    this.assignedLorryId = const Value.absent(),
    this.notes = const Value.absent(),
    this.requestedDate = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LorryRequestsCompanion.insert({
    required String id,
    required String organizationId,
    required String fieldManagerId,
    required String purpose,
    required int estimatedFarmers,
    required double estimatedWeight,
    this.urgency = const Value.absent(),
    this.status = const Value.absent(),
    this.assignedLorryId = const Value.absent(),
    this.notes = const Value.absent(),
    required DateTime requestedDate,
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        organizationId = Value(organizationId),
        fieldManagerId = Value(fieldManagerId),
        purpose = Value(purpose),
        estimatedFarmers = Value(estimatedFarmers),
        estimatedWeight = Value(estimatedWeight),
        requestedDate = Value(requestedDate);
  static Insertable<LorryRequest> custom({
    Expression<String>? id,
    Expression<String>? organizationId,
    Expression<String>? fieldManagerId,
    Expression<String>? purpose,
    Expression<int>? estimatedFarmers,
    Expression<double>? estimatedWeight,
    Expression<String>? urgency,
    Expression<String>? status,
    Expression<String>? assignedLorryId,
    Expression<String>? notes,
    Expression<DateTime>? requestedDate,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (organizationId != null) 'organization_id': organizationId,
      if (fieldManagerId != null) 'field_manager_id': fieldManagerId,
      if (purpose != null) 'purpose': purpose,
      if (estimatedFarmers != null) 'estimated_farmers': estimatedFarmers,
      if (estimatedWeight != null) 'estimated_weight': estimatedWeight,
      if (urgency != null) 'urgency': urgency,
      if (status != null) 'status': status,
      if (assignedLorryId != null) 'assigned_lorry_id': assignedLorryId,
      if (notes != null) 'notes': notes,
      if (requestedDate != null) 'requested_date': requestedDate,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LorryRequestsCompanion copyWith(
      {Value<String>? id,
      Value<String>? organizationId,
      Value<String>? fieldManagerId,
      Value<String>? purpose,
      Value<int>? estimatedFarmers,
      Value<double>? estimatedWeight,
      Value<String>? urgency,
      Value<String>? status,
      Value<String?>? assignedLorryId,
      Value<String?>? notes,
      Value<DateTime>? requestedDate,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? rowid}) {
    return LorryRequestsCompanion(
      id: id ?? this.id,
      organizationId: organizationId ?? this.organizationId,
      fieldManagerId: fieldManagerId ?? this.fieldManagerId,
      purpose: purpose ?? this.purpose,
      estimatedFarmers: estimatedFarmers ?? this.estimatedFarmers,
      estimatedWeight: estimatedWeight ?? this.estimatedWeight,
      urgency: urgency ?? this.urgency,
      status: status ?? this.status,
      assignedLorryId: assignedLorryId ?? this.assignedLorryId,
      notes: notes ?? this.notes,
      requestedDate: requestedDate ?? this.requestedDate,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (organizationId.present) {
      map['organization_id'] = Variable<String>(organizationId.value);
    }
    if (fieldManagerId.present) {
      map['field_manager_id'] = Variable<String>(fieldManagerId.value);
    }
    if (purpose.present) {
      map['purpose'] = Variable<String>(purpose.value);
    }
    if (estimatedFarmers.present) {
      map['estimated_farmers'] = Variable<int>(estimatedFarmers.value);
    }
    if (estimatedWeight.present) {
      map['estimated_weight'] = Variable<double>(estimatedWeight.value);
    }
    if (urgency.present) {
      map['urgency'] = Variable<String>(urgency.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (assignedLorryId.present) {
      map['assigned_lorry_id'] = Variable<String>(assignedLorryId.value);
    }
    if (notes.present) {
      map['notes'] = Variable<String>(notes.value);
    }
    if (requestedDate.present) {
      map['requested_date'] = Variable<DateTime>(requestedDate.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LorryRequestsCompanion(')
          ..write('id: $id, ')
          ..write('organizationId: $organizationId, ')
          ..write('fieldManagerId: $fieldManagerId, ')
          ..write('purpose: $purpose, ')
          ..write('estimatedFarmers: $estimatedFarmers, ')
          ..write('estimatedWeight: $estimatedWeight, ')
          ..write('urgency: $urgency, ')
          ..write('status: $status, ')
          ..write('assignedLorryId: $assignedLorryId, ')
          ..write('notes: $notes, ')
          ..write('requestedDate: $requestedDate, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LorryTripsTable extends LorryTrips
    with TableInfo<$LorryTripsTable, LorryTrip> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LorryTripsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _organizationIdMeta =
      const VerificationMeta('organizationId');
  @override
  late final GeneratedColumn<String> organizationId = GeneratedColumn<String>(
      'organization_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _lorryIdMeta =
      const VerificationMeta('lorryId');
  @override
  late final GeneratedColumn<String> lorryId = GeneratedColumn<String>(
      'lorry_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _fieldManagerIdMeta =
      const VerificationMeta('fieldManagerId');
  @override
  late final GeneratedColumn<String> fieldManagerId = GeneratedColumn<String>(
      'field_manager_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _requestIdMeta =
      const VerificationMeta('requestId');
  @override
  late final GeneratedColumn<String> requestId = GeneratedColumn<String>(
      'request_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _startDateMeta =
      const VerificationMeta('startDate');
  @override
  late final GeneratedColumn<DateTime> startDate = GeneratedColumn<DateTime>(
      'start_date', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _endDateMeta =
      const VerificationMeta('endDate');
  @override
  late final GeneratedColumn<DateTime> endDate = GeneratedColumn<DateTime>(
      'end_date', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('IN_PROGRESS'));
  static const VerificationMeta _farmerCountMeta =
      const VerificationMeta('farmerCount');
  @override
  late final GeneratedColumn<int> farmerCount = GeneratedColumn<int>(
      'farmer_count', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _totalBagsMeta =
      const VerificationMeta('totalBags');
  @override
  late final GeneratedColumn<int> totalBags = GeneratedColumn<int>(
      'total_bags', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _grossKgMeta =
      const VerificationMeta('grossKg');
  @override
  late final GeneratedColumn<double> grossKg = GeneratedColumn<double>(
      'gross_kg', aliasedName, false,
      type: DriftSqlType.double,
      requiredDuringInsert: false,
      defaultValue: const Constant(0.0));
  static const VerificationMeta _netKgMeta = const VerificationMeta('netKg');
  @override
  late final GeneratedColumn<double> netKg = GeneratedColumn<double>(
      'net_kg', aliasedName, false,
      type: DriftSqlType.double,
      requiredDuringInsert: false,
      defaultValue: const Constant(0.0));
  static const VerificationMeta _notesMeta = const VerificationMeta('notes');
  @override
  late final GeneratedColumn<String> notes = GeneratedColumn<String>(
      'notes', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
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
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'lorry_trips';
  @override
  VerificationContext validateIntegrity(Insertable<LorryTrip> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('organization_id')) {
      context.handle(
          _organizationIdMeta,
          organizationId.isAcceptableOrUnknown(
              data['organization_id']!, _organizationIdMeta));
    } else if (isInserting) {
      context.missing(_organizationIdMeta);
    }
    if (data.containsKey('lorry_id')) {
      context.handle(_lorryIdMeta,
          lorryId.isAcceptableOrUnknown(data['lorry_id']!, _lorryIdMeta));
    } else if (isInserting) {
      context.missing(_lorryIdMeta);
    }
    if (data.containsKey('field_manager_id')) {
      context.handle(
          _fieldManagerIdMeta,
          fieldManagerId.isAcceptableOrUnknown(
              data['field_manager_id']!, _fieldManagerIdMeta));
    } else if (isInserting) {
      context.missing(_fieldManagerIdMeta);
    }
    if (data.containsKey('request_id')) {
      context.handle(_requestIdMeta,
          requestId.isAcceptableOrUnknown(data['request_id']!, _requestIdMeta));
    }
    if (data.containsKey('start_date')) {
      context.handle(_startDateMeta,
          startDate.isAcceptableOrUnknown(data['start_date']!, _startDateMeta));
    } else if (isInserting) {
      context.missing(_startDateMeta);
    }
    if (data.containsKey('end_date')) {
      context.handle(_endDateMeta,
          endDate.isAcceptableOrUnknown(data['end_date']!, _endDateMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('farmer_count')) {
      context.handle(
          _farmerCountMeta,
          farmerCount.isAcceptableOrUnknown(
              data['farmer_count']!, _farmerCountMeta));
    }
    if (data.containsKey('total_bags')) {
      context.handle(_totalBagsMeta,
          totalBags.isAcceptableOrUnknown(data['total_bags']!, _totalBagsMeta));
    }
    if (data.containsKey('gross_kg')) {
      context.handle(_grossKgMeta,
          grossKg.isAcceptableOrUnknown(data['gross_kg']!, _grossKgMeta));
    }
    if (data.containsKey('net_kg')) {
      context.handle(
          _netKgMeta, netKg.isAcceptableOrUnknown(data['net_kg']!, _netKgMeta));
    }
    if (data.containsKey('notes')) {
      context.handle(
          _notesMeta, notes.isAcceptableOrUnknown(data['notes']!, _notesMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LorryTrip map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LorryTrip(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      organizationId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}organization_id'])!,
      lorryId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}lorry_id'])!,
      fieldManagerId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}field_manager_id'])!,
      requestId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}request_id']),
      startDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}start_date'])!,
      endDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}end_date']),
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      farmerCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}farmer_count'])!,
      totalBags: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}total_bags'])!,
      grossKg: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}gross_kg'])!,
      netKg: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}net_kg'])!,
      notes: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}notes']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $LorryTripsTable createAlias(String alias) {
    return $LorryTripsTable(attachedDatabase, alias);
  }
}

class LorryTrip extends DataClass implements Insertable<LorryTrip> {
  final String id;
  final String organizationId;
  final String lorryId;
  final String fieldManagerId;
  final String? requestId;
  final DateTime startDate;
  final DateTime? endDate;
  final String status;
  final int farmerCount;
  final int totalBags;
  final double grossKg;
  final double netKg;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;
  const LorryTrip(
      {required this.id,
      required this.organizationId,
      required this.lorryId,
      required this.fieldManagerId,
      this.requestId,
      required this.startDate,
      this.endDate,
      required this.status,
      required this.farmerCount,
      required this.totalBags,
      required this.grossKg,
      required this.netKg,
      this.notes,
      required this.createdAt,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['organization_id'] = Variable<String>(organizationId);
    map['lorry_id'] = Variable<String>(lorryId);
    map['field_manager_id'] = Variable<String>(fieldManagerId);
    if (!nullToAbsent || requestId != null) {
      map['request_id'] = Variable<String>(requestId);
    }
    map['start_date'] = Variable<DateTime>(startDate);
    if (!nullToAbsent || endDate != null) {
      map['end_date'] = Variable<DateTime>(endDate);
    }
    map['status'] = Variable<String>(status);
    map['farmer_count'] = Variable<int>(farmerCount);
    map['total_bags'] = Variable<int>(totalBags);
    map['gross_kg'] = Variable<double>(grossKg);
    map['net_kg'] = Variable<double>(netKg);
    if (!nullToAbsent || notes != null) {
      map['notes'] = Variable<String>(notes);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  LorryTripsCompanion toCompanion(bool nullToAbsent) {
    return LorryTripsCompanion(
      id: Value(id),
      organizationId: Value(organizationId),
      lorryId: Value(lorryId),
      fieldManagerId: Value(fieldManagerId),
      requestId: requestId == null && nullToAbsent
          ? const Value.absent()
          : Value(requestId),
      startDate: Value(startDate),
      endDate: endDate == null && nullToAbsent
          ? const Value.absent()
          : Value(endDate),
      status: Value(status),
      farmerCount: Value(farmerCount),
      totalBags: Value(totalBags),
      grossKg: Value(grossKg),
      netKg: Value(netKg),
      notes:
          notes == null && nullToAbsent ? const Value.absent() : Value(notes),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory LorryTrip.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LorryTrip(
      id: serializer.fromJson<String>(json['id']),
      organizationId: serializer.fromJson<String>(json['organizationId']),
      lorryId: serializer.fromJson<String>(json['lorryId']),
      fieldManagerId: serializer.fromJson<String>(json['fieldManagerId']),
      requestId: serializer.fromJson<String?>(json['requestId']),
      startDate: serializer.fromJson<DateTime>(json['startDate']),
      endDate: serializer.fromJson<DateTime?>(json['endDate']),
      status: serializer.fromJson<String>(json['status']),
      farmerCount: serializer.fromJson<int>(json['farmerCount']),
      totalBags: serializer.fromJson<int>(json['totalBags']),
      grossKg: serializer.fromJson<double>(json['grossKg']),
      netKg: serializer.fromJson<double>(json['netKg']),
      notes: serializer.fromJson<String?>(json['notes']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'organizationId': serializer.toJson<String>(organizationId),
      'lorryId': serializer.toJson<String>(lorryId),
      'fieldManagerId': serializer.toJson<String>(fieldManagerId),
      'requestId': serializer.toJson<String?>(requestId),
      'startDate': serializer.toJson<DateTime>(startDate),
      'endDate': serializer.toJson<DateTime?>(endDate),
      'status': serializer.toJson<String>(status),
      'farmerCount': serializer.toJson<int>(farmerCount),
      'totalBags': serializer.toJson<int>(totalBags),
      'grossKg': serializer.toJson<double>(grossKg),
      'netKg': serializer.toJson<double>(netKg),
      'notes': serializer.toJson<String?>(notes),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  LorryTrip copyWith(
          {String? id,
          String? organizationId,
          String? lorryId,
          String? fieldManagerId,
          Value<String?> requestId = const Value.absent(),
          DateTime? startDate,
          Value<DateTime?> endDate = const Value.absent(),
          String? status,
          int? farmerCount,
          int? totalBags,
          double? grossKg,
          double? netKg,
          Value<String?> notes = const Value.absent(),
          DateTime? createdAt,
          DateTime? updatedAt}) =>
      LorryTrip(
        id: id ?? this.id,
        organizationId: organizationId ?? this.organizationId,
        lorryId: lorryId ?? this.lorryId,
        fieldManagerId: fieldManagerId ?? this.fieldManagerId,
        requestId: requestId.present ? requestId.value : this.requestId,
        startDate: startDate ?? this.startDate,
        endDate: endDate.present ? endDate.value : this.endDate,
        status: status ?? this.status,
        farmerCount: farmerCount ?? this.farmerCount,
        totalBags: totalBags ?? this.totalBags,
        grossKg: grossKg ?? this.grossKg,
        netKg: netKg ?? this.netKg,
        notes: notes.present ? notes.value : this.notes,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  LorryTrip copyWithCompanion(LorryTripsCompanion data) {
    return LorryTrip(
      id: data.id.present ? data.id.value : this.id,
      organizationId: data.organizationId.present
          ? data.organizationId.value
          : this.organizationId,
      lorryId: data.lorryId.present ? data.lorryId.value : this.lorryId,
      fieldManagerId: data.fieldManagerId.present
          ? data.fieldManagerId.value
          : this.fieldManagerId,
      requestId: data.requestId.present ? data.requestId.value : this.requestId,
      startDate: data.startDate.present ? data.startDate.value : this.startDate,
      endDate: data.endDate.present ? data.endDate.value : this.endDate,
      status: data.status.present ? data.status.value : this.status,
      farmerCount:
          data.farmerCount.present ? data.farmerCount.value : this.farmerCount,
      totalBags: data.totalBags.present ? data.totalBags.value : this.totalBags,
      grossKg: data.grossKg.present ? data.grossKg.value : this.grossKg,
      netKg: data.netKg.present ? data.netKg.value : this.netKg,
      notes: data.notes.present ? data.notes.value : this.notes,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LorryTrip(')
          ..write('id: $id, ')
          ..write('organizationId: $organizationId, ')
          ..write('lorryId: $lorryId, ')
          ..write('fieldManagerId: $fieldManagerId, ')
          ..write('requestId: $requestId, ')
          ..write('startDate: $startDate, ')
          ..write('endDate: $endDate, ')
          ..write('status: $status, ')
          ..write('farmerCount: $farmerCount, ')
          ..write('totalBags: $totalBags, ')
          ..write('grossKg: $grossKg, ')
          ..write('netKg: $netKg, ')
          ..write('notes: $notes, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
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
      updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LorryTrip &&
          other.id == this.id &&
          other.organizationId == this.organizationId &&
          other.lorryId == this.lorryId &&
          other.fieldManagerId == this.fieldManagerId &&
          other.requestId == this.requestId &&
          other.startDate == this.startDate &&
          other.endDate == this.endDate &&
          other.status == this.status &&
          other.farmerCount == this.farmerCount &&
          other.totalBags == this.totalBags &&
          other.grossKg == this.grossKg &&
          other.netKg == this.netKg &&
          other.notes == this.notes &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class LorryTripsCompanion extends UpdateCompanion<LorryTrip> {
  final Value<String> id;
  final Value<String> organizationId;
  final Value<String> lorryId;
  final Value<String> fieldManagerId;
  final Value<String?> requestId;
  final Value<DateTime> startDate;
  final Value<DateTime?> endDate;
  final Value<String> status;
  final Value<int> farmerCount;
  final Value<int> totalBags;
  final Value<double> grossKg;
  final Value<double> netKg;
  final Value<String?> notes;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const LorryTripsCompanion({
    this.id = const Value.absent(),
    this.organizationId = const Value.absent(),
    this.lorryId = const Value.absent(),
    this.fieldManagerId = const Value.absent(),
    this.requestId = const Value.absent(),
    this.startDate = const Value.absent(),
    this.endDate = const Value.absent(),
    this.status = const Value.absent(),
    this.farmerCount = const Value.absent(),
    this.totalBags = const Value.absent(),
    this.grossKg = const Value.absent(),
    this.netKg = const Value.absent(),
    this.notes = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LorryTripsCompanion.insert({
    required String id,
    required String organizationId,
    required String lorryId,
    required String fieldManagerId,
    this.requestId = const Value.absent(),
    required DateTime startDate,
    this.endDate = const Value.absent(),
    this.status = const Value.absent(),
    this.farmerCount = const Value.absent(),
    this.totalBags = const Value.absent(),
    this.grossKg = const Value.absent(),
    this.netKg = const Value.absent(),
    this.notes = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        organizationId = Value(organizationId),
        lorryId = Value(lorryId),
        fieldManagerId = Value(fieldManagerId),
        startDate = Value(startDate);
  static Insertable<LorryTrip> custom({
    Expression<String>? id,
    Expression<String>? organizationId,
    Expression<String>? lorryId,
    Expression<String>? fieldManagerId,
    Expression<String>? requestId,
    Expression<DateTime>? startDate,
    Expression<DateTime>? endDate,
    Expression<String>? status,
    Expression<int>? farmerCount,
    Expression<int>? totalBags,
    Expression<double>? grossKg,
    Expression<double>? netKg,
    Expression<String>? notes,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (organizationId != null) 'organization_id': organizationId,
      if (lorryId != null) 'lorry_id': lorryId,
      if (fieldManagerId != null) 'field_manager_id': fieldManagerId,
      if (requestId != null) 'request_id': requestId,
      if (startDate != null) 'start_date': startDate,
      if (endDate != null) 'end_date': endDate,
      if (status != null) 'status': status,
      if (farmerCount != null) 'farmer_count': farmerCount,
      if (totalBags != null) 'total_bags': totalBags,
      if (grossKg != null) 'gross_kg': grossKg,
      if (netKg != null) 'net_kg': netKg,
      if (notes != null) 'notes': notes,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LorryTripsCompanion copyWith(
      {Value<String>? id,
      Value<String>? organizationId,
      Value<String>? lorryId,
      Value<String>? fieldManagerId,
      Value<String?>? requestId,
      Value<DateTime>? startDate,
      Value<DateTime?>? endDate,
      Value<String>? status,
      Value<int>? farmerCount,
      Value<int>? totalBags,
      Value<double>? grossKg,
      Value<double>? netKg,
      Value<String?>? notes,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? rowid}) {
    return LorryTripsCompanion(
      id: id ?? this.id,
      organizationId: organizationId ?? this.organizationId,
      lorryId: lorryId ?? this.lorryId,
      fieldManagerId: fieldManagerId ?? this.fieldManagerId,
      requestId: requestId ?? this.requestId,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      status: status ?? this.status,
      farmerCount: farmerCount ?? this.farmerCount,
      totalBags: totalBags ?? this.totalBags,
      grossKg: grossKg ?? this.grossKg,
      netKg: netKg ?? this.netKg,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (organizationId.present) {
      map['organization_id'] = Variable<String>(organizationId.value);
    }
    if (lorryId.present) {
      map['lorry_id'] = Variable<String>(lorryId.value);
    }
    if (fieldManagerId.present) {
      map['field_manager_id'] = Variable<String>(fieldManagerId.value);
    }
    if (requestId.present) {
      map['request_id'] = Variable<String>(requestId.value);
    }
    if (startDate.present) {
      map['start_date'] = Variable<DateTime>(startDate.value);
    }
    if (endDate.present) {
      map['end_date'] = Variable<DateTime>(endDate.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (farmerCount.present) {
      map['farmer_count'] = Variable<int>(farmerCount.value);
    }
    if (totalBags.present) {
      map['total_bags'] = Variable<int>(totalBags.value);
    }
    if (grossKg.present) {
      map['gross_kg'] = Variable<double>(grossKg.value);
    }
    if (netKg.present) {
      map['net_kg'] = Variable<double>(netKg.value);
    }
    if (notes.present) {
      map['notes'] = Variable<String>(notes.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LorryTripsCompanion(')
          ..write('id: $id, ')
          ..write('organizationId: $organizationId, ')
          ..write('lorryId: $lorryId, ')
          ..write('fieldManagerId: $fieldManagerId, ')
          ..write('requestId: $requestId, ')
          ..write('startDate: $startDate, ')
          ..write('endDate: $endDate, ')
          ..write('status: $status, ')
          ..write('farmerCount: $farmerCount, ')
          ..write('totalBags: $totalBags, ')
          ..write('grossKg: $grossKg, ')
          ..write('netKg: $netKg, ')
          ..write('notes: $notes, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $DeliveriesTable extends Deliveries
    with TableInfo<$DeliveriesTable, Delivery> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $DeliveriesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _organizationIdMeta =
      const VerificationMeta('organizationId');
  @override
  late final GeneratedColumn<String> organizationId = GeneratedColumn<String>(
      'organization_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _tripIdMeta = const VerificationMeta('tripId');
  @override
  late final GeneratedColumn<String> tripId = GeneratedColumn<String>(
      'trip_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _farmerIdMeta =
      const VerificationMeta('farmerId');
  @override
  late final GeneratedColumn<String> farmerId = GeneratedColumn<String>(
      'farmer_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _farmerNameMeta =
      const VerificationMeta('farmerName');
  @override
  late final GeneratedColumn<String> farmerName = GeneratedColumn<String>(
      'farmer_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _farmerPhoneMeta =
      const VerificationMeta('farmerPhone');
  @override
  late final GeneratedColumn<String> farmerPhone = GeneratedColumn<String>(
      'farmer_phone', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _numberOfBagsMeta =
      const VerificationMeta('numberOfBags');
  @override
  late final GeneratedColumn<int> numberOfBags = GeneratedColumn<int>(
      'number_of_bags', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _bagWeightsJsonMeta =
      const VerificationMeta('bagWeightsJson');
  @override
  late final GeneratedColumn<String> bagWeightsJson = GeneratedColumn<String>(
      'bag_weights_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _moisturePercentMeta =
      const VerificationMeta('moisturePercent');
  @override
  late final GeneratedColumn<double> moisturePercent = GeneratedColumn<double>(
      'moisture_percent', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _qualityGradeMeta =
      const VerificationMeta('qualityGrade');
  @override
  late final GeneratedColumn<String> qualityGrade = GeneratedColumn<String>(
      'quality_grade', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _grossWeightMeta =
      const VerificationMeta('grossWeight');
  @override
  late final GeneratedColumn<double> grossWeight = GeneratedColumn<double>(
      'gross_weight', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _deductionFixedKgMeta =
      const VerificationMeta('deductionFixedKg');
  @override
  late final GeneratedColumn<double> deductionFixedKg = GeneratedColumn<double>(
      'deduction_fixed_kg', aliasedName, false,
      type: DriftSqlType.double,
      requiredDuringInsert: false,
      defaultValue: const Constant(0.0));
  static const VerificationMeta _qualityDeductionKgMeta =
      const VerificationMeta('qualityDeductionKg');
  @override
  late final GeneratedColumn<double> qualityDeductionKg =
      GeneratedColumn<double>('quality_deduction_kg', aliasedName, false,
          type: DriftSqlType.double,
          requiredDuringInsert: false,
          defaultValue: const Constant(0.0));
  static const VerificationMeta _netWeightMeta =
      const VerificationMeta('netWeight');
  @override
  late final GeneratedColumn<double> netWeight = GeneratedColumn<double>(
      'net_weight', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('PENDING'));
  static const VerificationMeta _notesMeta = const VerificationMeta('notes');
  @override
  late final GeneratedColumn<String> notes = GeneratedColumn<String>(
      'notes', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _recordedAtMeta =
      const VerificationMeta('recordedAt');
  @override
  late final GeneratedColumn<DateTime> recordedAt = GeneratedColumn<DateTime>(
      'recorded_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        organizationId,
        tripId,
        farmerId,
        farmerName,
        farmerPhone,
        numberOfBags,
        bagWeightsJson,
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
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'deliveries';
  @override
  VerificationContext validateIntegrity(Insertable<Delivery> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('organization_id')) {
      context.handle(
          _organizationIdMeta,
          organizationId.isAcceptableOrUnknown(
              data['organization_id']!, _organizationIdMeta));
    } else if (isInserting) {
      context.missing(_organizationIdMeta);
    }
    if (data.containsKey('trip_id')) {
      context.handle(_tripIdMeta,
          tripId.isAcceptableOrUnknown(data['trip_id']!, _tripIdMeta));
    } else if (isInserting) {
      context.missing(_tripIdMeta);
    }
    if (data.containsKey('farmer_id')) {
      context.handle(_farmerIdMeta,
          farmerId.isAcceptableOrUnknown(data['farmer_id']!, _farmerIdMeta));
    } else if (isInserting) {
      context.missing(_farmerIdMeta);
    }
    if (data.containsKey('farmer_name')) {
      context.handle(
          _farmerNameMeta,
          farmerName.isAcceptableOrUnknown(
              data['farmer_name']!, _farmerNameMeta));
    } else if (isInserting) {
      context.missing(_farmerNameMeta);
    }
    if (data.containsKey('farmer_phone')) {
      context.handle(
          _farmerPhoneMeta,
          farmerPhone.isAcceptableOrUnknown(
              data['farmer_phone']!, _farmerPhoneMeta));
    }
    if (data.containsKey('number_of_bags')) {
      context.handle(
          _numberOfBagsMeta,
          numberOfBags.isAcceptableOrUnknown(
              data['number_of_bags']!, _numberOfBagsMeta));
    } else if (isInserting) {
      context.missing(_numberOfBagsMeta);
    }
    if (data.containsKey('bag_weights_json')) {
      context.handle(
          _bagWeightsJsonMeta,
          bagWeightsJson.isAcceptableOrUnknown(
              data['bag_weights_json']!, _bagWeightsJsonMeta));
    } else if (isInserting) {
      context.missing(_bagWeightsJsonMeta);
    }
    if (data.containsKey('moisture_percent')) {
      context.handle(
          _moisturePercentMeta,
          moisturePercent.isAcceptableOrUnknown(
              data['moisture_percent']!, _moisturePercentMeta));
    } else if (isInserting) {
      context.missing(_moisturePercentMeta);
    }
    if (data.containsKey('quality_grade')) {
      context.handle(
          _qualityGradeMeta,
          qualityGrade.isAcceptableOrUnknown(
              data['quality_grade']!, _qualityGradeMeta));
    } else if (isInserting) {
      context.missing(_qualityGradeMeta);
    }
    if (data.containsKey('gross_weight')) {
      context.handle(
          _grossWeightMeta,
          grossWeight.isAcceptableOrUnknown(
              data['gross_weight']!, _grossWeightMeta));
    } else if (isInserting) {
      context.missing(_grossWeightMeta);
    }
    if (data.containsKey('deduction_fixed_kg')) {
      context.handle(
          _deductionFixedKgMeta,
          deductionFixedKg.isAcceptableOrUnknown(
              data['deduction_fixed_kg']!, _deductionFixedKgMeta));
    }
    if (data.containsKey('quality_deduction_kg')) {
      context.handle(
          _qualityDeductionKgMeta,
          qualityDeductionKg.isAcceptableOrUnknown(
              data['quality_deduction_kg']!, _qualityDeductionKgMeta));
    }
    if (data.containsKey('net_weight')) {
      context.handle(_netWeightMeta,
          netWeight.isAcceptableOrUnknown(data['net_weight']!, _netWeightMeta));
    } else if (isInserting) {
      context.missing(_netWeightMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('notes')) {
      context.handle(
          _notesMeta, notes.isAcceptableOrUnknown(data['notes']!, _notesMeta));
    }
    if (data.containsKey('recorded_at')) {
      context.handle(
          _recordedAtMeta,
          recordedAt.isAcceptableOrUnknown(
              data['recorded_at']!, _recordedAtMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Delivery map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Delivery(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      organizationId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}organization_id'])!,
      tripId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}trip_id'])!,
      farmerId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}farmer_id'])!,
      farmerName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}farmer_name'])!,
      farmerPhone: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}farmer_phone']),
      numberOfBags: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}number_of_bags'])!,
      bagWeightsJson: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}bag_weights_json'])!,
      moisturePercent: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}moisture_percent'])!,
      qualityGrade: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}quality_grade'])!,
      grossWeight: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}gross_weight'])!,
      deductionFixedKg: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}deduction_fixed_kg'])!,
      qualityDeductionKg: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}quality_deduction_kg'])!,
      netWeight: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}net_weight'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      notes: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}notes']),
      recordedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}recorded_at'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $DeliveriesTable createAlias(String alias) {
    return $DeliveriesTable(attachedDatabase, alias);
  }
}

class Delivery extends DataClass implements Insertable<Delivery> {
  final String id;
  final String organizationId;
  final String tripId;
  final String farmerId;
  final String farmerName;
  final String? farmerPhone;
  final int numberOfBags;
  final String bagWeightsJson;
  final double moisturePercent;
  final String qualityGrade;
  final double grossWeight;
  final double deductionFixedKg;
  final double qualityDeductionKg;
  final double netWeight;
  final String status;
  final String? notes;
  final DateTime recordedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  const Delivery(
      {required this.id,
      required this.organizationId,
      required this.tripId,
      required this.farmerId,
      required this.farmerName,
      this.farmerPhone,
      required this.numberOfBags,
      required this.bagWeightsJson,
      required this.moisturePercent,
      required this.qualityGrade,
      required this.grossWeight,
      required this.deductionFixedKg,
      required this.qualityDeductionKg,
      required this.netWeight,
      required this.status,
      this.notes,
      required this.recordedAt,
      required this.createdAt,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['organization_id'] = Variable<String>(organizationId);
    map['trip_id'] = Variable<String>(tripId);
    map['farmer_id'] = Variable<String>(farmerId);
    map['farmer_name'] = Variable<String>(farmerName);
    if (!nullToAbsent || farmerPhone != null) {
      map['farmer_phone'] = Variable<String>(farmerPhone);
    }
    map['number_of_bags'] = Variable<int>(numberOfBags);
    map['bag_weights_json'] = Variable<String>(bagWeightsJson);
    map['moisture_percent'] = Variable<double>(moisturePercent);
    map['quality_grade'] = Variable<String>(qualityGrade);
    map['gross_weight'] = Variable<double>(grossWeight);
    map['deduction_fixed_kg'] = Variable<double>(deductionFixedKg);
    map['quality_deduction_kg'] = Variable<double>(qualityDeductionKg);
    map['net_weight'] = Variable<double>(netWeight);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || notes != null) {
      map['notes'] = Variable<String>(notes);
    }
    map['recorded_at'] = Variable<DateTime>(recordedAt);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  DeliveriesCompanion toCompanion(bool nullToAbsent) {
    return DeliveriesCompanion(
      id: Value(id),
      organizationId: Value(organizationId),
      tripId: Value(tripId),
      farmerId: Value(farmerId),
      farmerName: Value(farmerName),
      farmerPhone: farmerPhone == null && nullToAbsent
          ? const Value.absent()
          : Value(farmerPhone),
      numberOfBags: Value(numberOfBags),
      bagWeightsJson: Value(bagWeightsJson),
      moisturePercent: Value(moisturePercent),
      qualityGrade: Value(qualityGrade),
      grossWeight: Value(grossWeight),
      deductionFixedKg: Value(deductionFixedKg),
      qualityDeductionKg: Value(qualityDeductionKg),
      netWeight: Value(netWeight),
      status: Value(status),
      notes:
          notes == null && nullToAbsent ? const Value.absent() : Value(notes),
      recordedAt: Value(recordedAt),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory Delivery.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Delivery(
      id: serializer.fromJson<String>(json['id']),
      organizationId: serializer.fromJson<String>(json['organizationId']),
      tripId: serializer.fromJson<String>(json['tripId']),
      farmerId: serializer.fromJson<String>(json['farmerId']),
      farmerName: serializer.fromJson<String>(json['farmerName']),
      farmerPhone: serializer.fromJson<String?>(json['farmerPhone']),
      numberOfBags: serializer.fromJson<int>(json['numberOfBags']),
      bagWeightsJson: serializer.fromJson<String>(json['bagWeightsJson']),
      moisturePercent: serializer.fromJson<double>(json['moisturePercent']),
      qualityGrade: serializer.fromJson<String>(json['qualityGrade']),
      grossWeight: serializer.fromJson<double>(json['grossWeight']),
      deductionFixedKg: serializer.fromJson<double>(json['deductionFixedKg']),
      qualityDeductionKg:
          serializer.fromJson<double>(json['qualityDeductionKg']),
      netWeight: serializer.fromJson<double>(json['netWeight']),
      status: serializer.fromJson<String>(json['status']),
      notes: serializer.fromJson<String?>(json['notes']),
      recordedAt: serializer.fromJson<DateTime>(json['recordedAt']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'organizationId': serializer.toJson<String>(organizationId),
      'tripId': serializer.toJson<String>(tripId),
      'farmerId': serializer.toJson<String>(farmerId),
      'farmerName': serializer.toJson<String>(farmerName),
      'farmerPhone': serializer.toJson<String?>(farmerPhone),
      'numberOfBags': serializer.toJson<int>(numberOfBags),
      'bagWeightsJson': serializer.toJson<String>(bagWeightsJson),
      'moisturePercent': serializer.toJson<double>(moisturePercent),
      'qualityGrade': serializer.toJson<String>(qualityGrade),
      'grossWeight': serializer.toJson<double>(grossWeight),
      'deductionFixedKg': serializer.toJson<double>(deductionFixedKg),
      'qualityDeductionKg': serializer.toJson<double>(qualityDeductionKg),
      'netWeight': serializer.toJson<double>(netWeight),
      'status': serializer.toJson<String>(status),
      'notes': serializer.toJson<String?>(notes),
      'recordedAt': serializer.toJson<DateTime>(recordedAt),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  Delivery copyWith(
          {String? id,
          String? organizationId,
          String? tripId,
          String? farmerId,
          String? farmerName,
          Value<String?> farmerPhone = const Value.absent(),
          int? numberOfBags,
          String? bagWeightsJson,
          double? moisturePercent,
          String? qualityGrade,
          double? grossWeight,
          double? deductionFixedKg,
          double? qualityDeductionKg,
          double? netWeight,
          String? status,
          Value<String?> notes = const Value.absent(),
          DateTime? recordedAt,
          DateTime? createdAt,
          DateTime? updatedAt}) =>
      Delivery(
        id: id ?? this.id,
        organizationId: organizationId ?? this.organizationId,
        tripId: tripId ?? this.tripId,
        farmerId: farmerId ?? this.farmerId,
        farmerName: farmerName ?? this.farmerName,
        farmerPhone: farmerPhone.present ? farmerPhone.value : this.farmerPhone,
        numberOfBags: numberOfBags ?? this.numberOfBags,
        bagWeightsJson: bagWeightsJson ?? this.bagWeightsJson,
        moisturePercent: moisturePercent ?? this.moisturePercent,
        qualityGrade: qualityGrade ?? this.qualityGrade,
        grossWeight: grossWeight ?? this.grossWeight,
        deductionFixedKg: deductionFixedKg ?? this.deductionFixedKg,
        qualityDeductionKg: qualityDeductionKg ?? this.qualityDeductionKg,
        netWeight: netWeight ?? this.netWeight,
        status: status ?? this.status,
        notes: notes.present ? notes.value : this.notes,
        recordedAt: recordedAt ?? this.recordedAt,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  Delivery copyWithCompanion(DeliveriesCompanion data) {
    return Delivery(
      id: data.id.present ? data.id.value : this.id,
      organizationId: data.organizationId.present
          ? data.organizationId.value
          : this.organizationId,
      tripId: data.tripId.present ? data.tripId.value : this.tripId,
      farmerId: data.farmerId.present ? data.farmerId.value : this.farmerId,
      farmerName:
          data.farmerName.present ? data.farmerName.value : this.farmerName,
      farmerPhone:
          data.farmerPhone.present ? data.farmerPhone.value : this.farmerPhone,
      numberOfBags: data.numberOfBags.present
          ? data.numberOfBags.value
          : this.numberOfBags,
      bagWeightsJson: data.bagWeightsJson.present
          ? data.bagWeightsJson.value
          : this.bagWeightsJson,
      moisturePercent: data.moisturePercent.present
          ? data.moisturePercent.value
          : this.moisturePercent,
      qualityGrade: data.qualityGrade.present
          ? data.qualityGrade.value
          : this.qualityGrade,
      grossWeight:
          data.grossWeight.present ? data.grossWeight.value : this.grossWeight,
      deductionFixedKg: data.deductionFixedKg.present
          ? data.deductionFixedKg.value
          : this.deductionFixedKg,
      qualityDeductionKg: data.qualityDeductionKg.present
          ? data.qualityDeductionKg.value
          : this.qualityDeductionKg,
      netWeight: data.netWeight.present ? data.netWeight.value : this.netWeight,
      status: data.status.present ? data.status.value : this.status,
      notes: data.notes.present ? data.notes.value : this.notes,
      recordedAt:
          data.recordedAt.present ? data.recordedAt.value : this.recordedAt,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Delivery(')
          ..write('id: $id, ')
          ..write('organizationId: $organizationId, ')
          ..write('tripId: $tripId, ')
          ..write('farmerId: $farmerId, ')
          ..write('farmerName: $farmerName, ')
          ..write('farmerPhone: $farmerPhone, ')
          ..write('numberOfBags: $numberOfBags, ')
          ..write('bagWeightsJson: $bagWeightsJson, ')
          ..write('moisturePercent: $moisturePercent, ')
          ..write('qualityGrade: $qualityGrade, ')
          ..write('grossWeight: $grossWeight, ')
          ..write('deductionFixedKg: $deductionFixedKg, ')
          ..write('qualityDeductionKg: $qualityDeductionKg, ')
          ..write('netWeight: $netWeight, ')
          ..write('status: $status, ')
          ..write('notes: $notes, ')
          ..write('recordedAt: $recordedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      organizationId,
      tripId,
      farmerId,
      farmerName,
      farmerPhone,
      numberOfBags,
      bagWeightsJson,
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
      updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Delivery &&
          other.id == this.id &&
          other.organizationId == this.organizationId &&
          other.tripId == this.tripId &&
          other.farmerId == this.farmerId &&
          other.farmerName == this.farmerName &&
          other.farmerPhone == this.farmerPhone &&
          other.numberOfBags == this.numberOfBags &&
          other.bagWeightsJson == this.bagWeightsJson &&
          other.moisturePercent == this.moisturePercent &&
          other.qualityGrade == this.qualityGrade &&
          other.grossWeight == this.grossWeight &&
          other.deductionFixedKg == this.deductionFixedKg &&
          other.qualityDeductionKg == this.qualityDeductionKg &&
          other.netWeight == this.netWeight &&
          other.status == this.status &&
          other.notes == this.notes &&
          other.recordedAt == this.recordedAt &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class DeliveriesCompanion extends UpdateCompanion<Delivery> {
  final Value<String> id;
  final Value<String> organizationId;
  final Value<String> tripId;
  final Value<String> farmerId;
  final Value<String> farmerName;
  final Value<String?> farmerPhone;
  final Value<int> numberOfBags;
  final Value<String> bagWeightsJson;
  final Value<double> moisturePercent;
  final Value<String> qualityGrade;
  final Value<double> grossWeight;
  final Value<double> deductionFixedKg;
  final Value<double> qualityDeductionKg;
  final Value<double> netWeight;
  final Value<String> status;
  final Value<String?> notes;
  final Value<DateTime> recordedAt;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const DeliveriesCompanion({
    this.id = const Value.absent(),
    this.organizationId = const Value.absent(),
    this.tripId = const Value.absent(),
    this.farmerId = const Value.absent(),
    this.farmerName = const Value.absent(),
    this.farmerPhone = const Value.absent(),
    this.numberOfBags = const Value.absent(),
    this.bagWeightsJson = const Value.absent(),
    this.moisturePercent = const Value.absent(),
    this.qualityGrade = const Value.absent(),
    this.grossWeight = const Value.absent(),
    this.deductionFixedKg = const Value.absent(),
    this.qualityDeductionKg = const Value.absent(),
    this.netWeight = const Value.absent(),
    this.status = const Value.absent(),
    this.notes = const Value.absent(),
    this.recordedAt = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  DeliveriesCompanion.insert({
    required String id,
    required String organizationId,
    required String tripId,
    required String farmerId,
    required String farmerName,
    this.farmerPhone = const Value.absent(),
    required int numberOfBags,
    required String bagWeightsJson,
    required double moisturePercent,
    required String qualityGrade,
    required double grossWeight,
    this.deductionFixedKg = const Value.absent(),
    this.qualityDeductionKg = const Value.absent(),
    required double netWeight,
    this.status = const Value.absent(),
    this.notes = const Value.absent(),
    this.recordedAt = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        organizationId = Value(organizationId),
        tripId = Value(tripId),
        farmerId = Value(farmerId),
        farmerName = Value(farmerName),
        numberOfBags = Value(numberOfBags),
        bagWeightsJson = Value(bagWeightsJson),
        moisturePercent = Value(moisturePercent),
        qualityGrade = Value(qualityGrade),
        grossWeight = Value(grossWeight),
        netWeight = Value(netWeight);
  static Insertable<Delivery> custom({
    Expression<String>? id,
    Expression<String>? organizationId,
    Expression<String>? tripId,
    Expression<String>? farmerId,
    Expression<String>? farmerName,
    Expression<String>? farmerPhone,
    Expression<int>? numberOfBags,
    Expression<String>? bagWeightsJson,
    Expression<double>? moisturePercent,
    Expression<String>? qualityGrade,
    Expression<double>? grossWeight,
    Expression<double>? deductionFixedKg,
    Expression<double>? qualityDeductionKg,
    Expression<double>? netWeight,
    Expression<String>? status,
    Expression<String>? notes,
    Expression<DateTime>? recordedAt,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (organizationId != null) 'organization_id': organizationId,
      if (tripId != null) 'trip_id': tripId,
      if (farmerId != null) 'farmer_id': farmerId,
      if (farmerName != null) 'farmer_name': farmerName,
      if (farmerPhone != null) 'farmer_phone': farmerPhone,
      if (numberOfBags != null) 'number_of_bags': numberOfBags,
      if (bagWeightsJson != null) 'bag_weights_json': bagWeightsJson,
      if (moisturePercent != null) 'moisture_percent': moisturePercent,
      if (qualityGrade != null) 'quality_grade': qualityGrade,
      if (grossWeight != null) 'gross_weight': grossWeight,
      if (deductionFixedKg != null) 'deduction_fixed_kg': deductionFixedKg,
      if (qualityDeductionKg != null)
        'quality_deduction_kg': qualityDeductionKg,
      if (netWeight != null) 'net_weight': netWeight,
      if (status != null) 'status': status,
      if (notes != null) 'notes': notes,
      if (recordedAt != null) 'recorded_at': recordedAt,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  DeliveriesCompanion copyWith(
      {Value<String>? id,
      Value<String>? organizationId,
      Value<String>? tripId,
      Value<String>? farmerId,
      Value<String>? farmerName,
      Value<String?>? farmerPhone,
      Value<int>? numberOfBags,
      Value<String>? bagWeightsJson,
      Value<double>? moisturePercent,
      Value<String>? qualityGrade,
      Value<double>? grossWeight,
      Value<double>? deductionFixedKg,
      Value<double>? qualityDeductionKg,
      Value<double>? netWeight,
      Value<String>? status,
      Value<String?>? notes,
      Value<DateTime>? recordedAt,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? rowid}) {
    return DeliveriesCompanion(
      id: id ?? this.id,
      organizationId: organizationId ?? this.organizationId,
      tripId: tripId ?? this.tripId,
      farmerId: farmerId ?? this.farmerId,
      farmerName: farmerName ?? this.farmerName,
      farmerPhone: farmerPhone ?? this.farmerPhone,
      numberOfBags: numberOfBags ?? this.numberOfBags,
      bagWeightsJson: bagWeightsJson ?? this.bagWeightsJson,
      moisturePercent: moisturePercent ?? this.moisturePercent,
      qualityGrade: qualityGrade ?? this.qualityGrade,
      grossWeight: grossWeight ?? this.grossWeight,
      deductionFixedKg: deductionFixedKg ?? this.deductionFixedKg,
      qualityDeductionKg: qualityDeductionKg ?? this.qualityDeductionKg,
      netWeight: netWeight ?? this.netWeight,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      recordedAt: recordedAt ?? this.recordedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (organizationId.present) {
      map['organization_id'] = Variable<String>(organizationId.value);
    }
    if (tripId.present) {
      map['trip_id'] = Variable<String>(tripId.value);
    }
    if (farmerId.present) {
      map['farmer_id'] = Variable<String>(farmerId.value);
    }
    if (farmerName.present) {
      map['farmer_name'] = Variable<String>(farmerName.value);
    }
    if (farmerPhone.present) {
      map['farmer_phone'] = Variable<String>(farmerPhone.value);
    }
    if (numberOfBags.present) {
      map['number_of_bags'] = Variable<int>(numberOfBags.value);
    }
    if (bagWeightsJson.present) {
      map['bag_weights_json'] = Variable<String>(bagWeightsJson.value);
    }
    if (moisturePercent.present) {
      map['moisture_percent'] = Variable<double>(moisturePercent.value);
    }
    if (qualityGrade.present) {
      map['quality_grade'] = Variable<String>(qualityGrade.value);
    }
    if (grossWeight.present) {
      map['gross_weight'] = Variable<double>(grossWeight.value);
    }
    if (deductionFixedKg.present) {
      map['deduction_fixed_kg'] = Variable<double>(deductionFixedKg.value);
    }
    if (qualityDeductionKg.present) {
      map['quality_deduction_kg'] = Variable<double>(qualityDeductionKg.value);
    }
    if (netWeight.present) {
      map['net_weight'] = Variable<double>(netWeight.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (notes.present) {
      map['notes'] = Variable<String>(notes.value);
    }
    if (recordedAt.present) {
      map['recorded_at'] = Variable<DateTime>(recordedAt.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('DeliveriesCompanion(')
          ..write('id: $id, ')
          ..write('organizationId: $organizationId, ')
          ..write('tripId: $tripId, ')
          ..write('farmerId: $farmerId, ')
          ..write('farmerName: $farmerName, ')
          ..write('farmerPhone: $farmerPhone, ')
          ..write('numberOfBags: $numberOfBags, ')
          ..write('bagWeightsJson: $bagWeightsJson, ')
          ..write('moisturePercent: $moisturePercent, ')
          ..write('qualityGrade: $qualityGrade, ')
          ..write('grossWeight: $grossWeight, ')
          ..write('deductionFixedKg: $deductionFixedKg, ')
          ..write('qualityDeductionKg: $qualityDeductionKg, ')
          ..write('netWeight: $netWeight, ')
          ..write('status: $status, ')
          ..write('notes: $notes, ')
          ..write('recordedAt: $recordedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SyncQueueTable extends SyncQueue
    with TableInfo<$SyncQueueTable, SyncQueueData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncQueueTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _operationMeta =
      const VerificationMeta('operation');
  @override
  late final GeneratedColumn<String> operation = GeneratedColumn<String>(
      'operation', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _tableMeta = const VerificationMeta('table');
  @override
  late final GeneratedColumn<String> table = GeneratedColumn<String>(
      'table', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _recordIdMeta =
      const VerificationMeta('recordId');
  @override
  late final GeneratedColumn<String> recordId = GeneratedColumn<String>(
      'record_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _dataJsonMeta =
      const VerificationMeta('dataJson');
  @override
  late final GeneratedColumn<String> dataJson = GeneratedColumn<String>(
      'data_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _retryCountMeta =
      const VerificationMeta('retryCount');
  @override
  late final GeneratedColumn<int> retryCount = GeneratedColumn<int>(
      'retry_count', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _syncedMeta = const VerificationMeta('synced');
  @override
  late final GeneratedColumn<bool> synced = GeneratedColumn<bool>(
      'synced', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("synced" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _lastAttemptMeta =
      const VerificationMeta('lastAttempt');
  @override
  late final GeneratedColumn<DateTime> lastAttempt = GeneratedColumn<DateTime>(
      'last_attempt', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        operation,
        table,
        recordId,
        dataJson,
        retryCount,
        synced,
        createdAt,
        lastAttempt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_queue';
  @override
  VerificationContext validateIntegrity(Insertable<SyncQueueData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('operation')) {
      context.handle(_operationMeta,
          operation.isAcceptableOrUnknown(data['operation']!, _operationMeta));
    } else if (isInserting) {
      context.missing(_operationMeta);
    }
    if (data.containsKey('table')) {
      context.handle(
          _tableMeta, table.isAcceptableOrUnknown(data['table']!, _tableMeta));
    } else if (isInserting) {
      context.missing(_tableMeta);
    }
    if (data.containsKey('record_id')) {
      context.handle(_recordIdMeta,
          recordId.isAcceptableOrUnknown(data['record_id']!, _recordIdMeta));
    } else if (isInserting) {
      context.missing(_recordIdMeta);
    }
    if (data.containsKey('data_json')) {
      context.handle(_dataJsonMeta,
          dataJson.isAcceptableOrUnknown(data['data_json']!, _dataJsonMeta));
    } else if (isInserting) {
      context.missing(_dataJsonMeta);
    }
    if (data.containsKey('retry_count')) {
      context.handle(
          _retryCountMeta,
          retryCount.isAcceptableOrUnknown(
              data['retry_count']!, _retryCountMeta));
    }
    if (data.containsKey('synced')) {
      context.handle(_syncedMeta,
          synced.isAcceptableOrUnknown(data['synced']!, _syncedMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('last_attempt')) {
      context.handle(
          _lastAttemptMeta,
          lastAttempt.isAcceptableOrUnknown(
              data['last_attempt']!, _lastAttemptMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SyncQueueData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncQueueData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      operation: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}operation'])!,
      table: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}table'])!,
      recordId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}record_id'])!,
      dataJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}data_json'])!,
      retryCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}retry_count'])!,
      synced: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}synced'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      lastAttempt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}last_attempt']),
    );
  }

  @override
  $SyncQueueTable createAlias(String alias) {
    return $SyncQueueTable(attachedDatabase, alias);
  }
}

class SyncQueueData extends DataClass implements Insertable<SyncQueueData> {
  final int id;
  final String operation;
  final String table;
  final String recordId;
  final String dataJson;
  final int retryCount;
  final bool synced;
  final DateTime createdAt;
  final DateTime? lastAttempt;
  const SyncQueueData(
      {required this.id,
      required this.operation,
      required this.table,
      required this.recordId,
      required this.dataJson,
      required this.retryCount,
      required this.synced,
      required this.createdAt,
      this.lastAttempt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['operation'] = Variable<String>(operation);
    map['table'] = Variable<String>(table);
    map['record_id'] = Variable<String>(recordId);
    map['data_json'] = Variable<String>(dataJson);
    map['retry_count'] = Variable<int>(retryCount);
    map['synced'] = Variable<bool>(synced);
    map['created_at'] = Variable<DateTime>(createdAt);
    if (!nullToAbsent || lastAttempt != null) {
      map['last_attempt'] = Variable<DateTime>(lastAttempt);
    }
    return map;
  }

  SyncQueueCompanion toCompanion(bool nullToAbsent) {
    return SyncQueueCompanion(
      id: Value(id),
      operation: Value(operation),
      table: Value(table),
      recordId: Value(recordId),
      dataJson: Value(dataJson),
      retryCount: Value(retryCount),
      synced: Value(synced),
      createdAt: Value(createdAt),
      lastAttempt: lastAttempt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastAttempt),
    );
  }

  factory SyncQueueData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncQueueData(
      id: serializer.fromJson<int>(json['id']),
      operation: serializer.fromJson<String>(json['operation']),
      table: serializer.fromJson<String>(json['table']),
      recordId: serializer.fromJson<String>(json['recordId']),
      dataJson: serializer.fromJson<String>(json['dataJson']),
      retryCount: serializer.fromJson<int>(json['retryCount']),
      synced: serializer.fromJson<bool>(json['synced']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      lastAttempt: serializer.fromJson<DateTime?>(json['lastAttempt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'operation': serializer.toJson<String>(operation),
      'table': serializer.toJson<String>(table),
      'recordId': serializer.toJson<String>(recordId),
      'dataJson': serializer.toJson<String>(dataJson),
      'retryCount': serializer.toJson<int>(retryCount),
      'synced': serializer.toJson<bool>(synced),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'lastAttempt': serializer.toJson<DateTime?>(lastAttempt),
    };
  }

  SyncQueueData copyWith(
          {int? id,
          String? operation,
          String? table,
          String? recordId,
          String? dataJson,
          int? retryCount,
          bool? synced,
          DateTime? createdAt,
          Value<DateTime?> lastAttempt = const Value.absent()}) =>
      SyncQueueData(
        id: id ?? this.id,
        operation: operation ?? this.operation,
        table: table ?? this.table,
        recordId: recordId ?? this.recordId,
        dataJson: dataJson ?? this.dataJson,
        retryCount: retryCount ?? this.retryCount,
        synced: synced ?? this.synced,
        createdAt: createdAt ?? this.createdAt,
        lastAttempt: lastAttempt.present ? lastAttempt.value : this.lastAttempt,
      );
  SyncQueueData copyWithCompanion(SyncQueueCompanion data) {
    return SyncQueueData(
      id: data.id.present ? data.id.value : this.id,
      operation: data.operation.present ? data.operation.value : this.operation,
      table: data.table.present ? data.table.value : this.table,
      recordId: data.recordId.present ? data.recordId.value : this.recordId,
      dataJson: data.dataJson.present ? data.dataJson.value : this.dataJson,
      retryCount:
          data.retryCount.present ? data.retryCount.value : this.retryCount,
      synced: data.synced.present ? data.synced.value : this.synced,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      lastAttempt:
          data.lastAttempt.present ? data.lastAttempt.value : this.lastAttempt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SyncQueueData(')
          ..write('id: $id, ')
          ..write('operation: $operation, ')
          ..write('table: $table, ')
          ..write('recordId: $recordId, ')
          ..write('dataJson: $dataJson, ')
          ..write('retryCount: $retryCount, ')
          ..write('synced: $synced, ')
          ..write('createdAt: $createdAt, ')
          ..write('lastAttempt: $lastAttempt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, operation, table, recordId, dataJson,
      retryCount, synced, createdAt, lastAttempt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncQueueData &&
          other.id == this.id &&
          other.operation == this.operation &&
          other.table == this.table &&
          other.recordId == this.recordId &&
          other.dataJson == this.dataJson &&
          other.retryCount == this.retryCount &&
          other.synced == this.synced &&
          other.createdAt == this.createdAt &&
          other.lastAttempt == this.lastAttempt);
}

class SyncQueueCompanion extends UpdateCompanion<SyncQueueData> {
  final Value<int> id;
  final Value<String> operation;
  final Value<String> table;
  final Value<String> recordId;
  final Value<String> dataJson;
  final Value<int> retryCount;
  final Value<bool> synced;
  final Value<DateTime> createdAt;
  final Value<DateTime?> lastAttempt;
  const SyncQueueCompanion({
    this.id = const Value.absent(),
    this.operation = const Value.absent(),
    this.table = const Value.absent(),
    this.recordId = const Value.absent(),
    this.dataJson = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.synced = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.lastAttempt = const Value.absent(),
  });
  SyncQueueCompanion.insert({
    this.id = const Value.absent(),
    required String operation,
    required String table,
    required String recordId,
    required String dataJson,
    this.retryCount = const Value.absent(),
    this.synced = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.lastAttempt = const Value.absent(),
  })  : operation = Value(operation),
        table = Value(table),
        recordId = Value(recordId),
        dataJson = Value(dataJson);
  static Insertable<SyncQueueData> custom({
    Expression<int>? id,
    Expression<String>? operation,
    Expression<String>? table,
    Expression<String>? recordId,
    Expression<String>? dataJson,
    Expression<int>? retryCount,
    Expression<bool>? synced,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? lastAttempt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (operation != null) 'operation': operation,
      if (table != null) 'table': table,
      if (recordId != null) 'record_id': recordId,
      if (dataJson != null) 'data_json': dataJson,
      if (retryCount != null) 'retry_count': retryCount,
      if (synced != null) 'synced': synced,
      if (createdAt != null) 'created_at': createdAt,
      if (lastAttempt != null) 'last_attempt': lastAttempt,
    });
  }

  SyncQueueCompanion copyWith(
      {Value<int>? id,
      Value<String>? operation,
      Value<String>? table,
      Value<String>? recordId,
      Value<String>? dataJson,
      Value<int>? retryCount,
      Value<bool>? synced,
      Value<DateTime>? createdAt,
      Value<DateTime?>? lastAttempt}) {
    return SyncQueueCompanion(
      id: id ?? this.id,
      operation: operation ?? this.operation,
      table: table ?? this.table,
      recordId: recordId ?? this.recordId,
      dataJson: dataJson ?? this.dataJson,
      retryCount: retryCount ?? this.retryCount,
      synced: synced ?? this.synced,
      createdAt: createdAt ?? this.createdAt,
      lastAttempt: lastAttempt ?? this.lastAttempt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (operation.present) {
      map['operation'] = Variable<String>(operation.value);
    }
    if (table.present) {
      map['table'] = Variable<String>(table.value);
    }
    if (recordId.present) {
      map['record_id'] = Variable<String>(recordId.value);
    }
    if (dataJson.present) {
      map['data_json'] = Variable<String>(dataJson.value);
    }
    if (retryCount.present) {
      map['retry_count'] = Variable<int>(retryCount.value);
    }
    if (synced.present) {
      map['synced'] = Variable<bool>(synced.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (lastAttempt.present) {
      map['last_attempt'] = Variable<DateTime>(lastAttempt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncQueueCompanion(')
          ..write('id: $id, ')
          ..write('operation: $operation, ')
          ..write('table: $table, ')
          ..write('recordId: $recordId, ')
          ..write('dataJson: $dataJson, ')
          ..write('retryCount: $retryCount, ')
          ..write('synced: $synced, ')
          ..write('createdAt: $createdAt, ')
          ..write('lastAttempt: $lastAttempt')
          ..write(')'))
        .toString();
  }
}

class $ApiCacheTable extends ApiCache
    with TableInfo<$ApiCacheTable, ApiCacheData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ApiCacheTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _keyMeta = const VerificationMeta('key');
  @override
  late final GeneratedColumn<String> key = GeneratedColumn<String>(
      'key', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _dataJsonMeta =
      const VerificationMeta('dataJson');
  @override
  late final GeneratedColumn<String> dataJson = GeneratedColumn<String>(
      'data_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _cachedAtMeta =
      const VerificationMeta('cachedAt');
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
      'cached_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _expiresAtMeta =
      const VerificationMeta('expiresAt');
  @override
  late final GeneratedColumn<DateTime> expiresAt = GeneratedColumn<DateTime>(
      'expires_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [key, dataJson, cachedAt, expiresAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'api_cache';
  @override
  VerificationContext validateIntegrity(Insertable<ApiCacheData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('key')) {
      context.handle(
          _keyMeta, key.isAcceptableOrUnknown(data['key']!, _keyMeta));
    } else if (isInserting) {
      context.missing(_keyMeta);
    }
    if (data.containsKey('data_json')) {
      context.handle(_dataJsonMeta,
          dataJson.isAcceptableOrUnknown(data['data_json']!, _dataJsonMeta));
    } else if (isInserting) {
      context.missing(_dataJsonMeta);
    }
    if (data.containsKey('cached_at')) {
      context.handle(_cachedAtMeta,
          cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta));
    }
    if (data.containsKey('expires_at')) {
      context.handle(_expiresAtMeta,
          expiresAt.isAcceptableOrUnknown(data['expires_at']!, _expiresAtMeta));
    } else if (isInserting) {
      context.missing(_expiresAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {key};
  @override
  ApiCacheData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ApiCacheData(
      key: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}key'])!,
      dataJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}data_json'])!,
      cachedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}cached_at'])!,
      expiresAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}expires_at'])!,
    );
  }

  @override
  $ApiCacheTable createAlias(String alias) {
    return $ApiCacheTable(attachedDatabase, alias);
  }
}

class ApiCacheData extends DataClass implements Insertable<ApiCacheData> {
  final String key;
  final String dataJson;
  final DateTime cachedAt;
  final DateTime expiresAt;
  const ApiCacheData(
      {required this.key,
      required this.dataJson,
      required this.cachedAt,
      required this.expiresAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['key'] = Variable<String>(key);
    map['data_json'] = Variable<String>(dataJson);
    map['cached_at'] = Variable<DateTime>(cachedAt);
    map['expires_at'] = Variable<DateTime>(expiresAt);
    return map;
  }

  ApiCacheCompanion toCompanion(bool nullToAbsent) {
    return ApiCacheCompanion(
      key: Value(key),
      dataJson: Value(dataJson),
      cachedAt: Value(cachedAt),
      expiresAt: Value(expiresAt),
    );
  }

  factory ApiCacheData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ApiCacheData(
      key: serializer.fromJson<String>(json['key']),
      dataJson: serializer.fromJson<String>(json['dataJson']),
      cachedAt: serializer.fromJson<DateTime>(json['cachedAt']),
      expiresAt: serializer.fromJson<DateTime>(json['expiresAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'key': serializer.toJson<String>(key),
      'dataJson': serializer.toJson<String>(dataJson),
      'cachedAt': serializer.toJson<DateTime>(cachedAt),
      'expiresAt': serializer.toJson<DateTime>(expiresAt),
    };
  }

  ApiCacheData copyWith(
          {String? key,
          String? dataJson,
          DateTime? cachedAt,
          DateTime? expiresAt}) =>
      ApiCacheData(
        key: key ?? this.key,
        dataJson: dataJson ?? this.dataJson,
        cachedAt: cachedAt ?? this.cachedAt,
        expiresAt: expiresAt ?? this.expiresAt,
      );
  ApiCacheData copyWithCompanion(ApiCacheCompanion data) {
    return ApiCacheData(
      key: data.key.present ? data.key.value : this.key,
      dataJson: data.dataJson.present ? data.dataJson.value : this.dataJson,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
      expiresAt: data.expiresAt.present ? data.expiresAt.value : this.expiresAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ApiCacheData(')
          ..write('key: $key, ')
          ..write('dataJson: $dataJson, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('expiresAt: $expiresAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(key, dataJson, cachedAt, expiresAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ApiCacheData &&
          other.key == this.key &&
          other.dataJson == this.dataJson &&
          other.cachedAt == this.cachedAt &&
          other.expiresAt == this.expiresAt);
}

class ApiCacheCompanion extends UpdateCompanion<ApiCacheData> {
  final Value<String> key;
  final Value<String> dataJson;
  final Value<DateTime> cachedAt;
  final Value<DateTime> expiresAt;
  final Value<int> rowid;
  const ApiCacheCompanion({
    this.key = const Value.absent(),
    this.dataJson = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.expiresAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ApiCacheCompanion.insert({
    required String key,
    required String dataJson,
    this.cachedAt = const Value.absent(),
    required DateTime expiresAt,
    this.rowid = const Value.absent(),
  })  : key = Value(key),
        dataJson = Value(dataJson),
        expiresAt = Value(expiresAt);
  static Insertable<ApiCacheData> custom({
    Expression<String>? key,
    Expression<String>? dataJson,
    Expression<DateTime>? cachedAt,
    Expression<DateTime>? expiresAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (key != null) 'key': key,
      if (dataJson != null) 'data_json': dataJson,
      if (cachedAt != null) 'cached_at': cachedAt,
      if (expiresAt != null) 'expires_at': expiresAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ApiCacheCompanion copyWith(
      {Value<String>? key,
      Value<String>? dataJson,
      Value<DateTime>? cachedAt,
      Value<DateTime>? expiresAt,
      Value<int>? rowid}) {
    return ApiCacheCompanion(
      key: key ?? this.key,
      dataJson: dataJson ?? this.dataJson,
      cachedAt: cachedAt ?? this.cachedAt,
      expiresAt: expiresAt ?? this.expiresAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (key.present) {
      map['key'] = Variable<String>(key.value);
    }
    if (dataJson.present) {
      map['data_json'] = Variable<String>(dataJson.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (expiresAt.present) {
      map['expires_at'] = Variable<DateTime>(expiresAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ApiCacheCompanion(')
          ..write('key: $key, ')
          ..write('dataJson: $dataJson, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('expiresAt: $expiresAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $UsersTable users = $UsersTable(this);
  late final $OrganizationsTable organizations = $OrganizationsTable(this);
  late final $LorriesTable lorries = $LorriesTable(this);
  late final $FarmersTable farmers = $FarmersTable(this);
  late final $LorryRequestsTable lorryRequests = $LorryRequestsTable(this);
  late final $LorryTripsTable lorryTrips = $LorryTripsTable(this);
  late final $DeliveriesTable deliveries = $DeliveriesTable(this);
  late final $SyncQueueTable syncQueue = $SyncQueueTable(this);
  late final $ApiCacheTable apiCache = $ApiCacheTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        users,
        organizations,
        lorries,
        farmers,
        lorryRequests,
        lorryTrips,
        deliveries,
        syncQueue,
        apiCache
      ];
}

typedef $$UsersTableCreateCompanionBuilder = UsersCompanion Function({
  required String id,
  Value<String?> email,
  Value<String?> phone,
  required String role,
  Value<String?> organizationId,
  required String firstName,
  required String lastName,
  Value<String?> address,
  Value<String?> idNumber,
  Value<String> status,
  Value<DateTime?> lastLogin,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<String> profileJson,
  Value<String> preferencesJson,
  Value<int> rowid,
});
typedef $$UsersTableUpdateCompanionBuilder = UsersCompanion Function({
  Value<String> id,
  Value<String?> email,
  Value<String?> phone,
  Value<String> role,
  Value<String?> organizationId,
  Value<String> firstName,
  Value<String> lastName,
  Value<String?> address,
  Value<String?> idNumber,
  Value<String> status,
  Value<DateTime?> lastLogin,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<String> profileJson,
  Value<String> preferencesJson,
  Value<int> rowid,
});

class $$UsersTableFilterComposer extends Composer<_$AppDatabase, $UsersTable> {
  $$UsersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get email => $composableBuilder(
      column: $table.email, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get phone => $composableBuilder(
      column: $table.phone, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get role => $composableBuilder(
      column: $table.role, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get firstName => $composableBuilder(
      column: $table.firstName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastName => $composableBuilder(
      column: $table.lastName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get idNumber => $composableBuilder(
      column: $table.idNumber, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get lastLogin => $composableBuilder(
      column: $table.lastLogin, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get profileJson => $composableBuilder(
      column: $table.profileJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get preferencesJson => $composableBuilder(
      column: $table.preferencesJson,
      builder: (column) => ColumnFilters(column));
}

class $$UsersTableOrderingComposer
    extends Composer<_$AppDatabase, $UsersTable> {
  $$UsersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get email => $composableBuilder(
      column: $table.email, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get phone => $composableBuilder(
      column: $table.phone, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get role => $composableBuilder(
      column: $table.role, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get firstName => $composableBuilder(
      column: $table.firstName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastName => $composableBuilder(
      column: $table.lastName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get idNumber => $composableBuilder(
      column: $table.idNumber, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get lastLogin => $composableBuilder(
      column: $table.lastLogin, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get profileJson => $composableBuilder(
      column: $table.profileJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get preferencesJson => $composableBuilder(
      column: $table.preferencesJson,
      builder: (column) => ColumnOrderings(column));
}

class $$UsersTableAnnotationComposer
    extends Composer<_$AppDatabase, $UsersTable> {
  $$UsersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get email =>
      $composableBuilder(column: $table.email, builder: (column) => column);

  GeneratedColumn<String> get phone =>
      $composableBuilder(column: $table.phone, builder: (column) => column);

  GeneratedColumn<String> get role =>
      $composableBuilder(column: $table.role, builder: (column) => column);

  GeneratedColumn<String> get organizationId => $composableBuilder(
      column: $table.organizationId, builder: (column) => column);

  GeneratedColumn<String> get firstName =>
      $composableBuilder(column: $table.firstName, builder: (column) => column);

  GeneratedColumn<String> get lastName =>
      $composableBuilder(column: $table.lastName, builder: (column) => column);

  GeneratedColumn<String> get address =>
      $composableBuilder(column: $table.address, builder: (column) => column);

  GeneratedColumn<String> get idNumber =>
      $composableBuilder(column: $table.idNumber, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<DateTime> get lastLogin =>
      $composableBuilder(column: $table.lastLogin, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<String> get profileJson => $composableBuilder(
      column: $table.profileJson, builder: (column) => column);

  GeneratedColumn<String> get preferencesJson => $composableBuilder(
      column: $table.preferencesJson, builder: (column) => column);
}

class $$UsersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $UsersTable,
    User,
    $$UsersTableFilterComposer,
    $$UsersTableOrderingComposer,
    $$UsersTableAnnotationComposer,
    $$UsersTableCreateCompanionBuilder,
    $$UsersTableUpdateCompanionBuilder,
    (User, BaseReferences<_$AppDatabase, $UsersTable, User>),
    User,
    PrefetchHooks Function()> {
  $$UsersTableTableManager(_$AppDatabase db, $UsersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$UsersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$UsersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$UsersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String?> email = const Value.absent(),
            Value<String?> phone = const Value.absent(),
            Value<String> role = const Value.absent(),
            Value<String?> organizationId = const Value.absent(),
            Value<String> firstName = const Value.absent(),
            Value<String> lastName = const Value.absent(),
            Value<String?> address = const Value.absent(),
            Value<String?> idNumber = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<DateTime?> lastLogin = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<String> profileJson = const Value.absent(),
            Value<String> preferencesJson = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              UsersCompanion(
            id: id,
            email: email,
            phone: phone,
            role: role,
            organizationId: organizationId,
            firstName: firstName,
            lastName: lastName,
            address: address,
            idNumber: idNumber,
            status: status,
            lastLogin: lastLogin,
            createdAt: createdAt,
            updatedAt: updatedAt,
            profileJson: profileJson,
            preferencesJson: preferencesJson,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            Value<String?> email = const Value.absent(),
            Value<String?> phone = const Value.absent(),
            required String role,
            Value<String?> organizationId = const Value.absent(),
            required String firstName,
            required String lastName,
            Value<String?> address = const Value.absent(),
            Value<String?> idNumber = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<DateTime?> lastLogin = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<String> profileJson = const Value.absent(),
            Value<String> preferencesJson = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              UsersCompanion.insert(
            id: id,
            email: email,
            phone: phone,
            role: role,
            organizationId: organizationId,
            firstName: firstName,
            lastName: lastName,
            address: address,
            idNumber: idNumber,
            status: status,
            lastLogin: lastLogin,
            createdAt: createdAt,
            updatedAt: updatedAt,
            profileJson: profileJson,
            preferencesJson: preferencesJson,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$UsersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $UsersTable,
    User,
    $$UsersTableFilterComposer,
    $$UsersTableOrderingComposer,
    $$UsersTableAnnotationComposer,
    $$UsersTableCreateCompanionBuilder,
    $$UsersTableUpdateCompanionBuilder,
    (User, BaseReferences<_$AppDatabase, $UsersTable, User>),
    User,
    PrefetchHooks Function()>;
typedef $$OrganizationsTableCreateCompanionBuilder = OrganizationsCompanion
    Function({
  required String id,
  required String name,
  required String code,
  required String ownerId,
  Value<String?> address,
  Value<String?> phone,
  Value<String?> email,
  Value<String> settingsJson,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});
typedef $$OrganizationsTableUpdateCompanionBuilder = OrganizationsCompanion
    Function({
  Value<String> id,
  Value<String> name,
  Value<String> code,
  Value<String> ownerId,
  Value<String?> address,
  Value<String?> phone,
  Value<String?> email,
  Value<String> settingsJson,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});

class $$OrganizationsTableFilterComposer
    extends Composer<_$AppDatabase, $OrganizationsTable> {
  $$OrganizationsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get code => $composableBuilder(
      column: $table.code, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get ownerId => $composableBuilder(
      column: $table.ownerId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get phone => $composableBuilder(
      column: $table.phone, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get email => $composableBuilder(
      column: $table.email, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get settingsJson => $composableBuilder(
      column: $table.settingsJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$OrganizationsTableOrderingComposer
    extends Composer<_$AppDatabase, $OrganizationsTable> {
  $$OrganizationsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get code => $composableBuilder(
      column: $table.code, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get ownerId => $composableBuilder(
      column: $table.ownerId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get phone => $composableBuilder(
      column: $table.phone, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get email => $composableBuilder(
      column: $table.email, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get settingsJson => $composableBuilder(
      column: $table.settingsJson,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$OrganizationsTableAnnotationComposer
    extends Composer<_$AppDatabase, $OrganizationsTable> {
  $$OrganizationsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get code =>
      $composableBuilder(column: $table.code, builder: (column) => column);

  GeneratedColumn<String> get ownerId =>
      $composableBuilder(column: $table.ownerId, builder: (column) => column);

  GeneratedColumn<String> get address =>
      $composableBuilder(column: $table.address, builder: (column) => column);

  GeneratedColumn<String> get phone =>
      $composableBuilder(column: $table.phone, builder: (column) => column);

  GeneratedColumn<String> get email =>
      $composableBuilder(column: $table.email, builder: (column) => column);

  GeneratedColumn<String> get settingsJson => $composableBuilder(
      column: $table.settingsJson, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$OrganizationsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $OrganizationsTable,
    Organization,
    $$OrganizationsTableFilterComposer,
    $$OrganizationsTableOrderingComposer,
    $$OrganizationsTableAnnotationComposer,
    $$OrganizationsTableCreateCompanionBuilder,
    $$OrganizationsTableUpdateCompanionBuilder,
    (
      Organization,
      BaseReferences<_$AppDatabase, $OrganizationsTable, Organization>
    ),
    Organization,
    PrefetchHooks Function()> {
  $$OrganizationsTableTableManager(_$AppDatabase db, $OrganizationsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$OrganizationsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$OrganizationsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$OrganizationsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String> code = const Value.absent(),
            Value<String> ownerId = const Value.absent(),
            Value<String?> address = const Value.absent(),
            Value<String?> phone = const Value.absent(),
            Value<String?> email = const Value.absent(),
            Value<String> settingsJson = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              OrganizationsCompanion(
            id: id,
            name: name,
            code: code,
            ownerId: ownerId,
            address: address,
            phone: phone,
            email: email,
            settingsJson: settingsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String name,
            required String code,
            required String ownerId,
            Value<String?> address = const Value.absent(),
            Value<String?> phone = const Value.absent(),
            Value<String?> email = const Value.absent(),
            Value<String> settingsJson = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              OrganizationsCompanion.insert(
            id: id,
            name: name,
            code: code,
            ownerId: ownerId,
            address: address,
            phone: phone,
            email: email,
            settingsJson: settingsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$OrganizationsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $OrganizationsTable,
    Organization,
    $$OrganizationsTableFilterComposer,
    $$OrganizationsTableOrderingComposer,
    $$OrganizationsTableAnnotationComposer,
    $$OrganizationsTableCreateCompanionBuilder,
    $$OrganizationsTableUpdateCompanionBuilder,
    (
      Organization,
      BaseReferences<_$AppDatabase, $OrganizationsTable, Organization>
    ),
    Organization,
    PrefetchHooks Function()>;
typedef $$LorriesTableCreateCompanionBuilder = LorriesCompanion Function({
  required String id,
  required String organizationId,
  required String registrationNumber,
  required String driverName,
  required String driverPhone,
  required double capacity,
  Value<String> status,
  Value<String?> currentLocation,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});
typedef $$LorriesTableUpdateCompanionBuilder = LorriesCompanion Function({
  Value<String> id,
  Value<String> organizationId,
  Value<String> registrationNumber,
  Value<String> driverName,
  Value<String> driverPhone,
  Value<double> capacity,
  Value<String> status,
  Value<String?> currentLocation,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});

class $$LorriesTableFilterComposer
    extends Composer<_$AppDatabase, $LorriesTable> {
  $$LorriesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get registrationNumber => $composableBuilder(
      column: $table.registrationNumber,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get driverName => $composableBuilder(
      column: $table.driverName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get driverPhone => $composableBuilder(
      column: $table.driverPhone, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get capacity => $composableBuilder(
      column: $table.capacity, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get currentLocation => $composableBuilder(
      column: $table.currentLocation,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$LorriesTableOrderingComposer
    extends Composer<_$AppDatabase, $LorriesTable> {
  $$LorriesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get registrationNumber => $composableBuilder(
      column: $table.registrationNumber,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get driverName => $composableBuilder(
      column: $table.driverName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get driverPhone => $composableBuilder(
      column: $table.driverPhone, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get capacity => $composableBuilder(
      column: $table.capacity, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get currentLocation => $composableBuilder(
      column: $table.currentLocation,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$LorriesTableAnnotationComposer
    extends Composer<_$AppDatabase, $LorriesTable> {
  $$LorriesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get organizationId => $composableBuilder(
      column: $table.organizationId, builder: (column) => column);

  GeneratedColumn<String> get registrationNumber => $composableBuilder(
      column: $table.registrationNumber, builder: (column) => column);

  GeneratedColumn<String> get driverName => $composableBuilder(
      column: $table.driverName, builder: (column) => column);

  GeneratedColumn<String> get driverPhone => $composableBuilder(
      column: $table.driverPhone, builder: (column) => column);

  GeneratedColumn<double> get capacity =>
      $composableBuilder(column: $table.capacity, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get currentLocation => $composableBuilder(
      column: $table.currentLocation, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$LorriesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LorriesTable,
    Lorry,
    $$LorriesTableFilterComposer,
    $$LorriesTableOrderingComposer,
    $$LorriesTableAnnotationComposer,
    $$LorriesTableCreateCompanionBuilder,
    $$LorriesTableUpdateCompanionBuilder,
    (Lorry, BaseReferences<_$AppDatabase, $LorriesTable, Lorry>),
    Lorry,
    PrefetchHooks Function()> {
  $$LorriesTableTableManager(_$AppDatabase db, $LorriesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LorriesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LorriesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LorriesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> organizationId = const Value.absent(),
            Value<String> registrationNumber = const Value.absent(),
            Value<String> driverName = const Value.absent(),
            Value<String> driverPhone = const Value.absent(),
            Value<double> capacity = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String?> currentLocation = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LorriesCompanion(
            id: id,
            organizationId: organizationId,
            registrationNumber: registrationNumber,
            driverName: driverName,
            driverPhone: driverPhone,
            capacity: capacity,
            status: status,
            currentLocation: currentLocation,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String organizationId,
            required String registrationNumber,
            required String driverName,
            required String driverPhone,
            required double capacity,
            Value<String> status = const Value.absent(),
            Value<String?> currentLocation = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LorriesCompanion.insert(
            id: id,
            organizationId: organizationId,
            registrationNumber: registrationNumber,
            driverName: driverName,
            driverPhone: driverPhone,
            capacity: capacity,
            status: status,
            currentLocation: currentLocation,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$LorriesTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $LorriesTable,
    Lorry,
    $$LorriesTableFilterComposer,
    $$LorriesTableOrderingComposer,
    $$LorriesTableAnnotationComposer,
    $$LorriesTableCreateCompanionBuilder,
    $$LorriesTableUpdateCompanionBuilder,
    (Lorry, BaseReferences<_$AppDatabase, $LorriesTable, Lorry>),
    Lorry,
    PrefetchHooks Function()>;
typedef $$FarmersTableCreateCompanionBuilder = FarmersCompanion Function({
  required String id,
  required String organizationId,
  required String name,
  required String phone,
  Value<String?> village,
  Value<String?> district,
  Value<String?> address,
  Value<String?> idNumber,
  Value<double> totalWeightKg,
  Value<int> totalDeliveries,
  Value<DateTime?> lastDelivery,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});
typedef $$FarmersTableUpdateCompanionBuilder = FarmersCompanion Function({
  Value<String> id,
  Value<String> organizationId,
  Value<String> name,
  Value<String> phone,
  Value<String?> village,
  Value<String?> district,
  Value<String?> address,
  Value<String?> idNumber,
  Value<double> totalWeightKg,
  Value<int> totalDeliveries,
  Value<DateTime?> lastDelivery,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});

class $$FarmersTableFilterComposer
    extends Composer<_$AppDatabase, $FarmersTable> {
  $$FarmersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get phone => $composableBuilder(
      column: $table.phone, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get village => $composableBuilder(
      column: $table.village, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get district => $composableBuilder(
      column: $table.district, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get idNumber => $composableBuilder(
      column: $table.idNumber, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get totalWeightKg => $composableBuilder(
      column: $table.totalWeightKg, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get totalDeliveries => $composableBuilder(
      column: $table.totalDeliveries,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get lastDelivery => $composableBuilder(
      column: $table.lastDelivery, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$FarmersTableOrderingComposer
    extends Composer<_$AppDatabase, $FarmersTable> {
  $$FarmersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get phone => $composableBuilder(
      column: $table.phone, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get village => $composableBuilder(
      column: $table.village, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get district => $composableBuilder(
      column: $table.district, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get idNumber => $composableBuilder(
      column: $table.idNumber, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get totalWeightKg => $composableBuilder(
      column: $table.totalWeightKg,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get totalDeliveries => $composableBuilder(
      column: $table.totalDeliveries,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get lastDelivery => $composableBuilder(
      column: $table.lastDelivery,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$FarmersTableAnnotationComposer
    extends Composer<_$AppDatabase, $FarmersTable> {
  $$FarmersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get organizationId => $composableBuilder(
      column: $table.organizationId, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get phone =>
      $composableBuilder(column: $table.phone, builder: (column) => column);

  GeneratedColumn<String> get village =>
      $composableBuilder(column: $table.village, builder: (column) => column);

  GeneratedColumn<String> get district =>
      $composableBuilder(column: $table.district, builder: (column) => column);

  GeneratedColumn<String> get address =>
      $composableBuilder(column: $table.address, builder: (column) => column);

  GeneratedColumn<String> get idNumber =>
      $composableBuilder(column: $table.idNumber, builder: (column) => column);

  GeneratedColumn<double> get totalWeightKg => $composableBuilder(
      column: $table.totalWeightKg, builder: (column) => column);

  GeneratedColumn<int> get totalDeliveries => $composableBuilder(
      column: $table.totalDeliveries, builder: (column) => column);

  GeneratedColumn<DateTime> get lastDelivery => $composableBuilder(
      column: $table.lastDelivery, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$FarmersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $FarmersTable,
    Farmer,
    $$FarmersTableFilterComposer,
    $$FarmersTableOrderingComposer,
    $$FarmersTableAnnotationComposer,
    $$FarmersTableCreateCompanionBuilder,
    $$FarmersTableUpdateCompanionBuilder,
    (Farmer, BaseReferences<_$AppDatabase, $FarmersTable, Farmer>),
    Farmer,
    PrefetchHooks Function()> {
  $$FarmersTableTableManager(_$AppDatabase db, $FarmersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$FarmersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$FarmersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$FarmersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> organizationId = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String> phone = const Value.absent(),
            Value<String?> village = const Value.absent(),
            Value<String?> district = const Value.absent(),
            Value<String?> address = const Value.absent(),
            Value<String?> idNumber = const Value.absent(),
            Value<double> totalWeightKg = const Value.absent(),
            Value<int> totalDeliveries = const Value.absent(),
            Value<DateTime?> lastDelivery = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              FarmersCompanion(
            id: id,
            organizationId: organizationId,
            name: name,
            phone: phone,
            village: village,
            district: district,
            address: address,
            idNumber: idNumber,
            totalWeightKg: totalWeightKg,
            totalDeliveries: totalDeliveries,
            lastDelivery: lastDelivery,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String organizationId,
            required String name,
            required String phone,
            Value<String?> village = const Value.absent(),
            Value<String?> district = const Value.absent(),
            Value<String?> address = const Value.absent(),
            Value<String?> idNumber = const Value.absent(),
            Value<double> totalWeightKg = const Value.absent(),
            Value<int> totalDeliveries = const Value.absent(),
            Value<DateTime?> lastDelivery = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              FarmersCompanion.insert(
            id: id,
            organizationId: organizationId,
            name: name,
            phone: phone,
            village: village,
            district: district,
            address: address,
            idNumber: idNumber,
            totalWeightKg: totalWeightKg,
            totalDeliveries: totalDeliveries,
            lastDelivery: lastDelivery,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$FarmersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $FarmersTable,
    Farmer,
    $$FarmersTableFilterComposer,
    $$FarmersTableOrderingComposer,
    $$FarmersTableAnnotationComposer,
    $$FarmersTableCreateCompanionBuilder,
    $$FarmersTableUpdateCompanionBuilder,
    (Farmer, BaseReferences<_$AppDatabase, $FarmersTable, Farmer>),
    Farmer,
    PrefetchHooks Function()>;
typedef $$LorryRequestsTableCreateCompanionBuilder = LorryRequestsCompanion
    Function({
  required String id,
  required String organizationId,
  required String fieldManagerId,
  required String purpose,
  required int estimatedFarmers,
  required double estimatedWeight,
  Value<String> urgency,
  Value<String> status,
  Value<String?> assignedLorryId,
  Value<String?> notes,
  required DateTime requestedDate,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});
typedef $$LorryRequestsTableUpdateCompanionBuilder = LorryRequestsCompanion
    Function({
  Value<String> id,
  Value<String> organizationId,
  Value<String> fieldManagerId,
  Value<String> purpose,
  Value<int> estimatedFarmers,
  Value<double> estimatedWeight,
  Value<String> urgency,
  Value<String> status,
  Value<String?> assignedLorryId,
  Value<String?> notes,
  Value<DateTime> requestedDate,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});

class $$LorryRequestsTableFilterComposer
    extends Composer<_$AppDatabase, $LorryRequestsTable> {
  $$LorryRequestsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get fieldManagerId => $composableBuilder(
      column: $table.fieldManagerId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get purpose => $composableBuilder(
      column: $table.purpose, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get estimatedFarmers => $composableBuilder(
      column: $table.estimatedFarmers,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get estimatedWeight => $composableBuilder(
      column: $table.estimatedWeight,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get urgency => $composableBuilder(
      column: $table.urgency, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get assignedLorryId => $composableBuilder(
      column: $table.assignedLorryId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get notes => $composableBuilder(
      column: $table.notes, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get requestedDate => $composableBuilder(
      column: $table.requestedDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$LorryRequestsTableOrderingComposer
    extends Composer<_$AppDatabase, $LorryRequestsTable> {
  $$LorryRequestsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get fieldManagerId => $composableBuilder(
      column: $table.fieldManagerId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get purpose => $composableBuilder(
      column: $table.purpose, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get estimatedFarmers => $composableBuilder(
      column: $table.estimatedFarmers,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get estimatedWeight => $composableBuilder(
      column: $table.estimatedWeight,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get urgency => $composableBuilder(
      column: $table.urgency, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get assignedLorryId => $composableBuilder(
      column: $table.assignedLorryId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get notes => $composableBuilder(
      column: $table.notes, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get requestedDate => $composableBuilder(
      column: $table.requestedDate,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$LorryRequestsTableAnnotationComposer
    extends Composer<_$AppDatabase, $LorryRequestsTable> {
  $$LorryRequestsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get organizationId => $composableBuilder(
      column: $table.organizationId, builder: (column) => column);

  GeneratedColumn<String> get fieldManagerId => $composableBuilder(
      column: $table.fieldManagerId, builder: (column) => column);

  GeneratedColumn<String> get purpose =>
      $composableBuilder(column: $table.purpose, builder: (column) => column);

  GeneratedColumn<int> get estimatedFarmers => $composableBuilder(
      column: $table.estimatedFarmers, builder: (column) => column);

  GeneratedColumn<double> get estimatedWeight => $composableBuilder(
      column: $table.estimatedWeight, builder: (column) => column);

  GeneratedColumn<String> get urgency =>
      $composableBuilder(column: $table.urgency, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get assignedLorryId => $composableBuilder(
      column: $table.assignedLorryId, builder: (column) => column);

  GeneratedColumn<String> get notes =>
      $composableBuilder(column: $table.notes, builder: (column) => column);

  GeneratedColumn<DateTime> get requestedDate => $composableBuilder(
      column: $table.requestedDate, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$LorryRequestsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LorryRequestsTable,
    LorryRequest,
    $$LorryRequestsTableFilterComposer,
    $$LorryRequestsTableOrderingComposer,
    $$LorryRequestsTableAnnotationComposer,
    $$LorryRequestsTableCreateCompanionBuilder,
    $$LorryRequestsTableUpdateCompanionBuilder,
    (
      LorryRequest,
      BaseReferences<_$AppDatabase, $LorryRequestsTable, LorryRequest>
    ),
    LorryRequest,
    PrefetchHooks Function()> {
  $$LorryRequestsTableTableManager(_$AppDatabase db, $LorryRequestsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LorryRequestsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LorryRequestsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LorryRequestsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> organizationId = const Value.absent(),
            Value<String> fieldManagerId = const Value.absent(),
            Value<String> purpose = const Value.absent(),
            Value<int> estimatedFarmers = const Value.absent(),
            Value<double> estimatedWeight = const Value.absent(),
            Value<String> urgency = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String?> assignedLorryId = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            Value<DateTime> requestedDate = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LorryRequestsCompanion(
            id: id,
            organizationId: organizationId,
            fieldManagerId: fieldManagerId,
            purpose: purpose,
            estimatedFarmers: estimatedFarmers,
            estimatedWeight: estimatedWeight,
            urgency: urgency,
            status: status,
            assignedLorryId: assignedLorryId,
            notes: notes,
            requestedDate: requestedDate,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String organizationId,
            required String fieldManagerId,
            required String purpose,
            required int estimatedFarmers,
            required double estimatedWeight,
            Value<String> urgency = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String?> assignedLorryId = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            required DateTime requestedDate,
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LorryRequestsCompanion.insert(
            id: id,
            organizationId: organizationId,
            fieldManagerId: fieldManagerId,
            purpose: purpose,
            estimatedFarmers: estimatedFarmers,
            estimatedWeight: estimatedWeight,
            urgency: urgency,
            status: status,
            assignedLorryId: assignedLorryId,
            notes: notes,
            requestedDate: requestedDate,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$LorryRequestsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $LorryRequestsTable,
    LorryRequest,
    $$LorryRequestsTableFilterComposer,
    $$LorryRequestsTableOrderingComposer,
    $$LorryRequestsTableAnnotationComposer,
    $$LorryRequestsTableCreateCompanionBuilder,
    $$LorryRequestsTableUpdateCompanionBuilder,
    (
      LorryRequest,
      BaseReferences<_$AppDatabase, $LorryRequestsTable, LorryRequest>
    ),
    LorryRequest,
    PrefetchHooks Function()>;
typedef $$LorryTripsTableCreateCompanionBuilder = LorryTripsCompanion Function({
  required String id,
  required String organizationId,
  required String lorryId,
  required String fieldManagerId,
  Value<String?> requestId,
  required DateTime startDate,
  Value<DateTime?> endDate,
  Value<String> status,
  Value<int> farmerCount,
  Value<int> totalBags,
  Value<double> grossKg,
  Value<double> netKg,
  Value<String?> notes,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});
typedef $$LorryTripsTableUpdateCompanionBuilder = LorryTripsCompanion Function({
  Value<String> id,
  Value<String> organizationId,
  Value<String> lorryId,
  Value<String> fieldManagerId,
  Value<String?> requestId,
  Value<DateTime> startDate,
  Value<DateTime?> endDate,
  Value<String> status,
  Value<int> farmerCount,
  Value<int> totalBags,
  Value<double> grossKg,
  Value<double> netKg,
  Value<String?> notes,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});

class $$LorryTripsTableFilterComposer
    extends Composer<_$AppDatabase, $LorryTripsTable> {
  $$LorryTripsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lorryId => $composableBuilder(
      column: $table.lorryId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get fieldManagerId => $composableBuilder(
      column: $table.fieldManagerId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get requestId => $composableBuilder(
      column: $table.requestId, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get startDate => $composableBuilder(
      column: $table.startDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get endDate => $composableBuilder(
      column: $table.endDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get farmerCount => $composableBuilder(
      column: $table.farmerCount, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get totalBags => $composableBuilder(
      column: $table.totalBags, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get grossKg => $composableBuilder(
      column: $table.grossKg, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get netKg => $composableBuilder(
      column: $table.netKg, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get notes => $composableBuilder(
      column: $table.notes, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$LorryTripsTableOrderingComposer
    extends Composer<_$AppDatabase, $LorryTripsTable> {
  $$LorryTripsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lorryId => $composableBuilder(
      column: $table.lorryId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get fieldManagerId => $composableBuilder(
      column: $table.fieldManagerId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get requestId => $composableBuilder(
      column: $table.requestId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get startDate => $composableBuilder(
      column: $table.startDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get endDate => $composableBuilder(
      column: $table.endDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get farmerCount => $composableBuilder(
      column: $table.farmerCount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get totalBags => $composableBuilder(
      column: $table.totalBags, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get grossKg => $composableBuilder(
      column: $table.grossKg, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get netKg => $composableBuilder(
      column: $table.netKg, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get notes => $composableBuilder(
      column: $table.notes, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$LorryTripsTableAnnotationComposer
    extends Composer<_$AppDatabase, $LorryTripsTable> {
  $$LorryTripsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get organizationId => $composableBuilder(
      column: $table.organizationId, builder: (column) => column);

  GeneratedColumn<String> get lorryId =>
      $composableBuilder(column: $table.lorryId, builder: (column) => column);

  GeneratedColumn<String> get fieldManagerId => $composableBuilder(
      column: $table.fieldManagerId, builder: (column) => column);

  GeneratedColumn<String> get requestId =>
      $composableBuilder(column: $table.requestId, builder: (column) => column);

  GeneratedColumn<DateTime> get startDate =>
      $composableBuilder(column: $table.startDate, builder: (column) => column);

  GeneratedColumn<DateTime> get endDate =>
      $composableBuilder(column: $table.endDate, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<int> get farmerCount => $composableBuilder(
      column: $table.farmerCount, builder: (column) => column);

  GeneratedColumn<int> get totalBags =>
      $composableBuilder(column: $table.totalBags, builder: (column) => column);

  GeneratedColumn<double> get grossKg =>
      $composableBuilder(column: $table.grossKg, builder: (column) => column);

  GeneratedColumn<double> get netKg =>
      $composableBuilder(column: $table.netKg, builder: (column) => column);

  GeneratedColumn<String> get notes =>
      $composableBuilder(column: $table.notes, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$LorryTripsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LorryTripsTable,
    LorryTrip,
    $$LorryTripsTableFilterComposer,
    $$LorryTripsTableOrderingComposer,
    $$LorryTripsTableAnnotationComposer,
    $$LorryTripsTableCreateCompanionBuilder,
    $$LorryTripsTableUpdateCompanionBuilder,
    (LorryTrip, BaseReferences<_$AppDatabase, $LorryTripsTable, LorryTrip>),
    LorryTrip,
    PrefetchHooks Function()> {
  $$LorryTripsTableTableManager(_$AppDatabase db, $LorryTripsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LorryTripsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LorryTripsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LorryTripsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> organizationId = const Value.absent(),
            Value<String> lorryId = const Value.absent(),
            Value<String> fieldManagerId = const Value.absent(),
            Value<String?> requestId = const Value.absent(),
            Value<DateTime> startDate = const Value.absent(),
            Value<DateTime?> endDate = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> farmerCount = const Value.absent(),
            Value<int> totalBags = const Value.absent(),
            Value<double> grossKg = const Value.absent(),
            Value<double> netKg = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LorryTripsCompanion(
            id: id,
            organizationId: organizationId,
            lorryId: lorryId,
            fieldManagerId: fieldManagerId,
            requestId: requestId,
            startDate: startDate,
            endDate: endDate,
            status: status,
            farmerCount: farmerCount,
            totalBags: totalBags,
            grossKg: grossKg,
            netKg: netKg,
            notes: notes,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String organizationId,
            required String lorryId,
            required String fieldManagerId,
            Value<String?> requestId = const Value.absent(),
            required DateTime startDate,
            Value<DateTime?> endDate = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> farmerCount = const Value.absent(),
            Value<int> totalBags = const Value.absent(),
            Value<double> grossKg = const Value.absent(),
            Value<double> netKg = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LorryTripsCompanion.insert(
            id: id,
            organizationId: organizationId,
            lorryId: lorryId,
            fieldManagerId: fieldManagerId,
            requestId: requestId,
            startDate: startDate,
            endDate: endDate,
            status: status,
            farmerCount: farmerCount,
            totalBags: totalBags,
            grossKg: grossKg,
            netKg: netKg,
            notes: notes,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$LorryTripsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $LorryTripsTable,
    LorryTrip,
    $$LorryTripsTableFilterComposer,
    $$LorryTripsTableOrderingComposer,
    $$LorryTripsTableAnnotationComposer,
    $$LorryTripsTableCreateCompanionBuilder,
    $$LorryTripsTableUpdateCompanionBuilder,
    (LorryTrip, BaseReferences<_$AppDatabase, $LorryTripsTable, LorryTrip>),
    LorryTrip,
    PrefetchHooks Function()>;
typedef $$DeliveriesTableCreateCompanionBuilder = DeliveriesCompanion Function({
  required String id,
  required String organizationId,
  required String tripId,
  required String farmerId,
  required String farmerName,
  Value<String?> farmerPhone,
  required int numberOfBags,
  required String bagWeightsJson,
  required double moisturePercent,
  required String qualityGrade,
  required double grossWeight,
  Value<double> deductionFixedKg,
  Value<double> qualityDeductionKg,
  required double netWeight,
  Value<String> status,
  Value<String?> notes,
  Value<DateTime> recordedAt,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});
typedef $$DeliveriesTableUpdateCompanionBuilder = DeliveriesCompanion Function({
  Value<String> id,
  Value<String> organizationId,
  Value<String> tripId,
  Value<String> farmerId,
  Value<String> farmerName,
  Value<String?> farmerPhone,
  Value<int> numberOfBags,
  Value<String> bagWeightsJson,
  Value<double> moisturePercent,
  Value<String> qualityGrade,
  Value<double> grossWeight,
  Value<double> deductionFixedKg,
  Value<double> qualityDeductionKg,
  Value<double> netWeight,
  Value<String> status,
  Value<String?> notes,
  Value<DateTime> recordedAt,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});

class $$DeliveriesTableFilterComposer
    extends Composer<_$AppDatabase, $DeliveriesTable> {
  $$DeliveriesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tripId => $composableBuilder(
      column: $table.tripId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get farmerId => $composableBuilder(
      column: $table.farmerId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get farmerName => $composableBuilder(
      column: $table.farmerName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get farmerPhone => $composableBuilder(
      column: $table.farmerPhone, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get numberOfBags => $composableBuilder(
      column: $table.numberOfBags, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get bagWeightsJson => $composableBuilder(
      column: $table.bagWeightsJson,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get moisturePercent => $composableBuilder(
      column: $table.moisturePercent,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get qualityGrade => $composableBuilder(
      column: $table.qualityGrade, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get grossWeight => $composableBuilder(
      column: $table.grossWeight, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get deductionFixedKg => $composableBuilder(
      column: $table.deductionFixedKg,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get qualityDeductionKg => $composableBuilder(
      column: $table.qualityDeductionKg,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get netWeight => $composableBuilder(
      column: $table.netWeight, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get notes => $composableBuilder(
      column: $table.notes, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get recordedAt => $composableBuilder(
      column: $table.recordedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$DeliveriesTableOrderingComposer
    extends Composer<_$AppDatabase, $DeliveriesTable> {
  $$DeliveriesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get organizationId => $composableBuilder(
      column: $table.organizationId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tripId => $composableBuilder(
      column: $table.tripId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get farmerId => $composableBuilder(
      column: $table.farmerId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get farmerName => $composableBuilder(
      column: $table.farmerName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get farmerPhone => $composableBuilder(
      column: $table.farmerPhone, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get numberOfBags => $composableBuilder(
      column: $table.numberOfBags,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get bagWeightsJson => $composableBuilder(
      column: $table.bagWeightsJson,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get moisturePercent => $composableBuilder(
      column: $table.moisturePercent,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get qualityGrade => $composableBuilder(
      column: $table.qualityGrade,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get grossWeight => $composableBuilder(
      column: $table.grossWeight, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get deductionFixedKg => $composableBuilder(
      column: $table.deductionFixedKg,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get qualityDeductionKg => $composableBuilder(
      column: $table.qualityDeductionKg,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get netWeight => $composableBuilder(
      column: $table.netWeight, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get notes => $composableBuilder(
      column: $table.notes, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get recordedAt => $composableBuilder(
      column: $table.recordedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$DeliveriesTableAnnotationComposer
    extends Composer<_$AppDatabase, $DeliveriesTable> {
  $$DeliveriesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get organizationId => $composableBuilder(
      column: $table.organizationId, builder: (column) => column);

  GeneratedColumn<String> get tripId =>
      $composableBuilder(column: $table.tripId, builder: (column) => column);

  GeneratedColumn<String> get farmerId =>
      $composableBuilder(column: $table.farmerId, builder: (column) => column);

  GeneratedColumn<String> get farmerName => $composableBuilder(
      column: $table.farmerName, builder: (column) => column);

  GeneratedColumn<String> get farmerPhone => $composableBuilder(
      column: $table.farmerPhone, builder: (column) => column);

  GeneratedColumn<int> get numberOfBags => $composableBuilder(
      column: $table.numberOfBags, builder: (column) => column);

  GeneratedColumn<String> get bagWeightsJson => $composableBuilder(
      column: $table.bagWeightsJson, builder: (column) => column);

  GeneratedColumn<double> get moisturePercent => $composableBuilder(
      column: $table.moisturePercent, builder: (column) => column);

  GeneratedColumn<String> get qualityGrade => $composableBuilder(
      column: $table.qualityGrade, builder: (column) => column);

  GeneratedColumn<double> get grossWeight => $composableBuilder(
      column: $table.grossWeight, builder: (column) => column);

  GeneratedColumn<double> get deductionFixedKg => $composableBuilder(
      column: $table.deductionFixedKg, builder: (column) => column);

  GeneratedColumn<double> get qualityDeductionKg => $composableBuilder(
      column: $table.qualityDeductionKg, builder: (column) => column);

  GeneratedColumn<double> get netWeight =>
      $composableBuilder(column: $table.netWeight, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get notes =>
      $composableBuilder(column: $table.notes, builder: (column) => column);

  GeneratedColumn<DateTime> get recordedAt => $composableBuilder(
      column: $table.recordedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$DeliveriesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $DeliveriesTable,
    Delivery,
    $$DeliveriesTableFilterComposer,
    $$DeliveriesTableOrderingComposer,
    $$DeliveriesTableAnnotationComposer,
    $$DeliveriesTableCreateCompanionBuilder,
    $$DeliveriesTableUpdateCompanionBuilder,
    (Delivery, BaseReferences<_$AppDatabase, $DeliveriesTable, Delivery>),
    Delivery,
    PrefetchHooks Function()> {
  $$DeliveriesTableTableManager(_$AppDatabase db, $DeliveriesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$DeliveriesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$DeliveriesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$DeliveriesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> organizationId = const Value.absent(),
            Value<String> tripId = const Value.absent(),
            Value<String> farmerId = const Value.absent(),
            Value<String> farmerName = const Value.absent(),
            Value<String?> farmerPhone = const Value.absent(),
            Value<int> numberOfBags = const Value.absent(),
            Value<String> bagWeightsJson = const Value.absent(),
            Value<double> moisturePercent = const Value.absent(),
            Value<String> qualityGrade = const Value.absent(),
            Value<double> grossWeight = const Value.absent(),
            Value<double> deductionFixedKg = const Value.absent(),
            Value<double> qualityDeductionKg = const Value.absent(),
            Value<double> netWeight = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            Value<DateTime> recordedAt = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              DeliveriesCompanion(
            id: id,
            organizationId: organizationId,
            tripId: tripId,
            farmerId: farmerId,
            farmerName: farmerName,
            farmerPhone: farmerPhone,
            numberOfBags: numberOfBags,
            bagWeightsJson: bagWeightsJson,
            moisturePercent: moisturePercent,
            qualityGrade: qualityGrade,
            grossWeight: grossWeight,
            deductionFixedKg: deductionFixedKg,
            qualityDeductionKg: qualityDeductionKg,
            netWeight: netWeight,
            status: status,
            notes: notes,
            recordedAt: recordedAt,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String organizationId,
            required String tripId,
            required String farmerId,
            required String farmerName,
            Value<String?> farmerPhone = const Value.absent(),
            required int numberOfBags,
            required String bagWeightsJson,
            required double moisturePercent,
            required String qualityGrade,
            required double grossWeight,
            Value<double> deductionFixedKg = const Value.absent(),
            Value<double> qualityDeductionKg = const Value.absent(),
            required double netWeight,
            Value<String> status = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            Value<DateTime> recordedAt = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              DeliveriesCompanion.insert(
            id: id,
            organizationId: organizationId,
            tripId: tripId,
            farmerId: farmerId,
            farmerName: farmerName,
            farmerPhone: farmerPhone,
            numberOfBags: numberOfBags,
            bagWeightsJson: bagWeightsJson,
            moisturePercent: moisturePercent,
            qualityGrade: qualityGrade,
            grossWeight: grossWeight,
            deductionFixedKg: deductionFixedKg,
            qualityDeductionKg: qualityDeductionKg,
            netWeight: netWeight,
            status: status,
            notes: notes,
            recordedAt: recordedAt,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$DeliveriesTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $DeliveriesTable,
    Delivery,
    $$DeliveriesTableFilterComposer,
    $$DeliveriesTableOrderingComposer,
    $$DeliveriesTableAnnotationComposer,
    $$DeliveriesTableCreateCompanionBuilder,
    $$DeliveriesTableUpdateCompanionBuilder,
    (Delivery, BaseReferences<_$AppDatabase, $DeliveriesTable, Delivery>),
    Delivery,
    PrefetchHooks Function()>;
typedef $$SyncQueueTableCreateCompanionBuilder = SyncQueueCompanion Function({
  Value<int> id,
  required String operation,
  required String table,
  required String recordId,
  required String dataJson,
  Value<int> retryCount,
  Value<bool> synced,
  Value<DateTime> createdAt,
  Value<DateTime?> lastAttempt,
});
typedef $$SyncQueueTableUpdateCompanionBuilder = SyncQueueCompanion Function({
  Value<int> id,
  Value<String> operation,
  Value<String> table,
  Value<String> recordId,
  Value<String> dataJson,
  Value<int> retryCount,
  Value<bool> synced,
  Value<DateTime> createdAt,
  Value<DateTime?> lastAttempt,
});

class $$SyncQueueTableFilterComposer
    extends Composer<_$AppDatabase, $SyncQueueTable> {
  $$SyncQueueTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get operation => $composableBuilder(
      column: $table.operation, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get table => $composableBuilder(
      column: $table.table, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get recordId => $composableBuilder(
      column: $table.recordId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get dataJson => $composableBuilder(
      column: $table.dataJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get synced => $composableBuilder(
      column: $table.synced, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get lastAttempt => $composableBuilder(
      column: $table.lastAttempt, builder: (column) => ColumnFilters(column));
}

class $$SyncQueueTableOrderingComposer
    extends Composer<_$AppDatabase, $SyncQueueTable> {
  $$SyncQueueTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get operation => $composableBuilder(
      column: $table.operation, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get table => $composableBuilder(
      column: $table.table, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get recordId => $composableBuilder(
      column: $table.recordId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get dataJson => $composableBuilder(
      column: $table.dataJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get synced => $composableBuilder(
      column: $table.synced, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get lastAttempt => $composableBuilder(
      column: $table.lastAttempt, builder: (column) => ColumnOrderings(column));
}

class $$SyncQueueTableAnnotationComposer
    extends Composer<_$AppDatabase, $SyncQueueTable> {
  $$SyncQueueTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get operation =>
      $composableBuilder(column: $table.operation, builder: (column) => column);

  GeneratedColumn<String> get table =>
      $composableBuilder(column: $table.table, builder: (column) => column);

  GeneratedColumn<String> get recordId =>
      $composableBuilder(column: $table.recordId, builder: (column) => column);

  GeneratedColumn<String> get dataJson =>
      $composableBuilder(column: $table.dataJson, builder: (column) => column);

  GeneratedColumn<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => column);

  GeneratedColumn<bool> get synced =>
      $composableBuilder(column: $table.synced, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get lastAttempt => $composableBuilder(
      column: $table.lastAttempt, builder: (column) => column);
}

class $$SyncQueueTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SyncQueueTable,
    SyncQueueData,
    $$SyncQueueTableFilterComposer,
    $$SyncQueueTableOrderingComposer,
    $$SyncQueueTableAnnotationComposer,
    $$SyncQueueTableCreateCompanionBuilder,
    $$SyncQueueTableUpdateCompanionBuilder,
    (
      SyncQueueData,
      BaseReferences<_$AppDatabase, $SyncQueueTable, SyncQueueData>
    ),
    SyncQueueData,
    PrefetchHooks Function()> {
  $$SyncQueueTableTableManager(_$AppDatabase db, $SyncQueueTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SyncQueueTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SyncQueueTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SyncQueueTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> operation = const Value.absent(),
            Value<String> table = const Value.absent(),
            Value<String> recordId = const Value.absent(),
            Value<String> dataJson = const Value.absent(),
            Value<int> retryCount = const Value.absent(),
            Value<bool> synced = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime?> lastAttempt = const Value.absent(),
          }) =>
              SyncQueueCompanion(
            id: id,
            operation: operation,
            table: table,
            recordId: recordId,
            dataJson: dataJson,
            retryCount: retryCount,
            synced: synced,
            createdAt: createdAt,
            lastAttempt: lastAttempt,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String operation,
            required String table,
            required String recordId,
            required String dataJson,
            Value<int> retryCount = const Value.absent(),
            Value<bool> synced = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime?> lastAttempt = const Value.absent(),
          }) =>
              SyncQueueCompanion.insert(
            id: id,
            operation: operation,
            table: table,
            recordId: recordId,
            dataJson: dataJson,
            retryCount: retryCount,
            synced: synced,
            createdAt: createdAt,
            lastAttempt: lastAttempt,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$SyncQueueTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SyncQueueTable,
    SyncQueueData,
    $$SyncQueueTableFilterComposer,
    $$SyncQueueTableOrderingComposer,
    $$SyncQueueTableAnnotationComposer,
    $$SyncQueueTableCreateCompanionBuilder,
    $$SyncQueueTableUpdateCompanionBuilder,
    (
      SyncQueueData,
      BaseReferences<_$AppDatabase, $SyncQueueTable, SyncQueueData>
    ),
    SyncQueueData,
    PrefetchHooks Function()>;
typedef $$ApiCacheTableCreateCompanionBuilder = ApiCacheCompanion Function({
  required String key,
  required String dataJson,
  Value<DateTime> cachedAt,
  required DateTime expiresAt,
  Value<int> rowid,
});
typedef $$ApiCacheTableUpdateCompanionBuilder = ApiCacheCompanion Function({
  Value<String> key,
  Value<String> dataJson,
  Value<DateTime> cachedAt,
  Value<DateTime> expiresAt,
  Value<int> rowid,
});

class $$ApiCacheTableFilterComposer
    extends Composer<_$AppDatabase, $ApiCacheTable> {
  $$ApiCacheTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get key => $composableBuilder(
      column: $table.key, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get dataJson => $composableBuilder(
      column: $table.dataJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get expiresAt => $composableBuilder(
      column: $table.expiresAt, builder: (column) => ColumnFilters(column));
}

class $$ApiCacheTableOrderingComposer
    extends Composer<_$AppDatabase, $ApiCacheTable> {
  $$ApiCacheTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get key => $composableBuilder(
      column: $table.key, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get dataJson => $composableBuilder(
      column: $table.dataJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get expiresAt => $composableBuilder(
      column: $table.expiresAt, builder: (column) => ColumnOrderings(column));
}

class $$ApiCacheTableAnnotationComposer
    extends Composer<_$AppDatabase, $ApiCacheTable> {
  $$ApiCacheTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get key =>
      $composableBuilder(column: $table.key, builder: (column) => column);

  GeneratedColumn<String> get dataJson =>
      $composableBuilder(column: $table.dataJson, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get expiresAt =>
      $composableBuilder(column: $table.expiresAt, builder: (column) => column);
}

class $$ApiCacheTableTableManager extends RootTableManager<
    _$AppDatabase,
    $ApiCacheTable,
    ApiCacheData,
    $$ApiCacheTableFilterComposer,
    $$ApiCacheTableOrderingComposer,
    $$ApiCacheTableAnnotationComposer,
    $$ApiCacheTableCreateCompanionBuilder,
    $$ApiCacheTableUpdateCompanionBuilder,
    (ApiCacheData, BaseReferences<_$AppDatabase, $ApiCacheTable, ApiCacheData>),
    ApiCacheData,
    PrefetchHooks Function()> {
  $$ApiCacheTableTableManager(_$AppDatabase db, $ApiCacheTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ApiCacheTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ApiCacheTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ApiCacheTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> key = const Value.absent(),
            Value<String> dataJson = const Value.absent(),
            Value<DateTime> cachedAt = const Value.absent(),
            Value<DateTime> expiresAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ApiCacheCompanion(
            key: key,
            dataJson: dataJson,
            cachedAt: cachedAt,
            expiresAt: expiresAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String key,
            required String dataJson,
            Value<DateTime> cachedAt = const Value.absent(),
            required DateTime expiresAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              ApiCacheCompanion.insert(
            key: key,
            dataJson: dataJson,
            cachedAt: cachedAt,
            expiresAt: expiresAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$ApiCacheTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $ApiCacheTable,
    ApiCacheData,
    $$ApiCacheTableFilterComposer,
    $$ApiCacheTableOrderingComposer,
    $$ApiCacheTableAnnotationComposer,
    $$ApiCacheTableCreateCompanionBuilder,
    $$ApiCacheTableUpdateCompanionBuilder,
    (ApiCacheData, BaseReferences<_$AppDatabase, $ApiCacheTable, ApiCacheData>),
    ApiCacheData,
    PrefetchHooks Function()>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$UsersTableTableManager get users =>
      $$UsersTableTableManager(_db, _db.users);
  $$OrganizationsTableTableManager get organizations =>
      $$OrganizationsTableTableManager(_db, _db.organizations);
  $$LorriesTableTableManager get lorries =>
      $$LorriesTableTableManager(_db, _db.lorries);
  $$FarmersTableTableManager get farmers =>
      $$FarmersTableTableManager(_db, _db.farmers);
  $$LorryRequestsTableTableManager get lorryRequests =>
      $$LorryRequestsTableTableManager(_db, _db.lorryRequests);
  $$LorryTripsTableTableManager get lorryTrips =>
      $$LorryTripsTableTableManager(_db, _db.lorryTrips);
  $$DeliveriesTableTableManager get deliveries =>
      $$DeliveriesTableTableManager(_db, _db.deliveries);
  $$SyncQueueTableTableManager get syncQueue =>
      $$SyncQueueTableTableManager(_db, _db.syncQueue);
  $$ApiCacheTableTableManager get apiCache =>
      $$ApiCacheTableTableManager(_db, _db.apiCache);
}
