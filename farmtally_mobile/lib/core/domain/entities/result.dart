import 'package:freezed_annotation/freezed_annotation.dart';
import 'failure.dart';

part 'result.freezed.dart';

@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(Failure failure) = Error<T>;
}

// Extension methods for easier usage
extension ResultExtension<T> on Result<T> {
  bool get isSuccess => this is Success<T>;
  bool get isFailure => this is Error<T>;

  T? get data => when(
    success: (data) => data,
    failure: (_) => null,
  );

  Failure? get failure => when(
    success: (_) => null,
    failure: (failure) => failure,
  );

  // Transform success data
  Result<R> map<R>(R Function(T) transform) {
    return when(
      success: (data) => Result.success(transform(data)),
      failure: (failure) => Result.failure(failure),
    );
  }

  // Transform failure
  Result<T> mapFailure(Failure Function(Failure) transform) {
    return when(
      success: (data) => Result.success(data),
      failure: (failure) => Result.failure(transform(failure)),
    );
  }

  // Chain operations
  Result<R> flatMap<R>(Result<R> Function(T) transform) {
    return when(
      success: (data) => transform(data),
      failure: (failure) => Result.failure(failure),
    );
  }

  // Execute side effects
  Result<T> onSuccess(void Function(T) action) {
    when(
      success: (data) => action(data),
      failure: (_) {},
    );
    return this;
  }

  Result<T> onFailure(void Function(Failure) action) {
    when(
      success: (_) {},
      failure: (failure) => action(failure),
    );
    return this;
  }
}