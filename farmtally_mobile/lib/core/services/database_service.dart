import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../database/app_database.dart';
import '../domain/entities/user.dart';

class DatabaseService {
  static DatabaseService? _instance;
  static DatabaseService get instance => _instance ??= DatabaseService._();
  
  DatabaseService._();
  
  late AppDatabase _database;

  Future<void> initialize() async {
    _database = AppDatabase();
    print('✅ Database initialized with Drift SQLite');
  }

  Future<void> close() async {
    await _database.close();
  }

  AppDatabase get database => _database;

  // User operations
  Future<void> saveUser(User user) async {
    final companion = UsersCompanion.insert(
      id: user.id,
      email: Value(user.email),
      phone: Value(user.phone),
      role: user.role,
      organizationId: Value(user.organizationId),
      firstName: user.firstName,
      lastName: user.lastName,
      address: Value(user.address),
      idNumber: Value(user.idNumber),
      status: Value(user.status),
      lastLogin: Value(user.lastLogin),
      createdAt: Value(user.createdAt),
      updatedAt: Value(user.updatedAt),
    );
    await _database.into(_database.users).insertOnConflictUpdate(companion);
  }

  Future<User?> getUser(String id) async {
    final userRow = await _database.getUserById(id);
    if (userRow == null) return null;
    
    Organization? organization;
    if (userRow.organizationId != null) {
      final org = await _database.getOrganizationById(userRow.organizationId!);
      if (org != null) {
        organization = Organization(
          id: org.id,
          name: org.name,
          code: org.code,
          ownerId: org.ownerId,
          address: org.address,
          phone: org.phone,
          email: org.email,
          settings: json.decode(org.settingsJson) as Map<String, dynamic>,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
        );
      }
    }
    
    return User(
      id: userRow.id,
      email: userRow.email,
      phone: userRow.phone,
      role: userRow.role,
      organizationId: userRow.organizationId,
      firstName: userRow.firstName,
      lastName: userRow.lastName,
      address: userRow.address,
      idNumber: userRow.idNumber,
      status: userRow.status,
      lastLogin: userRow.lastLogin,
      createdAt: userRow.createdAt,
      updatedAt: userRow.updatedAt,
      organization: organization,
    );
  }

  Future<User?> getUserByEmail(String email) async {
    final userRow = await _database.getUserByEmail(email);
    if (userRow == null) return null;
    
    Organization? organization;
    if (userRow.organizationId != null) {
      final org = await _database.getOrganizationById(userRow.organizationId!);
      if (org != null) {
        organization = Organization(
          id: org.id,
          name: org.name,
          code: org.code,
          ownerId: org.ownerId,
          address: org.address,
          phone: org.phone,
          email: org.email,
          settings: json.decode(org.settingsJson) as Map<String, dynamic>,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
        );
      }
    }
    
    return User(
      id: userRow.id,
      email: userRow.email,
      phone: userRow.phone,
      role: userRow.role,
      organizationId: userRow.organizationId,
      firstName: userRow.firstName,
      lastName: userRow.lastName,
      address: userRow.address,
      idNumber: userRow.idNumber,
      status: userRow.status,
      lastLogin: userRow.lastLogin,
      createdAt: userRow.createdAt,
      updatedAt: userRow.updatedAt,
      organization: organization,
    );
  }

  Future<User?> getUserByPhone(String phone) async {
    final userRow = await _database.getUserByPhone(phone);
    if (userRow == null) return null;
    
    Organization? organization;
    if (userRow.organizationId != null) {
      final org = await _database.getOrganizationById(userRow.organizationId!);
      if (org != null) {
        organization = Organization(
          id: org.id,
          name: org.name,
          code: org.code,
          ownerId: org.ownerId,
          address: org.address,
          phone: org.phone,
          email: org.email,
          settings: json.decode(org.settingsJson) as Map<String, dynamic>,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
        );
      }
    }
    
    return User(
      id: userRow.id,
      email: userRow.email,
      phone: userRow.phone,
      role: userRow.role,
      organizationId: userRow.organizationId,
      firstName: userRow.firstName,
      lastName: userRow.lastName,
      address: userRow.address,
      idNumber: userRow.idNumber,
      status: userRow.status,
      lastLogin: userRow.lastLogin,
      createdAt: userRow.createdAt,
      updatedAt: userRow.updatedAt,
      organization: organization,
    );
  }

