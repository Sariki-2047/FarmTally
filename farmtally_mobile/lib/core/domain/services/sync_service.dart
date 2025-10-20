import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../entities/result.dart';
import '../../services/database_service.dart';
import '../../services/api_service.dart';

abstract class SyncService {
  /// Start automatic sync
  Future<void> startAutoSync();

  /// Stop automatic sync
  Future<void> stopAutoSync();

  /// Perform manual sync
  Future<Result<SyncResult>> syncNow();

  /// Add item to sync queue
  Future<void> addToSyncQueue({
    required String operation,
    required String tableName,
    required String recordId,
    required Map<String, dynamic> data,
  });

  /// Get sync status
  Stream<SyncStatus> get syncStatusStream;

  /// Check if device is online
  Future<bool> isOnline();

  /// Get pending sync items count
  Future<int> getPendingSyncCount();
}

class SyncServiceImpl implements SyncService {
  final DatabaseService _databaseService;
  final ApiService _apiService;
  final Connectivity _connectivity;

  Timer? _syncTimer;
  final StreamController<SyncStatus> _syncStatusController = StreamController<SyncStatus>.broadcast();
  bool _isSyncing = false;

  SyncServiceImpl({
    required DatabaseService databaseService,
    required ApiService apiService,
    required Connectivity connectivity,
  })  : _databaseService = databaseService,
        _apiService = apiService,
        _connectivity = connectivity;

  @override
  Stream<SyncStatus> get syncStatusStream => _syncStatusController.stream;

  @override
  Future<void> startAutoSync() async {
    await stopAutoSync(); // Stop any existing timer

    _syncTimer = Timer.periodic(const Duration(minutes: 5), (timer) async {
      if (!_isSyncing && await isOnline()) {
        await syncNow();
      }
    });

    // Also sync when connectivity changes
    _connectivity.onConnectivityChanged.listen((result) async {
      if (result != ConnectivityResult.none && !_isSyncing) {
        await Future.delayed(const Duration(seconds: 2)); // Wait for connection to stabilize
        await syncNow();
      }
    });

    print('🔄 Auto sync started');
  }

  @override
  Future<void> stopAutoSync() async {
    _syncTimer?.cancel();
    _syncTimer = null;
    print('🔄 Auto sync stopped');
  }

  @override
  Future<Result<SyncResult>> syncNow() async {
    if (_isSyncing) {
      return const Result.failure(
        Failure.unknown(message: 'Sync already in progress'),
      );
    }

    _isSyncing = true;
    _syncStatusController.add(const SyncStatus.syncing());

    try {
      final isConnected = await isOnline();
      if (!isConnected) {
        _syncStatusController.add(const SyncStatus.offline());
        return const Result.failure(
          Failure.network(message: 'Device is offline'),
        );
      }

      final pendingItems = await _databaseService.getPendingSyncItems();
      int successCount = 0;
      int failureCount = 0;
      final List<String> errors = [];

      for (final item in pendingItems) {
        try {
          final success = await _syncItem(item);
          if (success) {
            await _databaseService.markSyncItemCompleted(item['id']);
            successCount++;
          } else {
            await _databaseService.incrementSyncRetryCount(item['id']);
            failureCount++;
            errors.add('Failed to sync ${item['tableName']} ${item['recordId']}');
          }
        } catch (e) {
          await _databaseService.incrementSyncRetryCount(item['id']);
          failureCount++;
          errors.add('Error syncing ${item['tableName']} ${item['recordId']}: $e');
        }
      }

      // Download latest data from server
      await _downloadLatestData();

      final result = SyncResult(
        totalItems: pendingItems.length,
        successCount: successCount,
        failureCount: failureCount,
        errors: errors,
        syncedAt: DateTime.now(),
      );

      if (failureCount == 0) {
        _syncStatusController.add(SyncStatus.success(result));
      } else {
        _syncStatusController.add(SyncStatus.partialSuccess(result));
      }

      return Result.success(result);
    } catch (e) {
      final error = 'Sync failed: ${e.toString()}';
      _syncStatusController.add(SyncStatus.error(error));
      return Result.failure(
        Failure.unknown(message: error, error: e),
      );
    } finally {
      _isSyncing = false;
    }
  }

  @override
  Future<void> addToSyncQueue({
    required String operation,
    required String tableName,
    required String recordId,
    required Map<String, dynamic> data,
  }) async {
    await _databaseService.addToSyncQueue(
      operation: operation,
      tableName: tableName,
      recordId: recordId,
      data: data,
    );

    // Try to sync immediately if online
    if (await isOnline() && !_isSyncing) {
      unawaited(syncNow());
    }
  }

  @override
  Future<bool> isOnline() async {
    final connectivityResult = await _connectivity.checkConnectivity();
    return connectivityResult != ConnectivityResult.none;
  }

  @override
  Future<int> getPendingSyncCount() async {
    final items = await _databaseService.getPendingSyncItems();
    return items.length;
  }

