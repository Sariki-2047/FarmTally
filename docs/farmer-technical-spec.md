# Farmer - Complete Technical Specification

## Overview
This document provides comprehensive technical specifications for the Farmer role, covering frontend, backend, database, multi-organization support, notifications, and all development aspects.

## Frontend Architecture

### Technology Stack
- **Framework**: Flutter 3.16+ with Dart 3.0+ (Mobile-First)
- **State Management**: Riverpod for reactive state management
- **UI Library**: Material Design 3 with mobile-optimized components
- **Navigation**: GoRouter for declarative routing
- **Multi-language**: flutter_localizations (Hindi, English, Regional languages)
- **Offline Support**: SQLite with Drift ORM for local data storage
- **Voice Support**: speech_to_text package for voice commands
- **SMS Integration**: Native SMS capabilities for low-data scenarios
- **Push Notifications**: Firebase Cloud Messaging

### Flutter Project Structure
```
lib/
├── presentation/
│   ├── pages/
│   │   ├── farmer/
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard_page.dart
│   │   │   │   ├── multi_org_dashboard.dart
│   │   │   │   ├── single_org_dashboard.dart
│   │   │   │   └── dashboard_providers.dart
│   │   │   ├── deliveries/
│   │   │   │   ├── delivery_list_page.dart
│   │   │   │   ├── delivery_detail_page.dart
│   │   │   │   ├── delivery_filter_widget.dart
│   │   │   │   └── delivery_providers.dart
│   │   │   ├── payments/
│   │   │   │   ├── payment_history_page.dart
│   │   │   │   ├── advance_history_page.dart
│   │   │   │   ├── payment_summary_page.dart
│   │   │   │   └── payment_providers.dart
│   │   │   ├── schedule/
│   │   │   │   ├── lorry_schedule_page.dart
│   │   │   │   ├── calendar_view_widget.dart
│   │   │   │   └── schedule_providers.dart
│   │   │   └── settings/
│   │   │       ├── organization_management_page.dart
│   │   │       ├── notification_settings_page.dart
│   │   │       └── profile_settings_page.dart
│   │   └── common/
│   │       ├── organization_selector/
│   │       ├── mobile_layout/
│   │       ├── language_selector/
│   │       ├── offline_indicator/
│   │       └── voice_commands/
│   ├── widgets/
│   └── providers/
├── services/
│   ├── multi_org_service.dart
│   ├── voice_service.dart
│   └── sms_service.dart
├── domain/
├── data/
└── core/
│       └── SMSInterface/
├── hooks/
│   ├── useMultiOrganization.ts
│   ├── useVoiceCommands.ts
│   ├── useOfflineSync.ts
│   └── useLanguage.ts
├── services/
├── store/
├── types/
└── utils/
```

### Key Frontend Components

#### Multi-Organization Dashboard
```typescript
interface MultiOrgDashboardProps {
  farmerId: string;
}

interface OrganizationSummary {
  id: string;
  name: string;
  location: string;
  pendingAmount: number;
  lastDeliveryDate: string | null;
  nextScheduledDelivery: string | null;
  totalDeliveries: number;
  averageRating: number;
}

const MultiOrgDashboard: React.FC<MultiOrgDashboardProps> = ({ farmerId }) => {
  const { data: organizations, isLoading } = useGetFarmerOrganizationsQuery(farmerId);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const { language, changeLanguage } = useLanguage();
  
  if (selectedOrg) {
    return <SingleOrgDashboard organizationId={selectedOrg} farmerId={farmerId} />;
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {language === 'hi' ? 'मेरे व्यापार' : 'My Businesses'}
      </Typography>
      
      <Grid container spacing={2}>
        {organizations?.map((org) => (
          <Grid item xs={12} key={org.id}>
            <Card 
              sx={{ cursor: 'pointer' }}
              onClick={() => setSelectedOrg(org.id)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">{org.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      📍 {org.location}
                    </Typography>
                    <Typography variant="body2">
                      {language === 'hi' ? 'कुल डिलीवरी' : 'Total Deliveries'}: {org.totalDeliveries}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6" color="primary">
                      ₹{org.pendingAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {language === 'hi' ? 'बकाया' : 'Pending'}
                    </Typography>
                    {org.nextScheduledDelivery && (
                      <Chip 
                        label={language === 'hi' ? 'अगली डिलीवरी' : 'Next Delivery'}
                        size="small" 
                        color="success"
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <TotalSummaryCard organizations={organizations} />
      </Box>
    </Box>
  );
};
```

#### Organization Selector Component
```typescript
interface OrganizationSelectorProps {
  farmerId: string;
  selectedOrgId: string | null;
  onOrganizationChange: (orgId: string | null) => void;
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  farmerId,
  selectedOrgId,
  onOrganizationChange
}) => {
  const { data: organizations } = useGetFarmerOrganizationsQuery(farmerId);
  const { language } = useLanguage();
  
  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth>
        <InputLabel>
          {language === 'hi' ? 'व्यापार चुनें' : 'Select Business'}
        </InputLabel>
        <Select
          value={selectedOrgId || ''}
          onChange={(e) => onOrganizationChange(e.target.value || null)}
        >
          <MenuItem value="">
            {language === 'hi' ? 'सभी व्यापार' : 'All Businesses'}
          </MenuItem>
          {organizations?.map((org) => (
            <MenuItem key={org.id} value={org.id}>
              <Box display="flex" alignItems="center" width="100%">
                <Box flexGrow={1}>
                  <Typography variant="body1">{org.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {org.location}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="primary">
                    ₹{org.pendingAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
```