  Future<void> deleteUser(String id) async {
    await _database.deleteUser(id);
  }

  // Organization operations
  Future<void> saveOrganization(Organization organization) async {
    final companion = OrganizationsCompanion.insert(
      id: organization.id,
      name: organization.name,
      code: organization.code,
      ownerId: organization.ownerId,
      address: Value(organization.address),
      phone: Value(organization.phone),
      email: Value(organization.email),
      settingsJson: json.encode(organization.settings),
      createdAt: Value(organization.createdAt),
      updatedAt: Value(organization.updatedAt),
    );
    await _database.into(_database.organizations).insertOnConflictUpdate(companion);
  }

  Future<Organization?> getOrganization(String id) async {
    final org = await _database.getOrganizationById(id);
    if (org == null) return null;
    
    return Organization(
      id: org.id,
      name: org.name,
      code: org.code,
      ownerId: org.ownerId,
      address: org.address,
      phone: org.phone,
      email: org.email,
      settings: json.decode(org.settingsJson) as Map<String, dynamic>,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    );
  }

  // Lorry operations
  Future<void> saveLorry(Map<String, dynamic> lorry) async {
    final companion = LorriesCompanion.insert(
      id: lorry['id'],
      organizationId: lorry['organizationId'],
      registrationNumber: lorry['registrationNumber'],
      driverName: lorry['driverName'],
      driverPhone: lorry['driverPhone'],
      capacity: lorry['capacity'].toDouble(),
      status: Value(lorry['status'] ?? 'AVAILABLE'),
      currentLocation: Value(lorry['currentLocation']),
      createdAt: Value(DateTime.parse(lorry['createdAt'] ?? DateTime.now().toIso8601String())),
      updatedAt: Value(DateTime.parse(lorry['updatedAt'] ?? DateTime.now().toIso8601String())),
    );
    await _database.into(_database.lorries).insertOnConflictUpdate(companion);
  }

  Future<List<Map<String, dynamic>>> getLorries({String? organizationId}) async {
    List<Lorry> lorries;
    if (organizationId != null) {
      lorries = await _database.getLorriesByOrganization(organizationId);
    } else {
      lorries = await _database.select(_database.lorries).get();
    }
    
    return lorries.map((l) => {
      'id': l.id,
      'organizationId': l.organizationId,
      'registrationNumber': l.registrationNumber,
      'driverName': l.driverName,
      'driverPhone': l.driverPhone,
      'capacity': l.capacity,
      'status': l.status,
      'currentLocation': l.currentLocation,
      'createdAt': l.createdAt.toIso8601String(),
      'updatedAt': l.updatedAt.toIso8601String(),
    }).toList();
  }

  Future<Map<String, dynamic>?> getLorry(String id) async {
    final lorry = await _database.getLorryById(id);
    if (lorry == null) return null;
    
    return {
      'id': lorry.id,
      'organizationId': lorry.organizationId,
      'registrationNumber': lorry.registrationNumber,
      'driverName': lorry.driverName,
      'driverPhone': lorry.driverPhone,
      'capacity': lorry.capacity,
      'status': lorry.status,
      'currentLocation': lorry.currentLocation,
      'createdAt': lorry.createdAt.toIso8601String(),
      'updatedAt': lorry.updatedAt.toIso8601String(),
    };
  }

