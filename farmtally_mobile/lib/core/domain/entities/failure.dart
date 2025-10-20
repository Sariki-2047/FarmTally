import 'package:freezed_annotation/freezed_annotation.dart';

part 'failure.freezed.dart';

@freezed
class Failure with _$Failure {
  const factory Failure.network({
    required String message,
    String? code,
  }) = NetworkFailure;

  const factory Failure.server({
    required String message,
    String? code,
    int? statusCode,
  }) = ServerFailure;

  const factory Failure.cache({
    required String message,
  }) = CacheFailure;

  const factory Failure.validation({
    required String message,
    Map<String, String>? fieldErrors,
  }) = ValidationFailure;

  const factory Failure.authentication({
    required String message,
  }) = AuthenticationFailure;

  const factory Failure.authorization({
    required String message,
  }) = AuthorizationFailure;

  const factory Failure.notFound({
    required String message,
  }) = NotFoundFailure;

  const factory Failure.timeout({
    required String message,
  }) = TimeoutFailure;

  const factory Failure.unknown({
    required String message,
    Object? error,
  }) = UnknownFailure;
}

// Extension to get user-friendly messages
extension FailureExtension on Failure {
  String get userMessage {
    return when(
      network: (message, code) => 'Network error: Please check your internet connection',
      server: (message, code, statusCode) => 'Server error: $message',
      cache: (message) => 'Local storage error: $message',
      validation: (message, fieldErrors) => 'Validation error: $message',
      authentication: (message) => 'Authentication error: Please login again',
      authorization: (message) => 'Access denied: $message',
      notFound: (message) => 'Not found: $message',
      timeout: (message) => 'Request timeout: Please try again',
      unknown: (message, error) => 'An unexpected error occurred: $message',
    );
  }
}