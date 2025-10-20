# FarmTally Frontend Developer Guide

## 📋 Project Overview

FarmTally is a comprehensive corn procurement management system built with Flutter that streamlines the entire supply chain from farmer to business. The system manages lorry operations, farmer relationships, weight recording, quality assessment, and financial settlements across multiple organizations.

### 🎯 Core Business Model
- **Farm Admin** (Business Owner) employs **Field Managers** (Employees) who coordinate with **Farmers** (Corn Suppliers)
- Multi-organization support: Farmers can supply to multiple businesses with complete data isolation
- Mobile-first design optimized for field operations with offline support

## 🏗️ Technical Architecture

### Technology Stack
- **Framework**: Flutter 3.16+ with Dart 3.0+
- **UI Design**: Material Design 3 with custom agricultural theme
- **State Management**: Riverpod for reactive state management
- **Navigation**: GoRouter for declarative routing
- **Forms**: Flutter Form Builder with validation
- **Charts**: FL Chart for analytics dashboards
- **HTTP Client**: Dio with interceptors for API calls
- **Local Database**: SQLite with Drift ORM for offline support
- **Platform Support**: iOS, Android, Web, Windows, macOS, Linux

### Project Structure
```
lib/
├── main.dart                   # App entry point
├── core/                       # Core utilities and constants
│   ├── app/                    # App configuration & routing
│   ├── constants/              # App constants & themes
│   ├── models/                 # Core data models
│   ├── providers/              # Global providers
│   ├── services/               # Core services (API, storage)
│   ├── utils/                  # Utility functions
│   └── widgets/                # Reusable UI components
├── features/                   # Feature-based organization
│   ├── auth/                   # Authentication
│   ├── dashboard/              # Role-based dashboards
│   ├── farmer/                 # Farmer management
│   ├── lorry/                  # Lorry management
│   ├── lorry_request/          # Lorry request workflow
│   ├── delivery/               # Delivery entry system
│   ├── reports/                # Reporting & analytics
│   └── notifications/          # Notification system
└── l10n/                       # Internationalization
```

## 👥 User Roles & Interfaces

### 1. Farm Admin (Business Owner)
**Primary Responsibilities:**
- Manage lorry fleet and assignments
- Approve/reject lorry requests from field managers
- Set pricing and quality deduction parameters
- Process final payments and settlements
- Generate business reports and analytics

**Key UI Components:**
- Executive dashboard with KPIs
- Lorry fleet management interface
- Request approval workflow
- Financial management tools
- Advanced reporting dashboard

### 2. Field Manager (Employee)
**Primary Responsibilities:**
- Request lorries for procurement operations
- Add farmers to lorries and record deliveries
- Enter individual bag weights and moisture content
- Record farmer advance payments
- Submit completed lorry data for processing

**Key UI Components:**
- Operational dashboard
- Lorry request creation form
- Delivery entry interface with bag weight tracking
- Farmer management tools
- Field operation reports

### 3. Farmer (Corn Supplier)
**Primary Responsibilities:**
- View delivery schedules across organizations
- Track payment history and advance balances
- Monitor quality feedback and performance
- Access settlement reports and documentation
- Manage multi-organization relationships

**Key UI Components:**
- Personal dashboard with delivery schedule
- Payment history and balance tracking
- Quality feedback interface
- Multi-organization relationship management
- Settlement documentation access

## 🎨 Design System & UI Guidelines

### Color Palette (Agricultural Theme)
```dart
// Primary Colors
const Color primaryGreen = Color(0xFF2E7D32);      // Forest Green
const Color primaryLightGreen = Color(0xFF4CAF50);  // Light Green
const Color accentGold = Color(0xFFFFB300);         // Golden Yellow

// Secondary Colors
const Color earthBrown = Color(0xFF5D4037);         // Earth Brown
const Color skyBlue = Color(0xFF1976D2);            // Sky Blue
const Color warmOrange = Color(0xFFFF8F00);         // Warm Orange

// Neutral Colors
const Color lightGray = Color(0xFFF5F5F5);          // Background
const Color mediumGray = Color(0xFF9E9E9E);         // Text Secondary
const Color darkGray = Color(0xFF424242);           // Text Primary
```

### Typography
```dart
// Headings
TextStyle headingLarge = TextStyle(
  fontSize: 32,
  fontWeight: FontWeight.bold,
  color: darkGray,
);

TextStyle headingMedium = TextStyle(
  fontSize: 24,
  fontWeight: FontWeight.w600,
  color: darkGray,
);

// Body Text
TextStyle bodyLarge = TextStyle(
  fontSize: 16,
  fontWeight: FontWeight.normal,
  color: darkGray,
);

TextStyle bodyMedium = TextStyle(
  fontSize: 14,
  fontWeight: FontWeight.normal,
  color: mediumGray,
);
```