#### Voice Command Component
```typescript
interface VoiceCommandsProps {
  onCommand: (command: string, params?: any) => void;
}

const VoiceCommands: React.FC<VoiceCommandsProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { language } = useLanguage();
  
  const commands = {
    hi: {
      'डैशबोर्ड दिखाओ': () => onCommand('SHOW_DASHBOARD'),
      'पेमेंट दिखाओ': () => onCommand('SHOW_PAYMENTS'),
      'डिलीवरी दिखाओ': () => onCommand('SHOW_DELIVERIES'),
      'अगली डिलीवरी': () => onCommand('SHOW_NEXT_DELIVERY'),
    },
    en: {
      'show dashboard': () => onCommand('SHOW_DASHBOARD'),
      'show payments': () => onCommand('SHOW_PAYMENTS'),
      'show deliveries': () => onCommand('SHOW_DELIVERIES'),
      'next delivery': () => onCommand('SHOW_NEXT_DELIVERY'),
    }
  };
  
  const { startListening, stopListening } = useVoiceRecognition({
    language: language === 'hi' ? 'hi-IN' : 'en-US',
    onResult: (result) => {
      setTranscript(result);
      const command = commands[language][result.toLowerCase()];
      if (command) {
        command();
      }
    }
  });
  
  return (
    <Box sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}>
      <Fab
        color={isListening ? "secondary" : "primary"}
        onClick={() => {
          if (isListening) {
            stopListening();
            setIsListening(false);
          } else {
            startListening();
            setIsListening(true);
          }
        }}
      >
        <MicIcon />
      </Fab>
      
      {transcript && (
        <Paper sx={{ p: 1, mt: 1, maxWidth: 200 }}>
          <Typography variant="body2">{transcript}</Typography>
        </Paper>
      )}
    </Box>
  );
};
```

### State Management

#### Redux Store Structure
```typescript
interface FarmerState {
  auth: AuthState;
  farmer: {
    profile: FarmerProfile;
    organizations: OrganizationState;
    deliveries: DeliveryState;
    payments: PaymentState;
    schedule: ScheduleState;
    settings: SettingsState;
    offline: OfflineState;
  };
  ui: {
    selectedOrganization: string | null;
    language: 'en' | 'hi' | 'regional';
    theme: 'light' | 'dark';
    notifications: NotificationState;
  };
}

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  summary: OrganizationSummary[];
  loading: boolean;
  error: string | null;
}
```

#### Multi-Organization Hook
```typescript
export const useMultiOrganization = (farmerId: string) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization, organizations } = useAppSelector(state => state.farmer.organizations);
  
  const switchOrganization = useCallback((orgId: string | null) => {
    dispatch(setSelectedOrganization(orgId));
    
    // Update URL without page reload
    const url = orgId ? `/farmer/dashboard?org=${orgId}` : '/farmer/dashboard';
    window.history.pushState({}, '', url);
  }, [dispatch]);
  
  const getFilteredData = useCallback(<T extends { organizationId: string }>(data: T[]) => {
    if (!selectedOrganization) return data;
    return data.filter(item => item.organizationId === selectedOrganization);
  }, [selectedOrganization]);
  
  const getCurrentOrganization = useCallback(() => {
    if (!selectedOrganization) return null;
    return organizations.find(org => org.id === selectedOrganization) || null;
  }, [selectedOrganization, organizations]);
  
  return {
    selectedOrganization,
    organizations,
    switchOrganization,
    getFilteredData,
    getCurrentOrganization
  };
};
```

## Backend Architecture

### API Structure
```
src/
├── controllers/
│   ├── farmer/
│   │   ├── dashboard.controller.ts
│   │   ├── organization.controller.ts
│   │   ├── delivery.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── schedule.controller.ts
│   │   ├── report.controller.ts
│   │   └── settings.controller.ts
├── middleware/
│   ├── farmer-auth.middleware.ts
│   ├── multi-org-access.middleware.ts
│   └── language.middleware.ts
├── services/
│   ├── farmer-organization.service.ts
│   ├── delivery-tracking.service.ts
│   ├── payment-history.service.ts
│   └── notification.service.ts
└── utils/
    ├── multi-org.util.ts
    └── language.util.ts
```

### API Endpoints

#### Organization Management
```typescript
// GET /api/farmer/organizations
interface GetFarmerOrganizationsResponse {
  organizations: FarmerOrganization[];
  summary: {
    totalOrganizations: number;
    totalPendingAmount: number;
    totalDeliveries: number;
    averageRating: number;
  };
}

// GET /api/farmer/organizations/:id/summary
interface GetOrganizationSummaryResponse {
  organization: Organization;
  stats: {
    totalDeliveries: number;
    totalEarnings: number;
    averagePrice: number;
    qualityRating: number;
    lastDeliveryDate: string | null;
    nextScheduledDelivery: string | null;
  };
  recentDeliveries: Delivery[];
  pendingPayments: Payment[];
}
```

#### Delivery Tracking
```typescript
// GET /api/farmer/deliveries
interface GetDeliveriesRequest {
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  status?: DeliveryStatus;
  page?: number;
  limit?: number;
}

interface GetDeliveriesResponse {
  deliveries: FarmerDelivery[];
  pagination: PaginationMeta;
  summary: {
    totalDeliveries: number;
    totalWeight: number;
    totalEarnings: number;
    averagePrice: number;
  };
}

// GET /api/farmer/deliveries/:id
interface GetDeliveryDetailsResponse {
  delivery: DetailedDelivery;
  organization: Organization;
  lorry: LorryInfo;
  fieldManager: ManagerInfo;
  weightDetails: {
    individualWeights: number[];
    totalWeight: number;
    standardDeduction: number;
    qualityDeduction: number;
    netWeight: number;
  };
  qualityInfo: {
    moistureContent: number;
    qualityGrade: string;
    qualityNotes?: string;
  };
  financialDetails: {
    pricePerKg: number;
    totalValue: number;
    advanceDeducted: number;
    finalAmount: number;
  };
}
```

