# Farmer Multi-Organization Experience

## Overview
Farmers can supply corn to multiple Farm Admins (different organizations). Each organization maintains separate records, payments, and transactions for the same farmer, ensuring complete data isolation while providing the farmer with a unified view of all their business relationships.

## Farmer Login & Organization Selection

### Login Process
1. **Single Login**: Farmer uses one set of credentials (phone/email + password)
2. **Organization Detection**: System identifies all organizations the farmer supplies to
3. **Organization Selector**: If multiple organizations, farmer sees organization selector

### Organization Selector Interface
```
┌─────────────────────────────────────────┐
│           Welcome, Ramesh Kumar         │
├─────────────────────────────────────────┤
│ Select Organization:                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🏢 Green Valley Farms               │ │
│ │    📍 Bangalore                     │ │
│ │    💰 Pending: ₹25,000             │ │
│ │    📅 Last Delivery: 2 days ago    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🏢 Sunrise Agriculture              │ │
│ │    📍 Mysore                        │ │
│ │    💰 Pending: ₹15,000             │ │
│ │    📅 Last Delivery: 1 week ago    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🏢 Golden Harvest Co.               │ │
│ │    📍 Hassan                        │ │
│ │    💰 Pending: ₹8,000              │ │
│ │    📅 Last Delivery: 3 weeks ago   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Farmer Dashboard - Multi-Organization View

### Option 1: Organization-Specific Dashboard
After selecting an organization, farmer sees data only for that organization:

```
┌─────────────────────────────────────────┐
│    🏢 Green Valley Farms - Dashboard    │
├─────────────────────────────────────────┤
│ Current Organization: Green Valley      │
│ [Switch Organization ▼]                 │
├─────────────────────────────────────────┤
│ Today's Schedule:                       │
│ 🚛 Lorry L001 - 2:00 PM                │
│                                         │
│ Recent Deliveries:                      │
│ 📅 Jan 15: 1,200 KG - ₹25,800         │
│ 📅 Jan 10: 980 KG - ₹21,560           │
│                                         │
│ Payment Status:                         │
│ 💰 Pending: ₹25,000                    │
│ 💸 Advances: ₹5,000                    │
└─────────────────────────────────────────┘
```



## Navigation Structure for Multi-Organization Farmers

### Updated Farmer Navigation Tree
```
📊 Dashboard                    /farmer/dashboard
   ├── 🏢 Organization Selector /farmer/select-org
   └── 📊 All Organizations     /farmer/dashboard/all

🚛 My Deliveries               /farmer/deliveries
   ├── 📋 All Deliveries        /farmer/deliveries
   ├── 🏢 By Organization       /farmer/deliveries/by-org
   ├── 📋 Delivery Details      /farmer/deliveries/:id
   ├── ⏳ Scheduled             /farmer/deliveries/scheduled
   ├── ✅ Completed             /farmer/deliveries/completed
   └── 📊 Generate Delivery Report /farmer/deliveries/report

💰 Payment History             /farmer/payments
   ├── 📋 All Payments          /farmer/payments
   ├── 🏢 By Organization       /farmer/payments/by-org
   ├── 💵 Payment Details       /farmer/payments/:id
   ├── 💸 Advances Received     /farmer/payments/advances
   ├── 📊 Payment Summary       /farmer/payments/summary
   └── 📊 Generate Payment Report /farmer/payments/report

📅 Lorry Schedule              /farmer/schedule
   ├── 📋 All Schedules         /farmer/schedule
   ├── 🏢 By Organization       /farmer/schedule/by-org
   ├── 📅 Today's Schedule      /farmer/schedule/today
   └── 📆 Upcoming Deliveries   /farmer/schedule/upcoming

⚙️ Settings                    /farmer/settings
   ├── 👤 Profile               /farmer/settings/profile
   ├── 🏢 Organizations         /farmer/settings/organizations
   └── 🔔 Notifications         /farmer/settings/notifications
