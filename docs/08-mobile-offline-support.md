# Mobile & Offline Support System
## Complete Mobile-First & Offline Capabilities

### Overview
FarmTally is built with Flutter to provide native mobile performance with comprehensive offline support, recognizing that field operations often occur in areas with limited or unreliable internet connectivity. The system ensures continuous operation regardless of network conditions.

### Flutter Mobile-First Architecture

#### Design Principles
- **Native Performance**: Compiled to native ARM code for optimal speed
- **Touch-First Interface**: Large touch targets, gesture-based navigation
- **Thumb-Friendly**: Critical actions within thumb reach on mobile devices
- **Fast Loading**: Optimized native performance and efficient rendering
- **Battery Efficient**: Native optimizations for minimal battery drain
- **Readable in Sunlight**: High contrast design for outdoor visibility
- **Simple Navigation**: Intuitive navigation for users with varying tech literacy

#### Flutter Native Features
- **Cross-Platform**: Single codebase for iOS, Android, Web, Desktop
- **Native Performance**: 60fps smooth animations and interactions
- **Platform Integration**: Native camera, GPS, file system access
- **Offline-First**: SQLite database with automatic sync capabilities
- **Push Notifications**: Firebase Cloud Messaging integration
- **Background Tasks**: Background sync and data processing
- **Biometric Auth**: Fingerprint/Face ID authentication support

### Mobile Interface Specifications

#### Mobile Navigation System
```
┌─────────────────────────────────────┐
│            Header Bar               │
│  [☰] FarmTally    [🔔] [📶] [👤]   │
├─────────────────────────────────────┤
│                                     │
│         Main Content Area           │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        Content Cards            │ │
│  │                                 │ │
│  │  [Card 1: Today's Tasks]        │ │
│  │  [Card 2: Active Lorries]       │ │
│  │  [Card 3: Quick Actions]        │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│         Bottom Navigation           │
│  [🏠] [🚛] [👥] [📊] [⚙️]          │
│ Home Lorry People Report Settings   │
└─────────────────────────────────────┘
```

#### Mobile Card-Based Layout
Instead of traditional data tables, mobile uses card-based layouts:

```
┌─────────────────────────────────────┐
│           Farmer Card               │
├─────────────────────────────────────┤
│ 👤 Ramesh Kumar                     │
│ 📞 +91-9876543210                   │
│ 📍 Village: Kolar                   │
├─────────────────────────────────────┤
│ Bags: 5 | Weight: 221.0 KG         │
│ Moisture: 14.5% | Quality: Good     │
├─────────────────────────────────────┤
│ [⚖️ Enter Weights] [💧 Moisture]   │
│ [💸 Advance] [📊 History]          │
└─────────────────────────────────────┘
```

#### Mobile Weight Entry Interface
```
┌─────────────────────────────────────┐
│         Weight Entry                │
├─────────────────────────────────────┤
│ Farmer: Ramesh Kumar                │
│ Bag 3 of 5                          │
├─────────────────────────────────────┤
│                                     │
│        [  45.2  ] KG                │
│                                     │
│  [1] [2] [3]                        │
│  [4] [5] [6]                        │
│  [7] [8] [9]                        │
│  [.] [0] [⌫]                        │
│                                     │
├─────────────────────────────────────┤
│ [🎤 Voice] [📷 Photo] [✓ Next]     │
└─────────────────────────────────────┘
```

### Offline Support Architecture