#### Payment History
```typescript
// GET /api/farmer/payments
interface GetPaymentsRequest {
  organizationId?: string;
  type?: 'DELIVERY' | 'ADVANCE';
  status?: 'PENDING' | 'PAID';
  startDate?: string;
  endDate?: string;
}

interface GetPaymentsResponse {
  payments: FarmerPayment[];
  advances: AdvancePayment[];
  summary: {
    totalPending: number;
    totalPaid: number;
    totalAdvances: number;
    netBalance: number;
  };
}
```

### Service Layer

#### Farmer Organization Service
```typescript
class FarmerOrganizationService {
  async getFarmerOrganizations(farmerId: string): Promise<FarmerOrganization[]> {
    const organizations = await prisma.farmerOrganization.findMany({
      where: { farmerId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            phone: true,
            email: true
          }
        }
      }
    });
    
    // Get summary data for each organization
    const enrichedOrganizations = await Promise.all(
      organizations.map(async (farmerOrg) => {
        const stats = await this.getOrganizationStats(farmerId, farmerOrg.organizationId);
        
        return {
          ...farmerOrg,
          stats,
          pendingAmount: stats.pendingPayments,
          lastDeliveryDate: stats.lastDeliveryDate,
          nextScheduledDelivery: await this.getNextScheduledDelivery(farmerId, farmerOrg.organizationId)
        };
      })
    );
    
    return enrichedOrganizations;
  }
  
  private async getOrganizationStats(farmerId: string, organizationId: string): Promise<OrganizationStats> {
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(d.id) as total_deliveries,
        COALESCE(SUM(d.final_amount), 0) as total_earnings,
        COALESCE(AVG(d.price_per_kg), 0) as average_price,
        COALESCE(SUM(CASE WHEN d.status = 'PENDING' THEN d.final_amount ELSE 0 END), 0) as pending_payments,
        MAX(d.delivery_date) as last_delivery_date,
        COALESCE(AVG(CASE WHEN mr.quality_grade = 'EXCELLENT' THEN 5
                          WHEN mr.quality_grade = 'GOOD' THEN 4
                          WHEN mr.quality_grade = 'ACCEPTABLE' THEN 3
                          ELSE 2 END), 0) as quality_rating
      FROM deliveries d
      LEFT JOIN moisture_records mr ON d.id = mr.delivery_id
      WHERE d.farmer_id = ${farmerId} 
      AND d.organization_id = ${organizationId}
    `;
    
    return stats[0];
  }
  
  async getNextScheduledDelivery(farmerId: string, organizationId: string): Promise<string | null> {
    const nextDelivery = await prisma.lorryFarmer.findFirst({
      where: {
        farmerId,
        lorry: { organizationId },
        status: 'SCHEDULED'
      },
      include: {
        lorry: {
          select: {
            scheduledDate: true
          }
        }
      },
      orderBy: {
        lorry: {
          scheduledDate: 'asc'
        }
      }
    });
    
    return nextDelivery?.lorry.scheduledDate || null;
  }
}
```

#### Delivery Tracking Service
```typescript
class DeliveryTrackingService {
  async getFarmerDeliveries(farmerId: string, filters: DeliveryFilters): Promise<DeliveryResponse> {
    const whereClause: any = { farmerId };
    
    if (filters.organizationId) {
      whereClause.organizationId = filters.organizationId;
    }
    
    if (filters.startDate && filters.endDate) {
      whereClause.deliveryDate = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate)
      };
    }
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where: whereClause,
        include: {
          organization: {
            select: { id: true, name: true, code: true }
          },
          lorry: {
            select: { id: true, name: true, licensePlate: true }
          },
          manager: {
            select: { id: true, name: true, phone: true }
          },
          weightEntry: {
            select: {
              individualWeights: true,
              totalWeight: true,
              averageWeight: true
            }
          },
          moistureRecord: {
            select: {
              moistureContent: true,
              qualityGrade: true
            }
          }
        },
        orderBy: { deliveryDate: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.delivery.count({ where: whereClause })
    ]);
    
    const summary = await this.calculateDeliverySummary(farmerId, filters.organizationId);
    
    return {
      deliveries,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit)
      },
      summary
    };
  }
  
  async getDeliveryDetails(deliveryId: string, farmerId: string): Promise<DetailedDelivery> {
    const delivery = await prisma.delivery.findFirst({
      where: { id: deliveryId, farmerId },
      include: {
        organization: true,
        lorry: true,
        manager: {
          select: { id: true, name: true, phone: true, email: true }
        },
        weightEntry: true,
        moistureRecord: true,
        advancePayments: {
          where: { status: 'ACTIVE' }
        }
      }
    });
    
    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }
    
    return delivery;
  }
  
  private async calculateDeliverySummary(farmerId: string, organizationId?: string): Promise<DeliverySummary> {
    const whereClause: any = { farmerId };
    if (organizationId) {
      whereClause.organizationId = organizationId;
    }
    
    const summary = await prisma.delivery.aggregate({
      where: whereClause,
      _count: true,
      _sum: {
        netWeight: true,
        finalAmount: true
      },
      _avg: {
        pricePerKg: true
      }
    });
    
    return {
      totalDeliveries: summary._count,
      totalWeight: summary._sum.netWeight || 0,
      totalEarnings: summary._sum.finalAmount || 0,
      averagePrice: summary._avg.pricePerKg || 0
    };
  }
}
```

## Database Schema Extensions

### Farmer-Specific Views and Indexes
```sql
-- Farmer delivery summary view
CREATE VIEW farmer_delivery_summary AS
SELECT 
    f.id as farmer_id,
    f.name as farmer_name,
    o.id as organization_id,
    o.name as organization_name,
    COUNT(d.id) as total_deliveries,
    COALESCE(SUM(d.net_weight), 0) as total_weight,
    COALESCE(SUM(d.final_amount), 0) as total_earnings,
    COALESCE(AVG(d.price_per_kg), 0) as average_price,
    COALESCE(SUM(CASE WHEN d.status = 'PENDING' THEN d.final_amount ELSE 0 END), 0) as pending_amount,
    MAX(d.delivery_date) as last_delivery_date,
    COALESCE(AVG(CASE 
        WHEN mr.quality_grade = 'EXCELLENT' THEN 5
        WHEN mr.quality_grade = 'GOOD' THEN 4
        WHEN mr.quality_grade = 'ACCEPTABLE' THEN 3
        ELSE 2 
    END), 0) as quality_rating
