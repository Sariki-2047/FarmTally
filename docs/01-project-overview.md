# FarmTally - Corn Procurement System
## Project Overview & Architecture

### System Purpose
FarmTally is a comprehensive corn procurement management system designed to streamline the entire corn supply chain from farmer to business. The system manages lorry operations, farmer relationships, weight recording, quality assessment, and financial settlements across multiple organizations.

### Core Business Model
```
Farm Admin (Business Owner)
    ↓ employs
Field Manager (Employee)
    ↓ coordinates
Farmer (Corn Supplier)
```

### Key Features
- **Multi-Organization Support**: Farmers can supply to multiple businesses
- **Complete Procurement Workflow**: From lorry request to final payment
- **Real-time Weight & Quality Recording**: Individual bag weights and moisture content
- **Automated Financial Calculations**: Pricing, deductions, and settlements
- **Advance Payment Management**: Track and manage farmer advances
- **Comprehensive Reporting**: Detailed reports for all stakeholders
- **Mobile-First Design**: Optimized for field operations
- **Offline Support**: Continue operations without internet connectivity

### System Architecture

#### Technology Stack
- **Frontend**: Flutter 3.16+ with Dart 3.0+, Material Design 3
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: JWT with role-based access control
- **Real-time**: WebSocket for live updates
- **Mobile**: Native iOS/Android apps with web and desktop support
- **Offline**: SQLite with Drift ORM for local data storage
- **Notifications**: Multi-channel (SMS, Email, WhatsApp, Push)

#### Deployment Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Flutter App    │    │   Node.js API   │    │  PostgreSQL     │
│ (Cross-Platform)│◄──►│   (Backend)     │◄──►│  (Database)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local SQLite  │    │     Redis       │    │   File Storage  │
│   (Offline DB)  │    │   (Cache)       │    │   (AWS S3)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### User Roles & Permissions

#### Farm Admin (Business Owner)
- **Primary Role**: Business management and oversight
- **Key Responsibilities**:
  - Manage lorry fleet and assignments
  - Approve/reject lorry requests from field managers
  - Set pricing and quality deduction parameters
  - Process final payments and settlements
  - Generate business reports and analytics
  - Manage field managers and farmer database

#### Field Manager (Employee)
- **Primary Role**: Field operations and data collection
- **Key Responsibilities**:
  - Request lorries for procurement operations
  - Add farmers to lorries and record deliveries
  - Enter individual bag weights and moisture content
  - Record farmer advance payments
  - Submit completed lorry data for processing
  - Generate operational reports

#### Farmer (Corn Supplier)
- **Primary Role**: Corn delivery and transaction tracking
- **Key Responsibilities**:
  - View delivery schedules across organizations
  - Track payment history and advance balances
  - Monitor quality feedback and performance
  - Access settlement reports and documentation
  - Manage multi-organization relationships

### Organizational Structure

#### Single Organization Model
Each organization operates independently with complete data isolation:

```
Organization A
┌─────────────────────────────────────────┐
│           Farm Admin A                  │
│         (Business Owner)                │
├─────────────────────────────────────────┤
│  Field Manager 1  │  Field Manager 2   │
│  Field Manager 3  │  Field Manager 4   │
├─────────────────────────────────────────┤
│         Shared Farmer Database          │
│  Farmer 1 │ Farmer 2 │ ... │ Farmer N  │
└─────────────────────────────────────────┘
```

#### Multi-Organization Support for Farmers
Farmers can supply to multiple organizations while maintaining separate records:

```
        Farmer (Ramesh Kumar)
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
Org A      Org B      Org C
Records    Records    Records
```

### Core Workflow

#### 1. Lorry Request Process
```
Field Manager → Request Lorry → Farm Admin → Approve/Assign → Field Manager
```

#### 2. Procurement Process
```
Add Farmers → Record Weights → Record Moisture → Apply Pricing → Calculate Settlement
```

#### 3. Settlement Process
```
Submit Data → Farm Admin Review → Apply Deductions → Process Payment → Generate Reports
```

### Data Flow Architecture

#### Procurement Data Flow
```
Field Manager Entry → Validation → Database Storage → Farm Admin Review → Final Processing
```

#### Multi-Organization Data Flow
```
Farmer Login → Organization Selection → Scoped Data Access → Organization-Specific Views
```

### Security & Compliance

#### Data Security
- **Encryption**: All sensitive data encrypted at rest and in transit
- **Access Control**: Role-based permissions with organization scoping
- **Audit Trail**: Complete logging of all user actions
- **Data Isolation**: Strict separation between organizations

#### Compliance Features
- **Financial Records**: Detailed transaction logging for audits
- **Quality Documentation**: Photo and measurement records
- **Payment Tracking**: Complete advance and settlement history
- **Report Generation**: Compliance reports for regulatory requirements

### Integration Capabilities

#### External Systems
- **SMS Gateways**: Multi-provider SMS notifications
- **Email Services**: Automated email communications
- **Payment Systems**: UPI and bank transfer integration
- **WhatsApp Business**: Rich messaging and document sharing
- **Cloud Storage**: Document and photo backup

#### API Architecture
- **RESTful APIs**: Standard HTTP APIs for all operations
- **WebSocket**: Real-time updates and notifications
- **Webhook Support**: Integration with external systems
- **Mobile APIs**: Optimized endpoints for mobile operations

### Scalability & Performance

#### Performance Optimization
- **Database Indexing**: Optimized queries for large datasets
- **Caching Strategy**: Redis caching for frequently accessed data
- **CDN Integration**: Fast content delivery for mobile users
- **Background Processing**: Async processing for heavy operations

#### Scalability Features
- **Horizontal Scaling**: Support for multiple server instances
- **Database Sharding**: Organization-based data partitioning
- **Load Balancing**: Distribute traffic across servers
- **Auto-scaling**: Dynamic resource allocation based on demand

This overview provides the foundation for understanding FarmTally's architecture and capabilities. The following documents provide detailed specifications for each component and user role.