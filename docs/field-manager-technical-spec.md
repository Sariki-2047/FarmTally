# Field Manager - Complete Technical Specification

## Overview
This document provides comprehensive technical specifications for the Field Manager role, covering frontend, backend, database, approvals, notifications, and all development aspects.

## Frontend Architecture

### Technology Stack
- **Framework**: Flutter 3.16+ with Dart 3.0+ (Mobile-First)
- **State Management**: Riverpod for reactive state management
- **UI Library**: Material Design 3 with mobile-optimized components
- **Navigation**: GoRouter for declarative routing
- **Forms**: Flutter Form Builder with validation
- **Mobile Support**: Native iOS/Android with offline-first architecture
- **Camera Integration**: camera package for photo capture
- **Geolocation**: geolocator package for location services
- **Voice Input**: speech_to_text package for voice commands
- **Local Database**: SQLite with Drift ORM for offline operations

### Flutter Project Structure
```
lib/
├── presentation/
│   ├── pages/
│   │   ├── field_manager/
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard_page.dart
│   │   │   │   ├── dashboard_widgets.dart
│   │   │   │   └── dashboard_provider.dart
│   │   │   ├── lorries/
│   │   │   │   ├── lorry_operations_page.dart
│   │   │   │   ├── lorry_detail_page.dart
│   │   │   │   └── lorry_providers.dart
│   │   │   ├── weight_entry/
│   │   │   │   ├── weight_entry_page.dart
│   │   │   │   ├── weight_input_widget.dart
│   │   │   │   ├── voice_input_widget.dart
│   │   │   │   └── weight_providers.dart
│   │   │   ├── moisture/
│   │   │   │   ├── moisture_recording_page.dart
│   │   │   │   └── moisture_providers.dart
│   │   │   ├── farmers/
│   │   │   ├── advance/
│   │   │   └── reports/
│   │   └── common/
│   │       ├── mobile_data_table/
│   │       ├── camera_widget/
│   │       ├── voice_input/
│   │       └── offline_sync/
│   ├── widgets/
│   └── providers/
├── services/
│   ├── camera_service.dart
│   ├── voice_service.dart
│   ├── location_service.dart
│   └── offline_sync_service.dart
├── domain/
├── data/
└── core/
```

### Key Frontend Components

#### Mobile-First Dashboard
```typescript
interface FieldManagerDashboardProps {
  organizationId: string;
  managerId: string;
}

interface DashboardData {
  assignedLorries: {
    active: number;
    pending: number;
    completed: number;
  };
  todaysTasks: {
    farmersScheduled: number;
    weightEntryPending: number;
    submissionReady: number;
  };
  quickActions: QuickAction[];
  notifications: Notification[];
}

const FieldManagerDashboard: React.FC<FieldManagerDashboardProps> = ({ organizationId, managerId }) => {
  const { data, isLoading } = useGetDashboardQuery({ organizationId, managerId });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <Box sx={{ p: 2 }}>
      {isOffline && <OfflineBanner />}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <LorryStatusCards data={data?.assignedLorries} />
        </Grid>
        <Grid item xs={12}>
          <TodaysTasksCard data={data?.todaysTasks} />
        </Grid>
        <Grid item xs={12}>
          <QuickActionsGrid actions={data?.quickActions} />
        </Grid>
      </Grid>
    </Box>
  );
};
```

