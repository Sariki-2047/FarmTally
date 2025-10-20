# FarmTally Technical Stack

## Technology Stack

### Frontend
- **Framework**: Flutter 3.16+ with Dart 3.0+
- **UI Design**: Material Design 3 with custom theme
- **State Management**: Riverpod for reactive state management
- **Navigation**: GoRouter for declarative routing
- **Forms**: Flutter Form Builder with validation
- **Charts**: FL Chart for analytics dashboards
- **HTTP Client**: Dio with interceptors for API calls
- **Local Database**: SQLite with Drift ORM for offline support
- **Platform Support**: iOS, Android, Web, Windows, macOS, Linux

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: JWT + Refresh Tokens
- **Validation**: Joi for request validation
- **File Upload**: Multer + AWS S3
- **Email**: SendGrid for email notifications
- **SMS**: Twilio for SMS notifications
- **Caching**: Redis for session and data caching
- **Queue**: Bull Queue with Redis for background jobs
- **WebSocket**: Socket.io for real-time updates

### Database
- **Primary**: PostgreSQL 14+ with Prisma ORM
- **Local/Offline**: SQLite with Drift ORM
- **Caching**: Redis for performance optimization
- **File Storage**: AWS S3 for documents and photos

## Architecture Patterns

### Mobile-First Design
- Cross-platform Flutter application with native performance
- Offline-first architecture with SQLite local storage
- Automatic sync when connectivity is restored
- Optimized for field operations and data entry

### Multi-Tenant Architecture
- Complete data isolation between organizations
- Role-based access control with organization scoping
- Shared farmer database within organizations
- Separate reporting and analytics per organization

### API Design
- RESTful APIs with TypeScript
- JWT-based authentication with role permissions
- WebSocket for real-time updates
- Comprehensive error handling and validation

## Common Commands

### Development Setup
```bash
# Backend setup
npm install
npm run dev

# Frontend setup
flutter pub get
flutter run

# Database setup
npx prisma migrate dev
npx prisma generate
```

### Testing
```bash
# Backend tests
npm test
npm run test:watch

# Frontend tests
flutter test
flutter test --coverage
```

### Build & Deploy
```bash
# Backend build
npm run build
npm start

# Frontend build
flutter build apk --release
flutter build ios --release
flutter build web --release
```

## Development Guidelines

### Code Organization
- Follow Flutter project structure with feature-based organization
- Use TypeScript for all backend code
- Implement proper error handling and logging
- Follow Material Design 3 guidelines for UI components

### Data Flow
- Use Riverpod providers for state management
- Implement offline-first data synchronization
- Follow repository pattern for data access
- Use proper validation at all layers

### Security
- JWT authentication with refresh tokens
- Role-based permissions with organization scoping
- Data encryption at rest and in transit
- Comprehensive audit logging