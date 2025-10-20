# User Roles & Authentication System
## Complete User Management Specification

### User Registration & Onboarding

#### Farm Admin (Business Owner) Registration

##### Initial Signup Process
1. **Landing Page Access**: Visit FarmTally registration portal
2. **Business Registration Form**:
   - **Business Name**: Company/farm business name
   - **Owner Name**: Full name of business owner
   - **Email Address**: Business email (primary login credential)
   - **Phone Number**: Primary contact number
   - **Password**: Secure password with validation
   - **Business Address**: Physical location of operations
   - **Business License**: Registration/license number (optional)

3. **Email Verification**:
   - System sends verification email with activation link
   - Account status: "Pending Verification" → "Active"
   - Email verification required before system access

4. **Business Setup Wizard**:
   - **Step 1**: Complete business profile and preferences
   - **Step 2**: Initial lorry fleet setup (add first lorries)
   - **Step 3**: Configure pricing structure and deduction rules
   - **Step 4**: Set system preferences and notification settings

5. **Organization Creation**:
   - **Auto-generated Organization ID**: Unique system identifier
   - **Organization Code**: Short reference code (e.g., "FARM001")
   - **One-to-One Relationship**: Each Farm Admin owns exactly one organization

#### Field Manager Registration (Invitation-Only)

##### Invitation Process
Field Managers cannot self-register and must be invited by Farm Admin:

1. **Farm Admin Invitation**:
   - Navigate to "Field Managers" → "Add Manager"
   - **Invitation Form Fields**:
     - **Manager Name**: Full name
     - **Email Address**: Work email for login
     - **Phone Number**: Contact number
     - **Employment Details**: Start date, employee ID
     - **Access Level**: Standard or limited permissions

2. **System-Generated Invitation**:
   - Automated invitation email sent to manager
   - **Email Contents**:
     - Welcome message from Farm Admin
     - Organization details and context
     - Secure setup link with token
     - Account setup instructions

3. **Manager Account Setup**:
   - Click invitation link to access setup form
   - **Setup Requirements**:
     - **Password Creation**: Set secure password
     - **Profile Completion**: Additional personal details
     - **Contact Preferences**: Notification settings
     - **Terms Agreement**: Accept usage terms
   - Account status: "Invited" → "Active"

4. **Organization Binding**:
   - Manager automatically linked to Farm Admin's organization
   - Access strictly scoped to assigned organization
   - Cannot access other organizations' data

#### Farmer Registration (Dual Method)

##### Method 1: Farm Admin Registration
1. **Admin-Created Accounts**:
   - Navigate to "Farmers" → "Add Farmer"
   - **Farmer Registration Form**:
     - **Farmer Name**: Full name
     - **Phone Number**: Primary contact (login credential)
     - **Email Address**: Optional email
     - **Physical Address**: Location details
     - **ID Number**: National ID or farmer registration
     - **Bank Details**: Payment processing information
     - **Default Password**: System-generated or admin-set

2. **Account Activation**:
   - If email provided: Send activation email
   - If no email: SMS with login credentials
   - Farmer can login and update profile

##### Method 2: Field Manager Registration
1. **Manager-Created Accounts**:
   - Navigate to "Farmers Management" → "Add New Farmer"
   - Same form fields as Farm Admin method
   - Account automatically linked to organization
   - Farm Admin receives notification of new farmer addition

### Authentication Flow

#### Login Process

##### Farm Admin Login
```
Email + Password → Organization Auto-Scope → Admin Dashboard
```
- **Credentials**: Email and password
- **Auto-Organization**: Automatically scoped to owned organization
- **Dashboard Access**: Direct redirect to admin dashboard
- **Session Management**: Secure session with 8-hour timeout

##### Field Manager Login
```
Email + Password → Organization Auto-Select → Manager Dashboard
```
- **Credentials**: Email and password
- **Organization Scope**: Automatically scoped to assigned organization
- **Dashboard Access**: Redirect to manager dashboard
- **Permission Verification**: Verify active employment status

##### Farmer Login
```
Phone/Email + Password → Multi-Org Detection → Organization Selection → Farmer Dashboard
```
- **Login Options**:
  - **Email Login**: If email provided during registration
  - **Phone Login**: Use phone number as username
  - **SMS OTP**: Optional one-time password via SMS