```

## Data Presentation - Organization-Specific Views

### My Deliveries - Multi-Organization Table
| Column | Width | Description | Organization Filter |
|--------|-------|-------------|-------------------|
| Date | 120px | Delivery date | All/Specific Org |
| Organization | 150px | Farm Admin name | Filterable |
| Lorry ID | 100px | Lorry identifier | - |
| Bags | 80px | Number of bags | - |
| Weight (KG) | 100px | Total weight | - |
| Price/KG | 100px | Rate received | Varies by org |
| Amount | 120px | Total payment | - |
| Status | 100px | Paid/Pending | - |
| Actions | 100px | View Details | - |

### Payment History - Multi-Organization View
```
┌─────────────────────────────────────────┐
│           Payment History                │
├─────────────────────────────────────────┤
│ Filter: [All Organizations ▼]           │
├─────────────────────────────────────────┤
│ 🏢 Green Valley Farms                   │
│ Jan 15: ₹25,800 - Pending              │
│ Jan 10: ₹21,560 - Paid                 │
│ Jan 05: ₹18,200 - Paid                 │
│                                         │
│ 🏢 Sunrise Agriculture                  │
│ Jan 12: ₹15,400 - Pending              │
│ Jan 08: ₹19,800 - Paid                 │
│                                         │
│ 🏢 Golden Harvest Co.                   │
│ Dec 28: ₹8,500 - Paid                  │
│ Dec 20: ₹12,300 - Paid                 │
└─────────────────────────────────────────┘
```

## Organization Management for Farmers

### Organization Settings Page
```
┌─────────────────────────────────────────┐
│         My Organizations                 │
├─────────────────────────────────────────┤
│ 🏢 Green Valley Farms                   │
│    📧 Contact: admin@greenvalley.com    │
│    📞 Phone: +91-9876543210            │
│    📍 Location: Bangalore               │
│    📊 Total Deliveries: 45             │
│    💰 Total Earned: ₹2,45,000          │
│    [View Details] [Contact]            │
│                                         │
│ 🏢 Sunrise Agriculture                  │
│    📧 Contact: info@sunrise.com         │
│    📞 Phone: +91-9876543211            │
│    📍 Location: Mysore                  │
│    📊 Total Deliveries: 32             │
│    💰 Total Earned: ₹1,85,000          │
│    [View Details] [Contact]            │
│                                         │
│ 🏢 Golden Harvest Co.                   │
│    📧 Contact: admin@goldenharvest.com  │
│    📞 Phone: +91-9876543212            │
│    📍 Location: Hassan                  │
│    📊 Total Deliveries: 18             │
│    💰 Total Earned: ₹95,000            │
│    [View Details] [Contact]            │
└─────────────────────────────────────────┘
```

## Data Isolation & Security

### Separate Data Streams
Each organization maintains completely separate records:
- **Delivery Records**: Separate for each organization
- **Payment History**: Independent payment tracking
- **Advance Payments**: Separate advance balances
- **Quality Ratings**: Organization-specific quality scores
- **Communication**: Separate message threads

### Privacy Protection
- **Organization A** cannot see farmer's data with **Organization B**
- **Cross-Organization Analytics**: Not available to Farm Admins
- **Farmer Control**: Farmer sees all their data across organizations

## Notification Management

### Organization-Specific Notifications
```
📱 Notifications:

🏢 Green Valley Farms
   🚛 Lorry assigned for tomorrow 2:00 PM
   💰 Payment of ₹25,800 processed

🏢 Sunrise Agriculture  
   📅 Delivery scheduled for Jan 20
   💸 Advance payment of ₹3,000 approved

🏢 Golden Harvest Co.
   📊 Monthly report available
   ⚠️ Quality feedback: Improve moisture content
