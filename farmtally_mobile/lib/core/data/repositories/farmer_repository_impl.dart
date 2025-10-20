import '../../domain/entities/result.dart';
import '../../domain/entities/failure.dart';
import '../../domain/entities/farmer.dart';
import '../../domain/entities/lorry.dart';
import '../../domain/repositories/farmer_repository.dart';
import '../../domain/usecases/usecase.dart';
import '../../domain/services/sync_service.dart';
import '../../services/api_service.dart';
import '../../services/database_service.dart';

class FarmerRepositoryImpl implements FarmerRepository {
  final ApiService _apiService;
  final DatabaseService _databaseService;
  final SyncService _syncService;

  FarmerRepositoryImpl({
    required ApiService apiService,
    required DatabaseService databaseService,
    required SyncService syncService,
  })  : _apiService = apiService,
        _databaseService = databaseService,
        _syncService = syncService;

  @override
  Future<Result<List<Farmer>>> getFarmers({
    String? organizationId,
    String? search,
    PaginationParams? pagination,
  }) async {
    try {
      // Try API first
      if (await _syncService.isOnline()) {
        try {
          final queryParams = <String, dynamic>{};
          if (organizationId != null) queryParams['organizationId'] = organizationId;
          if (search != null) queryParams['search'] = search;
          if (pagination != null) {
            queryParams['page'] = pagination.page;
            queryParams['limit'] = pagination.limit;
          }

          final response = await _apiService.get('/farmers', queryParameters: queryParams);
          
          if (response['success'] == true) {
            final farmersData = response['data'] as List;
            final farmers = farmersData.map((data) => Farmer.fromJson(data as Map<String, dynamic>)).toList();
            
            // Cache farmers locally
            for (final farmer in farmers) {
              await _databaseService.saveFarmer(farmer.toJson());
            }
            
            return Result.success(farmers);
          }
        } catch (e) {
          print('API call failed, falling back to local data: $e');
        }
      }

      // Fallback to local database
      final localFarmers = await _databaseService.getFarmers(organizationId: organizationId);
      var farmers = localFarmers.map((data) => Farmer.fromJson(data)).toList();

      // Apply search filter if provided
      if (search != null && search.isNotEmpty) {
        final searchLower = search.toLowerCase();
        farmers = farmers.where((farmer) =>
          farmer.name.toLowerCase().contains(searchLower) ||
          farmer.phone.contains(search) ||
          (farmer.village?.toLowerCase().contains(searchLower) ?? false) ||
          (farmer.district?.toLowerCase().contains(searchLower) ?? false)
        ).toList();
      }

      // Apply pagination if provided
      if (pagination != null) {
        final startIndex = (pagination.page - 1) * pagination.limit;
        final endIndex = startIndex + pagination.limit;
        if (startIndex < farmers.length) {
          farmers = farmers.sublist(
            startIndex,
            endIndex > farmers.length ? farmers.length : endIndex,
          );
        } else {
          farmers = [];
        }
      }

      return Result.success(farmers);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get farmers: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<Farmer>> getFarmerById(String id) async {
    try {
      // Try API first
      if (await _syncService.isOnline()) {
        try {
          final response = await _apiService.get('/farmers/$id');
          if (response['success'] == true) {
            final farmerData = response['data'] as Map<String, dynamic>;
            final farmer = Farmer.fromJson(farmerData);
            
            // Cache locally
            await _databaseService.saveFarmer(farmer.toJson());
            
            return Result.success(farmer);
          }
        } catch (e) {
          print('API call failed, falling back to local data: $e');
        }
      }

      // Fallback to local database
      final localFarmer = await _databaseService.getFarmer(id);
      if (localFarmer != null) {
        return Result.success(Farmer.fromJson(localFarmer));
      }

      return const Result.failure(
        Failure.notFound(message: 'Farmer not found'),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get farmer: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<Farmer?>> getFarmerByPhone({
    required String phone,
    required String organizationId,
  }) async {
    try {
      // Try API first
      if (await _syncService.isOnline()) {
        try {
          final response = await _apiService.get('/farmers/by-phone', queryParameters: {
            'phone': phone,
            'organizationId': organizationId,
          });
          if (response['success'] == true) {
            final farmerData = response['data'] as Map<String, dynamic>?;
            if (farmerData != null) {
              final farmer = Farmer.fromJson(farmerData);
              
              // Cache locally
              await _databaseService.saveFarmer(farmer.toJson());
              
              return Result.success(farmer);
            }
            return const Result.success(null);
          }
        } catch (e) {
          print('API call failed, falling back to local data: $e');
        }
      }

      // Fallback to local database
      final localFarmers = await _databaseService.getFarmers(organizationId: organizationId);
      final farmer = localFarmers
          .where((data) => data['phone'] == phone)
          .map((data) => Farmer.fromJson(data))
          .firstOrNull;

      return Result.success(farmer);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get farmer by phone: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<Farmer>> createFarmer({
    required String name,
    required String phone,
    String? village,
    String? district,
    String? address,
    String? idNumber,
  }) async {
    try {
      final farmerData = {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'name': name,
        'phone': phone,
        'village': village,
        'district': district,
        'address': address,
        'idNumber': idNumber,
        'totalWeightKg': 0.0,
        'totalDeliveries': 0,
        'averageDeliveryWeight': 0.0,
        'averageQualityGrade': 'A',
        'totalEarnings': 0.0,
        'pendingPayments': 0.0,
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      };

      // Save locally first
      await _databaseService.saveFarmer(farmerData);

      // Add to sync queue
      await _syncService.addToSyncQueue(
        operation: 'CREATE',
        tableName: 'farmers',
        recordId: farmerData['id'],
        data: farmerData,
      );

      return Result.success(Farmer.fromJson(farmerData));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to create farmer: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<Farmer>> updateFarmer({
    required String id,
    String? name,
    String? phone,
    String? village,
    String? district,
    String? address,
    String? idNumber,
  }) async {
    try {
      // Get existing farmer
      final existingResult = await getFarmerById(id);
      if (existingResult.isFailure) {
        return Result.failure(existingResult.failure!);
      }

      final existingFarmer = existingResult.data!;
      final updatedData = {
        ...existingFarmer.toJson(),
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
        if (village != null) 'village': village,
        if (district != null) 'district': district,
        if (address != null) 'address': address,
        if (idNumber != null) 'idNumber': idNumber,
        'updatedAt': DateTime.now().toIso8601String(),
      };

      // Save locally
      await _databaseService.saveFarmer(updatedData);

      // Add to sync queue
      await _syncService.addToSyncQueue(
        operation: 'UPDATE',
        tableName: 'farmers',
        recordId: id,
        data: updatedData,
      );

      return Result.success(Farmer.fromJson(updatedData));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to update farmer: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<void>> deleteFarmer(String id) async {
    try {
      // Add to sync queue for deletion
      await _syncService.addToSyncQueue(
        operation: 'DELETE',
        tableName: 'farmers',
        recordId: id,
        data: {'id': id},
      );

      return const Result.success(null);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to delete farmer: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<List<Delivery>>> getFarmerDeliveries({
    required String farmerId,
    DateTime? startDate,
    DateTime? endDate,
    PaginationParams? pagination,
  }) async {
    try {
      // Try API first
      if (await _syncService.isOnline()) {
        try {
          final queryParams = <String, dynamic>{
            'farmerId': farmerId,
          };
          if (startDate != null) queryParams['startDate'] = startDate.toIso8601String();
          if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();
          if (pagination != null) {
            queryParams['page'] = pagination.page;
            queryParams['limit'] = pagination.limit;
          }

          final response = await _apiService.get('/farmers/$farmerId/deliveries', queryParameters: queryParams);
          if (response['success'] == true) {
            final deliveriesData = response['data'] as List;
            final deliveries = deliveriesData.map((data) => Delivery.fromJson(data as Map<String, dynamic>)).toList();
            return Result.success(deliveries);
          }
        } catch (e) {
          print('API call failed, falling back to local data: $e');
        }
      }

      // Fallback to local database
      final localDeliveries = await _databaseService.getDeliveries(farmerId: farmerId);
      var deliveries = localDeliveries.map((data) => Delivery.fromJson(data)).toList();

      // Apply date filters
      if (startDate != null) {
        deliveries = deliveries.where((d) => d.recordedAt.isAfter(startDate)).toList();
      }
      if (endDate != null) {
        deliveries = deliveries.where((d) => d.recordedAt.isBefore(endDate)).toList();
      }

      // Sort by recorded date (newest first)
      deliveries.sort((a, b) => b.recordedAt.compareTo(a.recordedAt));

      // Apply pagination
      if (pagination != null) {
        final startIndex = (pagination.page - 1) * pagination.limit;
        final endIndex = startIndex + pagination.limit;
        if (startIndex < deliveries.length) {
          deliveries = deliveries.sublist(
            startIndex,
            endIndex > deliveries.length ? deliveries.length : endIndex,
          );
        } else {
          deliveries = [];
        }
      }

      return Result.success(deliveries);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get farmer deliveries: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<FarmerStatistics>> getFarmerStatistics({
    required String farmerId,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      // Try API first
      if (await _syncService.isOnline()) {
        try {
          final queryParams = <String, dynamic>{};
          if (startDate != null) queryParams['startDate'] = startDate.toIso8601String();
          if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();

          final response = await _apiService.get('/farmers/$farmerId/statistics', queryParameters: queryParams);
          if (response['success'] == true) {
            final statsData = response['data'] as Map<String, dynamic>;
            final statistics = FarmerStatistics(
              farmerId: farmerId,
              totalDeliveries: statsData['totalDeliveries'] ?? 0,
              totalWeightKg: (statsData['totalWeightKg'] ?? 0.0).toDouble(),
              averageWeightPerDelivery: (statsData['averageWeightPerDelivery'] ?? 0.0).toDouble(),
              qualityGradeDistribution: Map<String, int>.from(statsData['qualityGradeDistribution'] ?? {}),
              totalEarnings: (statsData['totalEarnings'] ?? 0.0).toDouble(),
              pendingPayments: (statsData['pendingPayments'] ?? 0.0).toDouble(),
              advanceBalance: (statsData['advanceBalance'] ?? 0.0).toDouble(),
              lastDeliveryDate: statsData['lastDeliveryDate'] != null 
                  ? DateTime.parse(statsData['lastDeliveryDate'])
                  : null,
              averageQualityGrade: statsData['averageQualityGrade'] ?? 'A',
            );
            return Result.success(statistics);
          }
        } catch (e) {
          print('API call failed, calculating from local data: $e');
        }
      }

      // Calculate from local data
      final deliveriesResult = await getFarmerDeliveries(
        farmerId: farmerId,
        startDate: startDate,
        endDate: endDate,
      );

      if (deliveriesResult.isFailure) {
        return Result.failure(deliveriesResult.failure!);
      }

      final deliveries = deliveriesResult.data!;
      
      // Calculate statistics
      final totalDeliveries = deliveries.length;
      final totalWeightKg = deliveries.fold(0.0, (sum, d) => sum + d.netWeight);
      final averageWeightPerDelivery = totalDeliveries > 0 ? totalWeightKg / totalDeliveries : 0.0;
      
      final qualityGradeDistribution = <String, int>{};
      for (final delivery in deliveries) {
        qualityGradeDistribution[delivery.qualityGrade] = 
            (qualityGradeDistribution[delivery.qualityGrade] ?? 0) + 1;
      }

      final lastDeliveryDate = deliveries.isNotEmpty ? deliveries.first.recordedAt : null;
      
      // Calculate average quality grade (simplified)
      String averageQualityGrade = 'A';
      if (qualityGradeDistribution.isNotEmpty) {
        final sortedGrades = qualityGradeDistribution.entries.toList()
          ..sort((a, b) => b.value.compareTo(a.value));
        averageQualityGrade = sortedGrades.first.key;
      }

      final statistics = FarmerStatistics(
        farmerId: farmerId,
        totalDeliveries: totalDeliveries,
        totalWeightKg: totalWeightKg,
        averageWeightPerDelivery: averageWeightPerDelivery,
        qualityGradeDistribution: qualityGradeDistribution,
        totalEarnings: 0.0, // Would need pricing data to calculate
        pendingPayments: 0.0, // Would need payment data to calculate
        advanceBalance: 0.0, // Would need payment data to calculate
        lastDeliveryDate: lastDeliveryDate,
        averageQualityGrade: averageQualityGrade,
      );

      return Result.success(statistics);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get farmer statistics: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<List<FarmerPerformance>>> getFarmersByPerformance({
    String? organizationId,
    DateTime? startDate,
    DateTime? endDate,
    String? sortBy,
    bool ascending = false,
  }) async {
    try {
      // Try API first
      if (await _syncService.isOnline()) {
        try {
          final queryParams = <String, dynamic>{};
          if (organizationId != null) queryParams['organizationId'] = organizationId;
          if (startDate != null) queryParams['startDate'] = startDate.toIso8601String();
          if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();
          if (sortBy != null) queryParams['sortBy'] = sortBy;
          queryParams['ascending'] = ascending;

          final response = await _apiService.get('/farmers/performance', queryParameters: queryParams);
          if (response['success'] == true) {
            final performanceData = response['data'] as List;
            final performances = performanceData.map((data) {
              final farmerData = data['farmer'] as Map<String, dynamic>;
              final statsData = data['statistics'] as Map<String, dynamic>;
              
              return FarmerPerformance(
                farmer: Farmer.fromJson(farmerData),
                statistics: FarmerStatistics(
                  farmerId: statsData['farmerId'],
                  totalDeliveries: statsData['totalDeliveries'] ?? 0,
                  totalWeightKg: (statsData['totalWeightKg'] ?? 0.0).toDouble(),
                  averageWeightPerDelivery: (statsData['averageWeightPerDelivery'] ?? 0.0).toDouble(),
                  qualityGradeDistribution: Map<String, int>.from(statsData['qualityGradeDistribution'] ?? {}),
                  totalEarnings: (statsData['totalEarnings'] ?? 0.0).toDouble(),
                  pendingPayments: (statsData['pendingPayments'] ?? 0.0).toDouble(),
                  advanceBalance: (statsData['advanceBalance'] ?? 0.0).toDouble(),
                  lastDeliveryDate: statsData['lastDeliveryDate'] != null 
                      ? DateTime.parse(statsData['lastDeliveryDate'])
                      : null,
                  averageQualityGrade: statsData['averageQualityGrade'] ?? 'A',
                ),
                performanceRating: data['performanceRating'] ?? 'New',
                performanceScore: (data['performanceScore'] ?? 0.0).toDouble(),
              );
            }).toList();
            
            return Result.success(performances);
          }
        } catch (e) {
          print('API call failed: $e');
        }
      }

      // Return empty list for now - would need complex local calculation
      return const Result.success([]);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get farmers by performance: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<List<Farmer>>> searchFarmers({
    required String query,
    String? organizationId,
    PaginationParams? pagination,
  }) async {
    return getFarmers(
      organizationId: organizationId,
      search: query,
      pagination: pagination,
    );
  }

  @override
  Future<Result<List<FarmerPayment>>> getFarmerPayments({
    required String farmerId,
    DateTime? startDate,
    DateTime? endDate,
    PaginationParams? pagination,
  }) async {
    try {
      if (await _syncService.isOnline()) {
        final queryParams = <String, dynamic>{};
        if (startDate != null) queryParams['startDate'] = startDate.toIso8601String();
        if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();
        if (pagination != null) {
          queryParams['page'] = pagination.page;
          queryParams['limit'] = pagination.limit;
        }

        final response = await _apiService.get('/farmers/$farmerId/payments', queryParameters: queryParams);
        if (response['success'] == true) {
          final paymentsData = response['data'] as List;
          final payments = paymentsData.map((data) => FarmerPayment(
            id: data['id'],
            farmerId: data['farmerId'],
            amount: (data['amount'] ?? 0.0).toDouble(),
            type: data['type'],
            reference: data['reference'],
            notes: data['notes'],
            deliveryIds: List<String>.from(data['deliveryIds'] ?? []),
            createdAt: DateTime.parse(data['createdAt']),
            createdBy: data['createdBy'],
          )).toList();
          
          return Result.success(payments);
        }
      }

      // Return empty list for now - would need local payment storage
      return const Result.success([]);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get farmer payments: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<FarmerPayment>> recordPayment({
    required String farmerId,
    required double amount,
    required String type,
    String? reference,
    String? notes,
    List<String>? deliveryIds,
  }) async {
    try {
      final paymentData = {
        'farmerId': farmerId,
        'amount': amount,
        'type': type,
        'reference': reference,
        'notes': notes,
        'deliveryIds': deliveryIds ?? [],
      };

      if (await _syncService.isOnline()) {
        final response = await _apiService.post('/farmers/$farmerId/payments', paymentData);
        if (response['success'] == true) {
          final responseData = response['data'] as Map<String, dynamic>;
          final payment = FarmerPayment(
            id: responseData['id'],
            farmerId: responseData['farmerId'],
            amount: (responseData['amount'] ?? 0.0).toDouble(),
            type: responseData['type'],
            reference: responseData['reference'],
            notes: responseData['notes'],
            deliveryIds: List<String>.from(responseData['deliveryIds'] ?? []),
            createdAt: DateTime.parse(responseData['createdAt']),
            createdBy: responseData['createdBy'],
          );
          return Result.success(payment);
        }
      }

      return const Result.failure(
        Failure.network(message: 'Cannot record payment while offline'),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to record payment: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<double>> getFarmerAdvanceBalance(String farmerId) async {
    try {
      if (await _syncService.isOnline()) {
        final response = await _apiService.get('/farmers/$farmerId/advance-balance');
        if (response['success'] == true) {
          final balance = (response['data']['balance'] ?? 0.0).toDouble();
          return Result.success(balance);
        }
      }

      // Return 0 for now - would need local payment calculation
      return const Result.success(0.0);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get farmer advance balance: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<void>> updateFarmerStatistics({
    required String farmerId,
    required double weightKg,
    required String qualityGrade,
  }) async {
    try {
      // Get current farmer
      final farmerResult = await getFarmerById(farmerId);
      if (farmerResult.isFailure) {
        return Result.failure(farmerResult.failure!);
      }

      final farmer = farmerResult.data!;
      
      // Calculate new statistics
      final newTotalDeliveries = farmer.totalDeliveries + 1;
      final newTotalWeight = farmer.totalWeightKg + weightKg;
      final newAverageWeight = newTotalWeight / newTotalDeliveries;

      // Update farmer with new statistics
      final updatedData = {
        ...farmer.toJson(),
        'totalDeliveries': newTotalDeliveries,
        'totalWeightKg': newTotalWeight,
        'averageDeliveryWeight': newAverageWeight,
        'lastDelivery': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      };

      // Save locally
      await _databaseService.saveFarmer(updatedData);

      // Add to sync queue
      await _syncService.addToSyncQueue(
        operation: 'UPDATE',
        tableName: 'farmers',
        recordId: farmerId,
        data: updatedData,
      );

      return const Result.success(null);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to update farmer statistics: ${e.toString()}', error: e),
      );
    }
  }
}

// Extension to add firstOrNull method
extension IterableExtension<T> on Iterable<T> {
  T? get firstOrNull {
    final iterator = this.iterator;
    if (iterator.moveNext()) {
      return iterator.current;
    }
    return null;
  }
}