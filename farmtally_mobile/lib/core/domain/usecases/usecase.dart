import '../entities/result.dart';

/// Base class for all use cases
/// 
/// [Type] is the return type
/// [Params] is the parameter type
abstract class UseCase<Type, Params> {
  Future<Result<Type>> call(Params params);
}

/// Use case with no parameters
abstract class NoParamsUseCase<Type> {
  Future<Result<Type>> call();
}

/// Use case with stream return type
abstract class StreamUseCase<Type, Params> {
  Stream<Result<Type>> call(Params params);
}

/// Use case with stream return type and no parameters
abstract class NoParamsStreamUseCase<Type> {
  Stream<Result<Type>> call();
}

/// No parameters class for use cases that don't need parameters
class NoParams {
  const NoParams();
}

/// Pagination parameters
class PaginationParams {
  final int page;
  final int limit;
  final String? search;
  final Map<String, dynamic>? filters;

  const PaginationParams({
    this.page = 1,
    this.limit = 20,
    this.search,
    this.filters,
  });

  PaginationParams copyWith({
    int? page,
    int? limit,
    String? search,
    Map<String, dynamic>? filters,
  }) {
    return PaginationParams(
      page: page ?? this.page,
      limit: limit ?? this.limit,
      search: search ?? this.search,
      filters: filters ?? this.filters,
    );
  }
}

/// Paginated result wrapper
class PaginatedResult<T> {
  final List<T> items;
  final int totalCount;
  final int currentPage;
  final int totalPages;
  final bool hasNextPage;
  final bool hasPreviousPage;

  const PaginatedResult({
    required this.items,
    required this.totalCount,
    required this.currentPage,
    required this.totalPages,
    required this.hasNextPage,
    required this.hasPreviousPage,
  });

  factory PaginatedResult.fromData({
    required List<T> items,
    required int totalCount,
    required int currentPage,
    required int limit,
  }) {
    final totalPages = (totalCount / limit).ceil();
    return PaginatedResult(
      items: items,
      totalCount: totalCount,
      currentPage: currentPage,
      totalPages: totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    );
  }
}