#### Weight Entry Component
```typescript
interface WeightEntryProps {
  lorryId: string;
  farmerId: string;
  bagsCount: number;
  onWeightsSubmit: (weights: number[]) => void;
}

const WeightEntryComponent: React.FC<WeightEntryProps> = ({
  lorryId,
  farmerId,
  bagsCount,
  onWeightsSubmit
}) => {
  const [weights, setWeights] = useState<number[]>([]);
  const [currentBag, setCurrentBag] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const { startListening, stopListening, transcript } = useVoiceInput({
    onResult: (result) => {
      const weight = parseFloat(result);
      if (!isNaN(weight) && weight > 0) {
        handleWeightEntry(weight);
      }
    }
  });
  
  const handleWeightEntry = (weight: number) => {
    const newWeights = [...weights];
    newWeights[currentBag] = weight;
    setWeights(newWeights);
    
    if (currentBag < bagsCount - 1) {
      setCurrentBag(currentBag + 1);
    }
  };
  
  const totalWeight = weights.reduce((sum, weight) => sum + (weight || 0), 0);
  const averageWeight = weights.length > 0 ? totalWeight / weights.filter(w => w > 0).length : 0;
  
  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Weight Entry - Bag {currentBag + 1} of {bagsCount}
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={(weights.filter(w => w > 0).length / bagsCount) * 100} 
        />
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Weight (KG)"
            type="number"
            value={weights[currentBag] || ''}
            onChange={(e) => handleWeightEntry(parseFloat(e.target.value))}
            inputProps={{ min: 10, max: 100, step: 0.1 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant={isVoiceActive ? "contained" : "outlined"}
            startIcon={<MicIcon />}
            onMouseDown={() => {
              setIsVoiceActive(true);
              startListening();
            }}
            onMouseUp={() => {
              setIsVoiceActive(false);
              stopListening();
            }}
          >
            Voice Input
          </Button>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          Total Weight: {totalWeight.toFixed(1)} KG
        </Typography>
        <Typography variant="body2">
          Average per Bag: {averageWeight.toFixed(1)} KG
        </Typography>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <WeightGrid weights={weights} currentBag={currentBag} />
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Button
          fullWidth
          variant="contained"
          disabled={weights.filter(w => w > 0).length !== bagsCount}
          onClick={() => onWeightsSubmit(weights)}
        >
          Submit All Weights
        </Button>
      </Box>
    </Card>
  );
};
```

#### Offline Sync Component
```typescript
interface OfflineSyncProps {
  onSyncComplete: () => void;
}

const OfflineSyncComponent: React.FC<OfflineSyncProps> = ({ onSyncComplete }) => {
  const [pendingData, setPendingData] = useState<OfflineData[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { syncOfflineData } = useOfflineSync();
  
  useEffect(() => {
    loadPendingData();
  }, []);
  
  const loadPendingData = async () => {
    const data = await localforage.getItem<OfflineData[]>('pendingSync') || [];
    setPendingData(data);
  };
  
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    try {
      for (let i = 0; i < pendingData.length; i++) {
        const item = pendingData[i];
        await syncOfflineData(item);
        setSyncProgress(((i + 1) / pendingData.length) * 100);
      }
      
      await localforage.removeItem('pendingSync');
      setPendingData([]);
      onSyncComplete();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Offline Data Sync
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        {pendingData.length} items pending sync
      </Typography>
      
      {isSyncing && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={syncProgress} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Syncing... {Math.round(syncProgress)}%
          </Typography>
        </Box>
      )}
      
      <List>
        {pendingData.map((item, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={item.type}
              secondary={`${item.timestamp} - ${item.description}`}
            />
          </ListItem>
        ))}
      </List>
      
      <Button
        fullWidth
        variant="contained"
        disabled={pendingData.length === 0 || isSyncing}
        onClick={handleSync}
      >
        Sync Now
      </Button>
    </Card>
  );
};
```

### State Management

#### Redux Store Structure
```typescript
interface FieldManagerState {
  auth: AuthState;
  fieldManager: {
    dashboard: DashboardState;
    lorries: AssignedLorryState;
    requests: RequestState;
    farmers: FarmerState;
    weightEntry: WeightEntryState;
    moistureRecording: MoistureState;
    advancePayments: AdvanceState;
    reports: ReportState;
    offline: OfflineState;
  };
  ui: UIState;
  notifications: NotificationState;
}

interface OfflineState {
  isOnline: boolean;
  pendingSync: OfflineData[];
  lastSyncTime: string | null;
  syncInProgress: boolean;
}
```

