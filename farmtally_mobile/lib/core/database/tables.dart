import 'package:drift/drift.dart';

// Users table
class Users extends Table {
  TextColumn get id => text()();
  TextColumn get email => text().nullable()();
  TextColumn get phone => text().nullable()();
  TextColumn get role => text()();
  TextColumn get organizationId => text().nullable()();
  TextColumn get firstName => text()();
  TextColumn get lastName => text()();
  TextColumn get address => text().nullable()();
  TextColumn get idNumber => text().nullable()();
  TextColumn get status => text().withDefault(const Constant('ACTIVE'))();
  DateTimeColumn get lastLogin => dateTime().nullable()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
  TextColumn get profileJson => text().withDefault(const Constant('{}'))();
  TextColumn get preferencesJson => text().withDefault(const Constant('{}'))();

  @override
  Set<Column> get primaryKey => {id};
}

// Organizations table
class Organizations extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get code => text()();
  TextColumn get ownerId => text()();
  TextColumn get address => text().nullable()();
  TextColumn get phone => text().nullable()();
  TextColumn get email => text().nullable()();
  TextColumn get settingsJson => text().withDefault(const Constant('{}'))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// Lorries table
class Lorries extends Table {
  TextColumn get id => text()();
  TextColumn get organizationId => text()();
  TextColumn get registrationNumber => text()();
  TextColumn get driverName => text()();
  TextColumn get driverPhone => text()();
  RealColumn get capacity => real()();
  TextColumn get status => text().withDefault(const Constant('AVAILABLE'))();
  TextColumn get currentLocation => text().nullable()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// Farmers table
class Farmers extends Table {
  TextColumn get id => text()();
  TextColumn get organizationId => text()();
  TextColumn get name => text()();
  TextColumn get phone => text()();
  TextColumn get village => text().nullable()();
  TextColumn get district => text().nullable()();
  TextColumn get address => text().nullable()();
  TextColumn get idNumber => text().nullable()();
  RealColumn get totalWeightKg => real().withDefault(const Constant(0.0))();
  IntColumn get totalDeliveries => integer().withDefault(const Constant(0))();
  DateTimeColumn get lastDelivery => dateTime().nullable()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// Lorry Requests table
class LorryRequests extends Table {
  TextColumn get id => text()();
  TextColumn get organizationId => text()();
  TextColumn get fieldManagerId => text()();
  TextColumn get purpose => text()();
  IntColumn get estimatedFarmers => integer()();
  RealColumn get estimatedWeight => real()();
  TextColumn get urgency => text().withDefault(const Constant('NORMAL'))();
  TextColumn get status => text().withDefault(const Constant('PENDING'))();
  TextColumn get assignedLorryId => text().nullable()();
  TextColumn get notes => text().nullable()();
  DateTimeColumn get requestedDate => dateTime()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// Lorry Trips table
class LorryTrips extends Table {
  TextColumn get id => text()();
  TextColumn get organizationId => text()();
  TextColumn get lorryId => text()();
  TextColumn get fieldManagerId => text()();
  TextColumn get requestId => text().nullable()();
  DateTimeColumn get startDate => dateTime()();
  DateTimeColumn get endDate => dateTime().nullable()();
  TextColumn get status => text().withDefault(const Constant('IN_PROGRESS'))();
  IntColumn get farmerCount => integer().withDefault(const Constant(0))();
  IntColumn get totalBags => integer().withDefault(const Constant(0))();
  RealColumn get grossKg => real().withDefault(const Constant(0.0))();
  RealColumn get netKg => real().withDefault(const Constant(0.0))();
  TextColumn get notes => text().nullable()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// Deliveries table
class Deliveries extends Table {
  TextColumn get id => text()();
  TextColumn get organizationId => text()();
  TextColumn get tripId => text()();
  TextColumn get farmerId => text()();
  TextColumn get farmerName => text()();
  TextColumn get farmerPhone => text().nullable()();
  IntColumn get numberOfBags => integer()();
  TextColumn get bagWeightsJson => text()(); // JSON array of weights
  RealColumn get moisturePercent => real()();
  TextColumn get qualityGrade => text()();
  RealColumn get grossWeight => real()();
  RealColumn get deductionFixedKg => real().withDefault(const Constant(0.0))();
  RealColumn get qualityDeductionKg => real().withDefault(const Constant(0.0))();
  RealColumn get netWeight => real()();
  TextColumn get status => text().withDefault(const Constant('PENDING'))();
  TextColumn get notes => text().nullable()();
  DateTimeColumn get recordedAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// Sync Queue table for offline support
class SyncQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get operation => text()(); // CREATE, UPDATE, DELETE
  TextColumn get table => text()();
  TextColumn get recordId => text()();
  TextColumn get dataJson => text()();
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  BoolColumn get synced => boolean().withDefault(const Constant(false))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get lastAttempt => dateTime().nullable()();
}

// API Cache table
class ApiCache extends Table {
  TextColumn get key => text()();
  TextColumn get dataJson => text()();
  DateTimeColumn get cachedAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get expiresAt => dateTime()();

  @override
  Set<Column> get primaryKey => {key};
}