FROM farmers f
JOIN farmer_organizations fo ON f.id = fo.farmer_id
JOIN organizations o ON fo.organization_id = o.id
LEFT JOIN deliveries d ON f.id = d.farmer_id AND o.id = d.organization_id
LEFT JOIN moisture_records mr ON d.id = mr.delivery_id
GROUP BY f.id, f.name, o.id, o.name;

-- Farmer payment summary view
CREATE VIEW farmer_payment_summary AS
SELECT 
    f.id as farmer_id,
    o.id as organization_id,
    COALESCE(SUM(CASE WHEN d.status = 'PAID' THEN d.final_amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN d.status = 'PENDING' THEN d.final_amount ELSE 0 END), 0) as total_pending,
    COALESCE(SUM(ap.amount), 0) as total_advances,
    COUNT(CASE WHEN d.status = 'PENDING' THEN 1 END) as pending_deliveries
FROM farmers f
JOIN farmer_organizations fo ON f.id = fo.farmer_id
JOIN organizations o ON fo.organization_id = o.id
LEFT JOIN deliveries d ON f.id = d.farmer_id AND o.id = d.organization_id
LEFT JOIN advance_payments ap ON f.id = ap.farmer_id AND o.id = ap.organization_id AND ap.status = 'ACTIVE'
GROUP BY f.id, o.id;
```

### Performance Indexes
```sql
-- Farmer-specific indexes
CREATE INDEX idx_deliveries_farmer_org_date ON deliveries(farmer_id, organization_id, delivery_date DESC);
CREATE INDEX idx_deliveries_farmer_status ON deliveries(farmer_id, status);
CREATE INDEX idx_advance_payments_farmer_org_status ON advance_payments(farmer_id, organization_id, status);
CREATE INDEX idx_farmer_organizations_farmer ON farmer_organizations(farmer_id);

-- Composite indexes for common queries
CREATE INDEX idx_deliveries_farmer_org_status_date ON deliveries(farmer_id, organization_id, status, delivery_date DESC);
CREATE INDEX idx_lorry_farmers_farmer_status ON lorry_farmers(farmer_id, status);
```

## Multi-Organization Data Management

### Organization Context Middleware
```typescript
// multi-org-context.middleware.ts
export const multiOrgContext = (req: Request, res: Response, next: NextFunction) => {
  const farmerId = req.user?.id;
  const organizationId = req.query.organizationId as string;
  
  if (!farmerId) {
    return res.status(401).json({ error: 'Farmer authentication required' });
  }
  
  // Add organization context to request
  req.farmerContext = {
    farmerId,
    organizationId: organizationId || null,
    isMultiOrg: !organizationId
  };
  
  next();
};

// Verify farmer has access to organization
export const verifyOrganizationAccess = async (req: Request, res: Response, next: NextFunction) => {
  const { farmerId, organizationId } = req.farmerContext;
  
  if (organizationId) {
    const hasAccess = await prisma.farmerOrganization.findFirst({
      where: { farmerId, organizationId }
    });
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to organization' });
    }
  }
  
  next();
};
```

### Data Filtering Utility
```typescript
// multi-org-filter.util.ts
export class MultiOrgFilterUtil {
  static applyOrganizationFilter<T extends { organizationId: string }>(
    data: T[],
    selectedOrgId: string | null
  ): T[] {
    if (!selectedOrgId) return data;
    return data.filter(item => item.organizationId === selectedOrgId);
  }
  
  static buildWhereClause(farmerId: string, organizationId?: string): any {
    const where: any = { farmerId };
    
    if (organizationId) {
      where.organizationId = organizationId;
    }
    
    return where;
  }
  
  static async getFarmerOrganizationIds(farmerId: string): Promise<string[]> {
    const farmerOrgs = await prisma.farmerOrganization.findMany({
      where: { farmerId },
      select: { organizationId: true }
    });
    
    return farmerOrgs.map(fo => fo.organizationId);
  }
}
```

## Notification System

### Farmer Notification Types
```typescript
enum FarmerNotificationType {
  DELIVERY_SCHEDULED = 'DELIVERY_SCHEDULED',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  ADVANCE_APPROVED = 'ADVANCE_APPROVED',
  QUALITY_FEEDBACK = 'QUALITY_FEEDBACK',
  PRICE_UPDATE = 'PRICE_UPDATE',
  SCHEDULE_CHANGE = 'SCHEDULE_CHANGE',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER'
}

interface FarmerNotification {
  id: string;
  farmerId: string;
  organizationId: string;
  type: FarmerNotificationType;
  title: string;
  message: string;
  data?: any;
  channels: NotificationChannel[];
  language: 'en' | 'hi' | 'regional';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
}
```

### Multi-Channel Notification Service
```typescript
class FarmerNotificationService {
  async sendDeliveryScheduledNotification(
    farmerId: string,
    organizationId: string,
    deliveryInfo: DeliverySchedule
  ): Promise<void> {
    const farmer = await this.getFarmerWithPreferences(farmerId);
    const organization = await this.getOrganization(organizationId);
    
    // Determine language preference
    const language = farmer.preferredLanguage || 'en';
    
    // Create notification
    const notification: FarmerNotification = {
      id: generateId(),
      farmerId,
      organizationId,
      type: FarmerNotificationType.DELIVERY_SCHEDULED,
      title: this.getLocalizedTitle('DELIVERY_SCHEDULED', language),
      message: this.getLocalizedMessage('DELIVERY_SCHEDULED', language, {
        organizationName: organization.name,
        date: deliveryInfo.scheduledDate,
        time: deliveryInfo.scheduledTime,
        lorryName: deliveryInfo.lorryName
      }),
      data: deliveryInfo,
      channels: farmer.notificationPreferences.channels,
      language,
      priority: 'HIGH'
    };
    
    // Send via multiple channels
    await this.sendMultiChannelNotification(notification);
  }
  
