import 'dart:io';
import 'dart:convert';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:sqlite3/sqlite3.dart';
import 'package:sqlite3_flutter_libs/sqlite3_flutter_libs.dart';

import 'tables.dart';
import '../models/user_model.dart';

part 'app_database.g.dart';

@DriftDatabase(tables: [
  Users,
  Organizations,
  Lorries,
  Farmers,
  LorryRequests,
  LorryTrips,
  Deliveries,
  SyncQueue,
  ApiCache,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onCreate: (Migrator m) async {
        await m.createAll();
      },
      onUpgrade: (Migrator m, int from, int to) async {
        // Handle database migrations here
      },
    );
  }

  // User operations
  Future<User?> getUserById(String id) async {
    return await (select(users)..where((u) => u.id.equals(id))).getSingleOrNull();
  }

  Future<User?> getUserByEmail(String email) async {
    return await (select(users)..where((u) => u.email.equals(email))).getSingleOrNull();
  }

  Future<User?> getUserByPhone(String phone) async {
    return await (select(users)..where((u) => u.phone.equals(phone))).getSingleOrNull();
  }

  Future<void> insertUser(UsersCompanion user) async {
    await into(users).insert(user);
  }

  Future<void> updateUser(String id, UsersCompanion user) async {
    await (update(users)..where((u) => u.id.equals(id))).write(user);
  }

  Future<void> deleteUser(String id) async {
    await (delete(users)..where((u) => u.id.equals(id))).go();
  }

  // Organization operations
  Future<Organization?> getOrganizationById(String id) async {
    return await (select(organizations)..where((o) => o.id.equals(id))).getSingleOrNull();
  }

  Future<void> insertOrganization(OrganizationsCompanion organization) async {
    await into(organizations).insert(organization);
  }

  Future<void> updateOrganization(String id, OrganizationsCompanion organization) async {
    await (update(organizations)..where((o) => o.id.equals(id))).write(organization);
  }

  // Lorry operations
  Future<List<Lorry>> getLorriesByOrganization(String organizationId) async {
    return await (select(lorries)..where((l) => l.organizationId.equals(organizationId))).get();
  }

  Future<Lorry?> getLorryById(String id) async {
    return await (select(lorries)..where((l) => l.id.equals(id))).getSingleOrNull();
  }

  Future<void> insertLorry(LorriesCompanion lorry) async {
    await into(lorries).insert(lorry);
  }

  Future<void> updateLorry(String id, LorriesCompanion lorry) async {
    await (update(lorries)..where((l) => l.id.equals(id))).write(lorry);
  }

  Future<void> deleteLorry(String id) async {
    await (delete(lorries)..where((l) => l.id.equals(id))).go();
  }

  // Farmer operations
  Future<List<Farmer>> getFarmersByOrganization(String organizationId) async {
    return await (select(farmers)..where((f) => f.organizationId.equals(organizationId))).get();
  }

  Future<Farmer?> getFarmerById(String id) async {
    return await (select(farmers)..where((f) => f.id.equals(id))).getSingleOrNull();
  }

  Future<Farmer?> getFarmerByPhone(String phone, String organizationId) async {
    return await (select(farmers)
      ..where((f) => f.phone.equals(phone) & f.organizationId.equals(organizationId))
    ).getSingleOrNull();
  }

  Future<void> insertFarmer(FarmersCompanion farmer) async {
    await into(farmers).insert(farmer);
  }

  Future<void> updateFarmer(String id, FarmersCompanion farmer) async {
    await (update(farmers)..where((f) => f.id.equals(id))).write(farmer);
  }

  Future<void> deleteFarmer(String id) async {
    await (delete(farmers)..where((f) => f.id.equals(id))).go();
  }

  // Lorry Request operations
  Future<List<LorryRequest>> getLorryRequestsByOrganization(String organizationId) async {
    return await (select(lorryRequests)
      ..where((lr) => lr.organizationId.equals(organizationId))
      ..orderBy([(lr) => OrderingTerm.desc(lr.createdAt)])
    ).get();
  }

  Future<List<LorryRequest>> getLorryRequestsByFieldManager(String fieldManagerId) async {
    return await (select(lorryRequests)
      ..where((lr) => lr.fieldManagerId.equals(fieldManagerId))
      ..orderBy([(lr) => OrderingTerm.desc(lr.createdAt)])
    ).get();
  }

  Future<LorryRequest?> getLorryRequestById(String id) async {
    return await (select(lorryRequests)..where((lr) => lr.id.equals(id))).getSingleOrNull();
  }

  Future<void> insertLorryRequest(LorryRequestsCompanion request) async {
    await into(lorryRequests).insert(request);
  }

  Future<void> updateLorryRequest(String id, LorryRequestsCompanion request) async {
    await (update(lorryRequests)..where((lr) => lr.id.equals(id))).write(request);
  }

  // Lorry Trip operations
  Future<List<LorryTrip>> getLorryTripsByOrganization(String organizationId) async {
    return await (select(lorryTrips)
      ..where((lt) => lt.organizationId.equals(organizationId))
      ..orderBy([(lt) => OrderingTerm.desc(lt.createdAt)])
    ).get();
  }

  Future<List<LorryTrip>> getLorryTripsByFieldManager(String fieldManagerId) async {
    return await (select(lorryTrips)
      ..where((lt) => lt.fieldManagerId.equals(fieldManagerId))
      ..orderBy([(lt) => OrderingTerm.desc(lt.createdAt)])
    ).get();
  }

  Future<List<LorryTrip>> getLorryTripsByLorry(String lorryId) async {
    return await (select(lorryTrips)
      ..where((lt) => lt.lorryId.equals(lorryId))
      ..orderBy([(lt) => OrderingTerm.desc(lt.createdAt)])
    ).get();
  }

  Future<LorryTrip?> getLorryTripById(String id) async {
    return await (select(lorryTrips)..where((lt) => lt.id.equals(id))).getSingleOrNull();
  }

  Future<void> insertLorryTrip(LorryTripsCompanion trip) async {
    await into(lorryTrips).insert(trip);
  }

  Future<void> updateLorryTrip(String id, LorryTripsCompanion trip) async {
    await (update(lorryTrips)..where((lt) => lt.id.equals(id))).write(trip);
  }

  // Delivery operations
  Future<List<Delivery>> getDeliveriesByTrip(String tripId) async {
    return await (select(deliveries)
      ..where((d) => d.tripId.equals(tripId))
      ..orderBy([(d) => OrderingTerm.desc(d.createdAt)])
    ).get();
  }

  Future<List<Delivery>> getDeliveriesByFarmer(String farmerId) async {
    return await (select(deliveries)
      ..where((d) => d.farmerId.equals(farmerId))
      ..orderBy([(d) => OrderingTerm.desc(d.createdAt)])
    ).get();
  }

  Future<Delivery?> getDeliveryById(String id) async {
    return await (select(deliveries)..where((d) => d.id.equals(id))).getSingleOrNull();
  }

  Future<void> insertDelivery(DeliveriesCompanion delivery) async {
    await into(deliveries).insert(delivery);
  }

  Future<void> updateDelivery(String id, DeliveriesCompanion delivery) async {
    await (update(deliveries)..where((d) => d.id.equals(id))).write(delivery);
  }

  Future<void> deleteDelivery(String id) async {
    await (delete(deliveries)..where((d) => d.id.equals(id))).go();
  }

  // Sync Queue operations
  Future<List<SyncQueueData>> getPendingSyncItems() async {
    return await (select(syncQueue)
      ..where((sq) => sq.synced.equals(false))
      ..orderBy([(sq) => OrderingTerm.asc(sq.createdAt)])
    ).get();
  }

  Future<void> addToSyncQueue({
    required String operation,
    required String tableName,
    required String recordId,
    required Map<String, dynamic> data,
  }) async {
    await into(syncQueue).insert(SyncQueueCompanion.insert(
      operation: operation,
      table: tableName,
      recordId: recordId,
      dataJson: json.encode(data),
    ));
  }

  Future<void> markSyncItemCompleted(int id) async {
    await (update(syncQueue)..where((sq) => sq.id.equals(id)))
        .write(const SyncQueueCompanion(synced: Value(true)));
  }

  Future<void> incrementSyncRetryCount(int id) async {
    final item = await (select(syncQueue)..where((sq) => sq.id.equals(id))).getSingle();
    await (update(syncQueue)..where((sq) => sq.id.equals(id))).write(
      SyncQueueCompanion(
        retryCount: Value(item.retryCount + 1),
        lastAttempt: Value(DateTime.now()),
      ),
    );
  }

  Future<void> clearSyncQueue() async {
    await delete(syncQueue).go();
  }

  // API Cache operations
  Future<void> cacheApiResponse({
    required String key,
    required dynamic data,
    required DateTime expiresAt,
  }) async {
    await into(apiCache).insertOnConflictUpdate(ApiCacheCompanion.insert(
      key: key,
      dataJson: json.encode(data),
      expiresAt: expiresAt,
    ));
  }

  Future<Map<String, dynamic>?> getCachedApiResponse(String key) async {
    final cached = await (select(apiCache)..where((ac) => ac.key.equals(key))).getSingleOrNull();
    
    if (cached != null) {
      if (DateTime.now().isBefore(cached.expiresAt)) {
        return json.decode(cached.dataJson) as Map<String, dynamic>;
      } else {
        // Remove expired cache
        await (delete(apiCache)..where((ac) => ac.key.equals(key))).go();
      }
    }
    
    return null;
  }

  Future<void> clearExpiredCache() async {
    await (delete(apiCache)..where((ac) => ac.expiresAt.isSmallerThanValue(DateTime.now()))).go();
  }

  Future<void> clearAllCache() async {
    await delete(apiCache).go();
  }

  // Utility methods
  Future<void> clearAllData() async {
    await transaction(() async {
      await delete(deliveries).go();
      await delete(lorryTrips).go();
      await delete(lorryRequests).go();
      await delete(farmers).go();
      await delete(lorries).go();
      await delete(organizations).go();
      await delete(users).go();
      await delete(syncQueue).go();
      await delete(apiCache).go();
    });
  }

  // Helper methods for converting between models and database entities
  UsersCompanion userModelToCompanion(UserModel user) {
    return UsersCompanion.insert(
      id: user.id,
      email: Value(user.email),
      phone: Value(user.phone),
      role: user.role,
      organizationId: Value(user.organizationId),
      firstName: user.firstName,
      lastName: user.lastName,
      address: Value(user.address),
      idNumber: Value(user.idNumber),
      status: user.status,
      lastLogin: Value(user.lastLogin),
      profileJson: json.encode(user.profile),
      preferencesJson: json.encode(user.preferences),
      createdAt: Value(user.createdAt),
      updatedAt: Value(user.updatedAt),
    );
  }

  UserModel userEntityToModel(User user, OrganizationModel? organization) {
    return UserModel(
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      organizationId: user.organizationId,
      profile: json.decode(user.profileJson) as Map<String, dynamic>,
      preferences: json.decode(user.preferencesJson) as Map<String, dynamic>,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      organization: organization,
    );
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'farmtally.db'));

    // Make sure sqlite3 is available on mobile platforms
    if (Platform.isAndroid) {
      await applyWorkaroundToOpenSqlite3OnOldAndroidVersions();
    }

    final cachebase = (await getTemporaryDirectory()).path;
    sqlite3.tempDirectory = cachebase;

    return NativeDatabase.createInBackground(file);
  });
}