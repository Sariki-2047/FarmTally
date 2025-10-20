# Advance Payment Management Workflow

## Overview
The advance payment system allows Farm Admins and Field Managers to record and track advance payments given to farmers. These advances are automatically deducted from the farmer's final settlement amount.

## User Roles & Permissions

### Farm Admin
- **Record Advances**: Can record advance payments for any farmer
- **View All Advances**: Access to all advance payment records
- **Modify/Cancel**: Can modify or cancel advance payments
- **Set Limits**: Configure maximum advance limits
- **Generate Reports**: Create advance payment reports

### Field Manager
- **Record Advances**: Can record advances for farmers in their operations
- **View Assigned**: Can view advances for farmers they work with
- **Limited Modification**: Can edit recent advances (within 24 hours)
- **Request Approval**: Large advances may require Farm Admin approval

### Farmer
- **View Own Advances**: Can see their advance payment history
- **Request Advances**: Can request advances through Field Manager
- **Receive Notifications**: Get SMS/ in app notifications about advances

## Advance Payment Process

### Step 1: Farmer Requests Advance
```
Farmer → Field Manager: "I need ₹5,000 advance"
```

### Step 2: Field Manager Assessment
- **Evaluate Request**: Check farmer's history and reliability
- **Check Limits**: Verify against maximum advance limits
- **Assess Amount**: Ensure amount is reasonable for expected delivery
- **Review Balance**: Check farmer's current advance balance

### Step 3: Record Advance Payment
**Navigation**: Farmers Management → Select Farmer → Record Advance

**Form Fields:**
```
Farmer: [Auto-selected] Ramesh Kumar
Advance Amount: ₹5,000
Payment Method: [Cash/Bank Transfer/UPI/Cheque]
Payment Date: [Today's date]
Reference Number: [Optional - for non-cash payments]
Reason: [Optional] Pre-harvest expenses
Notes: [Optional] Additional information
```

### Step 4: Payment Delivery
- **Cash Payment**: Hand over cash to farmer
- **Bank Transfer**: Transfer to farmer's bank account
- **UPI Payment**: Send via UPI to farmer's phone
- **Cheque**: Issue cheque to farmer

### Step 5: System Updates
- **Advance Balance**: Updates farmer's total advance balance
- **Transaction Record**: Creates advance payment record
- **Notification**: Sends confirmation to farmer (SMS/WhatsApp)
- **Audit Trail**: Logs who recorded the advance and when

## Advance Payment Data Structure

### Advance Payment Record (Database Schema)
```prisma
model AdvancePayment {
  id                  String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId      String        @map("organization_id") @db.Uuid
  farmerId            String        @map("farmer_id") @db.Uuid
  amount              Decimal       @db.Decimal(10, 2)
  paymentMethod       PaymentMethod @map("payment_method")
  paymentDate         DateTime      @map("payment_date") @db.Date
  referenceNumber     String?       @map("reference_number") @db.VarChar(100)
  reason              String?       @db.Text
  notes               String?       @db.Text
  receiptPhoto        String?       @map("receipt_photo")
  recordedBy          String        @map("recorded_by") @db.Uuid
  status              AdvanceStatus @default(ACTIVE)
  adjustedInDelivery  String?       @map("adjusted_in_delivery") @db.Uuid
  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id])
  farmer       Farmer       @relation(fields: [farmerId], references: [id])
  recorder     User         @relation(fields: [recordedBy], references: [id])

  @@map("advance_payments")
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  MOBILE_MONEY
  CHECK
}

enum AdvanceStatus {
  ACTIVE
  ADJUSTED
  CANCELLED
}
```

### API Response Example
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "farmerId": "farmer-uuid-123",
  "farmerName": "Bobbadi Arun Kumar",
  "amount": 5000.00,
  "paymentMethod": "CASH",
  "paymentDate": "2024-01-15",
  "referenceNumber": null,
  "reason": "Pre-harvest expenses",
  "notes": "Requested for seeds and fertilizer",
  "recordedBy": "manager-uuid-456",
  "recordedByName": "Field Manager Name",
  "status": "ACTIVE",
  "organizationId": "org-uuid-789",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Farmer Advance Balance
