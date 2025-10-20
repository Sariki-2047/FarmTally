# UX Rules & Interaction Patterns

## Core Interaction Pattern

### Sidebar Navigation Behavior
When a user clicks any sidebar item:
1. **Right Panel Activation**: Load a DataTable component in the right panel
2. **Sub-Navigation Menu**: Display contextual sub-menu for the selected item
3. **Loading State**: Show skeleton loader while data fetches
4. **Data Population**: Populate table with relevant data based on selected nav item
5. **URL Update**: Update browser URL to reflect current view

### Sub-Navigation Menu Behavior
Each sidebar item displays a contextual sub-menu with relevant actions:
- **List View**: Show all items in a data table
- **Detail View**: View/edit individual item details
- **Add New**: Create new items
- **Reports**: Generate reports for the selected context
- **Actions**: Perform bulk operations or specific tasks

### DataTable Standard Features

#### Pagination
- **Default Page Size**: 25 rows
- **Page Size Options**: 10, 25, 50, 100
- **Navigation**: First, Previous, Next, Last buttons
- **Info Display**: "Showing X to Y of Z entries"
- **Jump to Page**: Direct page number input

#### Column Configuration
- **Auto-sizing**: Columns auto-size based on content
- **Manual Resize**: Draggable column borders
- **Standard Widths**:
  - ID columns: 80px
  - Name/Title: 200px
  - Status: 120px
  - Date: 140px
  - Actions: 100px
- **Column Reordering**: Drag and drop column headers
- **Column Visibility**: Toggle columns on/off

#### Sorting & Filtering
- **Column Sorting**: Click header to sort (asc/desc/none)
- **Multi-column Sort**: Shift+click for secondary sorting
- **Global Search**: Search across all visible columns
- **Column Filters**: Individual filter inputs per column
- **Filter Types**:
  - Text: Contains, starts with, ends with, equals
  - Number: Equals, greater than, less than, between
  - Date: Date range picker
  - Select: Dropdown with options

#### Row Selection & Bulk Actions
- **Selection Types**: Single row, multiple rows, select all
- **Visual Indicators**: Checkbox column, row highlighting
- **Bulk Action Bar**: Appears when rows selected
- **Standard Bulk Actions**: Delete, Export, Update Status
- **Action Confirmation**: Modal dialogs for destructive actions

## Permission Matrix

### Farm Admin Permissions
| Entity | View | Create | Edit | Delete | Export | Generate Report |
|--------|------|--------|------|--------|--------|-----------------|
| Lorries | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lorry Requests | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Request Approval/Rejection | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Lorry Assignment | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Field Managers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Farmers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Price per KG (in DataTable) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Quality Deductions (in DataTable) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Advance Payments (in DataTable) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Advance Payment Recording | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Advance Payment History | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Financial Reports | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Business Settings | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Field Manager Permissions
| Entity | View | Create | Edit | Delete | Export | Generate Report |
|--------|------|--------|------|--------|--------|-----------------|
| My Assigned Lorries | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Lorry Requests | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Farmers Database | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Farmers in Lorry | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Bag Weights | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Moisture Content | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Quality Deductions | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Price per KG | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Advance Payments | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Advance Payment Recording | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Advance Payment History | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Farmer Performance | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Payment Calculations | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Lorry Submission | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Farmer Permissions
| Entity | View | Create | Edit | Delete | Export | Generate Report |
|--------|------|--------|------|--------|--------|-----------------|
| My Deliveries | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Payment History | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Lorry Schedule | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delivery Details | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Advance Payments | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Quality Deductions | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Final Amounts | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |

## Multi-Business Scoping

### Organization Context
- **Farm Admin**: Automatically scoped to owned organization (no selector needed)
- **Field Manager**: Automatically scoped to assigned organization
- **Farmer**: Can view data from multiple organizations they supply to
- **Data Isolation**: Complete separation between different organizations

### Data Scoping Rules
- **Farm Admin**: Automatically scoped to owned organization, sees all data within it
- **Field Manager**: Scoped to assigned organization, cannot access other organizations
- **Farmer**: Can view data from multiple organizations they supply to, with organization selector for switching context

### Multi-Organization Farmer Experience
For detailed information about how farmers interact with multiple organizations, see:
- **[Farmer Multi-Organization Experience](farmer-multi-org-experience.md)** - Complete guide to farmer multi-org interface