#### Flutter Offline Database Implementation
```dart
// Drift database for offline functionality
@DriftDatabase(tables: [
  Users, Organizations, Lorries, Farmers, Deliveries, 
  AdvancePayments, LorryRequests, OfflineActions
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  static QueryExecutor _openConnection() {
    return LazyDatabase(() async {
      final dbFolder = await getApplicationDocumentsDirectory();
      final file = File(path.join(dbFolder.path, 'farmtally.db'));
      
      return NativeDatabase.createInBackground(
        file,
        logStatements: kDebugMode,
      );
    });
  }

  // Offline action queue management
  Future<int> queueOfflineAction(OfflineActionsCompanion action) async {
    return await into(offlineActions).insert(action);
  }

  Future<List<OfflineAction>> getPendingActions() async {
    return await (select(offlineActions)
      ..where((a) => a.status.equals(OfflineActionStatus.pending.index))
      ..orderBy([(a) => OrderingTerm.asc(a.timestamp)])).get();
  }

  Future<void> markActionCompleted(int actionId) async {
    await (update(offlineActions)..where((a) => a.id.equals(actionId)))
        .write(OfflineActionsCompanion(
      status: Value(OfflineActionStatus.completed.index),
      completedAt: Value(DateTime.now()),
    ));
  }

  // Cache management for offline data
  Future<void> cacheApiResponse(String key, Map<String, dynamic> data) async {
    await into(cachedData).insertOnConflictUpdate(
      CachedDataCompanion(
        key: Value(key),
        data: Value(json.encode(data)),
        cachedAt: Value(DateTime.now()),
        expiresAt: Value(DateTime.now().add(Duration(hours: 1))),
      ),
    );
  }

  Future<Map<String, dynamic>?> getCachedData(String key) async {
    final cached = await (select(cachedData)
      ..where((c) => c.key.equals(key))
      ..where((c) => c.expiresAt.isBiggerThanValue(DateTime.now()))).getSingleOrNull();
    
    if (cached != null) {
      return json.decode(cached.data) as Map<String, dynamic>;
    }
    return null;
  }
}

// Database tables
class OfflineActions extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get type => text()();
  TextColumn get payload => text()();
  DateTimeColumn get timestamp => dateTime()();
  IntColumn get attempts => integer().withDefault(const Constant(0))();
  IntColumn get status => integer()();
  DateTimeColumn get completedAt => dateTime().nullable()();
  TextColumn get organizationId => text()();
  TextColumn get userId => text()();
}

enum OfflineActionStatus {
  pending,
  syncing,
  completed,
  failed
}
```

#### Flutter Offline Storage Service
```dart
class OfflineStorageService {
  final AppDatabase _database;
  
  OfflineStorageService(this._database);
  
  Future<int> saveOfflineAction({
    required OfflineActionType type,
    required Map<String, dynamic> payload,
    required String organizationId,
    required String userId,
  }) async {
    final action = OfflineActionsCompanion(
      type: Value(type.name),
      payload: Value(json.encode(payload)),
      timestamp: Value(DateTime.now()),
      attempts: Value(0),
      status: Value(OfflineActionStatus.pending.index),
      organizationId: Value(organizationId),
      userId: Value(userId),
    );
    
    return await _database.queueOfflineAction(action);
  }
  
  Future<List<OfflineAction>> getPendingActions() async {
    return await _database.getPendingActions();
  }
  
  Future<void> markActionCompleted(int actionId) async {
    await _database.markActionCompleted(actionId);
  }
  
  Future<void> incrementActionAttempts(int actionId) async {
    final action = await (_database.select(_database.offlineActions)
      ..where((a) => a.id.equals(actionId))).getSingle();
    
    final newAttempts = action.attempts + 1;
    final newStatus = newAttempts >= 3 
        ? OfflineActionStatus.failed 
        : OfflineActionStatus.pending;
    
    await (_database.update(_database.offlineActions)
      ..where((a) => a.id.equals(actionId))).write(
      OfflineActionsCompanion(
        attempts: Value(newAttempts),
        status: Value(newStatus.index),
      ),
    );
  }
  
  // Cache frequently accessed data
  Future<void> cacheData(String key, Map<String, dynamic> data) async {
    await _database.cacheApiResponse(key, data);
  }
  
  Future<Map<String, dynamic>?> getCachedData(String key) async {
    return await _database.getCachedData(key);
  }
  
  // Get offline statistics
  Future<OfflineStats> getOfflineStats() async {
    final pending = await (_database.select(_database.offlineActions)
      ..where((a) => a.status.equals(OfflineActionStatus.pending.index))).get();
    
    final failed = await (_database.select(_database.offlineActions)
      ..where((a) => a.status.equals(OfflineActionStatus.failed.index))).get();
    
    return OfflineStats(
      pendingCount: pending.length,
      failedCount: failed.length,
      lastSyncAttempt: pending.isNotEmpty 
          ? pending.map((a) => a.timestamp).reduce((a, b) => a.isAfter(b) ? a : b)
          : null,
    );
  }
}

enum OfflineActionType {
  weightEntry,
  moistureRecord,
  advancePayment,
  farmerCreation,
  lorryRequest
}

class OfflineStats {
  final int pendingCount;
  final int failedCount;
  final DateTime? lastSyncAttempt;
  
  OfflineStats({
    required this.pendingCount,
    required this.failedCount,
    this.lastSyncAttempt,
  });
}
```