```json
{
  "farmerId": "F036",
  "totalAdvances": 15000.00,
  "activeAdvances": 12000.00,
  "adjustedAdvances": 3000.00,
  "lastAdvanceDate": "2024-01-15",
  "advanceCount": 3,
  "interestCharges": 0.00
}
```

## Integration with Settlement Process

### During Lorry Data Entry
When Field Manager adds a farmer to a lorry:
1. **Auto-populate Advance**: System shows farmer's current advance balance
2. **Advance Field**: Pre-filled with total advance amount
3. **Editable**: Field Manager can adjust if needed
4. **Validation**: Cannot exceed actual advance balance

### In Settlement Calculation
```
Final Amount = (Net Weight × Price per KG) - Total Advance - Interest
```

### Settlement Report Integration
The farmer settlement report includes:
- **Total Advance**: Sum of all advances given
- **Advance Breakdown**: Optional detailed list
- **Interest Charges**: If applicable
- **Final Calculation**: Clear deduction from total value

## Advance Payment Limits & Controls

### Maximum Advance Limits
- **Per Farmer**: Maximum advance per individual farmer
- **Per Transaction**: Maximum single advance amount
- **Total Outstanding**: Maximum total advances across all farmers
- **Percentage Based**: Advance as percentage of expected delivery value

### Approval Workflow
```
Small Advance (≤₹2,000) → Field Manager → Auto-approved
Medium Advance (₹2,001-₹10,000) → Field Manager → Farm Admin notification
Large Advance (>₹10,000) → Field Manager → Farm Admin approval required
```

### Risk Management
- **Credit Scoring**: Track farmer reliability and payment history
- **Seasonal Limits**: Adjust limits based on harvest season
- **Performance Based**: Higher limits for consistent performers
- **Blacklist Management**: Restrict advances for problematic farmers

## Advance Payment Reports

### Daily Advance Report
- **Date Range**: Advances given on specific date
- **Total Amount**: Sum of all advances
- **Payment Methods**: Breakdown by payment method
- **Field Manager Summary**: Advances by each manager

### Farmer Advance Statement
- **Individual Report**: All advances for specific farmer
- **Balance Summary**: Current outstanding balance
- **Payment History**: Chronological list of advances
- **Settlement History**: How advances were adjusted

### Outstanding Advances Report
- **Current Balances**: All farmers with outstanding advances
- **Aging Analysis**: How long advances have been outstanding
- **Risk Assessment**: Farmers with high advance balances
- **Collection Priority**: Farmers due for settlement

## Interest Calculation (Optional)

### Interest Policy
- **Interest Rate**: Configurable rate (e.g., 2% per month)
- **Grace Period**: No interest for first 30 days
- **Calculation Method**: Simple or compound interest
- **Maximum Interest**: Cap on total interest charges

### Interest Application
```
Monthly Interest = (Outstanding Advance × Interest Rate) / 12
Total Interest = Sum of monthly interest charges
```

### Interest in Settlement
- **Separate Line Item**: Interest shown separately in settlement
- **Auto-calculation**: System calculates based on advance duration
- **Manual Override**: Farm Admin can waive or adjust interest

## Mobile & Offline Support

### Mobile Advance Recording
- **Quick Entry**: Simplified form for mobile devices
- **Voice Input**: Speak advance amount and details
- **Photo Documentation**: Capture payment receipt/proof
- **GPS Tracking**: Record location of advance payment

### Offline Capability
- **Local Storage**: Store advance records locally when offline
- **Auto-sync**: Upload when internet connection available
- **Conflict Resolution**: Handle duplicate entries during sync
- **Backup**: Regular backup of offline data

## Security & Audit

### Access Control
- **Role-based Permissions**: Different access levels by role
- **IP Restrictions**: Limit access from specific locations
- **Time-based Access**: Restrict access to business hours
- **Multi-factor Authentication**: For large advance amounts