## Default Landing Pages

### Farm Admin
- **Default Route**: `/admin/dashboard`
- **Dashboard Content**:
  - Total lorries available/assigned
  - Active field managers count
  - Today's procurement summary
  - Pending lorry requests from field managers
  - Financial overview (revenue, payments due)
  - Recent lorry submissions for approval
  - Quick actions: Review Requests, Assign Lorry, Add Farmer, Set Pricing

### Field Manager
- **Default Route**: `/manager/dashboard`
- **Dashboard Content**:
  - My assigned lorries status
  - Pending lorry requests
  - Today's procurement targets
  - Farmers scheduled for delivery
  - In-progress lorry data entry
  - Completed lorries awaiting submission
  - Quick actions: Request Lorry, Add New Farmer, Add Farmer to Lorry, Submit Lorry

### Farmer
- **Default Route**: `/farmer/dashboard`
- **Organization Selection**: If farmer supplies to multiple organizations, show organization selector first
- **Dashboard Content**:
  - Organization selector/switcher (if multiple organizations)
  - Today's delivery schedule (current organization or all)
  - Assigned lorry information across organizations
  - Recent delivery history (filterable by organization)
  - Payment status and advances (per organization)
  - Upcoming delivery slots (all organizations)
  - Contact information for field managers (per organization)

## Responsive Behavior

### Desktop (>1200px)
- **Layout**: Sidebar + Main Content + Right Panel
- **Sidebar**: Fixed 280px width
- **Right Panel**: Flexible width (min 600px)

### Tablet (768px - 1200px)
- **Layout**: Collapsible sidebar + Main Content
- **Sidebar**: Overlay when expanded
- **Tables**: Horizontal scroll for overflow

### Mobile (<768px)
- **Layout**: Bottom navigation + Main Content
- **Tables**: Card view instead of table
- **Actions**: Swipe gestures for row actions

## Error Handling

### Data Loading Errors
- **Network Error**: Retry button with error message
- **Permission Error**: Clear message with contact info
- **No Data**: Empty state with helpful actions

### Form Validation
- **Real-time**: Validate on blur/change
- **Submission**: Block submit until valid
- **Error Display**: Inline messages with clear guidance
## 
Corn Procurement Specific Rules

### Lorry Data Table Structure
When viewing a lorry's farmer data, the DataTable displays:

| Column | Width | Type | Editable By | Calculation |
|--------|-------|------|-------------|-------------|
| Farmer Name | 180px | Select/Text | Field Manager | Manual selection |
| Number of Bags | 120px | Number | Field Manager | Manual entry |
| Individual Bag Weights | 200px | Array/List | Field Manager | Manual entry per bag |
| Moisture Content (%) | 140px | Number | Field Manager | Manual entry |
| Gross Weight (KG) | 140px | Number | System | Sum of bag weights |
| 2KG Deduction | 120px | Number | System | Bags × 2KG |
| Quality Deduction KGs | 160px | Number | Farm Admin | Manual entry |
| Net Weight (KG) | 140px | Number | System | Gross - 2KG - Quality |
| Price per KG | 120px | Currency | Farm Admin | Based on moisture |
| Advance | 120px | Currency | Farm Admin | Manual entry |
| Final Amount | 140px | Currency | System | (Net Weight × Price) - Advance |

### Workflow States

#### 1. Lorry Request State
- **Status**: "Requested"
- **Field Manager Actions**: Create request, view status
- **Farm Admin Actions**: Approve/reject, assign lorry

#### 2. Lorry Assigned State
- **Status**: "Assigned"
- **Field Manager Actions**: Add farmers, enter individual bag weights, record moisture content
- **Farm Admin Actions**: Monitor progress, set pricing based on moisture

#### 3. Data Entry State
- **Status**: "In Progress"
- **Field Manager Actions**: Edit farmer data, add/remove farmers, enter bag weights and moisture
- **Farm Admin Actions**: Apply quality deductions, set pricing, configure advances
- **Validation**: All bag weights and moisture content must be recorded

#### 4. Ready for Submission State
- **Status**: "Ready"
- **Field Manager Actions**: Review weight data, submit lorry
- **Farm Admin Actions**: Review and apply final pricing, deductions, and advances
- **Requirements**: All farmers must have complete bag weights and moisture data