  private async sendMultiChannelNotification(notification: FarmerNotification): Promise<void> {
    const promises: Promise<void>[] = [];
    
    // In-app notification
    if (notification.channels.includes('IN_APP')) {
      promises.push(this.sendInAppNotification(notification));
    }
    
    // SMS notification
    if (notification.channels.includes('SMS')) {
      promises.push(this.sendSMSNotification(notification));
    }
    
    // WhatsApp notification
    if (notification.channels.includes('WHATSAPP')) {
      promises.push(this.sendWhatsAppNotification(notification));
    }
    
    // Voice call for high priority
    if (notification.priority === 'HIGH' && notification.channels.includes('VOICE')) {
      promises.push(this.sendVoiceNotification(notification));
    }
    
    await Promise.allSettled(promises);
  }
  
  private async sendSMSNotification(notification: FarmerNotification): Promise<void> {
    const farmer = await this.userService.getById(notification.farmerId);
    
    // Use simple, clear language for SMS
    const smsMessage = this.getSMSMessage(notification);
    
    await this.smsService.send({
      to: farmer.phone,
      message: smsMessage,
      language: notification.language
    });
  }
  
  private getSMSMessage(notification: FarmerNotification): string {
    const templates = {
      en: {
        DELIVERY_SCHEDULED: `Delivery scheduled for ${notification.data.date} at ${notification.data.time}. Lorry: ${notification.data.lorryName}. Contact: ${notification.data.managerPhone}`,
        PAYMENT_PROCESSED: `Payment of ₹${notification.data.amount} processed for delivery on ${notification.data.deliveryDate}. Check app for details.`,
        ADVANCE_APPROVED: `Advance of ₹${notification.data.amount} approved. Will be deducted from next payment.`
      },
      hi: {
        DELIVERY_SCHEDULED: `डिलीवरी ${notification.data.date} को ${notification.data.time} बजे निर्धारित। लॉरी: ${notification.data.lorryName}। संपर्क: ${notification.data.managerPhone}`,
        PAYMENT_PROCESSED: `${notification.data.deliveryDate} की डिलीवरी के लिए ₹${notification.data.amount} का भुगतान हो गया। विवरण के लिए ऐप देखें।`,
        ADVANCE_APPROVED: `₹${notification.data.amount} का अग्रिम स्वीकृत। अगले भुगतान से काटा जाएगा।`
      }
    };
    
    return templates[notification.language][notification.type] || templates.en[notification.type];
  }
}
```

### WhatsApp Integration
```typescript
class WhatsAppService {
  private client: WhatsAppClient;
  
  constructor() {
    this.client = new WhatsAppClient({
      apiKey: process.env.WHATSAPP_API_KEY!,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!
    });
  }
  
  async sendDeliveryScheduleMessage(
    farmerPhone: string,
    deliveryInfo: DeliverySchedule,
    language: string
  ): Promise<void> {
    const template = language === 'hi' ? 'delivery_scheduled_hi' : 'delivery_scheduled_en';
    
    await this.client.sendTemplate({
      to: farmerPhone,
      template: {
        name: template,
        language: { code: language === 'hi' ? 'hi' : 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: deliveryInfo.organizationName },
              { type: 'text', text: deliveryInfo.scheduledDate },
              { type: 'text', text: deliveryInfo.scheduledTime },
              { type: 'text', text: deliveryInfo.lorryName }
            ]
          }
        ]
      }
    });
  }
  
  async sendPaymentConfirmation(
    farmerPhone: string,
    paymentInfo: PaymentInfo,
    language: string
  ): Promise<void> {
    // Send payment receipt as document
    const receiptPdf = await this.generatePaymentReceipt(paymentInfo);
    
    await this.client.sendDocument({
      to: farmerPhone,
      document: {
        link: receiptPdf.url,
        filename: `payment_receipt_${paymentInfo.id}.pdf`
      },
      caption: language === 'hi' 
        ? `आपका भुगतान रसीद - ₹${paymentInfo.amount}`
        : `Your payment receipt - ₹${paymentInfo.amount}`
    });
  }
}
```

This completes the first part of the comprehensive Farmer technical specification. The document covers frontend architecture with multi-organization support, backend services, database design, and notification systems specifically tailored for farmers who may work with multiple organizations.## Mo
bile & Offline Support

### PWA Configuration for Farmers
```json
// farmer-manifest.json
{
  "name": "Corn Procurement - Farmer",
  "short_name": "CP Farmer",
  "description": "Farmer app for corn procurement tracking",
  "start_url": "/farmer",
  "display": "standalone",
  "background_color": "#4caf50",
  "theme_color": "#2e7d32",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/farmer-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity", "agriculture"],
  "lang": "en",
  "dir": "ltr",
  "shortcuts": [
    {
      "name": "View Deliveries",
      "short_name": "Deliveries",
      "description": "View delivery history",
      "url": "/farmer/deliveries",
      "icons": [{ "src": "/icons/delivery-96.png", "sizes": "96x96" }]
    },
    {
      "name": "Check Payments",
      "short_name": "Payments",
      "description": "Check payment status",
      "url": "/farmer/payments",
      "icons": [{ "src": "/icons/payment-96.png", "sizes": "96x96" }]
    }
  ]
}
```

### Offline Data Management
```typescript
// farmer-offline.service.ts
class FarmerOfflineService {
  private db: IDBDatabase;
  
  async initializeOfflineDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FarmerDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Organizations store
        if (!db.objectStoreNames.contains('organizations')) {
          const orgStore = db.createObjectStore('organizations', { keyPath: 'id' });
          orgStore.createIndex('farmerId', 'farmerId', { unique: false });
        }
        
