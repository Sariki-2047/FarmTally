# Core Workflow Processes
## Complete Procurement & Settlement Workflows

### Overview
FarmTally manages the complete corn procurement lifecycle from initial lorry requests through final farmer settlements. This document outlines all core workflows and business processes.

### 1. Lorry Request & Assignment Workflow

#### Step 1: Field Manager Lorry Request
```
Field Manager → Create Request → Farm Admin Review → Approval/Assignment
```

##### Request Creation Process
1. **Navigate to Requests**: Field Manager goes to "Lorry Requests" → "New Request"
2. **Request Form Completion**:
   - **Required Date**: When lorry is needed
   - **Priority Level**: High/Medium/Low
   - **Purpose**: Detailed reason for request
   - **Estimated Duration**: Expected usage time
   - **Location**: Procurement area/region
   - **Expected Volume**: Estimated corn volume
   - **Special Requirements**: Any specific needs

3. **Request Submission**:
   - System validates all required fields
   - Auto-generates unique Request ID
   - Sends notification to Farm Admin
   - Status set to "Pending"

#### Step 2: Farm Admin Review & Approval
1. **Request Notification**: Farm Admin receives real-time notification
2. **Request Evaluation**:
   - **Availability Check**: Verify lorry availability for requested dates
   - **Priority Assessment**: Consider business priorities and urgency
   - **Manager History**: Review manager's track record and reliability
   - **Resource Optimization**: Maximize lorry utilization efficiency

3. **Decision Making**:
   - **Approve**: Proceed to lorry assignment
   - **Reject**: Provide detailed rejection reason
   - **Request Info**: Ask for additional information

#### Step 3: Lorry Assignment
1. **Available Lorries Display**:
   - Show all available lorries with details
   - Display capacity, location, maintenance status
   - Show availability calendar
   - Include assignment history

2. **Assignment Process**:
   - **Select Lorry**: Choose appropriate lorry for request
   - **Set Assignment Date**: Confirm assignment timing
   - **Add Instructions**: Special instructions or conditions
   - **Confirm Assignment**: Finalize lorry assignment

3. **Notification & Status Update**:
   - Field Manager receives assignment notification
   - Request status updated to "Assigned"
   - Lorry status updated to "Assigned"
   - Assignment details logged for audit

### 2. Farmer Management Workflow

#### Adding Farmers to System Database
Field Managers and Farm Admins can add farmers to the organization's database:

1. **New Farmer Registration**:
   - **Basic Information**: Name, phone, address
   - **Identification**: ID number, bank details
   - **Contact Preferences**: Communication preferences
   - **Quality History**: Previous quality ratings (if available)

2. **Database Integration**:
   - Farmer added to organization's shared database
   - Available to all Field Managers in organization
   - Duplicate detection prevents duplicate entries
   - Auto-generates unique Farmer ID

#### Adding Farmers to Lorries
1. **Farmer Selection**:
   - **Existing Farmers**: Select from organization database
   - **New Farmers**: Add new farmer and assign to lorry
   - **Quick Add**: Simplified form for urgent additions

2. **Lorry Assignment**:
   - **Estimated Bags**: Expected number of bags
   - **Delivery Schedule**: Planned delivery time
   - **Special Notes**: Any specific requirements
   - **Contact Information**: Ensure current contact details

### 3. Data Collection Workflow

#### Weight Entry Process
1. **Individual Bag Weight Recording**:
   - **Sequential Entry**: Record each bag weight individually
   - **Validation**: Each bag weight between 10-100 KG
   - **Running Total**: Display cumulative weight as bags are entered
   - **Average Calculation**: Show average weight per bag
   - **Edit Capability**: Modify individual weights before submission

2. **Weight Entry Methods**:
   - **Manual Entry**: Type weights using keyboard/keypad
   - **Voice Input**: Speak weights for hands-free entry
   - **Batch Entry**: Enter multiple bags with same weight
   - **Mobile Optimization**: Large number pad for mobile devices

#### Moisture Content Recording
1. **Moisture Measurement**:
   - **Digital Meter**: Record from moisture meter reading
   - **Manual Assessment**: Visual/tactile assessment
   - **Photo Documentation**: Capture meter display photo
   - **Quality Notes**: Additional quality observations

2. **Quality Assessment**:
   - **Moisture Ranges**: 
     - Excellent: <14%
     - Good: 14-16%
     - Acceptable: 16-20%
     - Poor: >20%
   - **Price Impact**: Show how moisture affects pricing
   - **Quality Alerts**: Warn if moisture exceeds thresholds

### 4. Pricing & Deduction Workflow

#### Farm Admin Pricing Control
1. **Moisture-Based Pricing**:
   - **Pricing Brackets**: Different rates for moisture ranges
   - **Auto-Calculation**: Price automatically set based on moisture
   - **Override Capability**: Manual price adjustment if needed
   - **Pricing History**: Track price changes over time

2. **Quality Deduction Assessment**:
   - **Visual Inspection**: Photo documentation of quality issues
   - **Deduction Reasons**: Standardized quality issue categories
   - **Deduction Methods**: 
     - Weight-based: Specific KG deduction
     - Percentage-based: Percentage of gross weight
   - **Approval Required**: Quality deductions require justification

#### Calculation Engine
```
Gross Weight = Sum of all individual bag weights
Standard Deduction = Number of Bags × 2KG
Quality Deduction = Farm Admin assessment
Net Weight = Gross Weight - Standard Deduction - Quality Deduction
Total Value = Net Weight × Price per KG
Final Amount = Total Value - Advance Payments - Interest
```

### 5. Advance Payment Workflow

