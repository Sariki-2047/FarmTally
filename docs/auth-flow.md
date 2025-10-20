# Authentication & User Management Flow

## User Registration & Onboarding Process

### Farm Admin (Business Owner) Registration

#### Initial Signup Process
1. **Landing Page**: Visit corn procurement system website
2. **Registration Form**: Complete business owner registration
   - **Business Name**: Company/farm business name
   - **Owner Name**: Full name of business owner
   - **Email Address**: Business email (becomes login username)
   - **Phone Number**: Primary contact number
   - **Password**: Secure password with validation
   - **Business Address**: Physical location of business
   - **Business Type**: Corn procurement, grain trading, etc.
   - **License Number**: Business registration/license (optional)

3. **Email Verification**: 
   - System sends verification email
   - Click verification link to activate account
   - Account status: "Pending Verification" → "Active"

4. **Business Setup Wizard**:
   - **Step 1**: Business profile completion
   - **Step 2**: Initial lorry fleet setup (add lorries)
   - **Step 3**: Pricing configuration (default rates)
   - **Step 4**: System preferences and settings

5. **Account Activation**:
   - Account status: "Active"
   - Access to full Farm Admin dashboard
   - Ability to add Field Managers, Lorries and Farmers

#### Business Organization Creation
- **Organization ID**: Auto-generated unique identifier
- **Organization Code**: Short code for easy reference (e.g., "FARM001")
- **Single Organization**: Each Farm Admin owns one organization
- **One-to-One Relationship**: One Farm Admin per organization

### Field Manager Registration Process

#### Invitation-Based Registration
Field Managers cannot self-register. They must be invited by Farm Admin.

1. **Farm Admin Invitation**:
   - Farm Admin goes to "Field Managers" → "Add Manager"
   - **Invitation Form**:
     - **Manager Name**: Full name
     - **Email Address**: Work email for login
     - **Phone Number**: Contact number
     - **Role Assignment**: Field Manager role
     - **Organization Assignment**: Which business organization
     - **Access Level**: Standard or Limited permissions
     - **Employment Details**: Start date, employee ID (optional)

2. **Invitation Email**:
   - System sends invitation email to manager
   - Email contains:
     - Welcome message from Farm Admin
     - Organization details
     - Temporary login link
     - Instructions for account setup

3. **Manager Account Setup**:
   - Click invitation link
   - **Setup Form**:
     - **Password Creation**: Set secure password
     - **Profile Completion**: Additional personal details
     - **Contact Preferences**: Notification settings
     - **Agreement**: Terms of employment/usage
   - Account status: "Invited" → "Active"

4. **Organization Binding**:
   - Manager account automatically linked to Farm Admin's organization
   - Access scoped to assigned organization only
   - Cannot access other organizations

#### Manager-Admin Relationship Establishment
- **Hierarchical Link**: Manager → Organization → Farm Admin
- **Permission Inheritance**: Permissions defined by Farm Admin
- **Data Scoping**: All manager data scoped to organization
- **Reporting Chain**: Manager reports to Farm Admin

### Farmer Registration Process

#### Dual Registration Method
Farmers can be added through two methods:

#### Method 1: Farm Admin Registration
1. **Admin-Created Accounts**:
   - Farm Admin goes to "Farmers" → "Add Farmer"
   - **Farmer Form**:
     - **Farmer Name**: Full name
     - **Phone Number**: Primary contact (can be used for login)
     - **Email Address**: Optional email
     - **Address**: Physical location
     - **ID Number**: National ID or farmer ID
     - **Bank Details**: For payment processing
     - **Default Password**: System-generated or admin-set

2. **Account Activation**:
   - If email provided: Send activation email
   - If no email: SMS with login credentials
   - Farmer can login and update profile

#### Method 2: Field Manager Registration
1. **Manager-Created Accounts**:
   - Field Manager goes to "Farmers Management" → "Add New Farmer"
   - Same form as Farm Admin method
   - Account automatically linked to organization
   - Farm Admin gets notification of new farmer

#### Farmer-Organization Relationship
- **Multi-Organization Support**: Farmers can supply to multiple businesses
- **Organization Linking**: Each delivery links farmer to specific organization
- **Payment Tracking**: Separate payment records per organization
- **Data Isolation**: Complete separation of data between organizations
- **Unified Access**: Single login provides access to all organizations farmer supplies to
- **Organization Switching**: Farmers can switch between organizations in their dashboard

## Authentication Flow

### Login Process

#### Farm Admin Login
1. **Login Page**: Enter email and password
2. **Auto-Organization**: Automatically scoped to owned organization
3. **Dashboard Access**: Redirect to admin dashboard
4. **Session Management**: Secure session with timeout

#### Field Manager Login
1. **Login Page**: Enter email and password
2. **Organization Auto-Select**: Automatically scoped to assigned organization
3. **Dashboard Access**: Redirect to manager dashboard
4. **Permission Check**: Verify active employment status