#### Offline Data Management
```typescript
// Custom hook for offline data management
export const useOfflineSync = () => {
  const dispatch = useAppDispatch();
  
  const saveOfflineData = async (data: OfflineData) => {
    const existing = await localforage.getItem<OfflineData[]>('pendingSync') || [];
    existing.push({
      ...data,
      id: generateId(),
      timestamp: new Date().toISOString(),
    });
    await localforage.setItem('pendingSync', existing);
    dispatch(addPendingSync(data));
  };
  
  const syncOfflineData = async (data: OfflineData) => {
    switch (data.type) {
      case 'WEIGHT_ENTRY':
        await fieldManagerApi.endpoints.submitWeights.initiate(data.payload);
        break;
      case 'MOISTURE_RECORDING':
        await fieldManagerApi.endpoints.recordMoisture.initiate(data.payload);
        break;
      case 'ADVANCE_PAYMENT':
        await fieldManagerApi.endpoints.recordAdvance.initiate(data.payload);
        break;
      case 'FARMER_CREATION':
        await fieldManagerApi.endpoints.createFarmer.initiate(data.payload);
        break;
    }
  };
  
  return { saveOfflineData, syncOfflineData };
};
```

## Backend Architecture

### API Structure
```
src/
├── controllers/
│   ├── field-manager/
│   │   ├── dashboard.controller.ts
│   │   ├── lorry.controller.ts
│   │   ├── request.controller.ts
│   │   ├── farmer.controller.ts
│   │   ├── weight.controller.ts
│   │   ├── moisture.controller.ts
│   │   ├── advance.controller.ts
│   │   └── report.controller.ts
├── middleware/
│   ├── field-manager-auth.middleware.ts
│   ├── organization-scope.middleware.ts
│   └── offline-sync.middleware.ts
├── services/
│   ├── weight-entry.service.ts
│   ├── moisture-recording.service.ts
│   ├── advance-payment.service.ts
│   └── farmer-management.service.ts
├── validators/
│   ├── weight-entry.validator.ts
│   ├── moisture.validator.ts
│   └── advance.validator.ts
└── utils/
    ├── calculations.util.ts
    └── offline-sync.util.ts
```

### API Endpoints

#### Lorry Management
```typescript
// GET /api/field-manager/lorries
interface GetAssignedLorriesResponse {
  lorries: AssignedLorry[];
  pagination: PaginationMeta;
}

// GET /api/field-manager/lorries/:id/farmers
interface GetLorryFarmersResponse {
  farmers: LorryFarmer[];
  lorryDetails: LorryDetails;
}

// POST /api/field-manager/lorries/:id/farmers
interface AddFarmerToLorryRequest {
  farmerId: string;
  bagsCount: number;
  estimatedWeight?: number;
}
```

#### Weight Entry
```typescript
// POST /api/field-manager/weight-entry
interface WeightEntryRequest {
  lorryId: string;
  farmerId: string;
  weights: number[];
  totalWeight: number;
  averageWeight: number;
  entryMethod: 'MANUAL' | 'VOICE' | 'BATCH';
  location?: GeolocationCoordinates;
  photos?: string[]; // Base64 encoded images
}

// PUT /api/field-manager/weight-entry/:id
interface UpdateWeightEntryRequest {
  weights: number[];
  updateReason: string;
}
```

#### Moisture Recording
```typescript
// POST /api/field-manager/moisture-recording
interface MoistureRecordingRequest {
  lorryId: string;
  farmerId: string;
  moistureContent: number;
  measurementMethod: 'DIGITAL_METER' | 'MANUAL_ASSESSMENT';
  meterReading?: string; // Photo of meter display
  qualityNotes?: string;
  location?: GeolocationCoordinates;
}
```

#### Advance Payments
```typescript
// POST /api/field-manager/advance-payments
interface RecordAdvanceRequest {
  farmerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  reason?: string;
  notes?: string;
  receiptPhoto?: string; // Base64 encoded
}

// GET /api/field-manager/farmers/:id/advances
interface GetFarmerAdvancesResponse {
  advances: AdvancePayment[];
  totalBalance: number;
  lastAdvanceDate: string | null;
}
```