#### 5. Submitted State
- **Status**: "Submitted"
- **Field Manager Actions**: View only
- **Farm Admin Actions**: Review, approve, generate payments

### Data Validation Rules

#### Field Manager Data Entry Validation
- **Farmer Name**: Required, must exist in system
- **Number of Bags**: Required, minimum 1, maximum 1000
- **Individual Bag Weights**: Required for each bag, minimum 10KG, maximum 100KG per bag
- **Moisture Content**: Required, between 10% and 30%
- **Total Weight Check**: Sum of bag weights must be reasonable for bag count

#### Farm Admin Data Entry Validation
- **Quality Deduction**: Optional, cannot exceed 50% of gross weight
- **Price per KG**: Required, must be based on moisture content brackets
- **Advance**: Optional, cannot exceed calculated final amount

#### Calculation Rules
- **Gross Weight**: Automatically calculated as sum of individual bag weights
- **2KG Deduction**: Automatically calculated as Bags × 2
- **Net Weight**: Gross Weight - 2KG Deduction - Quality Deduction
- **Price per KG**: Set by Farm Admin based on moisture content brackets
- **Final Amount**: (Net Weight × Price per KG) - Advance
- **Negative amounts**: Show as ₹0.00 with warning indicator

### Bulk Actions for Lorry Management

#### Field Manager Bulk Actions
- **Add Multiple Farmers**: Select from farmer list, bulk add to lorry
- **Create New Farmers**: Add multiple new farmers to database
- **Apply Standard Deduction**: Apply quality deduction to selected rows
- **Calculate All**: Recalculate all amounts for selected farmers
- **Remove Farmers**: Remove selected farmers from lorry

#### Farm Admin Bulk Actions
- **Update Pricing**: Apply new price per KG to selected lorries
- **Approve Multiple**: Bulk approve submitted lorries
- **Generate Payments**: Create payment records for approved lorries
- **Export Data**: Export lorry data for accounting

### Mobile Responsiveness for Procurement

#### Mobile Data Entry (Field Managers)
- **Card View**: Each farmer as a card instead of table row
- **Swipe Actions**: Swipe left for edit, right for delete
- **Quick Entry**: Simplified form with essential fields only
- **Voice Input**: Support for weight entry via voice

#### Mobile Dashboard (All Roles)
- **Summary Cards**: Key metrics in card format
- **Quick Actions**: Floating action button for common tasks
- **Status Indicators**: Color-coded status badges
- **Touch-friendly**: Large buttons and touch targets## Farm
er Management Workflow

### Adding Farmers to Database (Field Manager)
Field Managers can add new farmers to the business database for future use:

#### New Farmer Form Fields
- **Farmer Name**: Required, unique within business
- **Phone Number**: Required, for communication
- **Address**: Optional, for record keeping
- **ID Number**: Optional, for identification
- **Bank Details**: Optional, for payment processing
- **Notes**: Optional, additional information

#### Farmer Selection for Lorry
When adding farmers to a lorry, Field Managers can:
1. **Select Existing**: Choose from dropdown of existing farmers in database
2. **Add New**: Create new farmer and immediately add to lorry
3. **Quick Add**: Simplified form with just name and phone for urgent cases

### Farmer Database Management

#### Field Manager Farmer Actions
- **View All Farmers**: See complete list of farmers in business database
- **Search & Filter**: Find farmers by name, phone, or other criteria
- **Add New Farmer**: Create new farmer record in database
- **Edit Farmer Info**: Update farmer contact and payment details
- **View Farmer History**: See past deliveries and performance
- **Export Farmer List**: Download farmer database for offline use

#### Data Sharing Rules
- **Shared Database**: All farmers added by Field Managers are available to Farm Admin
- **Business Scope**: Farmers are scoped to the specific business/organization
- **Cross-Manager Access**: All Field Managers in same business can see all farmers
- **Approval Process**: New farmers are immediately available (no approval needed)

### Farmer Selection UX Patterns

#### Dropdown with Search
- **Searchable Dropdown**: Type to filter existing farmers
- **Recent Farmers**: Show recently used farmers at top
- **Add New Option**: "+ Add New Farmer" option at bottom of dropdown

