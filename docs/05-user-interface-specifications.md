# User Interface Specifications
## Complete UI/UX Design & Navigation System

### Design System Overview

#### Design Principles
- **Mobile-First**: Optimized for field operations on mobile devices
- **Native Performance**: Flutter's compiled native performance
- **Data-Driven**: Clear presentation of complex procurement data
- **Role-Based**: Tailored interfaces for each user role
- **Multi-Organization**: Seamless switching between organizations
- **Accessibility**: WCAG 2.1 AA compliant design
- **Cross-Platform**: Consistent experience across iOS, Android, Web, Desktop

#### Visual Design Language (Material Design 3)
- **Color Palette**:
  - Primary: #2196F3 (Blue) - Actions, links, primary buttons
  - Secondary: #4CAF50 (Green) - Success, completed states
  - Warning: #FF9800 (Orange) - Warnings, pending states
  - Error: #F44336 (Red) - Errors, rejected states
  - Neutral: #757575 (Gray) - Text, borders, backgrounds
- **Typography**: Roboto font family with Flutter's text scaling
- **Spacing**: 8dp grid system for consistent spacing
- **Elevation**: Material 3 elevation system with dynamic color
- **Adaptive Design**: Platform-specific adaptations (iOS/Android/Web)

### Navigation Architecture

#### Farm Admin Navigation
```
📊 Dashboard                    /admin/dashboard
🚛 Lorry Management            /admin/lorries
   ├── 📋 All Lorries           /admin/lorries
   ├── 🚛 Lorry Details         /admin/lorries/:id
   ├── ➕ Add New Lorry         /admin/lorries/new
   ├── 📋 Lorry Assignments     /admin/lorries/assignments
   └── 📊 Lorry Reports         /admin/lorries/reports
📝 Lorry Requests              /admin/requests
   ├── 📋 All Requests          /admin/requests
   ├── ⏳ Pending Requests      /admin/requests/pending
   ├── ✅ Approved Requests     /admin/requests/approved
   ├── ❌ Rejected Requests     /admin/requests/rejected
   └── 📊 Request Analytics     /admin/requests/analytics
👥 Field Managers              /admin/managers
   ├── 📋 All Managers          /admin/managers
   ├── 👤 Manager Profile       /admin/managers/:id
   ├── ➕ Add Manager           /admin/managers/new
   └── 📊 Manager Performance   /admin/managers/performance
🌾 Farmers                     /admin/farmers
   ├── 📋 All Farmers           /admin/farmers
   ├── 👤 Farmer Profile        /admin/farmers/:id
   ├── ➕ Add Farmer            /admin/farmers/new
   ├── 💸 Advance Management    /admin/farmers/advances
   └── 📊 Farmer Performance    /admin/farmers/performance
📊 Financial Reports           /admin/reports
   ├── 💰 Revenue Analysis      /admin/reports/revenue
   ├── 💸 Payment Summary       /admin/reports/payments
   ├── 📈 Profit Margins        /admin/reports/profits
   └── 📊 Custom Reports        /admin/reports/custom
⚙️ Business Settings           /admin/settings
   ├── 🏢 Business Profile      /admin/settings/profile
   └── 🔧 System Configuration  /admin/settings/system
```

#### Field Manager Navigation
```
📊 Dashboard                    /manager/dashboard
🚛 My Lorries                  /manager/lorries
   ├── 📋 Active Lorries        /manager/lorries/active
   ├── 🚛 Lorry Operations      /manager/lorries/:id
   ├── ⚖️ Weight Entry          /manager/lorries/:id/weights
   ├── 💧 Moisture Recording    /manager/lorries/:id/moisture
   └── 📊 Lorry Summary         /manager/lorries/:id/summary
📝 Lorry Requests              /manager/requests
   ├── 📋 My Requests           /manager/requests
   ├── ➕ New Request           /manager/requests/new
   ├── ⏳ Pending Requests      /manager/requests/pending
   └── ✅ Approved Requests     /manager/requests/approved
🌾 Farmers Management          /manager/farmers
   ├── 📋 All Farmers           /manager/farmers
   ├── 👤 Farmer Details        /manager/farmers/:id
   ├── ➕ Add New Farmer        /manager/farmers/new
   └── 💸 Record Advance        /manager/farmers/:id/advance
📊 Reports                     /manager/reports
   ├── 📈 My Performance        /manager/reports/performance
   ├── 📊 Lorry Reports         /manager/reports/lorries
   └── 🌾 Farmer Reports        /manager/reports/farmers
```