### Component Guidelines

#### Cards & Containers
- Use elevated cards with subtle shadows
- Round corners with 12px radius
- Consistent padding: 16px
- Status indicators with color coding

#### Buttons
- Primary: Green background with white text
- Secondary: Outlined with green border
- Danger: Red background for destructive actions
- Minimum height: 48px for accessibility

#### Forms
- Material Design 3 text fields
- Proper validation with error states
- Loading states during submission
- Clear success/error feedback

#### Navigation
- Bottom navigation for mobile
- Side navigation for tablet/desktop
- Role-based menu items
- Clear active state indicators

## 📱 Screen Specifications

### Authentication Screens

#### Login Screen
```dart
// Key Features:
- Email/phone input with validation
- Password field with visibility toggle
- "Remember me" checkbox
- "Forgot password" link
- Role-based login (auto-detect from backend)
- Backend connection test button
- Beautiful splash animation with leaf logo

// Demo Credentials:
- Farm Admin: admin@farmtally.com / Admin123!
- Field Manager: manager@farmtally.com / Manager123!
- Farmer: farmer@farmtally.com / Farmer123!
```

#### Splash Screen
```dart
// Features:
- Animated leaf logo
- Loading indicator
- Auto-login if tokens exist
- Smooth transition to dashboard
```

### Dashboard Screens

#### Farm Admin Dashboard
```dart
// Key Metrics Cards:
- Total Lorries (Available/Assigned/Maintenance)
- Pending Requests (with approval actions)
- Today's Deliveries (weight & count)
- Revenue Summary (daily/weekly/monthly)

// Quick Actions:
- Approve Pending Requests
- View Fleet Status
- Generate Reports
- Manage Pricing

// Recent Activity Feed:
- New lorry requests
- Completed deliveries
- Payment settlements
- System notifications
```

#### Field Manager Dashboard
```dart
// Key Metrics Cards:
- Assigned Lorries
- Today's Schedule
- Pending Deliveries
- Farmer Count

// Quick Actions:
- Request Lorry
- Record Delivery
- Add Farmer
- View Reports

// Active Operations:
- Current lorry assignments
- Scheduled pickups
- In-progress deliveries
```

#### Farmer Dashboard
```dart
// Key Information Cards:
- Next Delivery Schedule
- Payment Balance
- Recent Deliveries
- Quality Ratings

// Multi-Organization View:
- Organization selector
- Separate balances per org
- Delivery history per org
- Payment tracking per org

// Quick Access:
- View Payment History
- Check Delivery Schedule
- Contact Field Manager
- Download Receipts
```

### Lorry Management

#### Lorry List Screen
```dart
// Features:
- Grid/List view toggle
- Status-based filtering (Available, Assigned, In Transit, Maintenance)
- Search by lorry number or driver name
- Sort by capacity, status, last activity
- Pull-to-refresh functionality

// Lorry Card Components:
- Lorry number and driver name
- Capacity and current load
- Status indicator with color coding
- Assigned manager (if any)
- Last location update
- Action buttons (Assign, Maintenance, Details)
```

#### Lorry Details Screen
```dart
// Information Sections:
- Basic Info (Number, Driver, Capacity)
- Current Status & Location
- Assignment History
- Maintenance Schedule
- Performance Metrics

// Actions:
- Assign to Manager
- Schedule Maintenance
- Update Location
- View Trip History
```

### Farmer Management

#### Farmer List Screen
```dart
// Features:
- Search by name, phone, or ID
- Filter by performance rating
- Sort by recent activity, earnings
- Add new farmer button (role-based)
- Export farmer list

// Farmer Card Components:
- Profile photo placeholder
- Name and contact info
- Performance rating (stars)
- Total deliveries and earnings
- Last delivery date
- Quick action buttons
```

#### Farmer Details Screen
```dart
// Information Tabs:
- Personal Info (Name, Contact, Address, ID)
- Bank Details (Account, IFSC, Bank Name)
- Performance Metrics (Deliveries, Quality, Earnings)
- Payment History (Advances, Settlements)
- Delivery History (Dates, Weights, Quality)

// Actions:
- Edit Information
- Record Advance Payment
- View Full History
- Generate Statement
```

### Lorry Request Workflow

