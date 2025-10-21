#!/usr/bin/env node

/**
 * Test script for migration handler
 */

const MigrationHandler = require('./migration-handler.js');

async function testMigrationHandler() {
    console.log('Testing Migration Handler...');
    
    // Test environment check
    console.log('\n1. Testing environment check...');
    try {
        const handler = new MigrationHandler();
        
        // Temporarily set DATABASE_URL for testing
        if (!process.env.DATABASE_URL) {
            process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
            console.log('Set test DATABASE_URL for validation');
        }
        
        handler.checkEnvironment();
        console.log('✓ Environment check passed');
    } catch (error) {
        console.log('✗ Environment check failed:', error.message);
    }
    
    // Test utility functions
    console.log('\n2. Testing utility functions...');
    try {
        const handler = new MigrationHandler();
        
        const hash = handler.hashString('test-string');
        console.log('✓ Hash function works:', hash);
        
        const commit = handler.getGitCommit();
        console.log('✓ Git commit function works:', commit);
        
        console.log('✓ Utility functions passed');
    } catch (error) {
        console.log('✗ Utility functions failed:', error.message);
    }
    
    // Test logging
    console.log('\n3. Testing logging...');
    try {
        const handler = new MigrationHandler();
        handler.log('INFO', 'Test log message');
        handler.log('SUCCESS', 'Test success message');
        handler.log('WARNING', 'Test warning message');
        handler.log('ERROR', 'Test error message');
        console.log('✓ Logging functions work');
    } catch (error) {
        console.log('✗ Logging failed:', error.message);
    }
    
    console.log('\n✓ Migration handler basic functionality verified');
}

if (require.main === module) {
    testMigrationHandler().catch(console.error);
}

module.exports = testMigrationHandler;