- **Multi-Organization Support**:
  - System identifies all organizations farmer supplies to
  - If multiple organizations: Show organization selector
  - If single organization: Direct dashboard access

### Multi-Organization Farmer Experience

#### Organization Selection Interface
```
┌─────────────────────────────────────────┐
│           Welcome, Ramesh Kumar         │
├─────────────────────────────────────────┤
│ Select Organization:                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🏢 Green Valley Farms               │ │
│ │    📍 Bangalore                     │ │
│ │    💰 Pending: ₹25,000             │ │
│ │    📅 Last Delivery: 2 days ago    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🏢 Sunrise Agriculture              │ │
│ │    📍 Mysore                        │ │
│ │    💰 Pending: ₹15,000             │ │
│ │    📅 Last Delivery: 1 week ago    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Organization Context Management
- **Single Session**: One login provides access to all organizations
- **Context Switching**: Easy switching between organizations
- **Data Isolation**: Complete separation of data between organizations
- **Unified Interface**: Consistent experience across all organizations

### User Relationships & Hierarchy

#### Organizational Structure
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

#### Key Relationships
- **One-to-One**: Each organization has exactly one Farm Admin
- **One-to-Many**: Each Farm Admin can have multiple Field Managers
- **Many-to-Many**: Farmers can supply to multiple organizations
- **Data Isolation**: Complete separation between organizations

### Permission Matrix

#### Farm Admin Permissions
| Feature | View | Create | Edit | Delete | Export | Report |
|---------|------|--------|------|--------|--------|--------|
| Lorries | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lorry Requests | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Field Managers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Farmers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pricing Control | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Quality Deductions | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Advance Payments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Financial Reports | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Business Settings | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

#### Field Manager Permissions
| Feature | View | Create | Edit | Delete | Export | Report |
|---------|------|--------|------|--------|--------|--------|
| Assigned Lorries | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Lorry Requests | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Farmers Database | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Weight Entry | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Moisture Recording | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Advance Recording | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Farmer Performance | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |

#### Farmer Permissions
| Feature | View | Create | Edit | Delete | Export | Report |
|---------|------|--------|------|--------|--------|--------|
| My Deliveries | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Payment History | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Lorry Schedule | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Advance Payments | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Quality Feedback | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Security Implementation

#### Password Management
- **Requirements**: Minimum 8 characters, mixed case, numbers, special characters
- **Strength Validation**: Real-time password strength feedback
- **History**: Cannot reuse last 5 passwords
- **Reset Process**: Email/SMS-based password reset with secure tokens

#### Multi-Factor Authentication (MFA)
- **Farm Admin**: MFA required for enhanced security
- **Field Manager**: MFA optional but recommended
- **Farmer**: SMS-based MFA available as option

#### Session Security
- **JWT Tokens**: Secure API authentication with role-based claims
- **Session Timeout**: 8-hour automatic logout for security
- **Concurrent Sessions**: Limited concurrent sessions per user
- **Device Tracking**: Monitor and manage device access

### Account Status Management

#### Status Types
- **Active**: Full access to assigned features
- **Inactive**: Account disabled, cannot login
- **Suspended**: Temporary suspension with limited access
- **Pending**: Awaiting verification or approval
- **Invited**: Invitation sent, not yet activated

#### Automated Actions
- **Inactive Accounts**: Auto-suspend after 90 days of inactivity
- **Expired Invitations**: Auto-cancel invitations after 7 days
- **Password Expiry**: Force password change every 180 days (Farm Admin)
- **Session Management**: Auto-logout after inactivity period

### Data Isolation & Security

#### Organization Data Isolation
- **Strict Separation**: Each organization's data completely isolated
- **No Cross-Access**: Users cannot access other organizations' data
- **Audit Trail**: All data access logged and monitored
- **Permission Inheritance**: Hierarchical permission structure

#### Role-Based Access Control (RBAC)
- **Permission Sets**: Predefined permissions for each role
- **Feature Flags**: Enable/disable features per role
- **Data Filtering**: Automatic filtering based on user role and organization
- **Dynamic Permissions**: Permissions can be adjusted per user if needed

This authentication system ensures secure, scalable user management while supporting the complex multi-organization requirements of the corn procurement business.