        // Deliveries store
        if (!db.objectStoreNames.contains('deliveries')) {
          const deliveryStore = db.createObjectStore('deliveries', { keyPath: 'id' });
          deliveryStore.createIndex('farmerId', 'farmerId', { unique: false });
          deliveryStore.createIndex('organizationId', 'organizationId', { unique: false });
          deliveryStore.createIndex('date', 'deliveryDate', { unique: false });
        }
        
        // Payments store
        if (!db.objectStoreNames.contains('payments')) {
          const paymentStore = db.createObjectStore('payments', { keyPath: 'id' });
          paymentStore.createIndex('farmerId', 'farmerId', { unique: false });
          paymentStore.createIndex('status', 'status', { unique: false });
        }
        
        // Schedule store
        if (!db.objectStoreNames.contains('schedule')) {
          const scheduleStore = db.createObjectStore('schedule', { keyPath: 'id' });
          scheduleStore.createIndex('farmerId', 'farmerId', { unique: false });
          scheduleStore.createIndex('date', 'scheduledDate', { unique: false });
        }
      };
    });
  }
  
  async cacheOrganizations(farmerId: string, organizations: Organization[]): Promise<void> {
    const transaction = this.db.transaction(['organizations'], 'readwrite');
    const store = transaction.objectStore('organizations');
    
    for (const org of organizations) {
      await store.put({ ...org, farmerId, cachedAt: new Date().toISOString() });
    }
  }
  
  async getCachedOrganizations(farmerId: string): Promise<Organization[]> {
    const transaction = this.db.transaction(['organizations'], 'readonly');
    const store = transaction.objectStore('organizations');
    const index = store.index('farmerId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(farmerId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async syncWhenOnline(): Promise<void> {
    if (!navigator.onLine) return;
    
    try {
      // Sync cached data with server
      const farmerId = await this.getCurrentFarmerId();
      
      // Fetch latest data
      const [organizations, deliveries, payments, schedule] = await Promise.all([
        this.apiService.getOrganizations(farmerId),
        this.apiService.getRecentDeliveries(farmerId),
        this.apiService.getRecentPayments(farmerId),
        this.apiService.getUpcomingSchedule(farmerId)
      ]);
      
      // Update offline cache
      await Promise.all([
        this.cacheOrganizations(farmerId, organizations),
        this.cacheDeliveries(farmerId, deliveries),
        this.cachePayments(farmerId, payments),
        this.cacheSchedule(farmerId, schedule)
      ]);
      
    } catch (error) {
      console.error('Offline sync failed:', error);
    }
  }
}
```

## Language & Localization

### Multi-Language Support
```typescript
// i18n configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      dashboard: 'Dashboard',
      deliveries: 'My Deliveries',
      payments: 'Payment History',
      schedule: 'Lorry Schedule',
      organizations: 'My Businesses',
      totalEarnings: 'Total Earnings',
      pendingPayments: 'Pending Payments',
      nextDelivery: 'Next Delivery',
      deliveryDetails: 'Delivery Details',
      weightDetails: 'Weight Details',
      qualityInfo: 'Quality Information',
      financialSummary: 'Financial Summary'
    }
  },
  hi: {
    translation: {
      dashboard: 'डैशबोर्ड',
      deliveries: 'मेरी डिलीवरी',
      payments: 'भुगतान इतिहास',
      schedule: 'लॉरी समय सारणी',
      organizations: 'मेरे व्यापार',
      totalEarnings: 'कुल कमाई',
      pendingPayments: 'बकाया भुगतान',
      nextDelivery: 'अगली डिलीवरी',
      deliveryDetails: 'डिलीवरी विवरण',
      weightDetails: 'वजन विवरण',
      qualityInfo: 'गुणवत्ता जानकारी',
      financialSummary: 'वित्तीय सारांश'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### Regional Language Support
```typescript
// regional-language.service.ts
class RegionalLanguageService {
  private supportedLanguages = {
    'ka': 'Kannada',
    'te': 'Telugu',
    'ta': 'Tamil',
    'ml': 'Malayalam',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'pa': 'Punjabi'
  };
  
  async detectUserLanguage(location: GeolocationCoordinates): Promise<string> {
    // Use location to detect regional language
    const region = await this.getRegionFromCoordinates(location);
    
    const regionLanguageMap = {
      'Karnataka': 'ka',
      'Andhra Pradesh': 'te',
      'Telangana': 'te',
      'Tamil Nadu': 'ta',
      'Kerala': 'ml',
      'Maharashtra': 'mr',
      'Gujarat': 'gu',
      'Punjab': 'pa'
    };
    
    return regionLanguageMap[region] || 'en';
  }
  
  async loadRegionalTranslations(language: string): Promise<any> {
    try {
      const translations = await import(`../locales/${language}.json`);
      return translations.default;
    } catch (error) {
      console.warn(`Regional language ${language} not supported, falling back to English`);
      return null;
    }
  }
  
  formatCurrency(amount: number, language: string): string {
    const formatters = {
      'en': new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
      'hi': new Intl.NumberFormat('hi-IN', { style: 'currency', currency: 'INR' }),
      'ka': new Intl.NumberFormat('kn-IN', { style: 'currency', currency: 'INR' }),
      'te': new Intl.NumberFormat('te-IN', { style: 'currency', currency: 'INR' })
    };
    
    const formatter = formatters[language] || formatters['en'];
    return formatter.format(amount);
  }
  
  formatDate(date: Date, language: string): string {
    const formatters = {
      'en': new Intl.DateTimeFormat('en-IN'),
      'hi': new Intl.DateTimeFormat('hi-IN'),
      'ka': new Intl.DateTimeFormat('kn-IN'),
      'te': new Intl.DateTimeFormat('te-IN')
    };
    
    const formatter = formatters[language] || formatters['en'];
    return formatter.format(date);
  }
}
```

## Performance Optimization

### Data Caching Strategy
```typescript
// farmer-cache.service.ts
class FarmerCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = {
    ORGANIZATIONS: 30 * 60 * 1000, // 30 minutes
    DELIVERIES: 10 * 60 * 1000,   // 10 minutes
    PAYMENTS: 15 * 60 * 1000,     // 15 minutes
    SCHEDULE: 5 * 60 * 1000       // 5 minutes
  };
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl || this.TTL.DELIVERIES);
    
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now()
    });
  }
  
  async getFarmerOrganizations(farmerId: string): Promise<Organization[] | null> {
    const key = `farmer:orgs:${farmerId}`;
    return this.get<Organization[]>(key);
  }
  
  async cacheFarmerOrganizations(farmerId: string, organizations: Organization[]): Promise<void> {
    const key = `farmer:orgs:${farmerId}`;
    await this.set(key, organizations, this.TTL.ORGANIZATIONS);
  }
  
  async getFarmerDeliveries(farmerId: string, orgId?: string): Promise<Delivery[] | null> {
    const key = `farmer:deliveries:${farmerId}:${orgId || 'all'}`;
    return this.get<Delivery[]>(key);
  }
  
  async cacheFarmerDeliveries(farmerId: string, deliveries: Delivery[], orgId?: string): Promise<void> {
    const key = `farmer:deliveries:${farmerId}:${orgId || 'all'}`;
    await this.set(key, deliveries, this.TTL.DELIVERIES);
  }
  
  invalidateFarmerCache(farmerId: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache) {
      if (key.includes(`farmer:`) && key.includes(farmerId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
```

### Lazy Loading & Code Splitting
```typescript
// farmer-routes.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load components
const FarmerDashboard = lazy(() => import('../components/farmer/Dashboard/FarmerDashboard'));
const DeliveryList = lazy(() => import('../components/farmer/Deliveries/DeliveryList'));
const DeliveryDetails = lazy(() => import('../components/farmer/Deliveries/DeliveryDetails'));
const PaymentHistory = lazy(() => import('../components/farmer/Payments/PaymentHistory'));
const LorrySchedule = lazy(() => import('../components/farmer/Schedule/LorrySchedule'));
const OrganizationSettings = lazy(() => import('../components/farmer/Settings/OrganizationSettings'));

const FarmerRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<FarmerDashboard />} />
        <Route path="/deliveries" element={<DeliveryList />} />
        <Route path="/deliveries/:id" element={<DeliveryDetails />} />
        <Route path="/payments" element={<PaymentHistory />} />
        <Route path="/schedule" element={<LorrySchedule />} />
        <Route path="/settings/organizations" element={<OrganizationSettings />} />
      </Routes>
    </Suspense>
  );
};

export default FarmerRoutes;
```

## Security & Privacy

### Data Privacy for Multi-Organization
```typescript
// farmer-privacy.service.ts
class FarmerPrivacyService {
  async getFarmerDataByOrganization(farmerId: string, organizationId: string): Promise<FarmerOrgData> {
    // Ensure farmer has access to this organization
    const hasAccess = await this.verifyOrganizationAccess(farmerId, organizationId);
    
    if (!hasAccess) {
      throw new UnauthorizedError('Access denied to organization data');
    }
    
    // Return only data specific to this organization
    const data = await prisma.delivery.findMany({
      where: {
        farmerId,
        organizationId
      },
      select: {
        id: true,
        deliveryDate: true,
        netWeight: true,
        finalAmount: true,
        status: true,
        // Exclude sensitive data from other organizations
      }
    });
    
    return data;
  }
  
  async anonymizeDataForReporting(farmerId: string, organizationId: string): Promise<AnonymizedData> {
    // Remove personally identifiable information for analytics
    const data = await this.getFarmerDataByOrganization(farmerId, organizationId);
    
    return data.map(item => ({
      ...item,
      farmerId: this.hashId(item.farmerId),
      // Remove other PII
      farmerName: undefined,
      phone: undefined,
      address: undefined
    }));
  }
  
  private async verifyOrganizationAccess(farmerId: string, organizationId: string): Promise<boolean> {
    const access = await prisma.farmerOrganization.findFirst({
      where: { farmerId, organizationId }
    });
    
    return !!access;
  }
  
  private hashId(id: string): string {
    return crypto.createHash('sha256').update(id).digest('hex').substring(0, 8);
  }
}
```

### Authentication & Session Management
```typescript
// farmer-auth.service.ts
class FarmerAuthService {
  async authenticateFarmer(phone: string, password?: string, otp?: string): Promise<AuthResult> {
    let farmer: Farmer;
    
    if (otp) {
      // OTP-based authentication
      farmer = await this.verifyOTP(phone, otp);
    } else if (password) {
      // Password-based authentication
      farmer = await this.verifyPassword(phone, password);
    } else {
      throw new ValidationError('Either password or OTP is required');
    }
    
    // Generate tokens
    const accessToken = this.generateAccessToken(farmer);
    const refreshToken = this.generateRefreshToken(farmer);
    
    // Get farmer's organizations
    const organizations = await this.getFarmerOrganizations(farmer.id);
    
    return {
      farmer: {
        id: farmer.id,
        name: farmer.name,
        phone: farmer.phone,
        preferredLanguage: farmer.preferredLanguage
      },
      organizations,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600 // 1 hour
      }
    };
  }
  
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JWTPayload;
    
    const farmer = await prisma.farmer.findUnique({
      where: { id: payload.sub }
    });
    
    if (!farmer) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    
    return {
      accessToken: this.generateAccessToken(farmer),
      refreshToken: this.generateRefreshToken(farmer),
      expiresIn: 3600
    };
  }
  
  private async verifyOTP(phone: string, otp: string): Promise<Farmer> {
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone,
        otp,
        expiresAt: { gt: new Date() },
        used: false
      }
    });
    
    if (!otpRecord) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }
    
    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { used: true }
    });
    
    const farmer = await prisma.farmer.findFirst({
      where: { phone }
    });
    
    if (!farmer) {
      throw new NotFoundError('Farmer not found');
    }
    
    return farmer;
  }
}
```

## Testing Strategy

### Component Testing
```typescript
// FarmerDashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import FarmerDashboard from '../FarmerDashboard';
import { farmerApi } from '../../services/farmer.api';

const mockStore = configureStore({
  reducer: {
    farmer: farmerReducer,
    [farmerApi.reducerPath]: farmerApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(farmerApi.middleware)
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('FarmerDashboard', () => {
  beforeEach(() => {
    // Mock API responses
    jest.spyOn(farmerApi.endpoints.getFarmerOrganizations, 'initiate')
      .mockReturnValue({
        data: mockOrganizations,
        isLoading: false,
        error: null
      } as any);
  });
  
  it('should display organization selector for multi-org farmers', async () => {
    renderWithProviders(<FarmerDashboard farmerId="farmer-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Select Business')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Green Valley Farms')).toBeInTheDocument();
    expect(screen.getByText('Sunrise Agriculture')).toBeInTheDocument();
  });
  
  it('should show total summary across all organizations', async () => {
    renderWithProviders(<FarmerDashboard farmerId="farmer-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Pending: ₹48,000')).toBeInTheDocument();
      expect(screen.getByText('Total Deliveries: 77')).toBeInTheDocument();
    });
  });
  
  it('should switch to single organization view when selected', async () => {
    renderWithProviders(<FarmerDashboard farmerId="farmer-1" />);
    
    const orgCard = screen.getByText('Green Valley Farms');
    fireEvent.click(orgCard);
    
    await waitFor(() => {
      expect(screen.getByText('Green Valley Farms - Dashboard')).toBeInTheDocument();
    });
  });
});
```

### API Testing
```typescript
// farmer.api.test.ts
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../database';

describe('Farmer API', () => {
  let farmerToken: string;
  let farmerId: string;
  let organizationId: string;
  
  beforeAll(async () => {
    // Setup test data
    const farmer = await prisma.farmer.create({
      data: {
        name: 'Test Farmer',
        phone: '+919876543210',
        email: 'test@farmer.com'
      }
    });
    
    farmerId = farmer.id;
    farmerToken = generateTestToken(farmer);
  });
  
  describe('GET /api/farmer/organizations', () => {
    it('should return farmer organizations', async () => {
      const response = await request(app)
        .get('/api/farmer/organizations')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);
      
      expect(response.body.organizations).toBeInstanceOf(Array);
      expect(response.body.summary).toHaveProperty('totalOrganizations');
      expect(response.body.summary).toHaveProperty('totalPendingAmount');
    });
  });
  
  describe('GET /api/farmer/deliveries', () => {
    it('should return deliveries for all organizations', async () => {
      const response = await request(app)
        .get('/api/farmer/deliveries')
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);
      
      expect(response.body.deliveries).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.summary).toHaveProperty('totalDeliveries');
    });
    
    it('should filter deliveries by organization', async () => {
      const response = await request(app)
        .get(`/api/farmer/deliveries?organizationId=${organizationId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .expect(200);
      
      response.body.deliveries.forEach((delivery: any) => {
        expect(delivery.organizationId).toBe(organizationId);
      });
    });
  });
});
```

## Deployment & DevOps

### Mobile App Deployment
```yaml
# .github/workflows/deploy-farmer-app.yml
name: Deploy Farmer Mobile App