#### Request Creation Screen
```dart
// Form Fields:
- Requested Location (with map integration)
- Requested Date & Time
- Purpose/Description
- Estimated Farmers Count
- Estimated Weight (kg)
- Special Notes
- Urgency Level

// Validation:
- Required field validation
- Date cannot be in past
- Reasonable weight estimates
- Location format validation

// Submission:
- Loading state during submission
- Success confirmation
- Error handling with retry
```

#### Request List Screen (Field Manager)
```dart
// Features:
- Status-based tabs (All, Pending, Approved, Rejected, Completed)
- Search by location or purpose
- Date range filtering
- Pull-to-refresh

// Request Card Components:
- Request ID and date
- Location and purpose
- Status indicator
- Estimated metrics
- Assigned lorry (if approved)
- Rejection reason (if rejected)
- Action buttons based on status
```

#### Request Approval Screen (Farm Admin)
```dart
// Request Details:
- Field manager information
- Request details and estimates
- Location on map
- Urgency indicator

// Approval Actions:
- Lorry selection dropdown (available lorries only)
- Approval notes field
- Approve button with confirmation
- Reject with reason field
- Defer with new date suggestion

// Bulk Actions:
- Select multiple requests
- Bulk approve with lorry assignment
- Bulk reject with common reason
```

### Delivery Entry System

#### Delivery Entry Screen
```dart
// Farmer Selection:
- Searchable farmer dropdown
- Add new farmer option
- Farmer details preview

// Bag Weight Entry:
- Individual bag weight input
- Moisture content per bag
- Quality grade (1-5 scale)
- Running total display
- Add/remove bag functionality

// Calculations:
- Gross weight total
- Moisture deductions
- Quality deductions
- Net weight and amount
- Real-time price calculations

// Additional Info:
- Delivery notes
- Photo upload (multiple)
- Signature capture
- GPS location stamp

// Submission:
- Validation checks
- Confirmation dialog
- Offline support
- Sync status indicator
```

#### Bag Weight Management
```dart
// Individual Bag Entry:
- Bag number auto-increment
- Weight input with validation
- Moisture percentage
- Quality rating selector
- Remove bag option

// Summary Display:
- Total bags count
- Average weight
- Average moisture
- Total gross weight
- Total deductions
- Final net weight

// Bulk Operations:
- Set default moisture for all
- Apply quality grade to all
- Clear all bags
- Import from previous delivery
```

### Reports & Analytics

#### Reports Dashboard
```dart
// Report Categories:
- Delivery Reports (Daily, Weekly, Monthly)
- Farmer Performance Reports
- Lorry Utilization Reports
- Financial Summary Reports
- Quality Analysis Reports

// Quick Reports:
- Today's Deliveries
- Weekly Summary
- Top Performing Farmers
- Lorry Efficiency
- Payment Pending

// Custom Reports:
- Date range selector
- Filter options (farmer, lorry, location)
- Export options (PDF, Excel, CSV)
- Email report functionality
```

#### Charts & Visualizations
```dart
// Chart Types:
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Gauge charts for KPIs

// Interactive Features:
- Zoom and pan
- Data point tooltips
- Legend toggle
- Export chart as image

// Data Refresh:
- Auto-refresh options
- Manual refresh button
- Last updated timestamp
- Loading states
```

## 🔧 Implementation Guidelines

### State Management with Riverpod

#### Provider Structure
```dart
// Auth Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(apiServiceProvider));
});

// Farmer Provider
final farmerProvider = StateNotifierProvider<FarmerNotifier, AsyncValue<List<Farmer>>>((ref) {
  return FarmerNotifier(ref.read(farmerRepositoryProvider));
});

// Lorry Request Provider
final lorryRequestProvider = StateNotifierProvider<LorryRequestNotifier, AsyncValue<List<LorryRequest>>>((ref) {
  return LorryRequestNotifier(ref.read(lorryRequestRepositoryProvider));
});
```

#### Error Handling
```dart
// Consistent error handling across providers
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final String? details;
  
  ApiException(this.message, {this.statusCode, this.details});
}

// Error display widget
class ErrorDisplay extends ConsumerWidget {
  final String error;
  final VoidCallback? onRetry;
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        Icon(Icons.error_outline, size: 48, color: Colors.red),
        Text(error, textAlign: TextAlign.center),
        if (onRetry != null)
          ElevatedButton(
            onPressed: onRetry,
            child: Text('Retry'),
          ),
      ],
    );
  }
}
```

### API Integration