### Service Layer

#### Weight Entry Service
```typescript
class WeightEntryService {
  async recordWeights(data: WeightEntryData): Promise<WeightEntry> {
    // Validate weights
    await this.validateWeights(data);
    
    // Calculate totals
    const calculations = this.calculateWeightTotals(data.weights);
    
    // Save weight entry
    const weightEntry = await prisma.weightEntry.create({
      data: {
        lorryId: data.lorryId,
        farmerId: data.farmerId,
        managerId: data.managerId,
        individualWeights: data.weights,
        totalWeight: calculations.total,
        averageWeight: calculations.average,
        bagsCount: data.weights.length,
        entryMethod: data.entryMethod,
        location: data.location,
        createdAt: new Date(),
      },
    });
    
    // Update lorry farmer record
    await this.updateLorryFarmerWeights(data.lorryId, data.farmerId, calculations);
    
    // Save photos if provided
    if (data.photos && data.photos.length > 0) {
      await this.saveWeightPhotos(weightEntry.id, data.photos);
    }
    
    // Audit log
    await this.auditService.log({
      action: 'WEIGHT_ENTRY_RECORDED',
      entityId: weightEntry.id,
      userId: data.managerId,
      details: { bagsCount: data.weights.length, totalWeight: calculations.total },
    });
    
    return weightEntry;
  }
  
  private validateWeights(data: WeightEntryData): void {
    // Check individual weight limits
    data.weights.forEach((weight, index) => {
      if (weight < 10 || weight > 100) {
        throw new ValidationError(`Bag ${index + 1} weight ${weight}KG is outside valid range (10-100KG)`);
      }
    });
    
    // Check total weight reasonableness
    const averageWeight = data.weights.reduce((sum, w) => sum + w, 0) / data.weights.length;
    if (averageWeight < 20 || averageWeight > 80) {
      throw new ValidationError(`Average weight ${averageWeight.toFixed(1)}KG seems unusual`);
    }
  }
  
  private calculateWeightTotals(weights: number[]): WeightCalculations {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const average = total / weights.length;
    const standardDeduction = weights.length * 2; // 2KG per bag
    
    return {
      total: parseFloat(total.toFixed(2)),
      average: parseFloat(average.toFixed(2)),
      standardDeduction,
      netWeight: parseFloat((total - standardDeduction).toFixed(2)),
    };
  }
}
```

#### Moisture Recording Service
```typescript
class MoistureRecordingService {
  async recordMoisture(data: MoistureRecordingData): Promise<MoistureRecord> {
    // Validate moisture content
    this.validateMoistureContent(data.moistureContent);
    
    // Save moisture record
    const moistureRecord = await prisma.moistureRecord.create({
      data: {
        lorryId: data.lorryId,
        farmerId: data.farmerId,
        managerId: data.managerId,
        moistureContent: data.moistureContent,
        measurementMethod: data.measurementMethod,
        qualityNotes: data.qualityNotes,
        location: data.location,
        createdAt: new Date(),
      },
    });
    
    // Save meter reading photo if provided
    if (data.meterReading) {
      await this.saveMeterReadingPhoto(moistureRecord.id, data.meterReading);
    }
    
    // Update lorry farmer record
    await this.updateLorryFarmerMoisture(data.lorryId, data.farmerId, data.moistureContent);
    
    // Determine quality grade
    const qualityGrade = this.determineQualityGrade(data.moistureContent);
    
    // Notify if moisture is outside acceptable range
    if (data.moistureContent > 20) {
      await this.notificationService.sendHighMoistureAlert(
        data.managerId,
        data.farmerId,
        data.moistureContent
      );
    }
    
    return moistureRecord;
  }
  
  private validateMoistureContent(moisture: number): void {
    if (moisture < 8 || moisture > 35) {
      throw new ValidationError(`Moisture content ${moisture}% is outside valid range (8-35%)`);
    }
  }
  
  private determineQualityGrade(moisture: number): QualityGrade {
    if (moisture <= 14) return 'EXCELLENT';
    if (moisture <= 16) return 'GOOD';
    if (moisture <= 20) return 'ACCEPTABLE';
    return 'POOR';
  }
}
```