  Future<bool> _syncItem(Map<String, dynamic> item) async {
    final operation = item['operation'] as String;
    final tableName = item['tableName'] as String;
    final recordId = item['recordId'] as String;
    final data = item['data'] as Map<String, dynamic>;

    try {
      switch (operation.toUpperCase()) {
        case 'CREATE':
          return await _syncCreate(tableName, recordId, data);
        case 'UPDATE':
          return await _syncUpdate(tableName, recordId, data);
        case 'DELETE':
          return await _syncDelete(tableName, recordId);
        default:
          print('Unknown sync operation: $operation');
          return false;
      }
    } catch (e) {
      print('Error syncing item: $e');
      return false;
    }
  }

  Future<bool> _syncCreate(String tableName, String recordId, Map<String, dynamic> data) async {
    try {
      final endpoint = _getEndpointForTable(tableName);
      final response = await _apiService.post(endpoint, data);
      return response['success'] == true;
    } catch (e) {
      print('Error creating $tableName: $e');
      return false;
    }
  }

  Future<bool> _syncUpdate(String tableName, String recordId, Map<String, dynamic> data) async {
    try {
      final endpoint = '${_getEndpointForTable(tableName)}/$recordId';
      final response = await _apiService.put(endpoint, data);
      return response['success'] == true;
    } catch (e) {
      print('Error updating $tableName: $e');
      return false;
    }
  }

  Future<bool> _syncDelete(String tableName, String recordId) async {
    try {
      final endpoint = '${_getEndpointForTable(tableName)}/$recordId';
      final response = await _apiService.delete(endpoint);
      return response['success'] == true;
    } catch (e) {
      print('Error deleting $tableName: $e');
      return false;
    }
  }

  String _getEndpointForTable(String tableName) {
    switch (tableName.toLowerCase()) {
      case 'lorries':
        return '/lorries';
      case 'farmers':
        return '/farmers';
      case 'lorry_requests':
        return '/lorry-requests';
      case 'lorry_trips':
        return '/lorry-trips';
      case 'deliveries':
        return '/deliveries';
      default:
        return '/${tableName.toLowerCase()}';
    }
  }

  Future<void> _downloadLatestData() async {
    try {
      // Download lorries
      final lorriesResponse = await _apiService.get('/lorries');
      if (lorriesResponse['success'] == true) {
        final lorries = lorriesResponse['data'] as List;
        for (final lorry in lorries) {
          await _databaseService.saveLorry(lorry as Map<String, dynamic>);
        }
      }

      // Download farmers
      final farmersResponse = await _apiService.get('/farmers');
      if (farmersResponse['success'] == true) {
        final farmers = farmersResponse['data'] as List;
        for (final farmer in farmers) {
          await _databaseService.saveFarmer(farmer as Map<String, dynamic>);
        }
      }

      // Download other data as needed...
    } catch (e) {
      print('Error downloading latest data: $e');
    }
  }

  void dispose() {
    _syncTimer?.cancel();
    _syncStatusController.close();
  }
}

// Sync Status
sealed class SyncStatus {
  const SyncStatus();

  const factory SyncStatus.idle() = SyncIdle;
  const factory SyncStatus.syncing() = SyncInProgress;
  const factory SyncStatus.success(SyncResult result) = SyncSuccess;
  const factory SyncStatus.partialSuccess(SyncResult result) = SyncPartialSuccess;
  const factory SyncStatus.error(String message) = SyncError;
  const factory SyncStatus.offline() = SyncOffline;
}

class SyncIdle extends SyncStatus {
  const SyncIdle();
}

class SyncInProgress extends SyncStatus {
  const SyncInProgress();
}

class SyncSuccess extends SyncStatus {
  final SyncResult result;
  const SyncSuccess(this.result);
}

class SyncPartialSuccess extends SyncStatus {
  final SyncResult result;
  const SyncPartialSuccess(this.result);
}

class SyncError extends SyncStatus {
  final String message;
  const SyncError(this.message);
}

class SyncOffline extends SyncStatus {
  const SyncOffline();
}

// Sync Result
class SyncResult {
  final int totalItems;
  final int successCount;
  final int failureCount;
  final List<String> errors;
  final DateTime syncedAt;

  const SyncResult({
    required this.totalItems,
    required this.successCount,
    required this.failureCount,
    required this.errors,
    required this.syncedAt,
  });

  bool get hasErrors => failureCount > 0;
  bool get isComplete => failureCount == 0;
  double get successRate => totalItems > 0 ? successCount / totalItems : 1.0;
}

// Provider
final syncServiceProvider = Provider<SyncService>((ref) {
  return SyncServiceImpl(
    databaseService: ref.watch(databaseServiceProvider),
    apiService: ref.watch(apiServiceProvider),
    connectivity: Connectivity(),
  );
});

// Helper function for unawaited futures
void unawaited(Future<void> future) {
  // Intentionally not awaiting
}