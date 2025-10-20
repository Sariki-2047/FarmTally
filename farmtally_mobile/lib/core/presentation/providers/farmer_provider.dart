import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/result.dart';
import '../../domain/entities/farmer.dart';
import '../../domain/repositories/farmer_repository.dart';
import '../../domain/usecases/farmer/get_farmers_usecase.dart';
import '../../domain/usecases/farmer/create_farmer_usecase.dart';
import '../../domain/usecases/farmer/get_farmer_by_phone_usecase.dart';
import '../../domain/usecases/usecase.dart';
import '../../domain/services/sync_service.dart';
import '../../data/repositories/farmer_repository_impl.dart';
import 'auth_provider.dart';

// Farmer State
class FarmerState {
  final List<Farmer> farmers;
  final bool isLoading;
  final String? error;
  final bool hasMore;
  final int currentPage;
  final String? searchQuery;

  const FarmerState({
    this.farmers = const [],
    this.isLoading = false,
    this.error,
    this.hasMore = true,
    this.currentPage = 1,
    this.searchQuery,
  });

  FarmerState copyWith({
    List<Farmer>? farmers,
    bool? isLoading,
    String? error,
    bool? hasMore,
    int? currentPage,
    String? searchQuery,
  }) {
    return FarmerState(
      farmers: farmers ?? this.farmers,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

// Farmer Notifier
class FarmerNotifier extends StateNotifier<FarmerState> {
  final GetFarmersUseCase _getFarmersUseCase;
  final CreateFarmerUseCase _createFarmerUseCase;
  final GetFarmerByPhoneUseCase _getFarmerByPhoneUseCase;
  final String? _organizationId;

  FarmerNotifier({
    required GetFarmersUseCase getFarmersUseCase,
    required CreateFarmerUseCase createFarmerUseCase,
    required GetFarmerByPhoneUseCase getFarmerByPhoneUseCase,
    String? organizationId,
  })  : _getFarmersUseCase = getFarmersUseCase,
        _createFarmerUseCase = createFarmerUseCase,
        _getFarmerByPhoneUseCase = getFarmerByPhoneUseCase,
        _organizationId = organizationId,
        super(const FarmerState()) {
    loadFarmers();
  }

  Future<void> loadFarmers({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(
        farmers: [],
        currentPage: 1,
        hasMore: true,
        error: null,
      );
    }

    if (state.isLoading || !state.hasMore) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final params = GetFarmersParams(
        organizationId: _organizationId,
        search: state.searchQuery,
        pagination: PaginationParams(
          page: state.currentPage,
          limit: 20,
        ),
      );

      final result = await _getFarmersUseCase.call(params);

      result.when(
        success: (newFarmers) {
          final allFarmers = refresh 
              ? newFarmers 
              : [...state.farmers, ...newFarmers];
          
          state = state.copyWith(
            farmers: allFarmers,
            isLoading: false,
            hasMore: newFarmers.length >= 20,
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
        error: 'Failed to load farmers: ${e.toString()}',
      );
    }
  }

  Future<void> loadMoreFarmers() async {
    await loadFarmers();
  }

  Future<void> refreshFarmers() async {
    await loadFarmers(refresh: true);
  }

  Future<void> searchFarmers(String query) async {
    state = state.copyWith(
      searchQuery: query.trim().isEmpty ? null : query.trim(),
      farmers: [],
      currentPage: 1,
      hasMore: true,
    );
    await loadFarmers();
  }

  Future<void> clearSearch() async {
    state = state.copyWith(
      searchQuery: null,
      farmers: [],
      currentPage: 1,
      hasMore: true,
    );
    await loadFarmers();
  }

  Future<Result<Farmer>> createFarmer({
    required String name,
    required String phone,
    String? village,
    String? district,
    String? address,
    String? idNumber,
  }) async {
    try {
      final params = CreateFarmerParams(
        name: name,
        phone: phone,
        village: village,
        district: district,
        address: address,
        idNumber: idNumber,
      );

      final result = await _createFarmerUseCase.call(params);

      if (result.isSuccess) {
        // Add the new farmer to the beginning of the list
        state = state.copyWith(
          farmers: [result.data!, ...state.farmers],
        );
      }

      return result;
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to create farmer: ${e.toString()}'),
      );
    }
  }

  Future<Result<Farmer?>> getFarmerByPhone(String phone) async {
    if (_organizationId == null) {
      return const Result.failure(
        Failure.validation(message: 'Organization ID is required'),
      );
    }

    try {
      final params = GetFarmerByPhoneParams(
        phone: phone,
        organizationId: _organizationId!,
      );

      return await _getFarmerByPhoneUseCase.call(params);
    } catch (e) {
      return Result.failure(
        Failure.unknown(message: 'Failed to get farmer by phone: ${e.toString()}'),
      );
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  Farmer? getFarmerById(String id) {
    try {
      return state.farmers.firstWhere((farmer) => farmer.id == id);
    } catch (e) {
      return null;
    }
  }

  List<Farmer> getFarmersByVillage(String village) {
    return state.farmers
        .where((farmer) => farmer.village?.toLowerCase() == village.toLowerCase())
        .toList();
  }

  List<Farmer> getRecentFarmers({int limit = 10}) {
    final recentFarmers = state.farmers
        .where((farmer) => farmer.hasRecentDelivery)
        .toList();
    
    // Sort by last delivery date (most recent first)
    recentFarmers.sort((a, b) {
      if (a.lastDelivery == null && b.lastDelivery == null) return 0;
      if (a.lastDelivery == null) return 1;
      if (b.lastDelivery == null) return -1;
      return b.lastDelivery!.compareTo(a.lastDelivery!);
    });

    return recentFarmers.take(limit).toList();
  }

  List<Farmer> getTopPerformers({int limit = 10}) {
    final performers = [...state.farmers];
    
    // Sort by total weight delivered (highest first)
    performers.sort((a, b) => b.totalWeightKg.compareTo(a.totalWeightKg));

    return performers.take(limit).toList();
  }
}

// Farmer Statistics State
class FarmerStatisticsState {
  final FarmerStatistics? statistics;
  final bool isLoading;
  final String? error;

  const FarmerStatisticsState({
    this.statistics,
    this.isLoading = false,
    this.error,
  });

  FarmerStatisticsState copyWith({
    FarmerStatistics? statistics,
    bool? isLoading,
    String? error,
  }) {
    return FarmerStatisticsState(
      statistics: statistics ?? this.statistics,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Farmer Statistics Notifier
class FarmerStatisticsNotifier extends StateNotifier<FarmerStatisticsState> {
  final FarmerRepository _farmerRepository;
  final String _farmerId;

  FarmerStatisticsNotifier({
    required FarmerRepository farmerRepository,
    required String farmerId,
  })  : _farmerRepository = farmerRepository,
        _farmerId = farmerId,
        super(const FarmerStatisticsState()) {
    loadStatistics();
  }

  Future<void> loadStatistics({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await _farmerRepository.getFarmerStatistics(
        farmerId: _farmerId,
        startDate: startDate,
        endDate: endDate,
      );

      result.when(
        success: (statistics) {
          state = state.copyWith(
            statistics: statistics,
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
        error: 'Failed to load statistics: ${e.toString()}',
      );
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Repository Provider
final farmerRepositoryProvider = Provider<FarmerRepository>((ref) {
  return FarmerRepositoryImpl(
    apiService: ref.watch(apiServiceProvider),
    databaseService: ref.watch(databaseServiceProvider),
    syncService: ref.watch(syncServiceProvider),
  );
});

// Use Case Providers
final getFarmersUseCaseProvider = Provider<GetFarmersUseCase>((ref) {
  return GetFarmersUseCase(ref.watch(farmerRepositoryProvider));
});

final createFarmerUseCaseProvider = Provider<CreateFarmerUseCase>((ref) {
  return CreateFarmerUseCase(ref.watch(farmerRepositoryProvider));
});

final getFarmerByPhoneUseCaseProvider = Provider<GetFarmerByPhoneUseCase>((ref) {
  return GetFarmerByPhoneUseCase(ref.watch(farmerRepositoryProvider));
});

// State Notifier Providers
final farmerNotifierProvider = StateNotifierProvider.family<FarmerNotifier, FarmerState, String?>((ref, organizationId) {
  return FarmerNotifier(
    getFarmersUseCase: ref.watch(getFarmersUseCaseProvider),
    createFarmerUseCase: ref.watch(createFarmerUseCaseProvider),
    getFarmerByPhoneUseCase: ref.watch(getFarmerByPhoneUseCaseProvider),
    organizationId: organizationId,
  );
});

final farmerStatisticsNotifierProvider = StateNotifierProvider.family<FarmerStatisticsNotifier, FarmerStatisticsState, String>((ref, farmerId) {
  return FarmerStatisticsNotifier(
    farmerRepository: ref.watch(farmerRepositoryProvider),
    farmerId: farmerId,
  );
});

// Convenience Providers
final currentUserFarmersProvider = Provider<AsyncValue<List<Farmer>>>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user?.organizationId == null) {
    return const AsyncValue.data([]);
  }

  final farmerState = ref.watch(farmerNotifierProvider(user!.organizationId));
  
  if (farmerState.isLoading && farmerState.farmers.isEmpty) {
    return const AsyncValue.loading();
  }
  
  if (farmerState.error != null) {
    return AsyncValue.error(farmerState.error!, StackTrace.current);
  }
  
  return AsyncValue.data(farmerState.farmers);
});

final recentFarmersProvider = Provider<List<Farmer>>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user?.organizationId == null) return [];
  
  final farmerNotifier = ref.watch(farmerNotifierProvider(user!.organizationId).notifier);
  return farmerNotifier.getRecentFarmers();
});

final topPerformingFarmersProvider = Provider<List<Farmer>>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user?.organizationId == null) return [];
  
  final farmerNotifier = ref.watch(farmerNotifierProvider(user!.organizationId).notifier);
  return farmerNotifier.getTopPerformers();
});

// Search Provider
final farmerSearchProvider = StateProvider<String>((ref) => '');

final filteredFarmersProvider = Provider<List<Farmer>>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user?.organizationId == null) return [];
  
  final farmerState = ref.watch(farmerNotifierProvider(user!.organizationId));
  final searchQuery = ref.watch(farmerSearchProvider);
  
  if (searchQuery.isEmpty) {
    return farmerState.farmers;
  }
  
  final query = searchQuery.toLowerCase();
  return farmerState.farmers.where((farmer) =>
    farmer.name.toLowerCase().contains(query) ||
    farmer.phone.contains(searchQuery) ||
    (farmer.village?.toLowerCase().contains(query) ?? false) ||
    (farmer.district?.toLowerCase().contains(query) ?? false)
  ).toList();
});