#### Advance Payment Recording
1. **Payment Request Assessment**:
   - **Farmer Request**: Farmer requests advance through Field Manager
   - **Amount Evaluation**: Assess reasonable advance amount
   - **Limit Verification**: Check against maximum advance limits
   - **Balance Review**: Check farmer's current advance balance

2. **Advance Recording Process**:
   - **Payment Details**: Amount, method, date, reference
   - **Reason Documentation**: Purpose of advance payment
   - **Receipt Management**: Photo of payment receipt
   - **Balance Update**: Update farmer's advance balance

3. **Payment Methods**:
   - **Cash Payment**: Direct cash handover
   - **Bank Transfer**: Electronic bank transfer
   - **UPI Payment**: Mobile payment via UPI
   - **Cheque Payment**: Physical cheque issuance

#### Advance Integration with Settlement
1. **Auto-Deduction**: Advances automatically deducted from final amount
2. **Balance Tracking**: Real-time advance balance updates
3. **Interest Calculation**: Optional interest on overdue advances
4. **Settlement Impact**: Clear display of advance impact on final payment

### 6. Data Submission & Review Workflow

#### Field Manager Submission
1. **Data Completion Check**:
   - **Weight Verification**: All bag weights recorded
   - **Moisture Verification**: Moisture content for all farmers
   - **Data Validation**: System validates all required data
   - **Error Resolution**: Fix any validation errors

2. **Submission Process**:
   - **Review Summary**: Display complete lorry summary
   - **Final Confirmation**: Confirm data accuracy
   - **Submit to Admin**: Send data to Farm Admin for processing
   - **Status Update**: Lorry status updated to "Submitted"

#### Farm Admin Review & Processing
1. **Data Review**:
   - **Accuracy Check**: Verify weight and moisture data
   - **Quality Assessment**: Review quality deductions needed
   - **Pricing Application**: Apply appropriate pricing rates
   - **Advance Verification**: Confirm advance payment amounts

2. **Final Processing**:
   - **Calculation Verification**: Verify all calculations
   - **Approval Decision**: Approve or request corrections
   - **Payment Authorization**: Authorize final payments
   - **Status Update**: Update to "Processed" or "Completed"

### 7. Settlement & Payment Workflow

#### Settlement Calculation
1. **Final Amount Calculation**:
   ```
   For each farmer:
   - Gross Weight = Sum of individual bag weights
   - Standard Deduction = Bags × 2KG
   - Quality Deduction = Farm Admin assessment
   - Net Weight = Gross - Standard - Quality
   - Total Value = Net Weight × Price per KG
   - Final Amount = Total Value - Advances - Interest
   ```

2. **Settlement Verification**:
   - **Calculation Audit**: Verify all mathematical calculations
   - **Advance Reconciliation**: Confirm advance deductions
   - **Quality Justification**: Verify quality deduction reasons
   - **Final Approval**: Farm Admin final approval

#### Payment Processing
1. **Payment Authorization**:
   - **Amount Verification**: Confirm final payment amounts
   - **Payment Method**: Select payment method per farmer
   - **Batch Processing**: Process multiple payments together
   - **Payment Records**: Generate payment transaction records

2. **Payment Execution**:
   - **Bank Transfers**: Electronic transfer to farmer accounts
   - **Cash Payments**: Record cash payment transactions
   - **UPI Payments**: Mobile payment processing
   - **Payment Confirmation**: Confirm successful payments

### 8. Reporting & Documentation Workflow

#### Settlement Report Generation
1. **Individual Farmer Reports**:
   - **Complete Transaction Details**: All weights, calculations, deductions
   - **Individual Bag Weights**: Detailed weight breakdown
   - **Financial Summary**: Total value, advances, final amount
   - **Quality Information**: Moisture content, quality grades

2. **Report Distribution**:
   - **Digital Download**: PDF/Excel download from dashboard
   - **Email Delivery**: Automatic email to farmer
   - **SMS Summary**: Payment summary via SMS
   - **Physical Copy**: Printout for farmer signature

#### Business Analytics
1. **Performance Metrics**:
   - **Lorry Utilization**: Efficiency and usage patterns
   - **Manager Performance**: Completion rates, accuracy metrics
   - **Farmer Performance**: Quality consistency, delivery reliability
   - **Financial Analytics**: Revenue, costs, profit margins

2. **Trend Analysis**:
   - **Seasonal Patterns**: Procurement volume by season
   - **Quality Trends**: Moisture content and quality patterns
   - **Price Analysis**: Pricing trends and market conditions
   - **Efficiency Metrics**: Process improvement opportunities

### 9. Multi-Organization Workflow

#### Farmer Multi-Organization Experience
1. **Organization Selection**:
   - **Login Process**: Single login for all organizations
   - **Organization Detection**: System identifies all farmer's organizations
   - **Context Switching**: Easy switching between organizations
   - **Data Isolation**: Separate data views per organization

2. **Cross-Organization Management**:
   - **Unified Dashboard**: Overview of all organizations
   - **Organization-Specific Views**: Detailed data per organization
   - **Consolidated Reports**: Combined reports across organizations
   - **Separate Settlements**: Independent settlement per organization

### 10. Error Handling & Recovery Workflow

#### Data Validation & Error Prevention
1. **Real-Time Validation**:
   - **Input Validation**: Validate data as it's entered
   - **Range Checking**: Ensure values within acceptable ranges
   - **Consistency Checks**: Verify data consistency across fields
   - **Duplicate Prevention**: Prevent duplicate entries

2. **Error Recovery**:
   - **Auto-Save**: Automatically save work in progress
   - **Data Recovery**: Recover data after system interruptions
   - **Conflict Resolution**: Handle data conflicts during sync
   - **Backup Systems**: Regular data backups for recovery

This comprehensive workflow ensures smooth operations from initial lorry requests through final farmer settlements, with robust error handling and multi-organization support.