# Navigation Map - Corn Procurement System Routes & Icons

## Farm Admin Navigation Tree

```
📊 Dashboard                    /admin/dashboard
🚛 Lorry Management            /admin/lorries
   ├── 📋 All Lorries           /admin/lorries
   ├── 🚛 Lorry Details         /admin/lorries/:id
   ├── ➕ Add New Lorry         /admin/lorries/new
   ├── 📋 Lorry Assignments     /admin/lorries/assignments
   ├── 💰 Set Pricing           /admin/lorries/:id/pricing
   ├── ⚖️ Quality Deductions    /admin/lorries/:id/deductions
   ├── 💸 Advance Payments      /admin/lorries/:id/advances
   └── 📊 Generate Lorry Report /admin/lorries/:id/report
📝 Lorry Requests              /admin/requests
   ├── 📋 All Requests          /admin/requests
   ├── 📝 Request Details       /admin/requests/:id
   ├── ⏳ Pending Requests      /admin/requests/pending
   ├── ✅ Approved Requests     /admin/requests/approved
   ├── ❌ Rejected Requests     /admin/requests/rejected
   ├── 🚛 Assign Lorry          /admin/requests/:id/assign
   └── 📊 Generate Request Report /admin/requests/report
👥 Field Managers              /admin/managers
   ├── 📋 All Managers          /admin/managers
   ├── 👤 Manager Profile       /admin/managers/:id
   ├── ➕ Add Manager           /admin/managers/new
   ├── 📊 Manager Performance   /admin/managers/:id/performance
   └── 📊 Generate Manager Report /admin/managers/:id/report
🌾 Farmers                     /admin/farmers
   ├── 📋 All Farmers           /admin/farmers
   ├── 👤 Farmer Profile        /admin/farmers/:id
   ├── ➕ Add Farmer            /admin/farmers/new
   ├── 💸 Record Advance        /admin/farmers/:id/advance
   ├── 📊 Advance History       /admin/farmers/:id/advances
   ├── 📊 Farmer History        /admin/farmers/:id/history
   └── 📊 Generate Farmer Report /admin/farmers/:id/report
📊 Financial Reports           /admin/reports
   ├── 💰 Revenue Analysis      /admin/reports/revenue
   ├── 💸 Payment Summary       /admin/reports/payments
   ├── 📈 Profit Margins        /admin/reports/profits
   ├── 📊 Daily Summary         /admin/reports/daily
   └── 📈 Monthly Reports       /admin/reports/monthly
⚙️ Business Settings           /admin/settings
   ├── 🏢 Business Profile      /admin/settings/profile
   └── 🔧 System Configuration  /admin/settings/system
```

## Field Manager Navigation Tree

```
📊 Dashboard                    /manager/dashboard
🚛 My Lorries                  /manager/lorries
   ├── 📋 All My Lorries        /manager/lorries
   ├── 📋 Lorry Details         /manager/lorries/:id
   ├── ➕ Add Farmers           /manager/lorries/:id/farmers
   ├── ⚖️ Enter Bag Weights     /manager/lorries/:id/weights
   ├── 💧 Record Moisture       /manager/lorries/:id/moisture
   ├── 📊 Lorry Summary         /manager/lorries/:id/summary
   └── 📊 Generate Lorry Report /manager/lorries/:id/report
📝 Lorry Requests              /manager/requests
   ├── 📋 All Requests          /manager/requests
   ├── ➕ New Request           /manager/requests/new
   ├── ⏳ Pending Requests      /manager/requests/pending
   └── ✅ Approved Requests     /manager/requests/approved
🌾 Farmers Management          /manager/farmers
   ├── 📋 All Farmers           /manager/farmers
   ├── 👤 Farmer Details        /manager/farmers/:id
   ├── ➕ Add New Farmer        /manager/farmers/new
   ├── 💸 Record Advance        /manager/farmers/:id/advance
   ├── 📊 Advance History       /manager/farmers/:id/advances
   ├── 📊 Farmer Performance    /manager/farmers/:id/performance
   └── 📊 Generate Farmer Report /manager/farmers/:id/report
📊 Reports                     /manager/reports
   ├── 📈 My Performance        /manager/reports/performance
   ├── 💰 Payment Reports       /manager/reports/payments
   ├── 📊 Daily Summary         /manager/reports/daily
   └── 📄 Completed Lorries     /manager/reports/completed
```

## Farmer Navigation Tree

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

## Icon Legend
- 📊 Dashboard/Analytics
- 🚛 Lorries/Transportation
- 👥 Users/People Management
- 👤 Individual User Profile
- 🌾 Farmers/Agriculture
- 📋 Records/Lists
- 📄 Individual Record
- ➕ Add/Create New
- 📅 Calendar/Scheduling
- 💰 Financial/Money
- 💵 Pricing/Rates
- 💸 Payments/Advances
- ⚙️ Settings/Configuration
- 📈 Reports/Growth
- 📊 Metrics/Data
- ✅ Completed/Approved
- ⏳ Pending/Waiting
- 🔄 In Progress/Active
- ⚖️ Weight/Quality
- 💧 Moisture Content
- 🏢 Business/Organization
- 🔧 System/Tools
- 📆 Future Schedule
- 📝 Requests/Forms
- ❌ Rejected/Declined