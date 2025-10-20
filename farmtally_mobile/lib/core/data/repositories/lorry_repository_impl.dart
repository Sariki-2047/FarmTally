import 'dart:convert';

import '../../domain/entities/result.dart';
import '../../domain/entities/failure.dart';
import '../../domain/entities/lorry.dart';
import '../../domain/repositories/lorry_repository.dart';
import '../../domain/usecases/usecase.dart';
import '../../domain/services/sync_service.dart';
import '../../services/api_service.dart';
import '../../services/database_service.dart';

class LorryRepositoryImpl implements LorryRepository {
  final ApiService _apiService;
  final DatabaseService _databaseService;
  final SyncService _syncService;

  LorryRepositoryImpl({
    required ApiService apiService,
    required DatabaseService databaseService,
    required SyncService syncService,
  })  : _apiService = apiService,
        _databaseService = databaseService,
        _syncService = syncService;

  @override
  Future<Result<List<Lorry>>> getLorries({
    String? organizationId,
    String? status,
    PaginationParams? pagination,
  }) async {
    try {
      // Try to get from API first
      if (await _syncService.isOnline()) {
        try {
          final queryParams = <String, dynamic>{};
          if (organizationId != null) queryParams['organizationId'] = organizationId;
          if (status != null) queryParams['status'] = status;
          if (pagination != null) {
            queryParams['page'] = pagination.page;
            queryParams['limit'] = pagination.limit;
            if (pagination.search != null) queryParams['search'] = pagination.search;
          }

          final response = await _apiService.get('/lorries', queryParameters: queryParams);
          
          if (response['success'] == true) {
            final lorriesData = response['data'] as List;
            final lorries = lorriesData.map((data) => Lorry.fromJson(data as Map<String, dynamic>)).toList();
            
            // Cache lorries locally
            for (final lorry in lorries) {
              await _databaseService.saveLorry(lorry.toJson());
            }
            
            return Result.success(lorries);
          }
        } catch (e) {
          print('API call failed, falling back to local data: $e');
        }
      }

      // Fallback to local database
      final localLorries = await _databaseService.getLorries(organizationId: organizationId);
      final lorries = localLorries
          .where((data) => status == null || data['status'] == status)
          .map((data) => Lorry.fromJson(data))
          .toList();

      return Result.success(lorries);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get lorries: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<Lorry>> getLorryById(String id) async {
    try {
      // Try API first
      if (await _syncService.isOnline()) {
        try {
          final response = await _apiService.get('/lorries/$id');
          if (response['success'] == true) {
            final lorryData = response['data'] as Map<String, dynamic>;
            final lorry = Lorry.fromJson(lorryData);
            
            // Cache locally
            await _databaseService.saveLorry(lorry.toJson());
            
            return Result.success(lorry);
          }
        } catch (e) {
          print('API call failed, falling back to local data: $e');
        }
      }

      // Fallback to local database
      final localLorry = await _databaseService.getLorry(id);
      if (localLorry != null) {
        return Result.success(Lorry.fromJson(localLorry));
      }

      return const Result.failure(
        Failure.notFound(message: 'Lorry not found'),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get lorry: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<Lorry>> createLorry({
    required String registrationNumber,
    required String driverName,
    required String driverPhone,
    required double capacity,
    String? currentLocation,
  }) async {
    try {
      final lorryData = {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'registrationNumber': registrationNumber,
        'driverName': driverName,
        'driverPhone': driverPhone,
        'capacity': capacity,
        'currentLocation': currentLocation,
        'status': 'AVAILABLE',
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      };

      // Save locally first
      await _databaseService.saveLorry(lorryData);

      // Add to sync queue
      await _syncService.addToSyncQueue(
        operation: 'CREATE',
        tableName: 'lorries',
        recordId: lorryData['id'],
        data: lorryData,
      );

      return Result.success(Lorry.fromJson(lorryData));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to create lorry: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<Lorry>> updateLorry({
    required String id,
    String? registrationNumber,
    String? driverName,
    String? driverPhone,
    double? capacity,
    String? status,
    String? currentLocation,
  }) async {
    try {
      // Get existing lorry
      final existingResult = await getLorryById(id);
      if (existingResult.isFailure) {
        return Result.failure(existingResult.failure!);
      }

      final existingLorry = existingResult.data!;
      final updatedData = {
        ...existingLorry.toJson(),
        if (registrationNumber != null) 'registrationNumber': registrationNumber,
        if (driverName != null) 'driverName': driverName,
        if (driverPhone != null) 'driverPhone': driverPhone,
        if (capacity != null) 'capacity': capacity,
        if (status != null) 'status': status,
        if (currentLocation != null) 'currentLocation': currentLocation,
        'updatedAt': DateTime.now().toIso8601String(),
      };

      // Save locally
      await _databaseService.saveLorry(updatedData);

      // Add to sync queue
      await _syncService.addToSyncQueue(
        operation: 'UPDATE',
        tableName: 'lorries',
        recordId: id,
        data: updatedData,
      );

      return Result.success(Lorry.fromJson(updatedData));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to update lorry: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<void>> deleteLorry(String id) async {
    try {
      // Add to sync queue for deletion
      await _syncService.addToSyncQueue(
        operation: 'DELETE',
        tableName: 'lorries',
        recordId: id,
        data: {'id': id},
      );

      return const Result.success(null);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to delete lorry: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<Lorry>> updateLorryStatus({
    required String id,
    required String status,
  }) async {
    return updateLorry(id: id, status: status);
  }

  @override
  Future<Result<List<LorryRequest>>> getLorryRequests({
    String? organizationId,
    String? fieldManagerId,
    String? status,
    PaginationParams? pagination,
  }) async {
    try {
      // Try API first
      if (await _syncService.isOnline()) {
        try {
          final queryParams = <String, dynamic>{};
          if (organizationId != null) queryParams['organizationId'] = organizationId;
          if (fieldManagerId != null) queryParams['fieldManagerId'] = fieldManagerId;
          if (status != null) queryParams['status'] = status;
          if (pagination != null) {
            queryParams['page'] = pagination.page;
            queryParams['limit'] = pagination.limit;
          }

          final response = await _apiService.get('/lorry-requests', queryParameters: queryParams);
          
          if (response['success'] == true) {
            final requestsData = response['data'] as List;
            final requests = requestsData.map((data) => LorryRequest.fromJson(data as Map<String, dynamic>)).toList();
            
            return Result.success(requests);
          }
        } catch (e) {
          print('API call failed: $e');
        }
      }

      // For now, return empty list as we don't have local storage for requests yet
      // TODO: Implement local storage for lorry requests
      return const Result.success([]);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get lorry requests: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<LorryRequest>> getLorryRequestById(String id) async {
    try {
      if (await _syncService.isOnline()) {
        final response = await _apiService.get('/lorry-requests/$id');
        if (response['success'] == true) {
          final requestData = response['data'] as Map<String, dynamic>;
          return Result.success(LorryRequest.fromJson(requestData));
        }
      }

      return const Result.failure(
        Failure.notFound(message: 'Lorry request not found'),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get lorry request: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<LorryRequest>> createLorryRequest({
    required String purpose,
    required int estimatedFarmers,
    required double estimatedWeight,
    required String urgency,
    required DateTime requestedDate,
    String? notes,
  }) async {
    try {
      final requestData = {
        'purpose': purpose,
        'estimatedFarmers': estimatedFarmers,
        'estimatedWeight': estimatedWeight,
        'urgency': urgency,
        'requestedDate': requestedDate.toIso8601String(),
        'notes': notes,
      };

      if (await _syncService.isOnline()) {
        final response = await _apiService.post('/lorry-requests', requestData);
        if (response['success'] == true) {
          final responseData = response['data'] as Map<String, dynamic>;
          return Result.success(LorryRequest.fromJson(responseData));
        }
      }

      // TODO: Add to local storage and sync queue
      return const Result.failure(
        Failure.network(message: 'Cannot create lorry request while offline'),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to create lorry request: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<LorryRequest>> updateLorryRequest({
    required String id,
    String? purpose,
    int? estimatedFarmers,
    double? estimatedWeight,
    String? urgency,
    DateTime? requestedDate,
    String? notes,
  }) async {
    try {
      final updateData = <String, dynamic>{};
      if (purpose != null) updateData['purpose'] = purpose;
      if (estimatedFarmers != null) updateData['estimatedFarmers'] = estimatedFarmers;
      if (estimatedWeight != null) updateData['estimatedWeight'] = estimatedWeight;
      if (urgency != null) updateData['urgency'] = urgency;
      if (requestedDate != null) updateData['requestedDate'] = requestedDate.toIso8601String();
      if (notes != null) updateData['notes'] = notes;

      if (await _syncService.isOnline()) {
        final response = await _apiService.put('/lorry-requests/$id', updateData);
        if (response['success'] == true) {
          final responseData = response['data'] as Map<String, dynamic>;
          return Result.success(LorryRequest.fromJson(responseData));
        }
      }

      return const Result.failure(
        Failure.network(message: 'Cannot update lorry request while offline'),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to update lorry request: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<LorryRequest>> approveLorryRequest({
    required String requestId,
    required String lorryId,
  }) async {
    try {
      if (await _syncService.isOnline()) {
        final response = await _apiService.post('/lorry-requests/$requestId/approve', {
          'lorryId': lorryId,
        });
        if (response['success'] == true) {
          final responseData = response['data'] as Map<String, dynamic>;
          return Result.success(LorryRequest.fromJson(responseData));
        }
      }

      return const Result.failure(
        Failure.network(message: 'Cannot approve lorry request while offline'),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to approve lorry request: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<LorryRequest>> rejectLorryRequest({
    required String requestId,
    String? reason,
  }) async {
    try {
      if (await _syncService.isOnline()) {
        final response = await _apiService.post('/lorry-requests/$requestId/reject', {
          'reason': reason,
        });
        if (response['success'] == true) {
          final responseData = response['data'] as Map<String, dynamic>;
          return Result.success(LorryRequest.fromJson(responseData));
        }
      }

      return const Result.failure(
        Failure.network(message: 'Cannot reject lorry request while offline'),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to reject lorry request: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<List<LorryTrip>>> getLorryTrips({
    String? organizationId,
    String? lorryId,
    String? fieldManagerId,
    String? status,
    PaginationParams? pagination,
  }) async {
    try {
      if (await _syncService.isOnline()) {
        final queryParams = <String, dynamic>{};
        if (organizationId != null) queryParams['organizationId'] = organizationId;
        if (lorryId != null) queryParams['lorryId'] = lorryId;
        if (fieldManagerId != null) queryParams['fieldManagerId'] = fieldManagerId;
        if (status != null) queryParams['status'] = status;
        if (pagination != null) {
          queryParams['page'] = pagination.page;
          queryParams['limit'] = pagination.limit;
        }

        final response = await _apiService.get('/lorry-trips', queryParameters: queryParams);
        if (response['success'] == true) {
          final tripsData = response['data'] as List;
          final trips = tripsData.map((data) => LorryTrip.fromJson(data as Map<String, dynamic>)).toList();
          return Result.success(trips);
        }
      }

      return const Result.success([]);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get lorry trips: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<LorryTrip>> getLorryTripById(String id) async {
    try {
      if (await _syncService.isOnline()) {
        final response = await _apiService.get('/lorry-trips/$id');
        if (response['success'] == true) {
          final tripData = response['data'] as Map<String, dynamic>;
          return Result.success(LorryTrip.fromJson(tripData));
        }
      }

      return const Result.failure(
        Failure.notFound(message: 'Lorry trip not found'),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get lorry trip: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<LorryTrip>> createLorryTrip({
    required String lorryId,
    String? requestId,
    required DateTime startDate,
    String? notes,
  }) async {
    try {
      final tripData = {
        'lorryId': lorryId,
        'requestId': requestId,
        'startDate': startDate.toIso8601String(),
        'notes': notes,
      };

      if (await _syncService.isOnline()) {
        final response = await _apiService.post('/lorry-trips', tripData);
        if (response['success'] == true) {
          final responseData = response['data'] as Map<String, dynamic>;
          return Result.success(LorryTrip.fromJson(responseData));
        }
      }

      return const Result.failure(
        Failure.network(message: 'Cannot create lorry trip while offline'),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to create lorry trip: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<LorryTrip>> updateLorryTrip({
    required String id,
    DateTime? endDate,
    String? status,
    String? notes,
  }) async {
    try {
      final updateData = <String, dynamic>{};
      if (endDate != null) updateData['endDate'] = endDate.toIso8601String();
      if (status != null) updateData['status'] = status;
      if (notes != null) updateData['notes'] = notes;

      if (await _syncService.isOnline()) {
        final response = await _apiService.put('/lorry-trips/$id', updateData);
        if (response['success'] == true) {
          final responseData = response['data'] as Map<String, dynamic>;
          return Result.success(LorryTrip.fromJson(responseData));
        }
      }

      return const Result.failure(
        Failure.network(message: 'Cannot update lorry trip while offline'),
      );
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to update lorry trip: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<LorryTrip>> completeLorryTrip({
    required String id,
    required DateTime endDate,
    String? notes,
  }) async {
    return updateLorryTrip(
      id: id,
      endDate: endDate,
      status: 'COMPLETED',
      notes: notes,
    );
  }

  @override
  Future<Result<List<Delivery>>> getDeliveriesForTrip(String tripId) async {
    try {
      if (await _syncService.isOnline()) {
        final response = await _apiService.get('/lorry-trips/$tripId/deliveries');
        if (response['success'] == true) {
          final deliveriesData = response['data'] as List;
          final deliveries = deliveriesData.map((data) => Delivery.fromJson(data as Map<String, dynamic>)).toList();
          return Result.success(deliveries);
        }
      }

      // Fallback to local database
      final localDeliveries = await _databaseService.getDeliveries(tripId: tripId);
      final deliveries = localDeliveries.map((data) => Delivery.fromJson(data)).toList();
      return Result.success(deliveries);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get deliveries: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<Delivery>> addDelivery({
    required String tripId,
    required String farmerId,
    required String farmerName,
    String? farmerPhone,
    required int numberOfBags,
    required List<double> bagWeights,
    required double moisturePercent,
    required String qualityGrade,
    required double grossWeight,
    double? deductionFixedKg,
    double? qualityDeductionKg,
    required double netWeight,
    String? notes,
  }) async {
    try {
      final deliveryData = {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'tripId': tripId,
        'farmerId': farmerId,
        'farmerName': farmerName,
        'farmerPhone': farmerPhone,
        'numberOfBags': numberOfBags,
        'bagWeights': bagWeights,
        'moisturePercent': moisturePercent,
        'qualityGrade': qualityGrade,
        'grossWeight': grossWeight,
        'deductionFixedKg': deductionFixedKg ?? 0.0,
        'qualityDeductionKg': qualityDeductionKg ?? 0.0,
        'netWeight': netWeight,
        'notes': notes,
        'status': 'PENDING',
        'recordedAt': DateTime.now().toIso8601String(),
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      };

      // Save locally first
      await _databaseService.saveDelivery(deliveryData);

      // Add to sync queue
      await _syncService.addToSyncQueue(
        operation: 'CREATE',
        tableName: 'deliveries',
        recordId: deliveryData['id'],
        data: deliveryData,
      );

      return Result.success(Delivery.fromJson(deliveryData));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to add delivery: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<Delivery>> updateDelivery({
    required String id,
    int? numberOfBags,
    List<double>? bagWeights,
    double? moisturePercent,
    String? qualityGrade,
    double? grossWeight,
    double? deductionFixedKg,
    double? qualityDeductionKg,
    double? netWeight,
    String? status,
    String? notes,
  }) async {
    try {
      // Get existing delivery
      final existingDelivery = await _databaseService.getDelivery(id);
      if (existingDelivery == null) {
        return const Result.failure(
          Failure.notFound(message: 'Delivery not found'),
        );
      }

      final updatedData = {
        ...existingDelivery,
        if (numberOfBags != null) 'numberOfBags': numberOfBags,
        if (bagWeights != null) 'bagWeights': bagWeights,
        if (moisturePercent != null) 'moisturePercent': moisturePercent,
        if (qualityGrade != null) 'qualityGrade': qualityGrade,
        if (grossWeight != null) 'grossWeight': grossWeight,
        if (deductionFixedKg != null) 'deductionFixedKg': deductionFixedKg,
        if (qualityDeductionKg != null) 'qualityDeductionKg': qualityDeductionKg,
        if (netWeight != null) 'netWeight': netWeight,
        if (status != null) 'status': status,
        if (notes != null) 'notes': notes,
        'updatedAt': DateTime.now().toIso8601String(),
      };

      // Save locally
      await _databaseService.saveDelivery(updatedData);

      // Add to sync queue
      await _syncService.addToSyncQueue(
        operation: 'UPDATE',
        tableName: 'deliveries',
        recordId: id,
        data: updatedData,
      );

      return Result.success(Delivery.fromJson(updatedData));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to update delivery: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<void>> deleteDelivery(String id) async {
    try {
      // Add to sync queue for deletion
      await _syncService.addToSyncQueue(
        operation: 'DELETE',
        tableName: 'deliveries',
        recordId: id,
        data: {'id': id},
      );

      return const Result.success(null);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to delete delivery: ${e.toString()}', error: e),
      );
    }
  }

  @override
  Future<Result<LorryTrip>> submitTrip(String tripId) async {
    return updateLorryTrip(
      id: tripId,
      status: 'SUBMITTED',
    );
  }

  @override
  Future<Result<TripStatistics>> getTripStatistics({
    String? organizationId,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      if (await _syncService.isOnline()) {
        final queryParams = <String, dynamic>{};
        if (organizationId != null) queryParams['organizationId'] = organizationId;
        if (startDate != null) queryParams['startDate'] = startDate.toIso8601String();
        if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();

        final response = await _apiService.get('/lorry-trips/statistics', queryParameters: queryParams);
        if (response['success'] == true) {
          final statsData = response['data'] as Map<String, dynamic>;
          final statistics = TripStatistics(
            totalTrips: statsData['totalTrips'] ?? 0,
            completedTrips: statsData['completedTrips'] ?? 0,
            inProgressTrips: statsData['inProgressTrips'] ?? 0,
            totalWeightKg: (statsData['totalWeightKg'] ?? 0.0).toDouble(),
            averageWeightPerTrip: (statsData['averageWeightPerTrip'] ?? 0.0).toDouble(),
            totalFarmers: statsData['totalFarmers'] ?? 0,
            totalDeliveries: statsData['totalDeliveries'] ?? 0,
            qualityGradeDistribution: Map<String, int>.from(statsData['qualityGradeDistribution'] ?? {}),
          );
          return Result.success(statistics);
        }
      }

      // Return empty statistics if offline
      return const Result.success(TripStatistics(
        totalTrips: 0,
        completedTrips: 0,
        inProgressTrips: 0,
        totalWeightKg: 0.0,
        averageWeightPerTrip: 0.0,
        totalFarmers: 0,
        totalDeliveries: 0,
        qualityGradeDistribution: {},
      ));
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get trip statistics: ${e.toString()}', error: e),
      );
    }
  }
}