#### Quick Actions
- **Bulk Import**: Upload CSV of farmer details
- **Duplicate Detection**: Warn if similar farmer name/phone exists
- **Auto-complete**: Suggest farmer names as user types
- **Favorite Farmers**: Mark frequently used farmers for quick access## Bag W
eight & Moisture Entry Workflow

### Field Manager Data Entry Process

#### Individual Bag Weight Entry
- **Entry Method**: Sequential bag-by-bag weight recording
- **Input Format**: Decimal numbers (e.g., 45.5 KG)
- **Validation**: Each bag weight between 10-100 KG
- **Visual Feedback**: Running total displayed as bags are entered
- **Edit Capability**: Modify individual bag weights before submission

#### Moisture Content Recording
- **Entry Method**: Single moisture percentage per farmer
- **Input Format**: Percentage (e.g., 14.5%)
- **Validation**: Between 10% and 30% moisture
- **Quality Indicator**: Color-coded moisture levels (Green: <15%, Yellow: 15-20%, Red: >20%)
- **Impact Display**: Show how moisture affects pricing

### Data Entry UX Patterns

#### Bag Weight Entry Interface
```
Farmer: John Doe
Number of Bags: 5

Bag Weights:
[Bag 1] [45.2] KG  [✓]
[Bag 2] [43.8] KG  [✓]
[Bag 3] [44.1] KG  [✓]
[Bag 4] [42.9] KG  [✓]
[Bag 5] [45.0] KG  [✓]

Total Weight: 221.0 KG
Average per Bag: 44.2 KG
```

#### Moisture Entry Interface
```
Moisture Content: [14.5] %
Quality Level: ● Good (Green)
Price Impact: Standard Rate
```

### Farm Admin Pricing & Deduction Interface

#### Moisture-Based Pricing
- **Pricing Brackets**: Different rates for moisture ranges
- **Auto-Calculation**: Price automatically set based on moisture
- **Override Capability**: Manual price adjustment if needed
- **Pricing History**: Track price changes over time

#### Quality Deduction Entry
- **Visual Assessment**: Photo upload for quality documentation
- **Deduction Reasons**: Dropdown with common quality issues
- **Percentage or Weight**: Choose deduction method
- **Approval Required**: Quality deductions require justification

### Mobile-Optimized Data Entry

#### Quick Weight Entry (Mobile)
- **Number Pad**: Large numeric keypad for weight entry
- **Voice Input**: Speak weights for hands-free entry
- **Barcode Scanner**: Scan bag tags if available
- **Batch Entry**: Enter multiple bags with same weight quickly

#### Moisture Recording (Mobile)
- **Slider Input**: Visual slider for moisture percentage
- **Camera Integration**: Photo capture for moisture meter readings
- **Quick Presets**: Common moisture levels as quick buttons
- **GPS Tagging**: Location data for quality tracking##
 Inline Data Table Editing (Farm Admin Only)

### Price per KG Column
- **Edit Trigger**: Double-click or click edit icon in Price per KG cell
- **Input Type**: Currency input with validation
- **Auto-calculation**: Updates Final Amount automatically
- **Moisture Integration**: Suggested price based on moisture content
- **Bulk Edit**: Select multiple rows and apply same price
- **History Tracking**: Track price changes with timestamp

### Quality Deduction Column
- **Edit Trigger**: Double-click or click edit icon in Quality Deduction cell
- **Input Options**: 
  - Weight-based: Enter KG amount
  - Percentage-based: Enter percentage of gross weight
- **Validation**: Cannot exceed 50% of gross weight
- **Reason Required**: Dropdown with deduction reasons
- **Photo Upload**: Optional quality documentation
- **Auto-calculation**: Updates Net Weight and Final Amount

### Advance Payment Column
- **Edit Trigger**: Double-click or click edit icon in Advance cell
- **Input Type**: Currency input
- **Validation**: Cannot exceed calculated final amount
- **Payment Method**: Cash, Bank Transfer, Mobile Money
- **Date Tracking**: Record advance payment date
- **Auto-calculation**: Updates Final Amount automatically

## Report Generation System

### Farm Admin Report Capabilities

#### Lorry Reports
- **Individual Lorry Report**: Complete transaction details for single lorry
- **Lorry Performance Report**: Efficiency metrics, completion times
- **Lorry Financial Report**: Revenue, costs, profit margins per lorry
- **Export Formats**: PDF, Excel, CSV
- **Date Range Filtering**: Custom date ranges for historical data