### Offline Functionality by Feature

#### Weight Entry (Offline)
```typescript
class OfflineWeightEntry {
  async recordWeights(lorryId: string, farmerId: string, weights: number[]): Promise<void> {
    const weightData = {
      lorryId,
      farmerId,
      weights,
      totalWeight: weights.reduce((sum, w) => sum + w, 0),
      averageWeight: weights.reduce((sum, w) => sum + w, 0) / weights.length,
      timestamp: new Date().toISOString(),
      location: await this.getCurrentLocation(),
      organizationId: this.getCurrentOrganization(),
      userId: this.getCurrentUser()
    };
    
    // Save to offline storage
    const offlineId = await this.offlineStorage.saveOfflineData('WEIGHT_ENTRY', weightData);
    
    // Update local UI immediately
    this.updateLocalWeightDisplay(weightData);
    
    // Show offline indicator
    this.showOfflineIndicator('Weight entry saved offline');
    
    // Attempt sync if online
    if (navigator.onLine) {
      this.attemptSync(offlineId);
    }
  }
  
  private async getCurrentLocation(): Promise<GeolocationCoordinates | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        () => resolve(null),
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  }
}
```

#### Moisture Recording (Offline)
```typescript
class OfflineMoistureRecording {
  async recordMoisture(lorryId: string, farmerId: string, moistureContent: number): Promise<void> {
    const moistureData = {
      lorryId,
      farmerId,
      moistureContent,
      measurementMethod: 'DIGITAL_METER',
      qualityGrade: this.calculateQualityGrade(moistureContent),
      timestamp: new Date().toISOString(),
      organizationId: this.getCurrentOrganization(),
      userId: this.getCurrentUser()
    };
    
    // Save to offline storage
    await this.offlineStorage.saveOfflineData('MOISTURE_RECORD', moistureData);
    
    // Update local display
    this.updateLocalMoistureDisplay(moistureData);
    
    // Show offline notification
    this.showOfflineIndicator('Moisture data saved offline');
  }
  
  private calculateQualityGrade(moisture: number): string {
    if (moisture <= 14) return 'EXCELLENT';
    if (moisture <= 16) return 'GOOD';
    if (moisture <= 20) return 'ACCEPTABLE';
    return 'POOR';
  }
}
```

#### Advance Payment (Offline)
```typescript
class OfflineAdvancePayment {
  async recordAdvance(farmerId: string, amount: number, paymentMethod: string): Promise<void> {
    const advanceData = {
      farmerId,
      amount,
      paymentMethod,
      paymentDate: new Date().toISOString().split('T')[0],
      reason: 'Recorded offline',
      timestamp: new Date().toISOString(),
      organizationId: this.getCurrentOrganization(),
      userId: this.getCurrentUser()
    };
    
    // Validate offline limits
    const currentBalance = await this.getOfflineFarmerBalance(farmerId);
    if (currentBalance + amount > this.getOfflineAdvanceLimit()) {
      throw new Error('Advance would exceed offline limit');
    }
    
    // Save to offline storage
    await this.offlineStorage.saveOfflineData('ADVANCE_PAYMENT', advanceData);
    
    // Update local farmer balance
    await this.updateOfflineFarmerBalance(farmerId, amount);
    
    // Show confirmation
    this.showOfflineIndicator(`Advance of ₹${amount} recorded offline`);
  }
}
```

