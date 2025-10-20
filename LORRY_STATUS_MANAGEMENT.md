# Lorry Status Management in Deliveries Interface

## Overview
Added comprehensive lorry status management to the deliveries interface, allowing farm admins to track and update lorry statuses directly from the deliveries page. The interface now supports both grouped and individual delivery views with full lorry lifecycle management.

## Features Implemented

### 1. Grouped Delivery View (Default)
- **Lorry-based Grouping**: Deliveries are grouped by lorry plate number
- **Expandable Cards**: Click to expand/collapse individual delivery details
- **Summary Statistics**: Each lorry card shows:
  - Total bags collected
  - Total gross weight
  - Total net weight
  - Total value
  - Total advance payments
  - Final amount payable
- **Lorry Status Management**: Dropdown to change lorry status with smart transitions

### 2. Individual Delivery View
- **Toggle Option**: Switch between grouped and individual views
- **Complete Table**: All delivery details in a single table
- **Inline Status Management**: Lorry status dropdown for each delivery row

### 3. Lorry Status System
- **Available Statuses**:
  - `AVAILABLE` - Ready for assignment
  - `ASSIGNED` - Assigned to field manager
  - `LOADING` - Currently being loaded with corn
  - `IN_TRANSIT` - Moving to destination
  - `SENT_TO_DEALER` - Delivered to dealer
  - `MAINTENANCE` - Under maintenance

- **Smart Status Transitions**: Only valid status changes are allowed:
  - `AVAILABLE` → `ASSIGNED`, `MAINTENANCE`
  - `ASSIGNED` → `AVAILABLE`, `LOADING`, `MAINTENANCE`
  - `LOADING` → `IN_TRANSIT`, `ASSIGNED`, `MAINTENANCE`
  - `IN_TRANSIT` → `SENT_TO_DEALER`, `LOADING`, `MAINTENANCE`
  - `SENT_TO_DEALER` → `AVAILABLE`, `MAINTENANCE`
  - `MAINTENANCE` → `AVAILABLE`, `ASSIGNED`

- **Color-coded Status Badges**:
  - Green: AVAILABLE
  - Blue: ASSIGNED
  - Yellow: LOADING
  - Orange: IN_TRANSIT
  - Purple: SENT_TO_DEALER
  - Red: MAINTENANCE

### 4. Field Manager View
- **Read-only Status**: Field managers can see lorry status but cannot modify it
- **Status Badge**: Color-coded status display in delivery table
- **Simplified Interface**: Focus on delivery data entry and viewing

## User Interface Enhancements

### Farm Admin Deliveries Page
1. **View Toggle Button**: Switch between "Group by Lorry" and "Show All" views
2. **Expandable Lorry Cards**: 
   - Header shows lorry info, field manager, and status dropdown
   - Summary statistics prominently displayed
   - Expand/collapse individual deliveries
3. **Status Management**: 
   - Dropdown with only valid status transitions
   - Immediate API updates with success notifications
   - Automatic data refresh after status changes

### Field Manager Deliveries Page
1. **Status Column**: Added lorry status display
2. **Color-coded Badges**: Visual status indicators
3. **Read-only Access**: Cannot modify lorry status (appropriate permissions)

## Technical Implementation

### Frontend Changes
- **State Management**: Added `expandedLorries`, `groupByLorry` state
- **Data Grouping**: Automatic grouping of deliveries by lorry with aggregated statistics
- **Status Validation**: Client-side validation of status transitions
- **API Integration**: Uses existing `updateLorryStatus` method

### Backend Integration
- **Existing API**: Leverages current lorry status management endpoints
- **Status Validation**: Server-side validation of status transitions
- **Automatic Updates**: Status changes trigger delivery data refresh

## Benefits

### For Farm Admins
1. **Complete Visibility**: See all lorry statuses at a glance
2. **Efficient Management**: Update multiple lorry statuses from one interface
3. **Better Organization**: Grouped view provides clear overview of operations
4. **Quick Actions**: Direct status updates without navigating to separate pages

### For Field Managers
1. **Status Awareness**: Know current lorry status during operations
2. **Better Planning**: Understand lorry availability and workflow stage
3. **Visual Clarity**: Color-coded status indicators for quick recognition

### For Operations
1. **Workflow Tracking**: Complete lorry lifecycle visibility
2. **Status Consistency**: Enforced valid status transitions
3. **Real-time Updates**: Immediate status synchronization across platform
4. **Audit Trail**: All status changes logged and tracked

## Usage Instructions

### Farm Admin
1. **Access**: Navigate to Farm Admin → Deliveries
2. **View Toggle**: Use "Group by Lorry" / "Show All" button to switch views
3. **Status Update**: Click status dropdown and select new status
4. **Expand Details**: Click chevron icon to see individual deliveries
5. **Monitor Progress**: Use color-coded badges to track lorry workflow

### Field Manager
1. **Access**: Navigate to Field Manager → Deliveries
2. **View Status**: See lorry status in dedicated column
3. **Color Reference**: Use badge colors to understand current status
4. **Plan Operations**: Coordinate activities based on lorry status

## Future Enhancements
1. **Bulk Status Updates**: Select multiple lorries for batch status changes
2. **Status History**: View complete status change timeline
3. **Automated Transitions**: Smart status updates based on delivery events
4. **Mobile Optimization**: Enhanced mobile interface for field operations
5. **Notification Integration**: Status change alerts and notifications