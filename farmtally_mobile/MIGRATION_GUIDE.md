# FarmTally Mobile - Architecture Migration Guide

## Overview

This guide explains how to migrate existing features from the old architecture to the new Clean Architecture implementation with proper domain layer, repositories, and use cases.

## ✅ What's Been Implemented

### 1. Core Architecture
- **Domain Layer**: Entities, Use Cases, Repository Interfaces
- **Data Layer**: Repository Implementations with offline support
- **Presentation Layer**: Riverpod providers with proper state management
- **Database**: SQLite with Drift ORM replacing SharedPreferences
- **Sync Service**: Offline-first architecture with automatic sync

### 2. Implemented Features
- **Authentication**: Complete auth flow with domain layer
- **Lorry Management**: Full CRUD operations with offline support
- **Farmer Management**: Complete farmer operations
- **Delivery Recording**: Add deliveries with validation
- **Sync System**: Automatic background sync with retry logic

### 3. New Providers
- `authNotifierProvider`: New auth state management
- `lorryNotifierProvider`: Lorry operations with pagination
- `farmerNotifierProvider`: Farmer operations with search
- `syncServiceProvider`: Offline sync management

## 🔄 Migration Steps

### Step 1: Update Imports

**Old:**
```dart
import '../../../../core/providers/auth_provider.dart';
import '../../data/repositories/lorry_repository.dart';
import '../../data/models/lorry_model.dart';
```

**New:**
```dart
import '../../../../core/presentation/providers/auth_provider.dart';
import '../../../../core/presentation/providers/lorry_provider.dart';
import '../../../../core/domain/entities/lorry.dart';
```

### Step 2: Update Provider Usage

**Old:**
```dart
final lorriesAsync = ref.watch(lorriesProvider(user!.organizationId!));

lorriesAsync.when(
  data: (lorries) => ListView.builder(...),
  loading: () => CircularProgressIndicator(),
  error: (error, stack) => ErrorWidget(error),
)
```

**New:**
```dart
final lorryState = ref.watch(lorryNotifierProvider(user!.organizationId));

if (lorryState.isLoading && lorryState.lorries.isEmpty) {
  return CircularProgressIndicator();
}

if (lorryState.error != null) {
  return ErrorWidget(lorryState.error!);
}

return ListView.builder(
  itemCount: lorryState.lorries.length,
  itemBuilder: (context, index) => LorryCard(lorryState.lorries[index]),
);
```

### Step 3: Update Data Operations

**Old:**
```dart
// Direct repository calls
final repository = ref.read(lorryRepositoryProvider);
final lorries = await repository.getLorries();
```

**New:**
```dart
// Through use cases and providers
final result = await ref.read(lorryNotifierProvider(organizationId).notifier)
    .createLorry(
      registrationNumber: 'MH12AB1234',
      driverName: 'John Doe',
      driverPhone: '9876543210',
      capacity: 10.0,
    );

if (result.isSuccess) {
  // Handle success
} else {
  // Handle error with result.failure!.userMessage
}
```

### Step 4: Update Error Handling

**Old:**
```dart
try {
  final result = await apiCall();
  // Handle result
} catch (e) {
  showError(e.toString());
}
```

**New:**
```dart
final result = await useCase.call(params);

result.when(
  success: (data) {
    // Handle success
  },
  failure: (failure) {
    showError(failure.userMessage); // User-friendly message
  },
);
```

## 📁 File Structure Changes

### Old Structure
```
lib/
├── features/
│   └── lorry/
│       ├── data/
│       │   ├── models/
│       │   └── repositories/
│       └── presentation/
│           ├── pages/
│           └── providers/
```

### New Structure
```
lib/
├── core/
│   ├── domain/
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── usecases/
│   │   └── services/
│   ├── data/
│   │   └── repositories/
│   ├── presentation/
│   │   └── providers/
│   └── database/
└── features/
    └── lorry/
        └── presentation/
            └── pages/
```

## 🔧 Migration Examples

### Example 1: Lorry List Page

See `lorry_list_page_new.dart` for a complete example of migrating a list page with:
- ✅ New provider usage
- ✅ Proper error handling
- ✅ Loading states
- ✅ Pagination support
- ✅ Search functionality
- ✅ Offline support

### Example 2: Creating a Lorry

**Old:**
```dart
final repository = ref.read(lorryRepositoryProvider);
try {
  final lorry = await repository.createLorry(data);
  setState(() {
    lorries.add(lorry);
  });
} catch (e) {
  showError(e.toString());
}
```

**New:**
```dart
final result = await ref.read(lorryNotifierProvider(organizationId).notifier)
    .createLorry(
      registrationNumber: registrationNumber,
      driverName: driverName,
      driverPhone: driverPhone,
      capacity: capacity,
    );

if (result.isSuccess) {
  // Lorry automatically added to state
  showSuccess('Lorry created successfully');
} else {
  showError(result.failure!.userMessage);
}
```

### Example 3: Farmer Search

**New Implementation:**
```dart
// Search farmers
await ref.read(farmerNotifierProvider(organizationId).notifier)
    .searchFarmers(query);

// Get farmer by phone
final result = await ref.read(farmerNotifierProvider(organizationId).notifier)
    .getFarmerByPhone(phoneNumber);

if (result.isSuccess && result.data != null) {
  // Farmer found
  final farmer = result.data!;
} else {
  // Farmer not found or error
}
```

## 🎯 Benefits of New Architecture

### 1. **Offline-First**
- All data operations work offline
- Automatic sync when online
- Retry mechanisms for failed operations

### 2. **Better Error Handling**
- User-friendly error messages
- Consistent error types
- Proper validation

### 3. **Type Safety**
- Freezed entities with immutability
- Proper null safety
- Generated code for models

### 4. **Performance**
- Proper database with indexing
- Pagination support
- Efficient state management

### 5. **Testability**
- Clean separation of concerns
- Mockable repositories
- Testable use cases

## 🚀 Next Steps

### Immediate Tasks:
1. **Migrate Existing Pages**: Update lorry, farmer, and delivery pages
2. **Update Navigation**: Ensure routing works with new providers
3. **Add Tests**: Write unit tests for use cases and repositories
4. **Performance Optimization**: Add proper loading states and pagination

### Future Enhancements:
1. **Real-time Updates**: WebSocket integration
2. **Advanced Search**: Full-text search capabilities
3. **Caching Strategy**: Implement smart caching
4. **Background Sync**: Improve sync performance

## 📋 Migration Checklist

For each feature migration:

- [ ] Update imports to use new providers
- [ ] Replace direct repository calls with provider methods
- [ ] Update error handling to use Result pattern
- [ ] Add proper loading states
- [ ] Implement offline support
- [ ] Add validation using use cases
- [ ] Update UI to show sync status
- [ ] Test offline functionality
- [ ] Add proper error messages
- [ ] Implement pagination if needed

## 🔍 Testing the Migration

1. **Offline Testing**: Disable network and test all operations
2. **Sync Testing**: Test sync when network is restored
3. **Error Testing**: Test various error scenarios
4. **Performance Testing**: Test with large datasets
5. **User Experience**: Ensure smooth transitions and feedback

The new architecture provides a solid foundation for scalable, maintainable, and robust mobile application development.