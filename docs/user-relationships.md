# User Relationships & System Architecture

## User Registration Flow Diagram

### Farm Admin Registration Flow
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Landing Page  │───▶│  Registration    │───▶│ Email           │
│                 │    │  Form            │    │ Verification    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin         │◀───│  Business Setup  │◀───│ Account         │
│   Dashboard     │    │  Wizard          │    │ Activation      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Field Manager Invitation Flow
```
Farm Admin                    System                    Field Manager
     │                          │                           │
     │ 1. Create Invitation     │                           │
     ├─────────────────────────▶│                           │
     │                          │ 2. Send Invitation Email │
     │                          ├──────────────────────────▶│
     │                          │                           │ 3. Click Link
     │                          │◀──────────────────────────┤
     │                          │ 4. Setup Account Form    │
     │                          ├──────────────────────────▶│
     │                          │                           │ 5. Complete Setup
     │                          │◀──────────────────────────┤
     │ 6. Manager Added         │                           │
     │◀─────────────────────────┤                           │
     │                          │ 7. Welcome & Dashboard   │
     │                          ├──────────────────────────▶│
```

### Farmer Registration Flow
```
Method 1: Farm Admin Creates
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Farm Admin      │───▶│ Create Farmer    │───▶│ Send Login      │
│ "Add Farmer"    │    │ Account          │    │ Credentials     │
└─────────────────┘    └──────────────────┘    └─────────────────┘

Method 2: Field Manager Creates
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Field Manager   │───▶│ Create Farmer    │───▶│ Notify Farm     │
│ "Add Farmer"    │    │ Account          │    │ Admin           │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Organizational Structure

### Single Organization Model
```
┌─────────────────────────────────────────────────────────────┐
│                    ORGANIZATION A                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                Farm Admin                           │    │
│  │              (Business Owner)                       │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                    │
│  ┌─────────────────────┼───────────────────────────────┐    │
│  │                     ▼                               │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   Field     │  │   Field     │  │   Field     │  │    │
│  │  │ Manager 1   │  │ Manager 2   │  │ Manager 3   │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                    │
│  ┌─────────────────────┼───────────────────────────────┐    │
│  │                     ▼                               │    │
│  │         Shared Farmer Database                      │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │    │
│  │  │Farmer 1 │ │Farmer 2 │ │Farmer 3 │ │Farmer N │   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Organization System Model
```
Organization A                    Organization B
┌─────────────────┐              ┌─────────────────┐
│   Farm Admin A  │              │   Farm Admin B  │
│ (Business Owner)│              │ (Business Owner)│
└─────────┬───────┘              └─────────┬───────┘
          │                                │
          ▼                                ▼
┌─────────────────┐              ┌─────────────────┐
│ ┌─────────────┐ │              │ ┌─────────────┐ │
│ │Field Mgr 1  │ │              │ │Field Mgr 3  │ │
│ │Field Mgr 2  │ │              │ │Field Mgr 4  │ │
│ └─────────────┘ │              │ └─────────────┘ │
│                 │              │                 │
│ ┌─────────────┐ │              │ ┌─────────────┐ │
│ │  Farmers    │ │              │ │  Farmers    │ │
│ │ Database A  │ │              │ │ Database B  │ │
│ └─────────────┘ │              │ └─────────────┘ │
└─────────────────┘              └─────────────────┘
```

## Data Access Patterns

### Farm Admin Data Access
```
Farm Admin Login
       │
       ▼
┌─────────────────┐
│ Auto-Scoped to  │
│ Owned Org       │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ Full Access to: │
│ • All Lorries   │
│ • All Managers  │
│ • All Farmers   │
│ • All Requests  │
│ • All Reports   │
└─────────────────┘
```

### Field Manager Data Access
```
Field Manager Login
       │
       ▼
┌─────────────────┐
│ Auto-Scoped to  │
│ Assigned Org    │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ Limited Access: │
│ • My Lorries    │
│ • Org Farmers   │
│ • My Requests   │
│ • My Reports    │
└─────────────────┘
```

### Farmer Data Access
```
Farmer Login
       │
       ▼
┌─────────────────┐
│ Multi-Org Check │
│ (if applicable) │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ Personal Data:  │
│ • My Deliveries │
│ • My Payments   │
│ • My Schedule   │
│ • My History    │
└─────────────────┘
```

## Authentication Security Model

### Security Layers
```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Role-Based Access Control             │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │           Organization Isolation            │    │    │
│  │  │  ┌─────────────────────────────────────┐    │    │    │
│  │  │  │         Data Encryption             │    │    │    │
│  │  │  │  ┌─────────────────────────────┐    │    │    │    │
│  │  │  │  │    Session Management       │    │    │    │    │
│  │  │  │  │  ┌─────────────────────┐    │    │    │    │    │
│  │  │  │  │  │  Authentication     │    │    │    │    │    │
│  │  │  │  │  └─────────────────────┘    │    │    │    │    │
│  │  │  │  └─────────────────────────────┘    │    │    │    │
│  │  │  └─────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Permission Matrix by Role
```
Feature/Data          │ Farm Admin │ Field Manager │ Farmer
─────────────────────────────────────────────────────────────
Lorry Management      │     ✅     │      ❌       │   ❌
Lorry Requests        │     ✅     │      ✅       │   ❌
Field Manager Mgmt    │     ✅     │      ❌       │   ❌
Farmer Management     │     ✅     │      ✅       │   ❌
Pricing Control       │     ✅     │      ❌       │   ❌
Quality Deductions    │     ✅     │      ❌       │   ❌
Advance Payments      │     ✅     │      ❌       │   ❌
Weight Entry          │     ✅     │      ✅       │   ❌
Moisture Recording    │     ✅     │      ✅       │   ❌
View Own Deliveries   │     ✅     │      ✅       │   ✅
View Own Payments     │     ✅     │      ✅       │   ✅
Financial Reports     │     ✅     │      ❌       │   ❌
Operational Reports   │     ✅     │      ✅       │   ❌
Personal Reports      │     ✅     │      ✅       │   ✅
```

## User Lifecycle Management

### Account Lifecycle States
```
Registration ──▶ Pending ──▶ Active ──▶ Inactive ──▶ Suspended
     │              │          │          │            │
     │              │          │          │            │
     ▼              ▼          ▼          ▼            ▼
  Cancelled     Expired    Archived   Reactivated   Deleted
```

### State Transitions
- **Registration → Pending**: Account created, awaiting verification
- **Pending → Active**: Email verified or invitation accepted
- **Active → Inactive**: User hasn't logged in for 90 days
- **Inactive → Active**: User logs in again
- **Active → Suspended**: Admin action due to policy violation
- **Suspended → Active**: Admin reactivates account
- **Any State → Deleted**: Permanent account deletion

### Automated Actions
- **Inactive Accounts**: Auto-suspend after 90 days of inactivity
- **Expired Invitations**: Auto-cancel invitations after 7 days
- **Password Expiry**: Force password change every 180 days (Farm Admin only)
- **Session Timeout**: Auto-logout after 8 hours of inactivity

## Integration Points

### External Systems
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SMS Gateway   │    │  Email Service  │    │  Payment        │
│   (OTP/Alerts)  │    │  (Notifications)│    │  Gateway        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Corn Procurement│
                    │     System      │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Audit Log     │    │   File Storage  │    │   Analytics     │
│   Service       │    │   (Documents)   │    │   Service       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### API Authentication
- **JWT Tokens**: Secure API access with role-based claims
- **API Keys**: For system-to-system integration
- **OAuth 2.0**: For third-party application access
- **Rate Limiting**: Prevent API abuse and ensure fair usage