#### Farmer Navigation
```
📊 Dashboard                    /farmer/dashboard
   ├── 🏢 Organization Selector /farmer/select-org
   └── 📊 Multi-Org Overview    /farmer/dashboard/all
🚛 My Deliveries               /farmer/deliveries
   ├── 📋 All Deliveries        /farmer/deliveries
   ├── 🏢 By Organization       /farmer/deliveries/by-org
   ├── 📋 Delivery Details      /farmer/deliveries/:id
   ├── ⏳ Scheduled             /farmer/deliveries/scheduled
   └── ✅ Completed             /farmer/deliveries/completed
💰 Payment History             /farmer/payments
   ├── 📋 All Payments          /farmer/payments
   ├── 🏢 By Organization       /farmer/payments/by-org
   ├── 💵 Payment Details       /farmer/payments/:id
   ├── 💸 Advances Received     /farmer/payments/advances
   └── 📊 Payment Summary       /farmer/payments/summary
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

### Layout System

#### Desktop Layout (>1200px)
```
┌─────────────────────────────────────────────────────────────┐
│                    Header Bar                               │
├─────────────┬───────────────────────────────────────────────┤
│             │                                               │
│   Sidebar   │              Main Content Area                │
│             │                                               │
│ • Dashboard │  ┌─────────────────────────────────────────┐  │
│ • Lorries   │  │         Sub-Navigation Tabs             │  │
│ • Requests  │  ├─────────────────────────────────────────┤  │
│ • Managers  │  │                                         │  │
│ • Farmers   │  │           DataTable                     │  │
│ • Reports   │  │                                         │  │
│ • Settings  │  │  ┌─────┬─────┬─────┬─────┬─────┬─────┐  │  │
│             │  │  │ Col │ Col │ Col │ Col │ Col │ Act │  │  │
│             │  │  ├─────┼─────┼─────┼─────┼─────┼─────┤  │  │
│             │  │  │ Row │ Row │ Row │ Row │ Row │ ... │  │  │
│             │  │  └─────┴─────┴─────┴─────┴─────┴─────┘  │  │
│             │  │                                         │  │
│             │  └─────────────────────────────────────────┘  │
│             │                                               │
├─────────────┴───────────────────────────────────────────────┤
│                    Footer / Status Bar                     │
└─────────────────────────────────────────────────────────────┘
```

#### Mobile Layout (<768px)
```
┌─────────────────────────────────────┐
│            Header Bar               │
├─────────────────────────────────────┤
│                                     │
│         Main Content Area           │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        Card View Item           │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ Title                       │ │ │
│  │  │ Subtitle                    │ │ │
│  │  │ Details                     │ │ │
│  │  │ [Action Buttons]            │ │ │
│  │  └─────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        Card View Item           │ │
│  └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│         Bottom Navigation           │
│  [🏠] [🚛] [👥] [📊] [⚙️]          │
└─────────────────────────────────────┘
```

### DataTable Component Specifications

#### Standard DataTable Features
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageSizeOptions: number[];
  };
  sorting: {
    field: keyof T;
    direction: 'asc' | 'desc';
  };
  filtering: {
    globalSearch: string;
    columnFilters: Record<string, any>;
  };
  selection: {
    enabled: boolean;
    selectedRows: T[];
    onSelectionChange: (rows: T[]) => void;
  };
  bulkActions: BulkAction<T>[];
  onRowClick?: (row: T) => void;
  onBulkAction?: (action: string, rows: T[]) => void;
}
```

#### Column Configuration
```typescript
interface Column<T> {
  key: keyof T;
  title: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  hidden?: boolean;
}
```

