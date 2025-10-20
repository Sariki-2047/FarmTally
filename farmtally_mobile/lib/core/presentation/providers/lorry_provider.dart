import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/result.dart';
import '../../domain/entities/lorry.dart';
import '../../domain/repositories/lorry_repository.dart';
import '../../domain/usecases/lorry/get_lorries_usecase.dart';
import '../../domain/usecases/lorry/get_lorry_by_id_usecase.dart';
import '../../domain/usecases/lorry/create_lorry_usecase.dart';
import '../../domain/usecases/lorry/create_lorry_request_usecase.dart';
import '../../domain/usecases/lorry/add_delivery_usecase.dart';
import '../../domain/usecases/usecase.dart';
import '../../domain/services/sync_service.dart';
import '../../data/repositories/lorry_repository_impl.dart';
import '../../data/repositories/farmer_repository_impl.dart';
import 'auth_provider.dart';

// Lorry State
class LorryState {
  final List<Lorry> lorries;
  final bool isLoading;
  final String? error;
  final bool hasMore;
  final int currentPage;

  const LorryState({
    this.lorries = const [],
    this.isLoading = false,
    this.error,
    this.hasMore = true,
    this.currentPage = 1,
  });

  LorryState copyWith({
    List<Lorry>? lorries,
    bool? isLoading,
    String? error,
    bool? hasMore,
    int? currentPage,
  }) {
    return LorryState(
      lorries: lorries ?? this.lorries,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
    );
  }
}

// Lorry Notifier
class LorryNotifier extends StateNotifier<LorryState> {
  final GetLorriesUseCase _getLorriesUseCase;
  final GetLorryByIdUseCase _getLorryByIdUseCase;
  final CreateLorryUseCase _createLorryUseCase;
  final String? _organizationId;

  LorryNotifier({
    required GetLorriesUseCase getLorriesUseCase,
    required GetLorryByIdUseCase getLorryByIdUseCase,
    required CreateLorryUseCase createLorryUseCase,
    String? organizationId,
  })  : _getLorriesUseCase = getLorriesUseCase,
        _getLorryByIdUseCase = getLorryByIdUseCase,
        _createLorryUseCase = createLorryUseCase,
        _organizationId = organizationId,
        super(const LorryState()) {
    loadLorries();
  }

  Future<void> loadLorries({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(
        lorries: [],
        currentPage: 1,
        hasMore: true,
        error: null,
      );
    }

    if (state.isLoading || !state.hasMore) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final params = GetLorriesParams(
        organizationId: _organizationId,
        pagination: PaginationParams(
          page: state.currentPage,
          limit: 20,
        ),
      );

      final result = await _getLorriesUseCase.call(params);

      result.when(
        success: (newLorries) {
          final allLorries = refresh 
              ? newLorries 
              : [...state.lorries, ...newLorries];
          
          state = state.copyWith(
            lorries: allLorries,
            isLoading: false,
            hasMore: newLorries.length >= 20,
            currentPage: state.currentPage + 1,
          );
        },
        failure: (failure) {
          state = state.copyWith(
            isLoading: false,
            error: failure.userMessage,
          );
        },
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load lorries: ${e.toString()}',
      );
    }
  }

  Future<void> loadMoreLorries() async {
    await loadLorries();
  }

  Future<void> refreshLorries() async {
    await loadLorries(refresh: true);
  }

  Future<Result<Lorry>> getLorryById(String id) async {
    try {
      final params = GetLorryByIdParams(id: id);
      return await _getLorryByIdUseCase.call(params);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get lorry: ${e.toString()}'),
      );
    }
  }

  Future<Result<Lorry>> createLorry({
    required String registrationNumber,
    required String driverName,
    required String driverPhone,
    required double capacity,
    String? currentLocation,
  }) async {
    try {
      final params = CreateLorryParams(
        registrationNumber: registrationNumber,
        driverName: driverName,
        driverPhone: driverPhone,
        capacity: capacity,
        currentLocation: currentLocation,
      );

      final result = await _createLorryUseCase.call(params);

      if (result.isSuccess) {
        // Add the new lorry to the beginning of the list
        state = state.copyWith(
          lorries: [result.data!, ...state.lorries],
        );
      }

      return result;
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to create lorry: ${e.toString()}'),
      );
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  List<Lorry> getLorriesByStatus(String status) {
    return state.lorries.where((lorry) => lorry.status == status).toList();
  }
}