#### Advance Payment Service
```typescript
class AdvancePaymentService {
  async recordAdvance(data: AdvancePaymentData): Promise<AdvancePayment> {
    // Validate advance amount
    await this.validateAdvanceAmount(data);
    
    // Check daily limits
    await this.checkDailyLimits(data.managerId, data.amount);
    
    // Create advance payment record
    const advance = await prisma.advancePayment.create({
      data: {
        organizationId: data.organizationId,
        farmerId: data.farmerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentDate: new Date(data.paymentDate),
        referenceNumber: data.referenceNumber,
        reason: data.reason,
        notes: data.notes,
        recordedBy: data.managerId,
        status: 'ACTIVE',
      },
    });
    
    // Update farmer advance balance
    await this.updateFarmerAdvanceBalance(data.farmerId, data.organizationId, data.amount);
    
    // Save receipt photo if provided
    if (data.receiptPhoto) {
      await this.saveReceiptPhoto(advance.id, data.receiptPhoto);
    }
    
    // Send notification to farmer
    await this.notificationService.sendAdvanceConfirmation(
      data.farmerId,
      data.amount,
      data.paymentMethod
    );
    
    // Audit log
    await this.auditService.log({
      action: 'ADVANCE_PAYMENT_RECORDED',
      entityId: advance.id,
      userId: data.managerId,
      details: { amount: data.amount, farmerId: data.farmerId },
    });
    
    return advance;
  }
  
  private async validateAdvanceAmount(data: AdvancePaymentData): Promise<void> {
    // Check minimum/maximum limits
    if (data.amount < 100 || data.amount > 50000) {
      throw new ValidationError('Advance amount must be between ₹100 and ₹50,000');
    }
    
    // Check farmer's current balance
    const currentBalance = await this.getFarmerAdvanceBalance(data.farmerId, data.organizationId);
    if (currentBalance + data.amount > 100000) {
      throw new ValidationError('Total advance balance would exceed ₹1,00,000 limit');
    }
  }
  
  private async checkDailyLimits(managerId: string, amount: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const todayAdvances = await prisma.advancePayment.aggregate({
      where: {
        recordedBy: managerId,
        paymentDate: {
          gte: new Date(today),
          lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      _sum: { amount: true },
      _count: true,
    });
    
    const dailyTotal = (todayAdvances._sum.amount || 0) + amount;
    const dailyCount = (todayAdvances._count || 0) + 1;
    
    if (dailyTotal > 200000) {
      throw new ValidationError('Daily advance limit of ₹2,00,000 exceeded');
    }
    
    if (dailyCount > 20) {
      throw new ValidationError('Daily advance count limit of 20 exceeded');
    }
  }
}
```

## Database Schema Extensions