#### Lorry DataTable Example
| Column | Width | Type | Editable | Description |
|--------|-------|------|----------|-------------|
| Farmer Name | 180px | Select | Field Manager | Farmer selection dropdown |
| Bags Count | 120px | Number | Field Manager | Number of bags delivered |
| Individual Weights | 200px | Array | Field Manager | List of individual bag weights |
| Moisture % | 140px | Number | Field Manager | Moisture content percentage |
| Gross Weight | 140px | Calculated | System | Sum of individual weights |
| Standard Deduction | 120px | Calculated | System | Bags × 2KG |
| Quality Deduction | 160px | Number | Farm Admin | Quality-based deduction |
| Net Weight | 140px | Calculated | System | Gross - Deductions |
| Price per KG | 120px | Currency | Farm Admin | Moisture-based pricing |
| Advance | 120px | Currency | Farm Admin | Advance payment amount |
| Final Amount | 140px | Calculated | System | Net × Price - Advance |

### Form Components

#### Flutter Form Components
```dart
class FarmTallyForm extends StatefulWidget {
  final String title;
  final List<FormFieldConfig> fields;
  final Function(Map<String, dynamic>) onSubmit;
  final VoidCallback? onCancel;
  final bool loading;
  final Map<String, dynamic>? initialValues;

  const FarmTallyForm({
    Key? key,
    required this.title,
    required this.fields,
    required this.onSubmit,
    this.onCancel,
    this.loading = false,
    this.initialValues,
  }) : super(key: key);
}

class FormFieldConfig {
  final String name;
  final String label;
  final FormFieldType type;
  final bool required;
  final List<ValidationRule>? validation;
  final List<SelectOption>? options;
  final String? placeholder;
  final String? helpText;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;

  FormFieldConfig({
    required this.name,
    required this.label,
    required this.type,
    this.required = false,
    this.validation,
    this.options,
    this.placeholder,
    this.helpText,
    this.keyboardType,
    this.inputFormatters,
  });
}

enum FormFieldType {
  text,
  number,
  email,
  phone,
  select,
  textarea,
  date,
  currency,
  weight,
  moisture
}
```

#### Weight Entry Form (Mobile Optimized)
```
┌─────────────────────────────────────┐
│         Weight Entry Form           │
├─────────────────────────────────────┤
│ Farmer: John Doe                    │
│ Bags: 5                             │
├─────────────────────────────────────┤
│                                     │
│ Bag 1: [45.2] KG  [✓]              │
│ Bag 2: [43.8] KG  [✓]              │
│ Bag 3: [44.1] KG  [✓]              │
│ Bag 4: [42.9] KG  [✓]              │
│ Bag 5: [45.0] KG  [✓]              │
│                                     │
├─────────────────────────────────────┤
│ Total: 221.0 KG                     │
│ Average: 44.2 KG                    │
├─────────────────────────────────────┤
│ [🎤 Voice Input] [📷 Photo]        │
│ [Submit Weights]                    │
└─────────────────────────────────────┘
```

### Dashboard Components

