# FarmTally Pipeline Tests

Comprehensive test suite for the FarmTally Jenkins CI/CD pipeline components, covering unit tests, integration tests, and failure scenario simulations.

## Overview

This test suite validates all aspects of the Jenkins pipeline alignment implementation, including:

- **Unit Tests**: Individual component testing for pipeline scripts
- **Integration Tests**: End-to-end pipeline workflow testing
- **Failure Scenarios**: Comprehensive failure simulation and recovery testing

## Test Structure

```
tests/
├── unit/                           # Unit tests for individual components
│   └── pipeline/
│       ├── workspace-path-validation.test.js
│       ├── environment-injection.test.js
│       ├── health-check.test.js
│       └── artifact-management.test.js
├── integration/                    # Integration tests for complete workflows
│   └── pipeline/
│       ├── end-to-end-pipeline.test.js
│       ├── database-migration.test.js
│       ├── multi-environment-config.test.js
│       └── failure-scenario-simulation.test.js
├── jest.config.js                  # Jest configuration
├── setup.js                       # Test setup and utilities
├── globalSetup.js                  # Global test setup
├── globalTeardown.js              # Global test cleanup
└── package.json                   # Test dependencies and scripts
```

## Requirements Coverage

### Unit Tests

#### Workspace Path Validation (`workspace-path-validation.test.js`)
- ✅ Directory structure validation
- ✅ Build script validation  
- ✅ Common issues detection
- ✅ Path configuration generation
- ✅ Error handling

**Requirements Covered**: 1.1, 1.2, 1.3, 1.4, 1.5

#### Environment Variable Injection (`environment-injection.test.js`)
- ✅ Environment variable validation
- ✅ Environment file generation
- ✅ Variable validation rules
- ✅ Security features (masking, encryption)

**Requirements Covered**: 2.1, 2.2, 2.3, 2.4, 2.5

#### Health Check System (`health-check.test.js`)
- ✅ Basic health endpoint verification
- ✅ Authentication endpoint testing
- ✅ Database connectivity verification
- ✅ Service token generation
- ✅ Comprehensive health check execution
- ✅ Error handling and resilience
- ✅ Logging and output formatting

**Requirements Covered**: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6

#### Artifact Management (`artifact-management.test.js`)
- ✅ Version information generation
- ✅ Backend and frontend packaging
- ✅ Manifest generation
- ✅ Retention policy application
- ✅ Artifact verification and integrity
- ✅ Artifact listing and management

**Requirements Covered**: 7.1, 7.2, 7.3, 7.4, 7.5

### Integration Tests

#### End-to-End Pipeline (`end-to-end-pipeline.test.js`)
- ✅ Complete pipeline execution
- ✅ Stage dependencies and ordering
- ✅ Environment configuration integration
- ✅ Database migration integration
- ✅ Health check integration
- ✅ Artifact management integration
- ✅ Failure recovery and rollback

**Requirements Covered**: All requirements - complete workflow

#### Database Migration (`database-migration.test.js`)
- ✅ Migration execution with sample data
- ✅ Multi-environment configuration testing
- ✅ Failure scenario simulation
- ✅ Performance and scalability testing
- ✅ Migration reporting and monitoring

**Requirements Covered**: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6

#### Multi-Environment Configuration (`multi-environment-config.test.js`)
- ✅ Development environment configuration
- ✅ Staging environment configuration
- ✅ Production environment configuration
- ✅ Environment switching and validation
- ✅ Configuration security and compliance
- ✅ Performance and monitoring configuration

**Requirements Covered**: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6

#### Failure Scenario Simulation (`failure-scenario-simulation.test.js`)
- ✅ Build failure scenarios
- ✅ Database migration failure scenarios
- ✅ Deployment failure scenarios
- ✅ Health check failure scenarios
- ✅ Network and infrastructure failures
- ✅ Resource exhaustion scenarios
- ✅ Recovery and rollback testing
- ✅ Monitoring and alerting during failures

**Requirements Covered**: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Ensure Node.js 18+ is installed
node --version
```

### Test Commands

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose

# Run tests in CI mode
npm run test:ci

# Debug tests
npm run test:debug

# Lint test files
npm run lint:tests

# Clean test artifacts
npm clean
```

### Test Configuration

