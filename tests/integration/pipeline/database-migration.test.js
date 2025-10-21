/**
 * Integration Tests for Database Migration System
 * Tests database migration functionality with sample data and various scenarios
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Mock the migration handler
const MigrationHandler = require('../../../scripts/migration-handler.js');

describe('Database Migration Integration', () => {
    let tempDir;
    let originalCwd;
    let originalEnv;
    let migrationHandler;

    beforeAll(() => {
        jest.setTimeout(30000); // Longer timeout for database operations
    });

    beforeEach(() => {
        // Create temporary directory for testing
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'farmtally-migration-test-'));
        originalCwd = process.cwd();
        originalEnv = { ...process.env };
        
        process.chdir(tempDir);
        
        // Setup test environment
        setupTestEnvironment();
        
        // Create migration handler
        migrationHandler = new MigrationHandler();
    });

    afterEach(() => {
        // Cleanup
        process.chdir(originalCwd);
        process.env = originalEnv;
        
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('Migration Execution with Sample Data', () => {
        test('should execute migrations successfully with valid database', async () => {
            setupValidDatabase();
            setupSampleMigrations();
            
            const result = await migrationHandler.run();
            
            expect(result.success).toBe(true);
            expect(result.reportFile).toBeDefined();
            
            // Verify migration report was created
            expect(fs.existsSync(result.reportFile)).toBe(true);
            
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            expect(report.migration_execution.status).toBe('completed');
            expect(report.migration_status.applied).toBeGreaterThan(0);
        });

        test('should handle complex migration scenarios with sample data', async () => {
            setupValidDatabase();
            setupComplexMigrations();
            
            const result = await migrationHandler.run();
            
            expect(result.success).toBe(true);
            
            // Verify all migrations were applied
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            expect(report.migration_status.applied).toBe(3); // Should have applied 3 migrations
            expect(report.migration_status.pending).toBe(0);
        });

        test('should rollback on migration failure', async () => {
            setupValidDatabase();
            setupFailingMigration();
            
            try {
                await migrationHandler.run();
                fail('Expected migration to fail');
            } catch (error) {
                expect(error.message).toContain('Migration execution failed');
                
                // Verify database state is preserved
                const statusResult = await migrationHandler.getStatus();
                expect(statusResult.success).toBe(true);
                // Should not have any partially applied migrations
            }
        });

        test('should handle migration with seed data', async () => {
            setupValidDatabase();
            setupMigrationsWithSeedData();
            
            const result = await migrationHandler.run();
            
            expect(result.success).toBe(true);
            
            // Verify seed data was applied
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            expect(report.migration_execution.status).toBe('completed');
        });
    });

    describe('Multi-Environment Configuration Testing', () => {
        test('should handle development environment configuration', async () => {
            process.env.NODE_ENV = 'development';
            process.env.DATABASE_URL = 'postgresql://dev:dev@localhost:5432/farmtally_dev';
            
            setupValidDatabase();
            setupEnvironmentSpecificMigrations('development');
            
            const result = await migrationHandler.run();
            
            expect(result.success).toBe(true);
            
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            expect(report.environment.build_number).toBeDefined();
        });

        test('should handle production environment configuration', async () => {
            process.env.NODE_ENV = 'production';
            process.env.DATABASE_URL = 'postgresql://prod:prod@prod-db:5432/farmtally_prod';
            
            setupValidDatabase();
            setupEnvironmentSpecificMigrations('production');
            
            const result = await migrationHandler.run();
            
            expect(result.success).toBe(true);
            
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            expect(report.migration_execution.database_url_hash).toBeDefined();
            // Should not contain actual database credentials
            expect(JSON.stringify(report)).not.toContain('prod:prod');
        });

        test('should handle staging environment with production-like data', async () => {
            process.env.NODE_ENV = 'staging';
            process.env.DATABASE_URL = 'postgresql://staging:staging@staging-db:5432/farmtally_staging';
            
            setupValidDatabase();
            setupLargeDatasetMigrations();
            
            const result = await migrationHandler.run();
            
            expect(result.success).toBe(true);
            
            // Verify performance metrics are captured
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            expect(report.migration_execution.duration_ms).toBeGreaterThan(0);
        });

        test('should validate environment-specific constraints', async () => {
            process.env.NODE_ENV = 'production';
            process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/farmtally';
            
            setupValidDatabase();
            setupProductionConstraintMigrations();
            
            const result = await migrationHandler.run();
            
            expect(result.success).toBe(true);
            
            // Verify production constraints were applied
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            expect(report.migration_status.applied).toBeGreaterThan(0);
        });
    });

    describe('Failure Scenario Simulation', () => {
        test('should handle database connection timeout', async () => {
            process.env.DATABASE_URL = 'postgresql://user:pass@unreachable-host:5432/farmtally';
            
            try {
                await migrationHandler.checkConnectivity();
                fail('Expected connectivity check to fail');
            } catch (error) {
                expect(error.message).toContain('Failed to connect to database');
            }
        });

        test('should handle invalid database credentials', async () => {
            process.env.DATABASE_URL = 'postgresql://invalid:invalid@localhost:5432/farmtally';
            
            try {
                await migrationHandler.run();
                fail('Expected migration to fail with invalid credentials');
            } catch (error) {
                expect(error.message).toContain('Migration execution failed');
            }
        });

        test('should handle corrupted migration files', async () => {
            setupValidDatabase();
            setupCorruptedMigrations();
            
            try {
                await migrationHandler.run();
                fail('Expected migration to fail with corrupted files');
            } catch (error) {
                expect(error.message).toContain('Migration execution failed');
            }
        });

        test('should handle database schema conflicts', async () => {
            setupValidDatabase();
            setupConflictingMigrations();
            
            try {
                await migrationHandler.run();
                fail('Expected migration to fail with schema conflicts');
            } catch (error) {
                expect(error.message).toContain('Migration execution failed');
            }
        });

        test('should handle partial migration failures', async () => {
            setupValidDatabase();
            setupPartialFailureMigrations();
            
            try {
                await migrationHandler.run();
                fail('Expected migration to fail partially');
            } catch (error) {
                expect(error.message).toContain('Migration execution failed');
                
                // Verify database is in consistent state
                const statusResult = await migrationHandler.getStatus();
                expect(statusResult.success).toBe(true);
            }
        });

        test('should handle migration rollback scenarios', async () => {
            setupValidDatabase();
            
            // First, apply some migrations successfully
            setupSampleMigrations();
            const firstResult = await migrationHandler.run();
            expect(firstResult.success).toBe(true);
            
            // Then try to apply a failing migration
            setupFailingMigration();
            
            try {
                await migrationHandler.run();
                fail('Expected second migration to fail');
            } catch (error) {
                // Verify original migrations are still intact
                const statusResult = await migrationHandler.getStatus();
                expect(statusResult.success).toBe(true);
                expect(statusResult.status.applied).toBeGreaterThan(0);
            }
        });
    });

    describe('Performance and Scalability Testing', () => {
        test('should handle large migration files efficiently', async () => {
            setupValidDatabase();
            setupLargeMigrationFiles();
            
            const startTime = Date.now();
            const result = await migrationHandler.run();
            const duration = Date.now() - startTime;
            
            expect(result.success).toBe(true);
            expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
            
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            expect(report.migration_execution.duration_ms).toBeLessThan(30000);
        });

        test('should handle multiple concurrent migration attempts', async () => {
            setupValidDatabase();
            setupSampleMigrations();
            
            // Simulate concurrent migration attempts
            const migrationPromises = [
                migrationHandler.run(),
                new MigrationHandler().run(),
                new MigrationHandler().run()
            ];
            
            const results = await Promise.allSettled(migrationPromises);
            
            // Only one should succeed, others should handle the lock gracefully
            const successfulResults = results.filter(r => r.status === 'fulfilled' && r.value.success);
            expect(successfulResults.length).toBe(1);
        });

        test('should monitor memory usage during large migrations', async () => {
            setupValidDatabase();
            setupMemoryIntensiveMigrations();
            
            const initialMemory = process.memoryUsage();
            
            const result = await migrationHandler.run();
            
            const finalMemory = process.memoryUsage();
            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
            
            expect(result.success).toBe(true);
            // Memory increase should be reasonable (less than 100MB)
            expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
        });

        test('should handle database connection pooling', async () => {
            setupValidDatabase();
            setupConnectionPoolingMigrations();
            
            const result = await migrationHandler.run();
            
            expect(result.success).toBe(true);
            
            // Verify connection handling was efficient
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            expect(report.migration_execution.status).toBe('completed');
        });
    });

    describe('Migration Reporting and Monitoring', () => {
        test('should generate comprehensive migration reports', async () => {
            setupValidDatabase();
            setupSampleMigrations();
            
            const result = await migrationHandler.run();
            
            expect(result.success).toBe(true);
            
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            
            // Verify report structure
            expect(report.migration_execution).toBeDefined();
            expect(report.migration_status).toBeDefined();
            expect(report.environment).toBeDefined();
            
            // Verify execution details
            expect(report.migration_execution.timestamp).toBeDefined();
            expect(report.migration_execution.duration_ms).toBeGreaterThan(0);
            expect(report.migration_execution.status).toBe('completed');
            
            // Verify environment information
            expect(report.environment.node_version).toBeDefined();
            expect(report.environment.platform).toBeDefined();
        });

        test('should track migration performance metrics', async () => {
            setupValidDatabase();
            setupPerformanceTrackingMigrations();
            
            const result = await migrationHandler.run();
            
            expect(result.success).toBe(true);
            
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            
            // Verify performance metrics
            expect(report.migration_execution.duration_ms).toBeGreaterThan(0);
            expect(report.migration_status.applied).toBeGreaterThan(0);
        });

        test('should create audit trail for migration changes', async () => {
            setupValidDatabase();
            setupAuditableMigrations();
            
            const result = await migrationHandler.run();
            
            expect(result.success).toBe(true);
            
            // Verify audit information is captured
            const report = JSON.parse(fs.readFileSync(result.reportFile, 'utf8'));
            expect(report.migration_execution.database_url_hash).toBeDefined();
            expect(report.environment.build_number).toBeDefined();
            
            // Verify log file contains detailed information
            expect(fs.existsSync('migration.log')).toBe(true);
            const logContent = fs.readFileSync('migration.log', 'utf8');
            expect(logContent).toContain('Starting database migration execution');
            expect(logContent).toContain('Migrations applied successfully');
        });
    });

    // Helper functions
    function setupTestEnvironment() {
        // Create Prisma schema
        fs.mkdirSync('prisma', { recursive: true });
        fs.writeFileSync('prisma/schema.prisma', `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  role  String  @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Organization {
  id    Int     @id @default(autoincrement())
  name  String
  users User[]
}
        `);

        // Mock Prisma CLI commands
        setupMockPrismaCLI();
    }

    function setupValidDatabase() {
        process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/farmtally_test';
    }

    function setupMockPrismaCLI() {
        if (process.platform !== 'win32') {
            const prismaScript = `#!/bin/bash
case "$*" in
    "migrate deploy")
        echo "Environment variables loaded from .env"
        echo "Prisma schema loaded from prisma/schema.prisma"
        echo "Datasource \\"db\\": PostgreSQL database"
        echo ""
        echo "3 migrations found in prisma/migrations"
        echo ""
        echo "Following migration was applied:"
        echo "20231201000000_init"
        echo "20231202000000_add_organizations"
        echo "20231203000000_add_user_roles"
        echo ""
        echo "All migrations have been successfully applied."
        ;;
    "migrate status")
        echo "Environment variables loaded from .env"
        echo "Prisma schema loaded from prisma/schema.prisma"
        echo "Datasource \\"db\\": PostgreSQL database"
        echo ""
        echo "Database schema is up to date!"
        echo ""
        echo "✓ 20231201000000_init"
        echo "✓ 20231202000000_add_organizations"  
        echo "✓ 20231203000000_add_user_roles"
        ;;
    "db pull --preview-feature --force")
        echo "Introspecting based on datasource defined in prisma/schema.prisma"
        echo "Introspected 2 models and wrote them into prisma/schema.prisma"
        ;;
    "generate")
        echo "Environment variables loaded from .env"
        echo "Prisma schema loaded from prisma/schema.prisma"
        echo ""
        echo "✓ Generated Prisma Client"
        ;;
    *)
        echo "Mock Prisma CLI - Command: $*" >&2
        exit 0
        ;;
esac`;
            
            fs.writeFileSync('npx', prismaScript);
            fs.chmodSync('npx', 0o755);
            process.env.PATH = `${tempDir}:${process.env.PATH}`;
        }
    }

    function setupSampleMigrations() {
        fs.mkdirSync('prisma/migrations/20231201000000_init', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231201000000_init/migration.sql', `
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
        `);

        fs.mkdirSync('prisma/migrations/20231202000000_add_organizations', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231202000000_add_organizations/migration.sql', `
-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);
        `);
    }

    function setupComplexMigrations() {
        setupSampleMigrations();
        
        fs.mkdirSync('prisma/migrations/20231203000000_add_user_roles', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231203000000_add_user_roles/migration.sql', `
-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';
ALTER TABLE "User" ADD COLUMN "organizationId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        `);
    }

    function setupFailingMigration() {
        fs.mkdirSync('prisma/migrations/20231204000000_failing_migration', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231204000000_failing_migration/migration.sql', `
-- This migration will fail
ALTER TABLE "NonExistentTable" ADD COLUMN "newColumn" TEXT;
        `);

        // Update mock to simulate failure
        const failingPrismaScript = `#!/bin/bash
case "$*" in
    "migrate deploy")
        echo "Error: Migration failed"
        echo "P3009: migrate found failed migration"
        exit 1
        ;;
    *)
        echo "Mock Prisma CLI - Command: $*" >&2
        exit 0
        ;;
esac`;
        
        fs.writeFileSync('npx', failingPrismaScript);
        fs.chmodSync('npx', 0o755);
    }

    function setupMigrationsWithSeedData() {
        setupSampleMigrations();
        
        // Create seed file
        fs.writeFileSync('prisma/seed.ts', `
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.create({
    data: {
      email: 'admin@farmtally.com',
      name: 'Admin User',
      role: 'ADMIN'
    }
  })
  
  console.log('Created admin user:', admin)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
        `);
    }

    function setupEnvironmentSpecificMigrations(environment) {
        setupSampleMigrations();
        
        if (environment === 'production') {
            fs.mkdirSync('prisma/migrations/20231205000000_production_indexes', { recursive: true });
            fs.writeFileSync('prisma/migrations/20231205000000_production_indexes/migration.sql', `
-- Production-specific indexes for performance
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "Organization_name_idx" ON "Organization"("name");
            `);
        }
    }

    function setupLargeDatasetMigrations() {
        setupSampleMigrations();
        
        fs.mkdirSync('prisma/migrations/20231206000000_large_dataset', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231206000000_large_dataset/migration.sql', `
-- Migration that simulates large dataset operations
CREATE TABLE "LargeTable" (
    "id" SERIAL NOT NULL,
    "data" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LargeTable_pkey" PRIMARY KEY ("id")
);

-- Insert sample data (simulated)
-- INSERT INTO "LargeTable" ("data") SELECT 'sample_' || generate_series(1, 10000);
        `);
    }

    function setupProductionConstraintMigrations() {
        setupSampleMigrations();
        
        fs.mkdirSync('prisma/migrations/20231207000000_production_constraints', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231207000000_production_constraints/migration.sql', `
-- Production constraints and validations
ALTER TABLE "User" ADD CONSTRAINT "User_email_check" CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_name_check" CHECK (length(name) >= 2);
        `);
    }

    function setupCorruptedMigrations() {
        fs.mkdirSync('prisma/migrations/20231208000000_corrupted', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231208000000_corrupted/migration.sql', `
-- Corrupted SQL syntax
INVALID SQL SYNTAX HERE
CREATE TABLE "Test" (
    "id" SERIAL NOT NULL
    -- Missing closing parenthesis and semicolon
        `);
    }

    function setupConflictingMigrations() {
        setupSampleMigrations();
        
        fs.mkdirSync('prisma/migrations/20231209000000_conflicting', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231209000000_conflicting/migration.sql', `
-- This migration conflicts with existing schema
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "different_structure" TEXT
);
        `);
    }

    function setupPartialFailureMigrations() {
        fs.mkdirSync('prisma/migrations/20231210000000_partial_failure', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231210000000_partial_failure/migration.sql', `
-- First part succeeds
CREATE TABLE "TempTable" (
    "id" SERIAL NOT NULL,
    "data" TEXT
);

-- Second part fails
ALTER TABLE "NonExistentTable" ADD COLUMN "newColumn" TEXT;
        `);
    }

    function setupLargeMigrationFiles() {
        setupSampleMigrations();
        
        fs.mkdirSync('prisma/migrations/20231211000000_large_file', { recursive: true });
        
        // Create a large migration file (simulated)
        let largeMigration = '-- Large migration file\n';
        for (let i = 0; i < 1000; i++) {
            largeMigration += `-- Comment line ${i}\n`;
            largeMigration += `CREATE INDEX IF NOT EXISTS "idx_${i}" ON "User"("id");\n`;
            largeMigration += `DROP INDEX IF EXISTS "idx_${i}";\n`;
        }
        
        fs.writeFileSync('prisma/migrations/20231211000000_large_file/migration.sql', largeMigration);
    }

    function setupMemoryIntensiveMigrations() {
        setupSampleMigrations();
        
        fs.mkdirSync('prisma/migrations/20231212000000_memory_intensive', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231212000000_memory_intensive/migration.sql', `
-- Memory intensive operations (simulated)
CREATE TABLE "MemoryTest" (
    "id" SERIAL NOT NULL,
    "large_text" TEXT,
    "json_data" JSONB
);

-- Simulate large data operations
-- INSERT INTO "MemoryTest" SELECT generate_series(1, 100000), repeat('x', 1000), '{}';
        `);
    }

    function setupConnectionPoolingMigrations() {
        setupSampleMigrations();
        
        fs.mkdirSync('prisma/migrations/20231213000000_connection_pooling', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231213000000_connection_pooling/migration.sql', `
-- Migration that tests connection handling
CREATE TABLE "ConnectionTest" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW()
);

-- Multiple operations to test connection pooling
INSERT INTO "ConnectionTest" DEFAULT VALUES;
SELECT COUNT(*) FROM "ConnectionTest";
        `);
    }

    function setupPerformanceTrackingMigrations() {
        setupSampleMigrations();
        
        fs.mkdirSync('prisma/migrations/20231214000000_performance_tracking', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231214000000_performance_tracking/migration.sql', `
-- Performance tracking migration
CREATE TABLE "PerformanceTest" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP DEFAULT NOW(),
    "data" TEXT
);

CREATE INDEX "PerformanceTest_timestamp_idx" ON "PerformanceTest"("timestamp");
        `);
    }

    function setupAuditableMigrations() {
        setupSampleMigrations();
        
        fs.mkdirSync('prisma/migrations/20231215000000_auditable', { recursive: true });
        fs.writeFileSync('prisma/migrations/20231215000000_auditable/migration.sql', `
-- Auditable migration with tracking
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP DEFAULT NOW(),
    "user_id" INTEGER,
    "details" JSONB
);

-- Add audit triggers (simulated)
-- CREATE OR REPLACE FUNCTION audit_trigger() RETURNS TRIGGER AS ...
        `);
    }
});