  // Farmer operations
  Future<void> saveFarmer(Map<String, dynamic> farmer) async {
    final companion = FarmersCompanion.insert(
      id: farmer['id'],
      organizationId: farmer['organizationId'],
      name: farmer['name'],
      phone: farmer['phone'],
      village: Value(farmer['village']),
      district: Value(farmer['district']),
      address: Value(farmer['address']),
      idNumber: Value(farmer['idNumber']),
      totalWeightKg: Value(farmer['totalWeightKg']?.toDouble() ?? 0.0),
      totalDeliveries: Value(farmer['totalDeliveries'] ?? 0),
      lastDelivery: Value(farmer['lastDelivery'] != null ? DateTime.parse(farmer['lastDelivery']) : null),
      createdAt: Value(DateTime.parse(farmer['createdAt'] ?? DateTime.now().toIso8601String())),
      updatedAt: Value(DateTime.parse(farmer['updatedAt'] ?? DateTime.now().toIso8601String())),
    );
    await _database.into(_database.farmers).insertOnConflictUpdate(companion);
  }

  Future<List<Map<String, dynamic>>> getFarmers({String? organizationId}) async {
    List<Farmer> farmers;
    if (organizationId != null) {
      farmers = await _database.getFarmersByOrganization(organizationId);
    } else {
      farmers = await _database.select(_database.farmers).get();
    }
    
    return farmers.map((f) => {
      'id': f.id,
      'organizationId': f.organizationId,
      'name': f.name,
      'phone': f.phone,
      'village': f.village,
      'district': f.district,
      'address': f.address,
      'idNumber': f.idNumber,
      'totalWeightKg': f.totalWeightKg,
      'totalDeliveries': f.totalDeliveries,
      'lastDelivery': f.lastDelivery?.toIso8601String(),
      'createdAt': f.createdAt.toIso8601String(),
      'updatedAt': f.updatedAt.toIso8601String(),
    }).toList();
  }

  Future<Map<String, dynamic>?> getFarmer(String id) async {
    final farmer = await _database.getFarmerById(id);
    if (farmer == null) return null;
    
    return {
      'id': farmer.id,
      'organizationId': farmer.organizationId,
      'name': farmer.name,
      'phone': farmer.phone,
      'village': farmer.village,
      'district': farmer.district,
      'address': farmer.address,
      'idNumber': farmer.idNumber,
      'totalWeightKg': farmer.totalWeightKg,
      'totalDeliveries': farmer.totalDeliveries,
      'lastDelivery': farmer.lastDelivery?.toIso8601String(),
      'createdAt': farmer.createdAt.toIso8601String(),
      'updatedAt': farmer.updatedAt.toIso8601String(),
    };
  }

  // Delivery operations
  Future<void> saveDelivery(Map<String, dynamic> delivery) async {
    final companion = DeliveriesCompanion.insert(
      id: delivery['id'],
      organizationId: delivery['organizationId'],
      tripId: delivery['tripId'],
      farmerId: delivery['farmerId'],
      farmerName: delivery['farmerName'],
      farmerPhone: Value(delivery['farmerPhone']),
      numberOfBags: delivery['numberOfBags'],
      bagWeightsJson: json.encode(delivery['bagWeights'] ?? []),
      moisturePercent: delivery['moisturePercent'].toDouble(),
      qualityGrade: delivery['qualityGrade'],
      grossWeight: delivery['grossWeight'].toDouble(),
      deductionFixedKg: Value(delivery['deductionFixedKg']?.toDouble() ?? 0.0),
      qualityDeductionKg: Value(delivery['qualityDeductionKg']?.toDouble() ?? 0.0),
      netWeight: delivery['netWeight'].toDouble(),
      status: Value(delivery['status'] ?? 'PENDING'),
      notes: Value(delivery['notes']),
      recordedAt: Value(DateTime.parse(delivery['recordedAt'] ?? DateTime.now().toIso8601String())),
      createdAt: Value(DateTime.parse(delivery['createdAt'] ?? DateTime.now().toIso8601String())),
      updatedAt: Value(DateTime.parse(delivery['updatedAt'] ?? DateTime.now().toIso8601String())),
    );
    await _database.into(_database.deliveries).insertOnConflictUpdate(companion);
  }

