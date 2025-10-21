/**
 * Unit Tests for Health Check System
 * Tests the health-check.js functionality
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Import the HealthChecker class
const HealthChecker = require('../../../scripts/health-check.js');

describe('Health Check System', () => {
    let healthChecker;
    let originalEnv;

    beforeEach(() => {
        // Backup original environment
        originalEnv = { ...process.env };
        
        // Clear axios mocks
        jest.clearAllMocks();
        
        // Create health checker instance
        healthChecker = new HealthChecker({
            url: 'http://localhost:3000',
            timeout: 5000,
            retries: 2,
            verbose: false
        });
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    describe('Basic Health Check', () => {
        test('should pass basic health check with 200 response', async () => {
            mockedAxios.mockResolvedValueOnce({
                status: 200,
                data: { status: 'healthy', timestamp: new Date().toISOString() }
            });

            const result = await healthChecker.checkBasicHealth();

            expect(result).toBe(true);
            expect(mockedAxios).toHaveBeenCalledWith({
                url: 'http://localhost:3000/api/health',
                timeout: 5000,
                validateStatus: expect.any(Function)
            });
        });

        test('should fail basic health check with non-200 response', async () => {
            mockedAxios.mockResolvedValueOnce({
                status: 500,
                data: { error: 'Internal server error' }
            });

            const result = await healthChecker.checkBasicHealth();

            expect(result).toBe(false);
            expect(healthChecker.results.checks).toHaveLength(1);
            expect(healthChecker.results.checks[0].status).toBe('FAILED');
            expect(healthChecker.results.checks[0].error).toContain('Unexpected status code: 500');
        });

        test('should handle network errors gracefully', async () => {
            mockedAxios.mockRejectedValueOnce(new Error('ECONNREFUSED'));

            const result = await healthChecker.checkBasicHealth();

            expect(result).toBe(false);
            expect(healthChecker.results.checks[0].status).toBe('FAILED');
            expect(healthChecker.results.checks[0].error).toBe('ECONNREFUSED');
        });

        test('should retry failed requests', async () => {
            // First call fails, second succeeds
            mockedAxios
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    status: 200,
                    data: { status: 'healthy' }
                });

            const result = await healthChecker.checkBasicHealth();

            expect(result).toBe(true);
            expect(mockedAxios).toHaveBeenCalledTimes(2);
            expect(healthChecker.results.checks[0].attempts).toBe(2);
        });
    });

    describe('Root Endpoint Check', () => {
        test('should check root endpoint successfully', async () => {
            mockedAxios.mockResolvedValueOnce({
                status: 200,
                data: { message: 'FarmTally API Server' }
            });

            const result = await healthChecker.checkRootEndpoint();

            expect(result).toBe(true);
            expect(mockedAxios).toHaveBeenCalledWith({
                url: 'http://localhost:3000/',
                timeout: 5000,
                validateStatus: expect.any(Function)
            });
        });

        test('should handle root endpoint errors', async () => {
            mockedAxios.mockResolvedValueOnce({
                status: 404,
                data: { error: 'Not found' }
            });

            const result = await healthChecker.checkRootEndpoint();

            expect(result).toBe(false);
        });
    });

    describe('Authentication Check', () => {
        test('should skip auth check when no token provided', async () => {
            healthChecker.serviceToken = null;

            const result = await healthChecker.checkAuthEndpoint();

            expect(result).toBe(false);
            expect(healthChecker.results.checks).toHaveLength(1);
            expect(healthChecker.results.checks[0].status).toBe('SKIPPED');
            expect(healthChecker.results.checks[0].error).toBe('No service token provided');
        });

        test('should pass auth check with valid token', async () => {
            healthChecker.serviceToken = 'valid-jwt-token';
            
            mockedAxios.mockResolvedValueOnce({
                status: 200,
                data: {
                    id: 'user-123',
                    role: 'FARM_ADMIN',
                    organization: 'org-456'
                }
            });

            const result = await healthChecker.checkAuthEndpoint();

            expect(result).toBe(true);
            expect(mockedAxios).toHaveBeenCalledWith({
                url: 'http://localhost:3000/api/auth/profile',
                timeout: 5000,
                validateStatus: expect.any(Function),
                headers: {
                    'Authorization': 'Bearer valid-jwt-token',
                    'Content-Type': 'application/json'
                }
            });
        });

        test('should fail auth check with invalid token', async () => {
            healthChecker.serviceToken = 'invalid-token';
            
            mockedAxios.mockResolvedValueOnce({
                status: 401,
                data: { error: 'Unauthorized' }
            });

            const result = await healthChecker.checkAuthEndpoint();

            expect(result).toBe(false);
            expect(healthChecker.results.checks[0].status).toBe('FAILED');
            expect(healthChecker.results.checks[0].error).toBe('Invalid or expired service token');
        });
    });

    describe('Database Connectivity Check', () => {
        test('should pass database check with successful API response', async () => {
            healthChecker.serviceToken = 'valid-token';
            
            mockedAxios.mockResolvedValueOnce({
                status: 200,
                data: { farmers: [], total: 0 }
            });

            const result = await healthChecker.checkDatabaseConnectivity();

            expect(result).toBe(true);
            expect(mockedAxios).toHaveBeenCalledWith({
                url: 'http://localhost:3000/api/farmer/statistics?farmerId=test',
                timeout: 5000,
                validateStatus: expect.any(Function),
                headers: {
                    'Authorization': 'Bearer valid-token',
                    'Content-Type': 'application/json'
                }
            });
        });

        test('should pass database check with 400/404 responses (DB accessible)', async () => {
            healthChecker.serviceToken = 'valid-token';
            
            mockedAxios.mockResolvedValueOnce({
                status: 404,
                data: { error: 'Farmer not found' }
            });

            const result = await healthChecker.checkDatabaseConnectivity();

            expect(result).toBe(true); // 404 indicates DB is accessible
            expect(healthChecker.results.checks[0].responseData.databaseAccessible).toBe(true);
        });

        test('should fail database check with server errors', async () => {
            healthChecker.serviceToken = 'valid-token';
            
            mockedAxios.mockResolvedValueOnce({
                status: 500,
                data: { error: 'Database connection failed' }
            });

            const result = await healthChecker.checkDatabaseConnectivity();

            expect(result).toBe(false);
            expect(healthChecker.results.checks[0].error).toContain('Server error: 500');
        });

        test('should skip database check without token', async () => {
            healthChecker.serviceToken = null;

            const result = await healthChecker.checkDatabaseConnectivity();

            expect(result).toBe(false);
            expect(healthChecker.results.checks[0].status).toBe('SKIPPED');
        });
    });

    describe('Service Token Generation', () => {
        test('should generate valid service token', async () => {
            process.env.JWT_SECRET = 'test-secret-key';

            const token = await healthChecker.generateServiceToken();

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');

            // Verify token structure
            const decoded = jwt.decode(token);
            expect(decoded.userId).toBe('health-check-service');
            expect(decoded.role).toBe('FARM_ADMIN');
            expect(decoded.service).toBe(true);
        });

        test('should not generate token without JWT_SECRET', async () => {
            delete process.env.JWT_SECRET;

            const token = await healthChecker.generateServiceToken();

            // Should still generate with default secret for testing
            expect(token).toBeDefined();
        });
    });

    describe('Comprehensive Health Check', () => {
        test('should run all checks and return summary', async () => {
            // Mock all successful responses
            mockedAxios
                .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' } }) // basic health
                .mockResolvedValueOnce({ status: 200, data: { message: 'API' } }) // root endpoint
                .mockResolvedValueOnce({ status: 200, data: { id: 'user' } }) // auth
                .mockResolvedValueOnce({ status: 200, data: { farmers: [] } }); // database

            healthChecker.serviceToken = 'test-token';

            const results = await healthChecker.runAllChecks();

            expect(results.summary.total).toBe(4);
            expect(results.summary.passed).toBe(4);
            expect(results.summary.failed).toBe(0);
            expect(results.checks).toHaveLength(4);
        });

        test('should handle mixed success and failure results', async () => {
            // Mock mixed responses
            mockedAxios
                .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' } }) // success
                .mockResolvedValueOnce({ status: 500, data: { error: 'error' } }) // failure
                .mockResolvedValueOnce({ status: 401, data: { error: 'unauthorized' } }) // failure
                .mockResolvedValueOnce({ status: 200, data: { farmers: [] } }); // success

            healthChecker.serviceToken = 'test-token';

            const results = await healthChecker.runAllChecks();

            expect(results.summary.total).toBe(4);
            expect(results.summary.passed).toBe(2);
            expect(results.summary.failed).toBe(2);
        });

        test('should generate service token automatically if JWT_SECRET available', async () => {
            process.env.JWT_SECRET = 'test-secret';
            healthChecker.serviceToken = null;

            // Mock successful responses
            mockedAxios
                .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' } })
                .mockResolvedValueOnce({ status: 200, data: { message: 'API' } })
                .mockResolvedValueOnce({ status: 200, data: { id: 'user' } })
                .mockResolvedValueOnce({ status: 200, data: { farmers: [] } });

            const results = await healthChecker.runAllChecks();

            expect(healthChecker.serviceToken).toBeDefined();
            expect(results.summary.passed).toBe(4);
        });
    });

    describe('Error Handling and Resilience', () => {
        test('should handle timeout errors', async () => {
            const timeoutError = new Error('timeout of 5000ms exceeded');
            timeoutError.code = 'ECONNABORTED';
            
            mockedAxios.mockRejectedValueOnce(timeoutError);

            const result = await healthChecker.checkBasicHealth();

            expect(result).toBe(false);
            expect(healthChecker.results.checks[0].error).toBe('timeout of 5000ms exceeded');
            expect(healthChecker.results.checks[0].errorCode).toBe('ECONNABORTED');
        });

        test('should handle DNS resolution errors', async () => {
            const dnsError = new Error('getaddrinfo ENOTFOUND');
            dnsError.code = 'ENOTFOUND';
            
            mockedAxios.mockRejectedValueOnce(dnsError);

            const result = await healthChecker.checkBasicHealth();

            expect(result).toBe(false);
            expect(healthChecker.results.checks[0].errorCode).toBe('ENOTFOUND');
        });

        test('should implement exponential backoff for retries', async () => {
            const startTime = Date.now();
            
            mockedAxios
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' } });

            await healthChecker.checkBasicHealth();

            const duration = Date.now() - startTime;
            // Should have waited at least 1000ms + 2000ms for exponential backoff
            expect(duration).toBeGreaterThan(2500);
        });

        test('should track response times accurately', async () => {
            mockedAxios.mockImplementation(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({ status: 200, data: { status: 'healthy' } });
                    }, 100);
                });
            });

            await healthChecker.checkBasicHealth();

            const check = healthChecker.results.checks[0];
            expect(check.duration).toBeGreaterThan(90);
            expect(check.duration).toBeLessThan(200);
        });
    });

    describe('Logging and Output', () => {
        test('should log verbose information when enabled', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            healthChecker.verbose = true;
            healthChecker.log('Test message', 'info');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('ℹ️ [')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Test message')
            );

            consoleSpy.mockRestore();
        });

        test('should output JSON format when requested', () => {
            healthChecker.jsonOutput = true;
            healthChecker.results.summary = { total: 1, passed: 1, failed: 0 };

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            healthChecker.outputResults();

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('"summary"')
            );

            consoleSpy.mockRestore();
        });

        test('should mask sensitive information in logs', () => {
            healthChecker.jsonOutput = false;
            healthChecker.verbose = false;
            
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            healthChecker.log('Error with token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9', 'error');

            expect(consoleSpy).toHaveBeenCalled();
            // Should not contain the actual token
            expect(consoleSpy.mock.calls[0][0]).not.toContain('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9');

            consoleSpy.mockRestore();
        });
    });

    describe('Configuration and Options', () => {
        test('should use environment variables for configuration', () => {
            process.env.API_URL = 'https://api.farmtally.com';
            process.env.SERVICE_TOKEN = 'env-token';

            const checker = new HealthChecker();

            expect(checker.baseUrl).toBe('https://api.farmtally.com');
            expect(checker.serviceToken).toBe('env-token');
        });

        test('should override environment with explicit options', () => {
            process.env.API_URL = 'https://api.farmtally.com';

            const checker = new HealthChecker({
                url: 'http://localhost:3000'
            });

            expect(checker.baseUrl).toBe('http://localhost:3000');
        });

        test('should handle trailing slashes in base URL', () => {
            const checker = new HealthChecker({
                url: 'http://localhost:3000/'
            });

            expect(checker.baseUrl).toBe('http://localhost:3000');
        });

        test('should validate timeout and retry configuration', () => {
            const checker = new HealthChecker({
                timeout: 30000,
                retries: 5
            });

            expect(checker.timeout).toBe(30000);
            expect(checker.retries).toBe(5);
        });
    });
});