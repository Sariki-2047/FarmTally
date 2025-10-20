# Farm Admin Screen Details

## Sidebar Navigation Breakdown

### 📊 Dashboard
**Main Content:** Overview cards and summary widgets

#### Dashboard Widgets
- **Lorries Overview**
  - Total lorries: 12
  - Available: 8
  - Assigned: 3
  - Under maintenance: 1

- **Field Managers Summary**
  - Active managers: 5
  - Pending requests: 3
  - Today's active: 4

- **Today's Procurement**
  - Lorries in operation: 3
  - Farmers scheduled: 25
  - Expected volume: 1,200 KG
  - Estimated revenue: ₹48,000

- **Pending Actions**
  - Lorry requests awaiting approval: 3
  - Completed lorries for review: 2
  - Payment approvals needed: 8

- **Financial Summary**
  - Today's revenue: ₹35,000
  - Pending payments: ₹125,000
  - This month's profit: ₹450,000

#### Quick Actions
- 🚛 Assign Lorry
- 👥 Add Field Manager
- 🌾 Add Farmer
- 💰 Set Pricing
- 📊 Generate Report

---

### 🚛 Lorry Management
**Main Content:** DataTable with all lorries and sub-navigation

#### Sub-Navigation Tabs
- 📋 All Lorries (Default)
- ➕ Add New Lorry
- 📋 Lorry Assignments
- 📊 Performance Reports

#### All Lorries DataTable
| Column | Width | Description | Actions |
|--------|-------|-------------|---------|
| Lorry ID | 100px | Unique identifier (L001, L002) | View Details |
| Lorry Name | 150px | Custom name (Truck Alpha) | Edit Name |
| License Plate | 120px | Vehicle registration | Edit |
| Capacity (KG) | 100px | Maximum load capacity | Edit |
| Status | 120px | Available/Assigned/Maintenance | Change Status |
| Current Location | 180px | GPS location or area | View Map |
| Assigned Manager | 150px | Current field manager | Reassign |
| Last Used | 120px | Date of last operation | View History |
| Actions | 150px | View/Edit/Assign/Reports | Action Menu |

#### Row Actions (Right-click or Action Menu)
- 👁️ View Lorry Details
- ✏️ Edit Lorry Information
- 🚛 Assign to Manager
- 📊 View Performance Report
- 🔧 Schedule Maintenance
- 📍 Track Location
- 🗑️ Delete Lorry

#### Bulk Actions (Select multiple rows)
- 🚛 Bulk Assign to Managers
- 📊 Generate Fleet Report
- 🔧 Schedule Bulk Maintenance
- 📤 Export Lorry Data

---

### 📝 Lorry Requests
**Main Content:** DataTable with all requests from Field Managers

#### Sub-Navigation Tabs
- 📋 All Requests (Default)
- ⏳ Pending Approval
- ✅ Approved Requests
- ❌ Rejected Requests
- 📊 Request Analytics

#### Lorry Requests DataTable
| Column | Width | Description | Actions |
|--------|-------|-------------|---------|
| Request ID | 100px | Unique request ID (REQ001) | View Details |
| Field Manager | 150px | Manager who made request | View Profile |
| Request Date | 120px | When request was submitted | Sort by Date |
| Required Date | 120px | When lorry is needed | Priority Sort |
| Priority | 100px | High/Medium/Low badge | Change Priority |
| Purpose | 200px | Reason for request | View Details |
| Duration | 100px | Expected usage time | Edit |
| Status | 120px | Pending/Approved/Rejected | Change Status |
| Assigned Lorry | 150px | Lorry assigned (if approved) | Change Assignment |
| Actions | 180px | Approve/Reject/Assign/View | Action Menu |

#### Request Actions
- ✅ Approve Request
- ❌ Reject Request (with reason)
- 🚛 Assign Specific Lorry
- 📝 Request More Information
- 👁️ View Full Details
- 📊 View Manager's Request History

#### Bulk Actions
- ✅ Bulk Approve Selected
- ❌ Bulk Reject Selected
- 🚛 Bulk Assign Lorries
- 📤 Export Request Data

---

### 👥 Field Managers
**Main Content:** DataTable with all Field Managers

#### Sub-Navigation Tabs
- 📋 All Managers (Default)
- ➕ Add New Manager
- 📊 Performance Overview
- 📈 Manager Reports

#### Field Managers DataTable
| Column | Width | Description | Actions |
|--------|-------|-------------|---------|
| Manager ID | 100px | Unique ID (MGR001) | View Profile |
| Manager Name | 180px | Full name | Edit Profile |
| Email | 200px | Contact email | Send Email |
| Phone | 120px | Contact number | Call/SMS |
| Join Date | 120px | Employment start date | View History |
| Status | 100px | Active/Inactive/Suspended | Change Status |
| Assigned Lorries | 120px | Current lorry assignments | View/Modify |
| Performance | 120px | Rating or score | View Details |
| Last Active | 120px | Last login/activity | View Activity |
| Actions | 150px | View/Edit/Suspend/Reports | Action Menu |