on:
  push:
    branches: [main]
    paths: ['src/farmer/**', 'public/farmer/**']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:farmer
      
      - name: Build farmer app
        run: npm run build:farmer
        env:
          REACT_APP_API_URL: ${{ secrets.API_URL }}
          REACT_APP_VAPID_PUBLIC_KEY: ${{ secrets.VAPID_PUBLIC_KEY }}
      
      - name: Deploy to CDN
        run: |
          aws s3 sync build/farmer s3://${{ secrets.S3_BUCKET }}/farmer --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/farmer/*"
      
      - name: Update PWA manifest
        run: |
          # Update service worker version
          sed -i "s/CACHE_VERSION = 'v[0-9]*'/CACHE_VERSION = 'v${{ github.run_number }}'/" build/farmer/sw.js
```

### Performance Monitoring
```typescript
// farmer-performance.service.ts
class FarmerPerformanceService {
  private analytics: Analytics;
  
  constructor() {
    this.analytics = new Analytics({
      apiKey: process.env.ANALYTICS_API_KEY!,
      userId: 'farmer-app'
    });
  }
  
  trackPageLoad(page: string, loadTime: number, farmerId: string): void {
    this.analytics.track('Page Load', {
      page,
      loadTime,
      farmerId: this.hashId(farmerId),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType
    });
  }
  
  trackOrganizationSwitch(fromOrgId: string | null, toOrgId: string, farmerId: string): void {
    this.analytics.track('Organization Switch', {
      fromOrganization: fromOrgId ? this.hashId(fromOrgId) : null,
      toOrganization: this.hashId(toOrgId),
      farmerId: this.hashId(farmerId),
      timestamp: new Date().toISOString()
    });
  }
  
  trackOfflineUsage(action: string, duration: number, farmerId: string): void {
    this.analytics.track('Offline Usage', {
      action,
      duration,
      farmerId: this.hashId(farmerId),
      timestamp: new Date().toISOString()
    });
  }
  
  private hashId(id: string): string {
    return crypto.createHash('sha256').update(id).digest('hex').substring(0, 8);
  }
}
```

This completes the comprehensive Farmer technical specification covering all aspects including multi-organization support, mobile-first design, offline capabilities, multi-language support, security, testing, and deployment strategies specifically tailored for farmers who work with multiple corn procurement businesses.