#### Field Manager Reports
- **Manager Performance Report**: Lorries handled, completion rates, accuracy
- **Manager Financial Report**: Total revenue generated, farmer payments processed
- **Manager Efficiency Report**: Average processing time, error rates
- **Comparison Report**: Performance comparison between managers

#### Farmer Reports
- **Farmer Settlement Report**: Complete transaction details with individual bag weights
- **Individual Farmer Report**: Complete transaction history, payment summary
- **Farmer Performance Report**: Delivery consistency, quality metrics
- **Farmer Financial Report**: Total payments, advances, deductions
- **Top Farmers Report**: Highest volume, best quality, most consistent

**Note**: For detailed farmer settlement report structure including individual bag weights, see [Farmer Report Template](farmer-report-template.md)

### Field Manager Report Capabilities

#### My Lorry Reports
- **Lorry Summary Report**: Weight data, farmer count, completion status
- **Lorry Financial Summary**: Total amounts, pending payments
- **Data Entry Report**: Accuracy metrics, completion times

#### Farmer Performance Reports
- **Farmer Delivery Report**: Individual farmer's delivery history
- **Quality Metrics Report**: Moisture content trends, quality consistency
- **Volume Analysis Report**: Seasonal patterns, delivery frequency

### Farmer Report Capabilities

#### Delivery Reports
- **Personal Delivery Report**: Individual delivery history with details
- **Seasonal Summary Report**: Delivery patterns by season/month
- **Quality Performance Report**: Moisture content history, quality trends

#### Payment Reports
- **Payment History Report**: Complete payment record with dates
- **Advance Summary Report**: All advances received and adjustments
- **Annual Financial Report**: Yearly earnings summary for tax purposes

## Sub-Navigation UX Patterns

### Contextual Action Menus
When a sidebar item is selected, display relevant sub-actions:

#### Example: Lorry Management (Farm Admin)
```
🚛 Lorry Management [Selected]
├── 📋 View All Lorries
├── ➕ Add New Lorry
├── 📊 Lorry Performance
├── 💰 Pricing Overview
└── 📊 Generate Reports
```

#### Example: My Lorries (Field Manager)
```
🚛 My Lorries [Selected]
├── 📋 Active Lorries
├── ⏳ Pending Assignments
├── ✅ Completed Lorries
├── ⚖️ Weight Entry
└── 📊 Generate Reports
```

### Right Panel Layout
- **Top Section**: Sub-navigation tabs/buttons
- **Main Section**: DataTable with contextual columns
- **Bottom Section**: Action buttons (Save, Export, Generate Report)
- **Side Panel**: Quick filters and search options

### Report Generation UI
- **Report Type Selector**: Dropdown with available report types
- **Date Range Picker**: From/To date selection
- **Filter Options**: Entity-specific filters (farmer, lorry, manager)
- **Format Selection**: PDF, Excel, CSV options
- **Preview Button**: Show report preview before generation
- **Generate Button**: Create and download report
- **Scheduled Reports**: Option to schedule recurring reports##
 Lorry Request Management (Farm Admin)

### Request Overview DataTable
When Farm Admin clicks "Lorry Requests", display a comprehensive table:

| Column | Width | Type | Description |
|--------|-------|------|-------------|
| Request ID | 100px | Text | Unique request identifier |
| Field Manager | 180px | Text | Manager who made the request |
| Request Date | 140px | Date | When request was submitted |
| Required Date | 140px | Date | When lorry is needed |
| Priority | 100px | Badge | High/Medium/Low priority |
| Purpose | 200px | Text | Reason for lorry request |
| Estimated Duration | 120px | Text | Expected usage time |
| Status | 120px | Badge | Pending/Approved/Rejected/Assigned |
| Assigned Lorry | 150px | Text | Lorry assigned (if approved) |
| Actions | 150px | Buttons | Approve/Reject/Assign/View |

### Request Status Management

#### Pending Requests
- **Visual Indicator**: Yellow badge with "Pending" status
- **Actions Available**: Approve, Reject, Request More Info
- **Notification**: Real-time notifications for new requests
- **Priority Sorting**: High priority requests appear at top