#### Manager Actions
- 👁️ View Manager Profile
- ✏️ Edit Manager Details
- 🚛 Assign/Reassign Lorries
- 📊 View Performance Report
- 💬 Send Message/Notification
- ⏸️ Suspend Manager
- 🗑️ Remove Manager

#### Bulk Actions
- 🚛 Bulk Assign Lorries
- 📧 Send Bulk Notifications
- 📊 Generate Team Report
- 📤 Export Manager Data

---

### 🌾 Farmers
**Main Content:** DataTable with all Farmers in the organization

#### Sub-Navigation Tabs
- 📋 All Farmers (Default)
- ➕ Add New Farmer
- 📊 Farmer Performance
- 💰 Payment History
- 📈 Farmer Reports

#### Farmers DataTable
| Column | Width | Description | Actions |
|--------|-------|-------------|---------|
| Farmer ID | 100px | Unique ID (F001) | View Profile |
| Farmer Name | 180px | Full name | Edit Profile |
| Phone | 120px | Contact number | Call/SMS |
| Address | 200px | Location/area | View Map |
| Total Deliveries | 120px | Number of deliveries | View History |
| Total Volume (KG) | 120px | Cumulative corn delivered | View Details |
| Average Quality | 120px | Quality score/rating | View Trends |
| Total Advances | 120px | Total advance amount given | View Advance History |
| Payment Status | 120px | Pending/Paid amounts | View Payments |
| Last Delivery | 120px | Date of last delivery | View Details |
| Actions | 150px | View/Edit/Advance/Pay/Reports | Action Menu |

#### Farmer Actions
- 👁️ View Farmer Profile
- ✏️ Edit Farmer Details
- 📊 View Delivery History
- 💰 Process Payment
- � GenerPate Settlement Report (with individual bag weights)
- � Vinew Performance Report
- � Contavct Farmer
- 🗑️ Remove Farmer

#### Bulk Actions
- 💰 Bulk Payment Processing
- 📧 Send Bulk Notifications
- 📊 Generate Farmer Report
- 📤 Export Farmer Data

---

### 📊 Financial Reports
**Main Content:** Report dashboard with various financial analytics

#### Sub-Navigation Tabs
- 💰 Revenue Analysis (Default)
- 💸 Payment Summary
- 📈 Profit Margins
- 📊 Daily Summary
- 📈 Monthly Reports
- 📋 Custom Reports

#### Revenue Analysis View
**Charts and Metrics:**
- Daily revenue trend (line chart)
- Revenue by field manager (bar chart)
- Top performing farmers (table)
- Monthly comparison (comparison chart)

**Key Metrics Cards:**
- Today's Revenue: ₹35,000
- This Week: ₹245,000
- This Month: ₹980,000
- Average per Lorry: ₹12,500

#### Payment Summary View
**Payment Status Overview:**
- Total Pending: ₹125,000
- Paid Today: ₹35,000
- Overdue Payments: ₹15,000
- Advance Payments: ₹45,000

**Payment Actions:**
- 💰 Process Pending Payments
- 📧 Send Payment Reminders
- 📊 Generate Payment Report
- 📤 Export Payment Data

---

### ⚙️ Business Settings
**Main Content:** Configuration panels and settings forms

#### Sub-Navigation Tabs
- 🏢 Business Profile (Default)
- 🔧 System Configuration
- 👥 User Permissions
- 📧 Notification Settings
- 🔐 Security Settings

#### Business Profile View
**Editable Business Information:**
- Business Name
- Owner Name
- Business Address
- Contact Information
- Business License/Registration
- Tax Information
- Bank Account Details

#### System Configuration View
**Operational Settings:**
- Default pricing per KG
- Standard deduction rates (2KG per bag)
- Quality deduction thresholds
- Advance payment limits
- Lorry capacity settings
- Working hours configuration

#### User Permissions View
**Role Management:**
- Field Manager permissions
- Farmer access levels
- Feature toggles
- Data access controls

## Common UI Elements Across All Screens

### DataTable Features
- **Search Bar**: Global search across all columns
- **Column Filters**: Individual filters per column
- **Sort Options**: Click headers to sort (asc/desc)
- **Pagination**: 25/50/100 rows per page
- **Export Options**: PDF, Excel, CSV
- **Bulk Selection**: Checkboxes for bulk actions
- **Refresh Button**: Reload data
- **Column Visibility**: Show/hide columns