#### Farm Admin Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│                    Farm Admin Dashboard                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │   Lorries   │ │  Managers   │ │ Procurement │ │ Pending │ │
│  │             │ │             │ │             │ │ Actions │ │
│  │ Total: 12   │ │ Active: 5   │ │ Today: 3    │ │ Req: 3  │ │
│  │ Avail: 8    │ │ Pending: 3  │ │ Volume: 1.2T│ │ Rev: 2  │ │
│  │ Assigned: 3 │ │ Today: 4    │ │ Revenue: 48K│ │ Pay: 8  │ │
│  │ Maint: 1    │ │             │ │             │ │         │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     Quick Actions                           │
│  [🚛 Assign Lorry] [👥 Add Manager] [🌾 Add Farmer]       │
│  [💰 Set Pricing] [📊 Generate Report] [⚙️ Settings]      │
├─────────────────────────────────────────────────────────────┤
│                   Recent Activities                         │
│  • Lorry L001 submitted by Manager A (2 hours ago)         │
│  • New request from Manager B for tomorrow                 │
│  • Payment processed for Farmer C (₹25,000)               │
│  • Quality issue reported for Lorry L003                   │
└─────────────────────────────────────────────────────────────┘
```

#### Field Manager Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│                  Field Manager Dashboard                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │ My Lorries  │ │ Today's     │ │ Data Entry  │ │ Quick   │ │
│  │             │ │ Tasks       │ │ Progress    │ │ Actions │ │
│  │ Active: 2   │ │ Farmers: 15 │ │ Weights: 12 │ │ Request │ │
│  │ Pending: 1  │ │ Weights: 8  │ │ Moisture: 10│ │ Add     │ │
│  │ Complete: 3 │ │ Submit: 2   │ │ Submit: 1   │ │ Submit  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Active Lorries                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Lorry L001 - Assigned Today                             │ │
│  │ Farmers: 8/10 | Weights: 6/8 | Moisture: 5/8          │ │
│  │ [Continue Entry] [View Details]                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Lorry L003 - Ready for Submission                       │ │
│  │ Farmers: 12/12 | Complete | Ready to Submit            │ │
│  │ [Review & Submit] [Generate Report]                     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Farmer Dashboard (Multi-Organization)
```
┌─────────────────────────────────────────────────────────────┐
│                     Farmer Dashboard                        │
├─────────────────────────────────────────────────────────────┤
│ Organization: [Green Valley Farms ▼]                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │ Today's     │ │ Pending     │ │ This Month  │ │ Quality │ │
│  │ Schedule    │ │ Payments    │ │ Deliveries  │ │ Rating  │ │
│  │             │ │             │ │             │ │         │ │
│  │ Lorry L001  │ │ ₹25,000     │ │ 8 loads     │ │ ⭐⭐⭐⭐  │ │
│  │ 2:00 PM     │ │ 3 pending   │ │ 2,400 KG    │ │ Good    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│                  All Organizations Summary                   │
│  🏢 Green Valley: ₹25,000 pending | Last: 2 days ago       │
│  🏢 Sunrise Agri: ₹15,000 pending | Last: 1 week ago       │
│  🏢 Golden Harvest: ₹8,000 pending | Last: 3 weeks ago     │
├─────────────────────────────────────────────────────────────┤
│                    Recent Activities                        │
│  • Payment received from Green Valley (₹18,500)            │
│  • Delivery scheduled for tomorrow at Sunrise Agri         │
│  • Quality feedback: Improve moisture content              │
└─────────────────────────────────────────────────────────────┘
```

### Mobile-Specific Components

#### Mobile Navigation
```
┌─────────────────────────────────────┐
│            Header                   │
│  [☰] FarmTally        [🔔] [👤]    │
├─────────────────────────────────────┤
│                                     │
│         Content Area                │
│                                     │
├─────────────────────────────────────┤
│         Bottom Navigation           │
│  [🏠] [🚛] [👥] [📊] [⚙️]          │
│ Home Lorry People Report Settings   │
└─────────────────────────────────────┘
```

#### Mobile Card Components
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

### Responsive Breakpoints

#### Breakpoint System
```css
/* Mobile First Approach */
.mobile-first {
  /* Base styles for mobile (320px+) */
}

@media (min-width: 576px) {
  /* Small devices (landscape phones) */
}

@media (min-width: 768px) {
  /* Medium devices (tablets) */
}

@media (min-width: 992px) {
  /* Large devices (desktops) */
}

@media (min-width: 1200px) {
  /* Extra large devices (large desktops) */
}
```

#### Component Adaptations
- **DataTable**: Converts to card view on mobile
- **Forms**: Stack fields vertically on mobile
- **Navigation**: Sidebar becomes bottom navigation
- **Dashboards**: Cards stack vertically on mobile
- **Modals**: Full-screen on mobile

### Accessibility Features

#### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: Minimum 4.5:1 contrast ratio
- **Focus Management**: Clear focus indicators
- **Alternative Text**: Images and icons have alt text
- **Form Labels**: All form fields properly labeled

#### Accessibility Components
```typescript
// Accessible DataTable
<DataTable
  role="table"
  aria-label="Farmer delivery data"
  aria-describedby="table-description"
>
  <TableHeader role="rowgroup">
    <TableRow role="row">
      <TableCell role="columnheader" aria-sort="ascending">
        Farmer Name
      </TableCell>
    </TableRow>
  </TableHeader>
</DataTable>

// Accessible Form
<Form aria-labelledby="form-title">
  <FormField
    label="Farmer Name"
    required
    aria-describedby="farmer-name-help"
    aria-invalid={hasError}
  />
</Form>
```

This comprehensive UI specification ensures a consistent, accessible, and user-friendly interface across all user roles and devices, with special attention to mobile field operations and multi-organization support.