### Background Synchronization

#### Sync Manager
```typescript
class SyncManager {
  private syncInProgress = false;
  private syncQueue: OfflineDataItem[] = [];
  
  async startSync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }
    
    this.syncInProgress = true;
    this.showSyncIndicator('Syncing data...');
    
    try {
      const offlineData = await this.offlineStorage.getOfflineData();
      const pendingData = offlineData.filter(item => item.status === 'PENDING');
      
      for (const item of pendingData) {
        await this.syncDataItem(item);
      }
      
      this.showSyncIndicator('Sync completed');
    } catch (error) {
      this.showSyncIndicator('Sync failed - will retry');
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }
  
  private async syncDataItem(item: OfflineDataItem): Promise<void> {
    try {
      // Update status to syncing
      item.status = 'SYNCING';
      item.attempts += 1;
      
      // Sync based on data type
      switch (item.type) {
        case 'WEIGHT_ENTRY':
          await this.syncWeightEntry(item);
          break;
        case 'MOISTURE_RECORD':
          await this.syncMoistureRecord(item);
          break;
        case 'ADVANCE_PAYMENT':
          await this.syncAdvancePayment(item);
          break;
        case 'FARMER_CREATION':
          await this.syncFarmerCreation(item);
          break;
      }
      
      // Mark as completed and remove from offline storage
      await this.offlineStorage.removeOfflineData(item.id);
      
    } catch (error) {
      // Mark as failed if too many attempts
      if (item.attempts >= 3) {
        item.status = 'FAILED';
      } else {
        item.status = 'PENDING';
      }
      
      throw error;
    }
  }
  
  private async syncWeightEntry(item: OfflineDataItem): Promise<void> {
    const response = await fetch('/api/field-manager/weight-entry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(item.payload)
    });
    
    if (!response.ok) {
      throw new Error(`Weight entry sync failed: ${response.statusText}`);
    }
  }
}
```

#### Auto-Sync Triggers
```typescript
class AutoSyncManager {
  constructor() {
    // Sync when coming online
    window.addEventListener('online', () => {
      this.syncManager.startSync();
    });
    
    // Periodic sync when online
    setInterval(() => {
      if (navigator.onLine) {
        this.syncManager.startSync();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Sync on app focus
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) {
        this.syncManager.startSync();
      }
    });
    
    // Background sync (if supported)
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('background-sync');
      });
    }
  }
}
```

### Offline UI Components

#### Offline Indicator
```typescript
const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline && pendingSync === 0) {
    return null;
  }
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bgcolor: isOnline ? 'warning.main' : 'error.main',
        color: 'white',
        p: 1,
        textAlign: 'center',
        zIndex: 9999
      }}
    >
      {!isOnline ? (
        <Typography variant="body2">
          📶 Offline - Data will sync when connected
        </Typography>
      ) : (
        <Typography variant="body2">
          🔄 Syncing {pendingSync} items...
        </Typography>
      )}
    </Box>
  );
};
```