### Action Patterns
- **Primary Actions**: Blue buttons (Add, Approve, Assign)
- **Secondary Actions**: Gray buttons (View, Edit, Export)
- **Destructive Actions**: Red buttons (Delete, Reject, Suspend)
- **Confirmation Dialogs**: For all destructive actions
- **Success/Error Messages**: Toast notifications for actions

### Navigation Patterns
- **Breadcrumbs**: Show current location
- **Back Button**: Return to previous view
- **Quick Actions**: Floating action button on mobile
- **Keyboard Shortcuts**: Common actions (Ctrl+N for new, etc.)

### Responsive Behavior
- **Desktop**: Full DataTable with all columns
- **Tablet**: Horizontal scroll for overflow
- **Mobile**: Card view instead of table rows
- **Touch Actions**: Swipe gestures for mobile actions## 
Advance Payment Management

### Recording Advance Payments

#### Advance Payment Form
When Farm Admin or Field Manager clicks "Record Advance Payment":

**Form Fields:**
- **Farmer Name**: Auto-populated, read-only
- **Advance Amount**: Currency input (₹)
- **Payment Method**: Dropdown (Cash, Bank Transfer, UPI, Cheque)
- **Payment Date**: Date picker (defaults to today)
- **Reference Number**: Optional (for bank transfers/cheques)
- **Reason**: Optional text field
- **Notes**: Optional additional information

#### Advance Payment Validation
- **Amount Validation**: Must be greater than ₹0
- **Maximum Limit**: Cannot exceed configured advance limit
- **Duplicate Check**: Warn if similar advance recorded recently
- **Balance Check**: Show farmer's current advance balance

### Advance Payment History

#### Advance History DataTable
| Column | Width | Description |
|--------|-------|-------------|
| Date | 120px | Payment date |
| Amount | 100px | Advance amount (₹) |
| Method | 120px | Payment method |
| Reference | 120px | Transaction reference |
| Recorded By | 150px | Admin/Manager who recorded |
| Status | 100px | Active/Adjusted/Cancelled |
| Balance Impact | 120px | Running balance |

#### Advance Management Actions
- **View Details**: Complete advance payment information
- **Edit Advance**: Modify amount or details (if not yet adjusted)
- **Cancel Advance**: Cancel incorrect advance (with reason)
- **Add Interest**: Apply interest charges if applicable
- **Generate Receipt**: Print/email advance payment receipt

### Advance Payment Integration

#### In Lorry DataTable
The advance payment is automatically calculated and displayed in the lorry farmer data table:
- **Current Advance Balance**: Shows total advances given to farmer
- **Auto-Deduction**: Automatically deducted from final amount
- **Advance History Link**: Quick access to farmer's advance history

#### In Settlement Report
- **Total Advance**: Sum of all advances given to farmer
- **Advance Breakdown**: Optional detailed list of individual advances
- **Interest Calculation**: If interest is applied to advances
- **Final Calculation**: Final Amount = Total Value - Total Advance - Interest

### Advance Payment Workflow

#### Field Manager Process
1. **Farmer Request**: Farmer asks for advance payment
2. **Amount Assessment**: Field Manager assesses reasonable amount
3. **Record Advance**: Enter advance details in system
4. **Payment Delivery**: Give cash/transfer to farmer
5. **Confirmation**: System updates farmer's advance balance

#### Farm Admin Process
1. **Review Requests**: Can review all advance payments made
2. **Approve/Modify**: Can modify or cancel advances if needed
3. **Set Limits**: Configure maximum advance limits per farmer
4. **Monitor Balances**: Track total advances across all farmers

### Advance Payment Reports

#### Advance Summary Report
- **Total Advances Given**: Sum of all active advances
- **Advances by Farmer**: Individual farmer advance balances
- **Advances by Manager**: Which manager gave which advances
- **Payment Method Breakdown**: Cash vs Bank vs UPI distribution

#### Advance Aging Report
- **Recent Advances**: Advances given in last 30 days
- **Outstanding Advances**: Advances not yet adjusted in settlements
- **Long-term Advances**: Advances older than 90 days
- **Interest Calculations**: Interest charges on overdue advances

### Mobile Advance Payment

#### Quick Advance Entry (Mobile)
- **Simplified Form**: Essential fields only
- **Voice Input**: Speak advance amount
- **Photo Receipt**: Capture payment receipt photo
- **GPS Location**: Record location where advance was given
- **Instant SMS**: Send confirmation SMS to farmer

#### Offline Capability
- **Offline Recording**: Record advances without internet
- **Sync on Connection**: Upload when internet available
- **Conflict Resolution**: Handle conflicts when syncing
- **Backup Storage**: Local storage for offline data