#### Approved Requests
- **Visual Indicator**: Green badge with "Approved" status
- **Next Step**: Assign available lorry to the request
- **Actions Available**: Assign Lorry, View Details, Modify
- **Auto-Assignment**: Option to auto-assign based on availability

#### Rejected Requests
- **Visual Indicator**: Red badge with "Rejected" status
- **Reason Required**: Mandatory rejection reason
- **Actions Available**: View Details, Reconsider
- **Notification**: Automatic notification to Field Manager

#### Assigned Requests
- **Visual Indicator**: Blue badge with "Assigned" status
- **Lorry Information**: Shows which lorry was assigned
- **Actions Available**: View Details, Reassign, Complete
- **Tracking**: Monitor lorry usage and completion

### Request Approval Workflow

#### Approval Process
1. **Review Request**: View request details and justification
2. **Check Availability**: Verify lorry availability for requested dates
3. **Assess Priority**: Consider business priorities and urgency
4. **Make Decision**: Approve, reject, or request more information
5. **Assign Lorry**: If approved, assign specific lorry
6. **Notify Manager**: Automatic notification of decision

#### Approval Criteria
- **Lorry Availability**: Check if lorries are available for requested period
- **Business Priority**: Align with procurement targets and schedules
- **Manager Performance**: Consider manager's track record and reliability
- **Resource Optimization**: Maximize lorry utilization efficiency

### Lorry Assignment Interface

#### Available Lorries Display
- **Lorry List**: Show all available lorries with details
- **Capacity Information**: Load capacity, fuel status, maintenance status
- **Location Data**: Current location and distance from request area
- **Availability Calendar**: Visual calendar showing lorry schedules
- **Assignment History**: Previous assignments and performance

#### Assignment Actions
- **Quick Assign**: One-click assignment to available lorry
- **Scheduled Assignment**: Assign for future date/time
- **Conditional Assignment**: Assign with specific conditions
- **Bulk Assignment**: Assign multiple requests to different lorries
- **Assignment Notes**: Add special instructions or requirements

### Request Communication System

#### Notification Types
- **New Request**: Immediate notification to Farm Admin
- **Status Update**: Notify Field Manager of approval/rejection
- **Assignment Confirmation**: Confirm lorry assignment details
- **Completion Reminder**: Remind about expected completion time
- **Overdue Alert**: Alert if lorry usage exceeds estimated duration

#### Communication Channels
- **In-App Notifications**: Real-time notifications within system
- **Email Alerts**: Email notifications for important updates
- **SMS Notifications**: Text messages for urgent communications
- **Dashboard Alerts**: Visual alerts on dashboard for pending actions

### Request Analytics & Reporting

#### Request Metrics
- **Request Volume**: Number of requests per period
- **Approval Rate**: Percentage of requests approved
- **Response Time**: Average time to approve/reject requests
- **Utilization Rate**: Lorry utilization efficiency
- **Manager Performance**: Request accuracy and completion rates

#### Request Reports
- **Daily Request Summary**: All requests received and processed
- **Manager Request Report**: Requests by specific field manager
- **Lorry Utilization Report**: Usage patterns and efficiency metrics
- **Approval Trend Report**: Approval/rejection patterns over time
- **Performance Analysis**: Request fulfillment and completion analysis

### Sub-Navigation for Lorry Requests

#### Example: Lorry Requests (Farm Admin)
```
📝 Lorry Requests [Selected]
├── 📋 All Requests
├── ⏳ Pending Approval
├── ✅ Approved Requests
├── ❌ Rejected Requests
├── 🚛 Assignment Queue
├── 📊 Request Analytics
└── 📊 Generate Request Report
```

### Request DataTable Actions

#### Individual Request Actions
- **View Details**: Complete request information and history
- **Approve Request**: Approve with optional conditions
- **Reject Request**: Reject with mandatory reason
- **Assign Lorry**: Assign specific lorry to approved request
- **Request Info**: Ask for additional information from manager
- **Modify Request**: Edit request details if needed

#### Bulk Request Actions
- **Bulk Approve**: Approve multiple selected requests
- **Bulk Reject**: Reject multiple requests with common reason
- **Bulk Assign**: Assign lorries to multiple approved requests
- **Export Requests**: Export request data for analysis
- **Priority Update**: Change priority for multiple requests