// Lorry Request State
class LorryRequestState {
  final List<LorryRequest> requests;
  final bool isLoading;
  final String? error;

  const LorryRequestState({
    this.requests = const [],
    this.isLoading = false,
    this.error,
  });

  LorryRequestState copyWith({
    List<LorryRequest>? requests,
    bool? isLoading,
    String? error,
  }) {
    return LorryRequestState(
      requests: requests ?? this.requests,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Lorry Request Notifier
class LorryRequestNotifier extends StateNotifier<LorryRequestState> {
  final CreateLorryRequestUseCase _createLorryRequestUseCase;
  final LorryRepository _lorryRepository;
  final String? _organizationId;
  final String? _fieldManagerId;

  LorryRequestNotifier({
    required CreateLorryRequestUseCase createLorryRequestUseCase,
    required LorryRepository lorryRepository,
    String? organizationId,
    String? fieldManagerId,
  })  : _createLorryRequestUseCase = createLorryRequestUseCase,
        _lorryRepository = lorryRepository,
        _organizationId = organizationId,
        _fieldManagerId = fieldManagerId,
        super(const LorryRequestState()) {
    loadRequests();
  }

  Future<void> loadRequests() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await _lorryRepository.getLorryRequests(
        organizationId: _organizationId,
        fieldManagerId: _fieldManagerId,
      );

      result.when(
        success: (requests) {
          state = state.copyWith(
            requests: requests,
            isLoading: false,
          );
        },
        failure: (failure) {
          state = state.copyWith(
            isLoading: false,
            error: failure.userMessage,
          );
        },
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load requests: ${e.toString()}',
      );
    }
  }

  Future<Result<LorryRequest>> createRequest({
    required String purpose,
    required int estimatedFarmers,
    required double estimatedWeight,
    required String urgency,
    required DateTime requestedDate,
    String? notes,
  }) async {
    try {
      final params = CreateLorryRequestParams(
        purpose: purpose,
        estimatedFarmers: estimatedFarmers,
        estimatedWeight: estimatedWeight,
        urgency: urgency,
        requestedDate: requestedDate,
        notes: notes,
      );

      final result = await _createLorryRequestUseCase.call(params);

      if (result.isSuccess) {
        // Add the new request to the beginning of the list
        state = state.copyWith(
          requests: [result.data!, ...state.requests],
        );
      }

      return result;
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to create request: ${e.toString()}'),
      );
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Delivery State
class DeliveryState {
  final List<Delivery> deliveries;
  final bool isLoading;
  final String? error;

  const DeliveryState({
    this.deliveries = const [],
    this.isLoading = false,
    this.error,
  });

  DeliveryState copyWith({
    List<Delivery>? deliveries,
    bool? isLoading,
    String? error,
  }) {
    return DeliveryState(
      deliveries: deliveries ?? this.deliveries,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Delivery Notifier
class DeliveryNotifier extends StateNotifier<DeliveryState> {
  final AddDeliveryUseCase _addDeliveryUseCase;
  final LorryRepository _lorryRepository;
  final String _tripId;

  DeliveryNotifier({
    required AddDeliveryUseCase addDeliveryUseCase,
    required LorryRepository lorryRepository,
    required String tripId,
  })  : _addDeliveryUseCase = addDeliveryUseCase,
        _lorryRepository = lorryRepository,
        _tripId = tripId,
        super(const DeliveryState()) {
    loadDeliveries();
  }

  Future<void> loadDeliveries() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await _lorryRepository.getDeliveriesForTrip(_tripId);

      result.when(
        success: (deliveries) {
          state = state.copyWith(
            deliveries: deliveries,
            isLoading: false,
          );
        },
        failure: (failure) {
          state = state.copyWith(
            isLoading: false,
            error: failure.userMessage,
          );
        },
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load deliveries: ${e.toString()}',
      );
    }
  }

  Future<Result<Delivery>> addDelivery({
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
      final params = AddDeliveryParams(
        tripId: _tripId,
        farmerId: farmerId,
        farmerName: farmerName,
        farmerPhone: farmerPhone,
        numberOfBags: numberOfBags,
        bagWeights: bagWeights,
        moisturePercent: moisturePercent,
        qualityGrade: qualityGrade,
        grossWeight: grossWeight,
        deductionFixedKg: deductionFixedKg,
        qualityDeductionKg: qualityDeductionKg,
        netWeight: netWeight,
        notes: notes,
      );

      final result = await _addDeliveryUseCase.call(params);

      if (result.isSuccess) {
        // Add the new delivery to the beginning of the list
        state = state.copyWith(
          deliveries: [result.data!, ...state.deliveries],
        );
      }

      return result;
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to add delivery: ${e.toString()}'),
      );
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Repository Provider
final lorryRepositoryProvider = Provider<LorryRepository>((ref) {
  return LorryRepositoryImpl(
    apiService: ref.watch(apiServiceProvider),
    databaseService: ref.watch(databaseServiceProvider),
    syncService: ref.watch(syncServiceProvider),
  );
});

// Use Case Providers
final getLorriesUseCaseProvider = Provider<GetLorriesUseCase>((ref) {
  return GetLorriesUseCase(ref.watch(lorryRepositoryProvider));
});

final getLorryByIdUseCaseProvider = Provider<GetLorryByIdUseCase>((ref) {
  return GetLorryByIdUseCase(ref.watch(lorryRepositoryProvider));
});

final createLorryUseCaseProvider = Provider<CreateLorryUseCase>((ref) {
  return CreateLorryUseCase(ref.watch(lorryRepositoryProvider));
});

final createLorryRequestUseCaseProvider = Provider<CreateLorryRequestUseCase>((ref) {
  return CreateLorryRequestUseCase(ref.watch(lorryRepositoryProvider));
});

final addDeliveryUseCaseProvider = Provider<AddDeliveryUseCase>((ref) {
  return AddDeliveryUseCase(
    ref.watch(lorryRepositoryProvider),
    ref.watch(farmerRepositoryProvider),
  );
});

// State Notifier Providers
final lorryNotifierProvider = StateNotifierProvider.family<LorryNotifier, LorryState, String?>((ref, organizationId) {
  return LorryNotifier(
    getLorriesUseCase: ref.watch(getLorriesUseCaseProvider),
    getLorryByIdUseCase: ref.watch(getLorryByIdUseCaseProvider),
    createLorryUseCase: ref.watch(createLorryUseCaseProvider),
    organizationId: organizationId,
  );
});

final lorryRequestNotifierProvider = StateNotifierProvider.family<LorryRequestNotifier, LorryRequestState, LorryRequestParams>((ref, params) {
  return LorryRequestNotifier(
    createLorryRequestUseCase: ref.watch(createLorryRequestUseCaseProvider),
    lorryRepository: ref.watch(lorryRepositoryProvider),
    organizationId: params.organizationId,
    fieldManagerId: params.fieldManagerId,
  );
});

final deliveryNotifierProvider = StateNotifierProvider.family<DeliveryNotifier, DeliveryState, String>((ref, tripId) {
  return DeliveryNotifier(
    addDeliveryUseCase: ref.watch(addDeliveryUseCaseProvider),
    lorryRepository: ref.watch(lorryRepositoryProvider),
    tripId: tripId,
  );
});

// Convenience Providers
final currentUserLorriesProvider = Provider<AsyncValue<List<Lorry>>>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user?.organizationId == null) {
    return const AsyncValue.data([]);
  }

  final lorryState = ref.watch(lorryNotifierProvider(user!.organizationId));
  
  if (lorryState.isLoading && lorryState.lorries.isEmpty) {
    return const AsyncValue.loading();
  }
  
  if (lorryState.error != null) {
    return AsyncValue.error(lorryState.error!, StackTrace.current);
  }
  
  return AsyncValue.data(lorryState.lorries);
});

final availableLorriesProvider = Provider<List<Lorry>>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user?.organizationId == null) return [];
  
  final lorryState = ref.watch(lorryNotifierProvider(user!.organizationId));
  return lorryState.lorries.where((lorry) => lorry.isAvailable).toList();
});

// Helper class for lorry request parameters
class LorryRequestParams {
  final String? organizationId;
  final String? fieldManagerId;

  const LorryRequestParams({
    this.organizationId,
    this.fieldManagerId,
  });
}

// Import farmer repository from farmer_provider
final farmerRepositoryProvider = Provider<FarmerRepository>((ref) {
  return FarmerRepositoryImpl(
    apiService: ref.watch(apiServiceProvider),
    databaseService: ref.watch(databaseServiceProvider),
    syncService: ref.watch(syncServiceProvider),
  );
});