#### Service Layer
```dart
class ApiService {
  final Dio _dio;
  
  ApiService() : _dio = Dio() {
    _dio.options.baseUrl = 'http://localhost:8000';
    _dio.interceptors.add(AuthInterceptor());
    _dio.interceptors.add(LoggingInterceptor());
  }
  
  Future<ApiResponse<T>> get<T>(String path, {Map<String, dynamic>? queryParams}) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParams);
      return ApiResponse.success(response.data);
    } on DioException catch (e) {
      return ApiResponse.error(e.message ?? 'Unknown error');
    }
  }
}
```

#### Repository Pattern
```dart
abstract class FarmerRepository {
  Future<List<Farmer>> getFarmers({int page = 1, int limit = 20, String? search});
  Future<Farmer> getFarmerById(String id);
  Future<Farmer> createFarmer(CreateFarmerRequest request);
  Future<Farmer> updateFarmer(String id, UpdateFarmerRequest request);
  Future<void> deleteFarmer(String id);
}

class FarmerRepositoryImpl implements FarmerRepository {
  final ApiService _apiService;
  
  FarmerRepositoryImpl(this._apiService);
  
  @override
  Future<List<Farmer>> getFarmers({int page = 1, int limit = 20, String? search}) async {
    final response = await _apiService.get('/api/v1/farmers', queryParams: {
      'page': page,
      'limit': limit,
      if (search != null) 'search': search,
    });
    
    if (response.isSuccess) {
      return (response.data['farmers'] as List)
          .map((json) => Farmer.fromJson(json))
          .toList();
    } else {
      throw ApiException(response.error!);
    }
  }
}
```

### Form Handling

#### Form Validation
```dart
class LorryRequestForm extends ConsumerStatefulWidget {
  @override
  ConsumerState<LorryRequestForm> createState() => _LorryRequestFormState();
}

class _LorryRequestFormState extends ConsumerState<LorryRequestForm> {
  final _formKey = GlobalKey<FormState>();
  final _locationController = TextEditingController();
  final _purposeController = TextEditingController();
  DateTime? _selectedDate;
  int? _estimatedFarmers;
  double? _estimatedWeight;
  
  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            controller: _locationController,
            decoration: InputDecoration(
              labelText: 'Location',
              prefixIcon: Icon(Icons.location_on),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Location is required';
              }
              return null;
            },
          ),
          // More form fields...
          ElevatedButton(
            onPressed: _submitForm,
            child: Text('Submit Request'),
          ),
        ],
      ),
    );
  }
  
  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      final request = CreateLorryRequestRequest(
        location: _locationController.text,
        purpose: _purposeController.text,
        requestedDate: _selectedDate!,
        estimatedFarmers: _estimatedFarmers!,
        estimatedWeight: _estimatedWeight!,
      );
      
      ref.read(lorryRequestProvider.notifier).createRequest(request);
    }
  }
}
```

### Offline Support

#### Local Storage
```dart
@DriftDatabase(tables: [Farmers, Lorries, Deliveries])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());
  
  @override
  int get schemaVersion => 1;
  
  // Sync methods
  Future<void> syncFarmers() async {
    final localFarmers = await select(farmers).get();
    final remoteFarmers = await _apiService.getFarmers();
    
    // Sync logic here
  }
}
```

#### Sync Status Indicator
```dart
class SyncStatusWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncStatus = ref.watch(syncStatusProvider);
    
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getSyncColor(syncStatus),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_getSyncIcon(syncStatus), size: 16),
          SizedBox(width: 4),
          Text(_getSyncText(syncStatus)),
        ],
      ),
    );
  }
}
```

## 🧪 Testing Guidelines

### Unit Tests
```dart
void main() {
  group('FarmerNotifier', () {
    late FarmerNotifier notifier;
    late MockFarmerRepository mockRepository;
    
    setUp(() {
      mockRepository = MockFarmerRepository();
      notifier = FarmerNotifier(mockRepository);
    });
    
    test('should load farmers successfully', () async {
      // Arrange
      final farmers = [Farmer(id: '1', name: 'John Doe')];
      when(mockRepository.getFarmers()).thenAnswer((_) async => farmers);
      
      // Act
      await notifier.loadFarmers();
      
      // Assert
      expect(notifier.state.value, farmers);
    });
  });
}
```

### Widget Tests
```dart
void main() {
  testWidgets('FarmerCard displays farmer information', (tester) async {
    // Arrange
    final farmer = Farmer(
      id: '1',
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
    );
    
    // Act
    await tester.pumpWidget(
      MaterialApp(
        home: FarmerCard(farmer: farmer),
      ),
    );
    
    // Assert
    expect(find.text('John Doe'), findsOneWidget);
    expect(find.text('+1234567890'), findsOneWidget);
  });
}
```