  Future<List<Map<String, dynamic>>> getDeliveries({
    String? organizationId,
    String? tripId,
    String? farmerId,
  }) async {
    var query = _database.select(_database.deliveries);
    
    if (organizationId != null) {
      query = query..where((d) => d.organizationId.equals(organizationId));
    }
    if (tripId != null) {
      query = query..where((d) => d.tripId.equals(tripId));
    }
    if (farmerId != null) {
      query = query..where((d) => d.farmerId.equals(farmerId));
    }
    
    final deliveries = await query.get();
    
    return deliveries.map((d) => {
      'id': d.id,
      'organizationId': d.organizationId,
      'tripId': d.tripId,
      'farmerId': d.farmerId,
      'farmerName': d.farmerName,
      'farmerPhone': d.farmerPhone,
      'numberOfBags': d.numberOfBags,
      'bagWeights': json.decode(d.bagWeightsJson),
      'moisturePercent': d.moisturePercent,
      'qualityGrade': d.qualityGrade,
      'grossWeight': d.grossWeight,
      'deductionFixedKg': d.deductionFixedKg,
      'qualityDeductionKg': d.qualityDeductionKg,
      'netWeight': d.netWeight,
      'status': d.status,
      'notes': d.notes,
      'recordedAt': d.recordedAt.toIso8601String(),
      'createdAt': d.createdAt.toIso8601String(),
      'updatedAt': d.updatedAt.toIso8601String(),
    }).toList();
  }

  Future<Map<String, dynamic>?> getDelivery(String id) async {
    final delivery = await _database.getDeliveryById(id);
    if (delivery == null) return null;
    
    return {
      'id': delivery.id,
      'organizationId': delivery.organizationId,
      'tripId': delivery.tripId,
      'farmerId': delivery.farmerId,
      'farmerName': delivery.farmerName,
      'farmerPhone': delivery.farmerPhone,
      'numberOfBags': delivery.numberOfBags,
      'bagWeights': json.decode(delivery.bagWeightsJson),
      'moisturePercent': delivery.moisturePercent,
      'qualityGrade': delivery.qualityGrade,
      'grossWeight': delivery.grossWeight,
      'deductionFixedKg': delivery.deductionFixedKg,
      'qualityDeductionKg': delivery.qualityDeductionKg,
      'netWeight': delivery.netWeight,
      'status': delivery.status,
      'notes': delivery.notes,
      'recordedAt': delivery.recordedAt.toIso8601String(),
      'createdAt': delivery.createdAt.toIso8601String(),
      'updatedAt': delivery.updatedAt.toIso8601String(),
    };
  }

  // API Cache operations
  Future<void> cacheApiResponse({
    required String key,
    required dynamic data,
    required DateTime expiresAt,
  }) async {
    await _database.cacheApiResponse(key: key, data: data, expiresAt: expiresAt);
  }

  Future<Map<String, dynamic>?> getCachedApiResponse(String key) async {
    return await _database.getCachedApiResponse(key);
  }

  Future<void> clearExpiredCache() async {
    await _database.clearExpiredCache();
  }

  // Sync Queue operations
  Future<void> addToSyncQueue({
    required String operation,
    required String tableName,
    required String recordId,
    required Map<String, dynamic> data,
  }) async {
    await _database.addToSyncQueue(
      operation: operation,
      tableName: tableName,
      recordId: recordId,
      data: data,
    );
  }

  Future<List<Map<String, dynamic>>> getPendingSyncItems() async {
    final items = await _database.getPendingSyncItems();
    return items.map((item) => {
      'id': item.id,
      'operation': item.operation,
      'tableName': item.table,
      'recordId': item.recordId,
      'data': json.decode(item.dataJson),
      'retryCount': item.retryCount,
      'synced': item.synced,
      'createdAt': item.createdAt.toIso8601String(),
      'lastAttempt': item.lastAttempt?.toIso8601String(),
    }).toList();
  }

  Future<void> markSyncItemCompleted(int id) async {
    await _database.markSyncItemCompleted(id);
  }

  Future<void> incrementSyncRetryCount(int id) async {
    await _database.incrementSyncRetryCount(id);
  }

  Future<void> clearSyncQueue() async {
    await _database.clearSyncQueue();
  }

  // Utility methods
  Future<void> clearAllData() async {
    await _database.clearAllData();
  }
}

// Provider for database service
final databaseServiceProvider = Provider<DatabaseService>((ref) {
  return DatabaseService.instance;
});