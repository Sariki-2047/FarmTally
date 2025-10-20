import 'package:dio/dio.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';

import '../utils/app_constants.dart';
import 'database_service.dart';

class ApiService {
  late final Dio _dio;
  String? _authToken;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: AppConstants.apiTimeout,
      receiveTimeout: AppConstants.apiTimeout,
      sendTimeout: AppConstants.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _setupInterceptors();
    
    // Log the API base URL for debugging
    print('🌐 API Service initialized with base URL: ${AppConstants.apiBaseUrl}');
  }

  void _setupInterceptors() {
    // Request interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        // Add auth token if available
        if (_authToken != null) {
          options.headers['Authorization'] = 'Bearer $_authToken';
        }
        
        debugPrint('→ ${options.method} ${options.uri}');
        if (options.data != null) {
          debugPrint('📤 Request Data: ${options.data}');
        }
        
        handler.next(options);
      },
      
      onResponse: (response, handler) {
        debugPrint('✅ ${response.statusCode} ${response.requestOptions.uri}');
        handler.next(response);
      },
      
      onError: (error, handler) async {
        debugPrint('✗ ${error.requestOptions.uri} → ${error.message}');
        
        // Handle offline scenarios
        if (error.type == DioExceptionType.connectionTimeout ||
            error.type == DioExceptionType.receiveTimeout ||
            error.type == DioExceptionType.sendTimeout) {
          
          // Check if we're offline
          final connectivity = await Connectivity().checkConnectivity();
          if (connectivity == ConnectivityResult.none) {
            // Try to serve from local database
            final cachedResponse = await _handleOfflineRequest(error.requestOptions);
            if (cachedResponse != null) {
              return handler.resolve(cachedResponse);
            }
          }
        }
        
        // Handle 401 Unauthorized - token expired
        if (error.response?.statusCode == 401) {
          // Token refresh should be handled by auth provider
          // For now, just pass the error through
        }
        
        handler.next(error);
      },
    ));
  }

  // Set authentication token
  void setAuthToken(String token) {
    _authToken = token;
  }

  // Clear authentication token
  void clearAuthToken() {
    _authToken = null;
  }

  // GET request
  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      
      // Cache successful responses for offline use
      await _cacheResponse(path, response.data, queryParameters);
      
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // POST request
  Future<Map<String, dynamic>> post(
    String path,
    dynamic data, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // PUT request
  Future<Map<String, dynamic>> put(
    String path,
    dynamic data, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // DELETE request
  Future<Map<String, dynamic>> delete(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Upload file
  Future<Map<String, dynamic>> uploadFile(
    String path,
    String filePath, {
    String fieldName = 'file',
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(filePath),
        ...?data,
      });

      final response = await _dio.post(
        path,
        data: formData,
        options: Options(
          headers: {'Content-Type': 'multipart/form-data'},
        ),
        onSendProgress: onSendProgress,
      );

      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Upload multiple files
  Future<Map<String, dynamic>> uploadFiles(
    String path,
    List<String> filePaths, {
    String fieldName = 'photos',
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final formData = FormData();
      
      // Add additional data if provided
      if (data != null) {
        data.forEach((key, value) {
          formData.fields.add(MapEntry(key, value.toString()));
        });
      }
      
      // Add files
      for (int i = 0; i < filePaths.length; i++) {
        final file = await MultipartFile.fromFile(
          filePaths[i],
          filename: 'photo_$i.jpg',
        );
        formData.files.add(MapEntry(fieldName, file));
      }

      final response = await _dio.post(
        path,
        data: formData,
        options: Options(
          headers: {'Content-Type': 'multipart/form-data'},
        ),
        onSendProgress: onSendProgress,
      );

      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Download file
  Future<void> downloadFile(
    String url,
    String savePath, {
    ProgressCallback? onReceiveProgress,
    CancelToken? cancelToken,
  }) async {
    try {
      await _dio.download(
        url,
        savePath,
        onReceiveProgress: onReceiveProgress,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Handle offline requests
  Future<Response?> _handleOfflineRequest(RequestOptions options) async {
    if (options.method == 'GET') {
      // Try to get cached response
      final cachedData = await _getCachedResponse(options.path, options.queryParameters);
      if (cachedData != null) {
        return Response(
          requestOptions: options,
          data: cachedData,
          statusCode: 200,
        );
      }
    }
    return null;
  }

  // Cache response for offline use
  Future<void> _cacheResponse(
    String path,
    dynamic data,
    Map<String, dynamic>? queryParameters,
  ) async {
    try {
      final db = DatabaseService.instance;
      final cacheKey = _generateCacheKey(path, queryParameters);
      
      await db.cacheApiResponse(
        key: cacheKey,
        data: data,
        expiresAt: DateTime.now().add(const Duration(hours: 24)),
      );
    } catch (e) {
      // Ignore cache errors
      print('Cache error: $e');
    }
  }

  // Get cached response
  Future<Map<String, dynamic>?> _getCachedResponse(
    String path,
    Map<String, dynamic>? queryParameters,
  ) async {
    try {
      final db = DatabaseService.instance;
      final cacheKey = _generateCacheKey(path, queryParameters);
      
      return await db.getCachedApiResponse(cacheKey);
    } catch (e) {
      print('Cache retrieval error: $e');
      return null;
    }
  }

  // Generate cache key
  String _generateCacheKey(String path, Map<String, dynamic>? queryParameters) {
    final params = queryParameters?.entries
        .map((e) => '${e.key}=${e.value}')
        .join('&') ?? '';
    return '$path${params.isNotEmpty ? '?$params' : ''}';
  }

  // Handle API errors
  ApiException _handleError(DioException error) {
    print('API Error: ${error.type} - ${error.message}');
    print('Request URL: ${error.requestOptions.uri}');
    
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException(
          'Connection timeout. Please check your internet connection and ensure the backend server is running.',
          type: ApiExceptionType.timeout,
        );
      
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        String message = 'An error occurred';
        
        // Safely extract error message
        try {
          final responseData = error.response?.data;
          if (responseData is Map<String, dynamic>) {
            message = responseData['message']?.toString() ?? 
                     responseData['error']?.toString() ?? 
                     'An error occurred';
          } else if (responseData is String) {
            message = responseData;
          }
        } catch (e) {
          message = 'An error occurred';
        }
        
        switch (statusCode) {
          case 400:
            return ApiException(message, type: ApiExceptionType.badRequest);
          case 401:
            return ApiException('Unauthorized access', type: ApiExceptionType.unauthorized);
          case 403:
            return ApiException('Access forbidden', type: ApiExceptionType.forbidden);
          case 404:
            return ApiException('Resource not found', type: ApiExceptionType.notFound);
          case 422:
            return ApiException(message, type: ApiExceptionType.validation);
          case 500:
            return ApiException('Server error', type: ApiExceptionType.serverError);
          default:
            return ApiException(message, type: ApiExceptionType.unknown);
        }
      
      case DioExceptionType.cancel:
        return ApiException('Request cancelled', type: ApiExceptionType.cancelled);
      
      case DioExceptionType.unknown:
      default:
        return ApiException(
          'Network error. Please check your connection and ensure the backend server is running at ${AppConstants.apiBaseUrl}',
          type: ApiExceptionType.network,
        );
    }
  }
}

// API Exception
class ApiException implements Exception {
  final String message;
  final ApiExceptionType type;
  final int? statusCode;
  final Map<String, dynamic>? data;

  const ApiException(
    this.message, {
    required this.type,
    this.statusCode,
    this.data,
  });

  @override
  String toString() => message;
}

enum ApiExceptionType {
  network,
  timeout,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  validation,
  serverError,
  cancelled,
  unknown,
}