### Integration Tests
```dart
void main() {
  group('Login Flow', () {
    testWidgets('should login successfully with valid credentials', (tester) async {
      // Setup mock server
      await tester.pumpWidget(MyApp());
      
      // Enter credentials
      await tester.enterText(find.byKey(Key('email_field')), 'admin@farmtally.com');
      await tester.enterText(find.byKey(Key('password_field')), 'Admin123!');
      
      // Tap login
      await tester.tap(find.byKey(Key('login_button')));
      await tester.pumpAndSettle();
      
      // Verify navigation to dashboard
      expect(find.byType(DashboardPage), findsOneWidget);
    });
  });
}
```

## 📱 Responsive Design

### Breakpoints
```dart
class Breakpoints {
  static const double mobile = 600;
  static const double tablet = 1024;
  static const double desktop = 1440;
}

class ResponsiveBuilder extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;
  
  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    
    if (screenWidth >= Breakpoints.desktop && desktop != null) {
      return desktop!;
    } else if (screenWidth >= Breakpoints.tablet && tablet != null) {
      return tablet!;
    } else {
      return mobile;
    }
  }
}
```

### Adaptive Layouts
```dart
class AdaptiveScaffold extends StatelessWidget {
  final Widget body;
  final List<NavigationItem> navigationItems;
  
  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      mobile: Scaffold(
        body: body,
        bottomNavigationBar: BottomNavigationBar(
          items: navigationItems.map((item) => item.toBottomNavItem()).toList(),
        ),
      ),
      tablet: Scaffold(
        body: Row(
          children: [
            NavigationRail(
              destinations: navigationItems.map((item) => item.toRailDestination()).toList(),
            ),
            Expanded(child: body),
          ],
        ),
      ),
    );
  }
}
```

## 🚀 Performance Optimization

### Image Optimization
```dart
class OptimizedImage extends StatelessWidget {
  final String imageUrl;
  final double? width;
  final double? height;
  
  @override
  Widget build(BuildContext context) {
    return CachedNetworkImage(
      imageUrl: imageUrl,
      width: width,
      height: height,
      placeholder: (context, url) => Shimmer.fromColors(
        baseColor: Colors.grey[300]!,
        highlightColor: Colors.grey[100]!,
        child: Container(
          width: width,
          height: height,
          color: Colors.white,
        ),
      ),
      errorWidget: (context, url, error) => Icon(Icons.error),
      memCacheWidth: width?.toInt(),
      memCacheHeight: height?.toInt(),
    );
  }
}
```

### List Performance
```dart
class OptimizedFarmerList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final farmers = ref.watch(farmerProvider);
    
    return farmers.when(
      data: (farmerList) => ListView.builder(
        itemCount: farmerList.length,
        itemBuilder: (context, index) {
          return FarmerCard(
            key: ValueKey(farmerList[index].id),
            farmer: farmerList[index],
          );
        },
      ),
      loading: () => SkeletonLoader(),
      error: (error, stack) => ErrorDisplay(error: error.toString()),
    );
  }
}
```

## 🔒 Security Considerations

### Token Management
```dart
class SecureStorage {
  static const _storage = FlutterSecureStorage();
  
  static Future<void> storeToken(String token) async {
    await _storage.write(key: 'access_token', value: token);
  }
  
  static Future<String?> getToken() async {
    return await _storage.read(key: 'access_token');
  }
  
  static Future<void> clearTokens() async {
    await _storage.deleteAll();
  }
}
```

### Input Validation
```dart
class ValidationUtils {
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
      return 'Please enter a valid email';
    }
    return null;
  }
  
  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Phone number is required';
    }
    if (!RegExp(r'^\+?[1-9]\d{1,14}$').hasMatch(value)) {
      return 'Please enter a valid phone number';
    }
    return null;
  }
}
```

## 📚 Additional Resources

### API Documentation
- Base URL: `http://localhost:8000`
- Authentication: JWT Bearer tokens
- All endpoints return JSON responses
- Error responses include error codes and messages

### Design Assets
- Logo files in `assets/images/`
- Icon set in `assets/icons/`
- Color palette defined in `lib/core/constants/colors.dart`
- Typography styles in `lib/core/constants/text_styles.dart`

### Development Tools
- Flutter DevTools for debugging
- Riverpod Inspector for state management
- Network Inspector for API calls
- Performance profiler for optimization

This comprehensive guide provides everything a frontend developer needs to understand the requirements and implement the FarmTally UI effectively. The focus is on creating a beautiful, functional, and maintainable Flutter application that serves all user roles efficiently.