Tests can be configured through environment variables:

```bash
# Enable verbose console output during tests
VERBOSE_TESTS=true npm test

# Set custom test timeout
JEST_TIMEOUT=60000 npm test

# Run tests in parallel
JEST_MAX_WORKERS=4 npm test
```

## Test Features

### Mock System Components

- **Git Repository**: Simulated git commands and repository state
- **Database**: Mock Prisma CLI and database operations
- **API Endpoints**: Axios mocking for health check testing
- **File System**: Temporary directories for isolated testing
- **Environment Variables**: Controlled environment setup

### Test Utilities

- **Temporary Directory Management**: Automatic cleanup
- **Mock Project Creation**: Complete project structure setup
- **Environment Configuration**: Realistic environment simulation
- **Error Simulation**: Comprehensive failure scenario testing

### Coverage Reporting

Tests generate comprehensive coverage reports including:

- Line coverage for all pipeline scripts
- Branch coverage for conditional logic
- Function coverage for all exported functions
- Statement coverage for complete code paths

Coverage reports are available in:
- `tests/coverage/lcov-report/index.html` (HTML report)
- `tests/coverage/lcov.info` (LCOV format)
- Console output during test execution

## Test Data and Fixtures

### Sample Migrations

Tests include realistic database migration scenarios:
- Basic table creation
- Complex schema changes
- Production constraints
- Large dataset operations
- Conflicting migrations
- Partial failure scenarios

### Environment Configurations

Tests cover multiple environment types:
- **Development**: Debug mode, local services, relaxed security
- **Staging**: Production-like, monitoring enabled, security hardened
- **Production**: Maximum security, performance optimized, compliance ready

### Failure Scenarios

Comprehensive failure simulation including:
- Build failures (TypeScript, dependencies, memory)
- Database failures (connection, migration, schema conflicts)
- Deployment failures (startup, ports, permissions, disk space)
- Health check failures (API, database, authentication, timeouts)
- Network failures (DNS, SSL, load balancer, CDN)
- Resource exhaustion (memory, CPU, file descriptors)

## Continuous Integration

### GitHub Actions Integration

```yaml
name: Pipeline Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd tests && npm ci
      - run: cd tests && npm run test:ci
      - uses: codecov/codecov-action@v3
        with:
          file: tests/coverage/lcov.info
```

### Jenkins Integration

```groovy
pipeline {
    agent any
    stages {
        stage('Pipeline Tests') {
            steps {
                dir('tests') {
                    sh 'npm ci'
                    sh 'npm run test:ci'
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'tests/coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Pipeline Test Coverage'
                    ])
                }
            }
        }
    }
}
```

## Troubleshooting

### Common Issues

1. **Test Timeouts**
   ```bash
   # Increase timeout for slow tests
   JEST_TIMEOUT=60000 npm test
   ```

2. **Permission Errors**
   ```bash
   # Ensure proper permissions for test scripts
   chmod +x scripts/*.sh
   ```

3. **Mock Failures**
   ```bash
   # Clear Jest cache if mocks behave unexpectedly
   npx jest --clearCache
   ```

4. **Coverage Issues**
   ```bash
   # Run tests with verbose coverage
   npm run test:coverage -- --verbose
   ```

### Debug Mode

Enable debug mode for detailed test execution:

```bash
# Run specific test file in debug mode
npm run test:debug -- tests/unit/pipeline/health-check.test.js

# Enable verbose console output
VERBOSE_TESTS=true npm test
```

## Contributing

### Adding New Tests

1. **Unit Tests**: Add to `tests/unit/pipeline/`
2. **Integration Tests**: Add to `tests/integration/pipeline/`
3. **Follow naming convention**: `component-name.test.js`
4. **Include comprehensive coverage**: Happy path, edge cases, error scenarios
5. **Use test utilities**: Leverage `global.TestUtils` for common operations

### Test Guidelines

- **Isolation**: Each test should be independent
- **Cleanup**: Always clean up temporary resources
- **Mocking**: Mock external dependencies appropriately
- **Assertions**: Use descriptive assertion messages
- **Coverage**: Aim for >90% code coverage

### Code Quality

```bash
# Lint test files
npm run lint:tests

# Format test files
npx prettier --write tests/**/*.js
```

## License

MIT License - see LICENSE file for details.