#### Offline Data Summary
```typescript
const OfflineDataSummary: React.FC = () => {
  const [offlineData, setOfflineData] = useState<OfflineDataItem[]>([]);
  
  useEffect(() => {
    loadOfflineData();
  }, []);
  
  const loadOfflineData = async () => {
    const data = await offlineStorage.getOfflineData();
    setOfflineData(data);
  };
  
  const syncNow = async () => {
    await syncManager.startSync();
    await loadOfflineData();
  };
  
  if (offlineData.length === 0) {
    return null;
  }
  
  return (
    <Card sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Offline Data ({offlineData.length} items)
        </Typography>
        
        {offlineData.map((item) => (
          <Box key={item.id} sx={{ mb: 1 }}>
            <Typography variant="body2">
              {item.type} - {new Date(item.timestamp).toLocaleString()}
            </Typography>
            <Chip
              size="small"
              label={item.status}
              color={item.status === 'FAILED' ? 'error' : 'warning'}
            />
          </Box>
        ))}
        
        <Button
          variant="contained"
          onClick={syncNow}
          disabled={!navigator.onLine}
          sx={{ mt: 2 }}
        >
          Sync Now
        </Button>
      </CardContent>
    </Card>
  );
};
```

### Voice Input Support

#### Voice Weight Entry
```typescript
class VoiceWeightEntry {
  private recognition: SpeechRecognition | null = null;
  
  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.setupRecognition();
    }
  }
  
  private setupRecognition(): void {
    if (!this.recognition) return;
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-IN'; // Indian English
    
    this.recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      const weight = this.parseWeightFromSpeech(result);
      
      if (weight) {
        this.onWeightRecognized(weight);
      } else {
        this.onRecognitionError('Could not understand weight');
      }
    };
    
    this.recognition.onerror = (event) => {
      this.onRecognitionError(event.error);
    };
  }
  
  startListening(): void {
    if (this.recognition) {
      this.recognition.start();
    }
  }
  
  private parseWeightFromSpeech(text: string): number | null {
    // Parse various formats: "45.2", "forty five point two", "45 kg", etc.
    const patterns = [
      /(\d+\.?\d*)\s*(?:kg|kilograms?)?/i,
      /(\d+)\s*point\s*(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1] + (match[2] ? '.' + match[2] : ''));
      }
    }
    
    return null;
  }
  
  private onWeightRecognized(weight: number): void {
    // Validate weight range
    if (weight < 10 || weight > 100) {
      this.onRecognitionError('Weight must be between 10 and 100 KG');
      return;
    }
    
    // Trigger weight entry
    this.weightEntryCallback(weight);
  }
}
```

### Performance Optimization

#### Lazy Loading
```typescript
// Lazy load components for better performance
const LazyDashboard = lazy(() => import('./components/Dashboard'));
const LazyLorryManagement = lazy(() => import('./components/LorryManagement'));
const LazyReports = lazy(() => import('./components/Reports'));

// Route-based code splitting
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<LazyDashboard />} />
        <Route path="/lorries" element={<LazyLorryManagement />} />
        <Route path="/reports" element={<LazyReports />} />
      </Routes>
    </Suspense>
  );
};
```

#### Image Optimization
```typescript
// Optimized image loading for mobile
const OptimizedImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  return (
    <Box sx={{ position: 'relative' }}>
      {!loaded && !error && <Skeleton variant="rectangular" height={200} />}
      
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          display: loaded ? 'block' : 'none',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {error && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Image failed to load
          </Typography>
        </Box>
      )}
    </Box>
  );
};
```

### Battery Optimization

#### Power-Efficient Features
```typescript
class PowerManager {
  private wakeLock: WakeLockSentinel | null = null;
  
  async requestWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch (error) {
      console.warn('Wake lock failed:', error);
    }
  }
  
  releaseWakeLock(): void {
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
  }
  
  // Reduce GPS accuracy when not critical
  getLocationOptions(highAccuracy = false): PositionOptions {
    return {
      enableHighAccuracy: highAccuracy,
      timeout: highAccuracy ? 10000 : 5000,
      maximumAge: highAccuracy ? 0 : 300000 // 5 minutes cache for low accuracy
    };
  }
  
  // Throttle network requests
  private requestQueue: Array<() => Promise<any>> = [];
  private processing = false;
  
  async queueRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        // Small delay to prevent overwhelming the device
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    this.processing = false;
  }
}
```

This comprehensive mobile and offline support system ensures FarmTally works reliably in field conditions with limited connectivity while providing an optimal mobile user experience.