```

### Notification Settings
Farmers can configure notifications per organization:
- **Delivery Schedules**: On/Off per organization
- **Payment Updates**: On/Off per organization
- **Quality Feedback**: On/Off per organization
- **General Updates**: On/Off per organization

## Reporting - Multi-Organization

### Consolidated Reports
Farmers can generate reports that include:
1. **Single Organization**: Data from one specific organization
2. **All Organizations**: Combined data from all organizations
3. **Comparative**: Side-by-side comparison between organizations

### Report Types
- **Annual Summary**: Total earnings across all organizations
- **Organization Comparison**: Performance with different Farm Admins
- **Seasonal Analysis**: Delivery patterns across organizations
- **Payment Analysis**: Payment terms and timing comparison

## Mobile Experience

### Mobile Organization Switcher
```
┌─────────────────────┐
│ 🏢 Green Valley ▼   │
├─────────────────────┤
│ Today's Deliveries  │
│ 🚛 L001 - 2:00 PM   │
│                     │
│ Pending Payments    │
│ 💰 ₹25,000         │
│                     │
│ Quick Actions:      │
│ [📞 Call Manager]   │
│ [📊 View Report]    │
│ [💸 Check Advance]  │
└─────────────────────┘
```

### Swipe Navigation
- **Swipe Left/Right**: Switch between organizations
- **Pull to Refresh**: Update data for current organization
- **Long Press**: Quick actions menu

## Technical Implementation

### Database Structure (Prisma Schema)
```prisma
// Farmer can be linked to multiple organizations
model FarmerOrganization {
  farmerId         String   @map("farmer_id") @db.Uuid
  organizationId   String   @map("organization_id") @db.Uuid
  joinDate         DateTime @default(now()) @map("join_date") @db.Date
  status           String   @default("ACTIVE") @db.VarChar(20)
  qualityRating    Decimal? @map("quality_rating") @db.Decimal(3, 2)
  totalDeliveries  Int      @default(0) @map("total_deliveries")
  totalEarnings    Decimal  @default(0) @map("total_earnings") @db.Decimal(12, 2)

  // Relations
  farmer       Farmer       @relation(fields: [farmerId], references: [id])
  organization Organization @relation(fields: [organizationId], references: [id])

  @@id([farmerId, organizationId])
  @@map("farmer_organizations")
}

// All transactions are organization-scoped
model Delivery {
  id                       String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId           String         @map("organization_id") @db.Uuid  // Ensures data isolation
  farmerId                 String         @map("farmer_id") @db.Uuid
  lorryId                  String         @map("lorry_id") @db.Uuid
  deliveryDate             DateTime       @map("delivery_date") @db.Date
  // ... other fields
  
  // Relations ensure proper data isolation
  organization Organization @relation(fields: [organizationId], references: [id])
  farmer       Farmer       @relation(fields: [farmerId], references: [id])
}
```

### JWT Authentication & Session Management
- **JWT Tokens**: Secure authentication with 8-hour access tokens
- **Organization Context**: Current organization stored in JWT payload
- **Role-based Access**: FARMER role with organization-specific permissions
- **Token Refresh**: 7-day refresh tokens for seamless experience
- **Multi-tenant Security**: Organization ID in JWT ensures data isolation

### API Design (Express.js with TypeScript)
```typescript
// Get farmer's organizations
GET /api/v1/farmer/organizations
Authorization: Bearer <jwt_token>

// Get deliveries for specific organization
GET /api/v1/farmer/deliveries?organizationId=uuid

// Get all deliveries across organizations
GET /api/v1/farmer/deliveries/all

// Switch organization context (updates JWT)
POST /api/v1/farmer/switch-organization
{
  "organizationId": "uuid"
}

// Get farmer's multi-org dashboard data
GET /api/v1/farmer/dashboard/multi-org
```

### Firebase Push Notifications
```typescript
// Organization-specific notification topics
await firebaseService.subscribeToTopic(
  userTokens, 
  `farmer_${farmerId}_org_${organizationId}`
);

// Send delivery notifications per organization
await notificationService.sendToUser(farmerId, {
  type: 'delivery_scheduled',
  title: `Delivery Scheduled - ${organizationName}`,
  body: 'Your delivery is scheduled for tomorrow at 2:00 PM',
  data: { 
    organizationId,
    deliveryId,
    type: 'delivery_scheduled'
  }
});
```

## User Experience Best Practices

### Clear Organization Context
- **Always show** which organization's data is being viewed
- **Easy switching** between organizations
- **Visual indicators** for different organizations (colors, logos)

### Consistent Navigation
- **Same menu structure** across all organizations
- **Consistent data presentation** regardless of organization
- **Unified search** across all organizations when needed

### Performance Optimization
- **Lazy loading** of organization data
- **Background sync** for inactive organizations
- **Offline support** for current organization data