#### Farmer Login
1. **Login Options**:
   - **Email Login**: If email provided during registration
   - **Phone Login**: Use phone number as username
   - **SMS OTP**: One-time password via SMS (optional)
2. **Organization Detection**: System identifies all organizations farmer supplies to
3. **Organization Selection**: If multiple organizations, show organization selector
4. **Dashboard Access**: Redirect to farmer dashboard with organization context

### Password Management

#### Password Requirements
- **Minimum Length**: 8 characters
- **Complexity**: Mix of letters, numbers, special characters
- **Strength Indicator**: Real-time password strength feedback
- **History**: Cannot reuse last 5 passwords

#### Password Reset Process
1. **Forgot Password**: Click "Forgot Password" on login page
2. **Identity Verification**: Enter email or phone number
3. **Reset Method**:
   - **Email**: Send reset link to email
   - **SMS**: Send OTP to phone number
4. **New Password**: Set new password with validation
5. **Confirmation**: Login with new password

### Multi-Factor Authentication (MFA)

#### MFA Options
- **SMS OTP**: Text message verification
- **Email OTP**: Email verification code
- **Authenticator App**: Google Authenticator, Authy
- **Backup Codes**: Emergency access codes

#### MFA Requirements
- **Farm Admin**: MFA required for security
- **Field Manager**: MFA optional, recommended
- **Farmer**: MFA optional, SMS-based

## User Management & Relationships

### Organization Hierarchy

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
│ │(shared)     │ │              │ │(shared)     │ │
│ └─────────────┘ │              │ └─────────────┘ │
└─────────────────┘              └─────────────────┘
```

**Key Structure:**
- Each organization has exactly one Farm Admin (Business Owner)
- Each Farm Admin owns one organization
- Multiple Field Managers work within each organization
- Farmers database is shared across all Field Managers within the same organization
- Complete data isolation between different organizations

### Permission Inheritance

#### Farm Admin Permissions
- **Full Control**: All features and data within their organization
- **User Management**: Add/remove/modify Field Managers and Farmers
- **Organization Settings**: Configure business rules and preferences
- **Single Organization**: Access limited to owned organization only

#### Field Manager Permissions
- **Scoped Access**: Limited to assigned organization
- **Operational Control**: Lorry requests, farmer management, data entry
- **No User Management**: Cannot add/remove other managers
- **Farmer Addition**: Can add farmers to organization database

#### Farmer Permissions
- **Self-Service**: View own deliveries, payments, schedules
- **Read-Only**: Cannot modify system data
- **Multi-Organization**: Can view data from multiple businesses they supply to

### Account Status Management

#### Status Types
- **Active**: Full access to assigned features
- **Inactive**: Account disabled, cannot login
- **Suspended**: Temporary suspension, limited access
- **Pending**: Awaiting verification or approval
- **Invited**: Invitation sent, not yet activated

#### Status Changes
- **Farm Admin**: Can change status of Field Managers and Farmers
- **Field Manager**: Cannot change user statuses
- **System**: Auto-suspend inactive accounts after 90 days

### Data Isolation & Security

#### Organization Data Isolation
- **Strict Separation**: Each organization's data completely isolated
- **No Cross-Access**: Users cannot access other organizations' data
- **Audit Trail**: All data access logged and monitored

#### Role-Based Access Control (RBAC)
- **Permission Sets**: Predefined permissions for each role
- **Feature Flags**: Enable/disable features per role
- **Data Filtering**: Automatic filtering based on user role and organization

#### Security Measures
- **Session Security**: Secure session management with timeout
- **API Security**: JWT tokens for API authentication
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Audit Logging**: Complete audit trail of user actions

## Onboarding Experience

### Farm Admin Onboarding
1. **Welcome Dashboard**: Overview of system capabilities
2. **Setup Checklist**: 
   - ✅ Business profile completed
   - ✅ First lorry added
   - ✅ First field manager invited
   - ✅ Pricing configured
3. **Tutorial Tour**: Interactive guide through key features
4. **Support Resources**: Documentation, video tutorials, contact info

### Field Manager Onboarding
1. **Welcome Message**: Personal welcome from Farm Admin
2. **Organization Overview**: Business details and expectations
3. **Feature Introduction**: Tour of manager-specific features
4. **First Tasks**: 
   - Complete profile
   - Request first lorry
   - Add first farmer
5. **Training Resources**: Role-specific training materials

### Farmer Onboarding
1. **Simple Welcome**: Easy-to-understand interface
2. **Profile Completion**: Basic information and payment details
3. **Feature Overview**: How to view deliveries and payments
4. **Contact Information**: How to reach Field Manager or Farm Admin
5. **Mobile App**: Download mobile app for easier access