### Audit Trail
- **Complete Logging**: All advance payment activities logged
- **User Tracking**: Who recorded, modified, or cancelled advances
- **Timestamp Records**: Exact date/time of all activities
- **Change History**: Track all modifications to advance records

### Fraud Prevention
- **Duplicate Detection**: Prevent duplicate advance entries
- **Velocity Checks**: Alert on unusual advance patterns
- **Approval Workflows**: Multi-level approval for large amounts
- **Regular Reconciliation**: Match advances with actual payments

## Integration Points

### Notification Integration (Current Implementation)

#### Firebase Push Notifications
```typescript
// Advance payment confirmation
await notificationService.sendToUser(farmerId, {
  type: 'advance_payment',
  title: 'Advance Payment Processed',
  body: `₹${amount.toLocaleString()} advance payment has been recorded`,
  data: { 
    advanceId,
    amount: amount.toString(),
    paymentMethod,
    organizationId 
  }
});
```

#### Professional Email Notifications
```typescript
// Send advance payment confirmation email
await emailService.sendAdvancePaymentNotification(
  farmerEmail,
  {
    farmerName: 'Bobbadi Arun Kumar',
    amount: 5000,
    paymentDate: '2024-01-15',
    referenceNumber: 'ADV001',
    reason: 'Pre-harvest expenses'
  }
);
```

#### In-App Notifications
- **Real-time Updates**: Instant notification when advance is recorded
- **History Tracking**: All advance notifications stored in database
- **Read/Unread Status**: Track notification engagement
- **Organization Scoped**: Notifications isolated by organization

### API Endpoints (Express.js + TypeScript)
```typescript
// Advance Payment Management
POST /api/v1/advance-payments                    // Record new advance
GET /api/v1/advance-payments                     // List advances (with filters)
GET /api/v1/advance-payments/:id                 // Get specific advance
PUT /api/v1/advance-payments/:id                 // Update advance
DELETE /api/v1/advance-payments/:id              // Cancel advance

// Farmer-specific endpoints
GET /api/v1/farmer/advances                      // Get farmer's advances
GET /api/v1/farmer/advances/balance              // Get current balance
POST /api/v1/farmer/advances/request             // Request advance (future)

// Reporting endpoints
GET /api/v1/reports/advances/daily               // Daily advance report
GET /api/v1/reports/advances/outstanding         // Outstanding advances
GET /api/v1/reports/advances/farmer/:id          // Farmer advance statement
```

### JWT Authentication & Authorization
```typescript
// Middleware for advance payment operations
authenticate,                    // Verify JWT token
authorize(['FARM_ADMIN', 'FIELD_MANAGER']),  // Role-based access
organizationScope,              // Ensure organization data isolation

// Example protected route
router.post('/advance-payments',
  authenticate,
  authorize(['FARM_ADMIN', 'FIELD_MANAGER']),
  validateAdvancePayment,
  async (req: Request, res: Response) => {
    // Record advance payment with organization isolation
    const advance = await advanceService.recordPayment({
      ...req.body,
      organizationId: req.user.organizationId,
      recordedBy: req.user.id
    });
    
    // Send notifications
    await notificationService.sendAdvanceNotification(advance);
    
    res.json({ success: true, data: advance });
  }
);
```

### Database Integration (Prisma ORM)
```typescript
// Record advance payment with full audit trail
const advance = await prisma.advancePayment.create({
  data: {
    organizationId: user.organizationId,
    farmerId,
    amount,
    paymentMethod,
    paymentDate,
    referenceNumber,
    reason,
    notes,
    recordedBy: user.id,
    status: 'ACTIVE'
  },
  include: {
    farmer: true,
    organization: true,
    recorder: {
      select: { id: true, email: true, profile: true }
    }
  }
});

// Update farmer's total advance balance
await prisma.farmerOrganization.update({
  where: {
    farmerId_organizationId: {
      farmerId,
      organizationId: user.organizationId
    }
  },
  data: {
    totalAdvances: {
      increment: amount
    }
  }
});
```