### Field Manager Specific Tables
```sql
-- Weight Entries
CREATE TABLE weight_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lorry_id UUID NOT NULL REFERENCES lorries(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    manager_id UUID NOT NULL REFERENCES users(id),
    individual_weights DECIMAL[] NOT NULL,
    total_weight DECIMAL(10,2) NOT NULL,
    average_weight DECIMAL(8,2) NOT NULL,
    bags_count INTEGER NOT NULL,
    entry_method entry_method NOT NULL,
    location JSONB,
    photos TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Moisture Records
CREATE TABLE moisture_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lorry_id UUID NOT NULL REFERENCES lorries(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    manager_id UUID NOT NULL REFERENCES users(id),
    moisture_content DECIMAL(5,2) NOT NULL,
    measurement_method measurement_method NOT NULL,
    quality_grade quality_grade,
    quality_notes TEXT,
    meter_reading_photo TEXT,
    location JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lorry Farmers (Junction table with additional data)
CREATE TABLE lorry_farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lorry_id UUID NOT NULL REFERENCES lorries(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    manager_id UUID NOT NULL REFERENCES users(id),
    bags_count INTEGER NOT NULL,
    individual_weights DECIMAL[],
    total_weight DECIMAL(10,2),
    moisture_content DECIMAL(5,2),
    standard_deduction DECIMAL(10,2),
    quality_deduction DECIMAL(10,2) DEFAULT 0,
    net_weight DECIMAL(10,2),
    price_per_kg DECIMAL(8,2),
    advance_amount DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(12,2),
    final_amount DECIMAL(12,2),
    status lorry_farmer_status DEFAULT 'PENDING',
    added_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Offline Sync Queue
CREATE TABLE offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    data_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    status sync_status DEFAULT 'PENDING',
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Enums
```sql
CREATE TYPE entry_method AS ENUM ('MANUAL', 'VOICE', 'BATCH', 'IMPORT');
CREATE TYPE measurement_method AS ENUM ('DIGITAL_METER', 'MANUAL_ASSESSMENT', 'LABORATORY');
CREATE TYPE quality_grade AS ENUM ('EXCELLENT', 'GOOD', 'ACCEPTABLE', 'POOR');
CREATE TYPE lorry_farmer_status AS ENUM ('PENDING', 'WEIGHTS_ENTERED', 'MOISTURE_RECORDED', 'COMPLETED', 'SUBMITTED');
CREATE TYPE sync_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
```

### Indexes for Performance
```sql
-- Weight entries indexes
CREATE INDEX idx_weight_entries_lorry_farmer ON weight_entries(lorry_id, farmer_id);
CREATE INDEX idx_weight_entries_manager_date ON weight_entries(manager_id, created_at);

-- Moisture records indexes
CREATE INDEX idx_moisture_records_lorry_farmer ON moisture_records(lorry_id, farmer_id);
CREATE INDEX idx_moisture_records_quality ON moisture_records(quality_grade, moisture_content);

-- Lorry farmers indexes
CREATE INDEX idx_lorry_farmers_status ON lorry_farmers(status);
CREATE INDEX idx_lorry_farmers_lorry_status ON lorry_farmers(lorry_id, status);

