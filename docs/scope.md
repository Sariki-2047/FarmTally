# Corn Procurement System - Scope & Roles

## User Roles

### Farm Admin (Business Owner)
**Primary Responsibilities:** Business management, lorry allocation, pricing control, and financial oversight

**Sidebar Navigation:**
- Dashboard
- Lorry Management
- Lorry Requests
- Field Managers
- Farmers
- Financial Reports
- Business Settings

**Screen Responsibilities:**
- Manage lorry fleet and assign lorries to field managers
- View and approve/reject lorry requests from field managers
- Add/edit/delete farmers in the system
- Add field managers to the business
- Set price per KG, advance payments, and quality deductions directly in data tables
- Record and manage farmer advance payments with transaction history
- Monitor procurement performance and financial metrics
- Review and approve completed lorry submissions with final calculations
- Generate reports for lorries, field managers, and farmers

### Field Manager (Employee)
**Primary Responsibilities:** Lorry operations, farmer coordination, and data collection

**Sidebar Navigation:**
- Dashboard
- My Lorries
- Lorry Requests
- Farmers Management
- Reports

**Screen Responsibilities:**
- Request lorries from Farm Admin
- Add new farmers to the database for business use
- Add/edit farmers to assigned lorries (select from database or add new)
- Record individual bag weights and moisture content for each farmer
- Record farmer advance payments when requested
- Submit completed weight data to Farm Admin for processing
- Generate reports for assigned lorries and farmer performance

### Farmer (Corn Supplier)
**Primary Responsibilities:** Corn delivery and transaction tracking across multiple organizations

**Sidebar Navigation:**
- Dashboard (with organization selector)
- My Deliveries (filterable by organization)
- Payment History (filterable by organization)
- Lorry Schedule (all organizations)
- Settings (organization management)

**Screen Responsibilities:**
- Select and switch between different Farm Admin organizations
- View assigned lorry schedules across all organizations
- Track delivery history and payments per organization
- View transaction details and deductions for each organization
- Monitor payment status and advances separately per organization
- Manage organization-specific notification preferences

## Corn Procurement Workflow

### 1. Lorry Request Process
```
Field Manager → Request Lorry → Farm Admin → Assign Lorry → Field Manager
```

### 2. Farmer Assignment & Data Collection
```
Field Manager → Add Farmers to Lorry → Record Bag Weights & Moisture → Submit Data → Farm Admin → Apply Pricing & Deductions → Finalize Payments
```

### 3. Data Table Structure (Per Lorry)
| Column | Description | Entered By |
|--------|-------------|------------|
| Farmer Name | Farmer delivering corn | Field Manager |
| Number of Bags | Total bags delivered | Field Manager |
| Individual Bag Weights | Weight of each bag | Field Manager |
| Moisture Content | Moisture percentage per farmer | Field Manager |
| Gross Weight | Total weight before deductions | System (Sum of bag weights) |
| 2KG Deduction | Standard 2KG per bag deduction | System (Bags × 2KG) |
| Quality Deduction KGs | Quality-based weight reduction | Farm Admin |
| Net Weight | Final weight for payment | System (Gross - 2KG - Quality) |
| Price per KG | Rate based on moisture content | Farm Admin |
| Advance | Advance payment given | Farm Admin/Field Manager |
| Final Amount | Net payment due | System (Net Weight × Price - Advance) |

## Role Hierarchy & Business Model
```
Farm Admin (Business Owner)
    ↓ employs
Field Manager (Employee)
    ↓ coordinates
Farmer (Corn Supplier)
```

## Organizational Structure
- Each organization has one Farm Admin (Business Owner)
- Each Farm Admin owns and operates one corn procurement business
- Field Managers are employees of specific organizations
- Farmers can supply to multiple organizations
- Complete data isolation between different organizations

## Authentication & User Management
For detailed information about user registration, authentication flow, and relationship establishment, see:
- **[Authentication Flow](auth-flow.md)** - Complete signup process and login procedures
- **[User Relationships](user-relationships.md)** - Organizational structure and data access patterns

## Advance Payment Management
For detailed information about advance payment recording and management, see:
- **[Advance Payment Workflow](advance-payment-workflow.md)** - Complete advance payment process and management
- **[Farm Admin Screens](farm-admin-screens.md)** - Detailed screen layouts including advance payment features

### Quick Overview
- **Farm Admin**: Self-registers and creates business organization
- **Field Manager**: Invited by Farm Admin, cannot self-register
- **Farmer**: Added by Farm Admin or Field Manager, receives login credentials
- **Relationships**: Hierarchical structure with strict data isolation per organization
- **Advance Payments**: Both Farm Admin and Field Manager can record farmer advances##
 Corrected Organizational Structure
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
│ │ Database    │ │              │ │ Database    │ │
│ └─────────────┘ │              │ └─────────────┘ │
└─────────────────┘              └─────────────────┘
```

### Key Relationships
- **One-to-One**: Each organization has exactly one Farm Admin
- **One-to-Many**: Each Farm Admin can have multiple Field Managers
- **Many-to-Many**: Farmers can supply to multiple organizations
- **Data Isolation**: Complete separation between organizations