# FarmTally Project Structure

## Repository Organization

This is a documentation-first project with comprehensive specifications for a corn procurement management system. The repository contains detailed technical specifications, user interface designs, and business requirements.

### Current Structure
```
├── docs/                           # Complete project documentation
│   ├── 01-project-overview.md      # System overview and architecture
│   ├── 02-user-roles-authentication.md # User management and auth
│   ├── 03-core-workflow-processes.md   # Business workflows
│   ├── 04-technical-architecture.md    # Technical specifications
│   ├── 05-user-interface-specifications.md # UI/UX design
│   ├── 06-advance-payment-system.md    # Payment management
│   ├── 07-reporting-analytics-system.md # Reporting features
│   ├── 08-mobile-offline-support.md    # Mobile and offline features
│   ├── 09-notification-communication-system.md # Notifications
│   ├── advance-payment-workflow.md     # Payment workflows
│   ├── auth-flow.md                    # Authentication flows
│   ├── farm-admin-screens.md           # Admin interface specs
│   ├── farm-admin-technical-spec.md    # Admin technical details
│   ├── farmer-multi-org-experience.md  # Multi-org farmer experience
│   ├── farmer-report-template.md       # Farmer reporting
│   ├── farmer-technical-spec.md        # Farmer technical details
│   ├── field-manager-technical-spec.md # Manager technical details
│   ├── nav-map.md                      # Navigation structure
│   ├── scope.md                        # Project scope and roles
│   ├── user-relationships.md           # User relationship patterns
│   └── ux-rules.md                     # UX patterns and rules
└── .kiro/
    └── steering/                       # AI assistant guidance
        ├── product.md                  # Product overview
        ├── tech.md                     # Technical stack
        └── structure.md                # This file
```

## Planned Implementation Structure

When implementing the actual application, follow this structure:

### Flutter Frontend Structure
```
lib/
├── main.dart                   # App entry point
├── app/                        # App configuration
├── core/                       # Core utilities and constants
├── data/                       # Data layer (repositories, models, datasources)
├── domain/                     # Business logic layer
├── presentation/               # UI layer
│   ├── providers/              # Riverpod providers
│   ├── pages/                  # Screen implementations
│   │   ├── auth/               # Authentication screens
│   │   ├── farm_admin/         # Farm admin interface
│   │   ├── field_manager/      # Field manager interface
│   │   └── farmer/             # Farmer interface
│   ├── widgets/                # Reusable UI components
│   └── dialogs/                # Modal dialogs
├── services/                   # External services
└── l10n/                       # Internationalization
```

### Backend Structure
```
src/
├── controllers/                # API endpoints
│   ├── auth/                   # Authentication controllers
│   ├── farm-admin/             # Farm admin endpoints
│   ├── field-manager/          # Field manager endpoints
│   └── farmer/                 # Farmer endpoints
├── middleware/                 # Express middleware
├── services/                   # Business logic services
├── models/                     # Data models
├── routes/                     # API routes
├── utils/                      # Utility functions
└── types/                      # TypeScript type definitions
```

## Documentation Conventions

### File Naming
- Use kebab-case for file names (e.g., `user-roles-authentication.md`)
- Number core specification files (01-09) for reading order
- Use descriptive names for supplementary documentation

### Content Organization
- Each major feature has its own specification document
- Technical specifications separate from business requirements
- User interface specifications include both design and interaction patterns
- Workflow documents focus on business processes

### Cross-References
- Documents reference each other using relative links
- Key concepts are explained in multiple contexts
- Navigation maps provide overview of system structure

## Development Workflow

### Documentation-Driven Development
1. Review relevant documentation before implementing features
2. Update documentation when making architectural changes
3. Use specifications as acceptance criteria for features
4. Maintain consistency between docs and implementation

### Feature Implementation Order
1. Authentication and user management
2. Core data models and database schema
3. Farm admin lorry and request management
4. Field manager data entry workflows
5. Farmer multi-organization experience
6. Reporting and analytics
7. Mobile optimization and offline support
8. Notification and communication systems

### Code Organization Principles
- Feature-based organization over layer-based
- Shared components in common directories
- Role-specific code in dedicated modules
- Clear separation between business logic and UI
- Consistent naming conventions across all layers