-- Offline sync indexes
CREATE INDEX idx_offline_sync_user_status ON offline_sync_queue(user_id, status);
CREATE INDEX idx_offline_sync_created ON offline_sync_queue(created_at);
```

## Mobile & Offline Support

### PWA Configuration
```json
// manifest.json
{
  "name": "Corn Procurement - Field Manager",
  "short_name": "CP Manager",
  "description": "Field Manager app for corn procurement",
  "start_url": "/field-manager",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196f3",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["business", "productivity"],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
```typescript
// sw.js
const CACHE_NAME = 'corn-procurement-fm-v1';
const urlsToCache = [
  '/field-manager',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  const offlineData = await getOfflineData();
  
  for (const item of offlineData) {
    try {
      await syncDataItem(item);
      await removeOfflineData(item.id);
    } catch (error) {
      console.error('Sync failed for item:', item.id, error);
    }
  }
}
```

### Offline Data Storage
```typescript
// offline-storage.ts
import localforage from 'localforage';

interface OfflineDataItem {
  id: string;
  type: 'WEIGHT_ENTRY' | 'MOISTURE_RECORD' | 'ADVANCE_PAYMENT' | 'FARMER_CREATION';
  payload: any;
  timestamp: string;
  attempts: number;
}

class OfflineStorageService {
  private store = localforage.createInstance({
    name: 'CornProcurementFM',
    storeName: 'offlineData'
  });
  
  async saveOfflineData(type: string, payload: any): Promise<string> {
    const id = generateId();
    const item: OfflineDataItem = {
      id,
      type: type as any,
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0
    };
    
    await this.store.setItem(id, item);
    return id;
  }
  
  async getOfflineData(): Promise<OfflineDataItem[]> {
    const items: OfflineDataItem[] = [];
    
    await this.store.iterate((value: OfflineDataItem) => {
      items.push(value);
    });
    
    return items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  async removeOfflineData(id: string): Promise<void> {
    await this.store.removeItem(id);
  }
  
  async incrementAttempts(id: string): Promise<void> {
    const item = await this.store.getItem<OfflineDataItem>(id);
    if (item) {
      item.attempts += 1;
      await this.store.setItem(id, item);
    }
  }
}
```

## Notification System

### Field Manager Notifications
```typescript
enum FieldManagerNotificationType {
  LORRY_ASSIGNED = 'LORRY_ASSIGNED',
  LORRY_REQUEST_APPROVED = 'LORRY_REQUEST_APPROVED',
  LORRY_REQUEST_REJECTED = 'LORRY_REQUEST_REJECTED',
  WEIGHT_ENTRY_REMINDER = 'WEIGHT_ENTRY_REMINDER',
  SUBMISSION_DEADLINE = 'SUBMISSION_DEADLINE',
  FARMER_ADVANCE_REQUEST = 'FARMER_ADVANCE_REQUEST',
  QUALITY_ALERT = 'QUALITY_ALERT',
  SYNC_COMPLETED = 'SYNC_COMPLETED',
  SYNC_FAILED = 'SYNC_FAILED'
}

class FieldManagerNotificationService {
  async sendLorryAssignmentNotification(managerId: string, lorry: Lorry): Promise<void> {
    // In-app notification
    await this.createInAppNotification({
      userId: managerId,
      type: FieldManagerNotificationType.LORRY_ASSIGNED,
      title: 'Lorry Assigned',
      message: `Lorry ${lorry.name} (${lorry.licensePlate}) has been assigned to you`,
      data: { lorryId: lorry.id },
      priority: 'HIGH'
    });
    
    // Push notification for mobile
    await this.sendPushNotification(managerId, {
      title: 'New Lorry Assignment',
      body: `${lorry.name} is ready for procurement`,
      icon: '/icons/lorry-icon.png',
      badge: '/icons/badge.png',
      data: { lorryId: lorry.id, action: 'VIEW_LORRY' }
    });
    
    // SMS for urgent assignments
    if (lorry.priority === 'HIGH') {
      const manager = await this.userService.getById(managerId);
      await this.smsService.send({
        to: manager.phone,
        message: `Urgent: Lorry ${lorry.name} assigned for immediate procurement. Check app for details.`
      });
    }
  }
  
  async sendWeightEntryReminder(managerId: string, lorryId: string): Promise<void> {
    const lorryFarmers = await this.getLorryFarmersWithoutWeights(lorryId);
    
    if (lorryFarmers.length > 0) {
      await this.createInAppNotification({
        userId: managerId,
        type: FieldManagerNotificationType.WEIGHT_ENTRY_REMINDER,
        title: 'Weight Entry Pending',
        message: `${lorryFarmers.length} farmers need weight entry for lorry`,
        data: { lorryId, pendingCount: lorryFarmers.length }
      });
    }
  }
  
  async sendQualityAlert(managerId: string, farmerId: string, issue: QualityIssue): Promise<void> {
    await this.createInAppNotification({
      userId: managerId,
      type: FieldManagerNotificationType.QUALITY_ALERT,
      title: 'Quality Alert',
      message: `${issue.type}: ${issue.description}`,
      data: { farmerId, issue },
      priority: 'HIGH'
    });
  }
}
```

### Push Notification Setup
```typescript
// push-notifications.ts
class PushNotificationService {
  private vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!
  };
  
  async subscribeUser(userId: string, subscription: PushSubscription): Promise<void> {
    await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys as any,
        userAgent: subscription.userAgent || '',
      }
    });
  }
  
  async sendPushNotification(userId: string, payload: PushPayload): Promise<void> {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId, active: true }
    });
    
    const notifications = subscriptions.map(sub => 
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys as any
        },
        JSON.stringify(payload),
        {
          vapidDetails: {
            subject: 'mailto:admin@cornprocurement.com',
            publicKey: this.vapidKeys.publicKey,
            privateKey: this.vapidKeys.privateKey
          }
        }
      )
    );
    
    await Promise.allSettled(notifications);
  }
}
```

## Performance & Optimization

### Caching Strategy
```typescript
// field-manager-cache.service.ts
class FieldManagerCacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }
  
  async cacheAssignedLorries(managerId: string, lorries: AssignedLorry[]): Promise<void> {
    const key = `fm:lorries:${managerId}`;
    await this.redis.setex(key, 300, JSON.stringify(lorries)); // 5 minutes
  }
  
  async getCachedAssignedLorries(managerId: string): Promise<AssignedLorry[] | null> {
    const key = `fm:lorries:${managerId}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async cacheFarmerList(organizationId: string, farmers: Farmer[]): Promise<void> {
    const key = `fm:farmers:${organizationId}`;
    await this.redis.setex(key, 1800, JSON.stringify(farmers)); // 30 minutes
  }
  
  async invalidateManagerCache(managerId: string): Promise<void> {
    const pattern = `fm:*:${managerId}`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### Database Query Optimization
```typescript
// optimized-queries.service.ts
class OptimizedQueriesService {
  async getManagerDashboardData(managerId: string): Promise<DashboardData> {
    // Single optimized query for dashboard data
    const result = await prisma.$queryRaw`
      WITH lorry_stats AS (
        SELECT 
          COUNT(*) as total_lorries,
          COUNT(CASE WHEN status = 'ASSIGNED' THEN 1 END) as active_lorries,
          COUNT(CASE WHEN lf.status = 'PENDING' THEN 1 END) as pending_farmers,
          COUNT(CASE WHEN lf.status = 'COMPLETED' THEN 1 END) as completed_farmers
        FROM lorries l
        LEFT JOIN lorry_farmers lf ON l.id = lf.lorry_id
        WHERE l.assigned_manager_id = ${managerId}
      ),
      today_tasks AS (
        SELECT 
          COUNT(CASE WHEN lf.individual_weights IS NULL THEN 1 END) as weight_entry_pending,
          COUNT(CASE WHEN mr.moisture_content IS NULL THEN 1 END) as moisture_pending,
          COUNT(CASE WHEN lf.status = 'COMPLETED' AND l.status != 'SUBMITTED' THEN 1 END) as ready_for_submission
        FROM lorry_farmers lf
        JOIN lorries l ON lf.lorry_id = l.id
        LEFT JOIN moisture_records mr ON lf.lorry_id = mr.lorry_id AND lf.farmer_id = mr.farmer_id
        WHERE l.assigned_manager_id = ${managerId}
        AND DATE(lf.added_at) = CURRENT_DATE
      )
      SELECT 
        ls.*,
        tt.*
      FROM lorry_stats ls, today_tasks tt
    `;
    
    return result[0];
  }
  
  async getLorryFarmersWithDetails(lorryId: string): Promise<LorryFarmerDetails[]> {
    return await prisma.lorryFarmer.findMany({
      where: { lorryId },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            // Get advance balance for this organization
            advancePayments: {
              where: { status: 'ACTIVE' },
              select: { amount: true }
            }
          }
        },
        weightEntry: {
          select: {
            individualWeights: true,
            totalWeight: true,
            averageWeight: true,
            entryMethod: true,
            createdAt: true
          }
        },
        moistureRecord: {
          select: {
            moistureContent: true,
            qualityGrade: true,
            measurementMethod: true,
            createdAt: true
          }
        }
      },
      orderBy: { addedAt: 'asc' }
    });
  }
}
```

This completes the comprehensive Field Manager technical specification. The document covers all aspects including mobile-first design, offline capabilities, weight entry systems, moisture recording, advance payments, and performance optimizations specifically tailored for field operations.