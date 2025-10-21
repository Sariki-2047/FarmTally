#!/usr/bin/env node

/**
 * Pipeline Execution Monitor
 * Tracks build times, resource usage, and failure rates for Jenkins pipeline
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class PipelineMonitor {
    constructor() {
        this.metricsFile = path.join(__dirname, '../pipeline-metrics.json');
        this.alertThresholds = {
            buildTimeMinutes: 15,
            failureRatePercent: 20,
            memoryUsagePercent: 80,
            cpuUsagePercent: 85
        };
    }

    /**
     * Start monitoring a pipeline stage
     */
    startStage(stageName) {
        const timestamp = new Date().toISOString();
        const stageData = {
            name: stageName,
            startTime: timestamp,
            startTimestamp: Date.now(),
            buildNumber: process.env.BUILD_NUMBER || 'local',
            commitSha: process.env.GIT_COMMIT || 'unknown',
            resourceUsage: this.getResourceUsage()
        };

        console.log(`[MONITOR] Starting stage: ${stageName} at ${timestamp}`);
        this.saveStageData(stageData, 'start');
        return stageData;
    }

    /**
     * End monitoring a pipeline stage
     */
    endStage(stageName, status = 'success', errorMessage = null) {
        const timestamp = new Date().toISOString();
        const endData = {
            name: stageName,
            endTime: timestamp,
            endTimestamp: Date.now(),
            status: status,
            errorMessage: errorMessage,
            resourceUsage: this.getResourceUsage()
        };

        // Calculate duration
        const startData = this.getStageStartData(stageName);
        if (startData) {
            endData.durationMs = endData.endTimestamp - startData.startTimestamp;
            endData.durationMinutes = Math.round(endData.durationMs / 60000 * 100) / 100;
        }

        console.log(`[MONITOR] Ending stage: ${stageName} - Status: ${status} - Duration: ${endData.durationMinutes || 'unknown'}min`);
        this.saveStageData(endData, 'end');
        
        // Check for alerts
        this.checkAlerts(endData);
        
        return endData;
    }

    /**
     * Get current system resource usage
     */
    getResourceUsage() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        return {
            memoryUsagePercent: Math.round((usedMem / totalMem) * 100),
            memoryUsedMB: Math.round(usedMem / 1024 / 1024),
            memoryTotalMB: Math.round(totalMem / 1024 / 1024),
            cpuCount: os.cpus().length,
            loadAverage: os.loadavg(),
            platform: os.platform(),
            arch: os.arch()
        };
    }

    /**
     * Save stage data to metrics file
     */
    saveStageData(stageData, type) {
        let metrics = this.loadMetrics();
        
        if (!metrics.builds) metrics.builds = {};
        if (!metrics.stages) metrics.stages = {};
        
        const buildNumber = stageData.buildNumber || process.env.BUILD_NUMBER || 'local';
        
        if (!metrics.builds[buildNumber]) {
            metrics.builds[buildNumber] = {
                buildNumber: buildNumber,
                commitSha: stageData.commitSha || process.env.GIT_COMMIT || 'unknown',
                startTime: type === 'start' ? stageData.startTime : null,
                stages: {}
            };
        }

        if (type === 'start') {
            metrics.builds[buildNumber].stages[stageData.name] = stageData;
        } else if (type === 'end') {
            if (metrics.builds[buildNumber].stages[stageData.name]) {
                Object.assign(metrics.builds[buildNumber].stages[stageData.name], stageData);
            } else {
                metrics.builds[buildNumber].stages[stageData.name] = stageData;
            }
        }

        this.saveMetrics(metrics);
    }

    /**
     * Get stage start data
     */
    getStageStartData(stageName) {
        const metrics = this.loadMetrics();
        const buildNumber = process.env.BUILD_NUMBER || 'local';
        
        if (metrics.builds && metrics.builds[buildNumber] && metrics.builds[buildNumber].stages) {
            return metrics.builds[buildNumber].stages[stageName];
        }
        return null;
    }

    /**
     * Load metrics from file
     */
    loadMetrics() {
        try {
            if (fs.existsSync(this.metricsFile)) {
                const data = fs.readFileSync(this.metricsFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.warn(`[MONITOR] Error loading metrics: ${error.message}`);
        }
        return { builds: {}, summary: {} };
    }

    /**
     * Save metrics to file
     */
    saveMetrics(metrics) {
        try {
            // Ensure directory exists
            const dir = path.dirname(this.metricsFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
        } catch (error) {
            console.error(`[MONITOR] Error saving metrics: ${error.message}`);
        }
    }

    /**
     * Generate pipeline performance report
     */
    generateReport() {
        const metrics = this.loadMetrics();
        const builds = Object.values(metrics.builds || {});
        
        if (builds.length === 0) {
            console.log('[MONITOR] No build data available for report');
            return;
        }

        const report = {
            totalBuilds: builds.length,
            successfulBuilds: 0,
            failedBuilds: 0,
            averageBuildTime: 0,
            stagePerformance: {},
            resourceUsage: {
                averageMemory: 0,
                peakMemory: 0,
                averageCpu: 0
            },
            recentBuilds: builds.slice(-10)
        };

        let totalBuildTime = 0;
        let totalMemory = 0;
        let peakMemory = 0;

        builds.forEach(build => {
            const stages = Object.values(build.stages || {});
            let buildFailed = false;
            let buildTime = 0;

            stages.forEach(stage => {
                if (stage.status === 'failed' || stage.status === 'error') {
                    buildFailed = true;
                }
                
                if (stage.durationMs) {
                    buildTime += stage.durationMs;
                }

                // Track stage performance
                if (!report.stagePerformance[stage.name]) {
                    report.stagePerformance[stage.name] = {
                        totalRuns: 0,
                        successfulRuns: 0,
                        averageTime: 0,
                        totalTime: 0
                    };
                }

                const stageStats = report.stagePerformance[stage.name];
                stageStats.totalRuns++;
                if (stage.status === 'success') {
                    stageStats.successfulRuns++;
                }
                if (stage.durationMs) {
                    stageStats.totalTime += stage.durationMs;
                    stageStats.averageTime = stageStats.totalTime / stageStats.totalRuns;
                }

                // Track resource usage
                if (stage.resourceUsage) {
                    totalMemory += stage.resourceUsage.memoryUsagePercent || 0;
                    peakMemory = Math.max(peakMemory, stage.resourceUsage.memoryUsagePercent || 0);
                }
            });

            if (buildFailed) {
                report.failedBuilds++;
            } else {
                report.successfulBuilds++;
            }

            totalBuildTime += buildTime;
        });

        report.averageBuildTime = Math.round(totalBuildTime / builds.length / 60000 * 100) / 100; // minutes
        report.failureRate = Math.round((report.failedBuilds / report.totalBuilds) * 100);
        report.resourceUsage.averageMemory = Math.round(totalMemory / builds.length);
        report.resourceUsage.peakMemory = peakMemory;

        console.log('\n=== PIPELINE PERFORMANCE REPORT ===');
        console.log(`Total Builds: ${report.totalBuilds}`);
        console.log(`Success Rate: ${Math.round((report.successfulBuilds / report.totalBuilds) * 100)}%`);
        console.log(`Failure Rate: ${report.failureRate}%`);
        console.log(`Average Build Time: ${report.averageBuildTime} minutes`);
        console.log(`Average Memory Usage: ${report.resourceUsage.averageMemory}%`);
        console.log(`Peak Memory Usage: ${report.resourceUsage.peakMemory}%`);
        
        console.log('\nStage Performance:');
        Object.entries(report.stagePerformance).forEach(([stageName, stats]) => {
            const successRate = Math.round((stats.successfulRuns / stats.totalRuns) * 100);
            const avgTime = Math.round(stats.averageTime / 60000 * 100) / 100;
            console.log(`  ${stageName}: ${successRate}% success, ${avgTime}min avg`);
        });

        return report;
    }

    /**
     * Check for performance alerts
     */
    checkAlerts(stageData) {
        const alerts = [];

        // Check build time
        if (stageData.durationMinutes && stageData.durationMinutes > this.alertThresholds.buildTimeMinutes) {
            alerts.push({
                type: 'SLOW_BUILD',
                message: `Stage ${stageData.name} took ${stageData.durationMinutes} minutes (threshold: ${this.alertThresholds.buildTimeMinutes}min)`,
                severity: 'warning'
            });
        }

        // Check memory usage
        if (stageData.resourceUsage && stageData.resourceUsage.memoryUsagePercent > this.alertThresholds.memoryUsagePercent) {
            alerts.push({
                type: 'HIGH_MEMORY',
                message: `High memory usage: ${stageData.resourceUsage.memoryUsagePercent}% (threshold: ${this.alertThresholds.memoryUsagePercent}%)`,
                severity: 'warning'
            });
        }

        // Check failure rate
        const metrics = this.loadMetrics();
        const recentBuilds = Object.values(metrics.builds || {}).slice(-10);
        const recentFailures = recentBuilds.filter(build => {
            const stages = Object.values(build.stages || {});
            return stages.some(stage => stage.status === 'failed' || stage.status === 'error');
        });

        const failureRate = (recentFailures.length / recentBuilds.length) * 100;
        if (failureRate > this.alertThresholds.failureRatePercent) {
            alerts.push({
                type: 'HIGH_FAILURE_RATE',
                message: `High failure rate: ${Math.round(failureRate)}% in last 10 builds (threshold: ${this.alertThresholds.failureRatePercent}%)`,
                severity: 'critical'
            });
        }

        // Log alerts
        alerts.forEach(alert => {
            console.log(`[ALERT-${alert.severity.toUpperCase()}] ${alert.message}`);
        });

        return alerts;
    }

    /**
     * Clean old metrics data
     */
    cleanOldMetrics(daysToKeep = 30) {
        const metrics = this.loadMetrics();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        let cleaned = 0;
        Object.keys(metrics.builds || {}).forEach(buildNumber => {
            const build = metrics.builds[buildNumber];
            const stages = Object.values(build.stages || {});
            
            if (stages.length > 0) {
                const buildDate = new Date(stages[0].startTime || stages[0].endTime);
                if (buildDate < cutoffDate) {
                    delete metrics.builds[buildNumber];
                    cleaned++;
                }
            }
        });

        if (cleaned > 0) {
            this.saveMetrics(metrics);
            console.log(`[MONITOR] Cleaned ${cleaned} old build records`);
        }

        return cleaned;
    }
}

// CLI interface
if (require.main === module) {
    const monitor = new PipelineMonitor();
    const command = process.argv[2];
    const stageName = process.argv[3];
    const status = process.argv[4];
    const errorMessage = process.argv[5];

    switch (command) {
        case 'start':
            if (!stageName) {
                console.error('Usage: pipeline-monitor.js start <stage-name>');
                process.exit(1);
            }
            monitor.startStage(stageName);
            break;

        case 'end':
            if (!stageName) {
                console.error('Usage: pipeline-monitor.js end <stage-name> [status] [error-message]');
                process.exit(1);
            }
            monitor.endStage(stageName, status || 'success', errorMessage);
            break;

        case 'report':
            monitor.generateReport();
            break;

        case 'clean':
            const days = parseInt(process.argv[3]) || 30;
            monitor.cleanOldMetrics(days);
            break;

        case 'resource-check':
            const usage = monitor.getResourceUsage();
            console.log('Current Resource Usage:');
            console.log(`Memory: ${usage.memoryUsagePercent}% (${usage.memoryUsedMB}MB / ${usage.memoryTotalMB}MB)`);
            console.log(`CPU Cores: ${usage.cpuCount}`);
            console.log(`Load Average: ${usage.loadAverage.map(l => l.toFixed(2)).join(', ')}`);
            break;

        default:
            console.log('Usage: pipeline-monitor.js <command> [args]');
            console.log('Commands:');
            console.log('  start <stage-name>                 - Start monitoring a stage');
            console.log('  end <stage-name> [status] [error]  - End monitoring a stage');
            console.log('  report                              - Generate performance report');
            console.log('  clean [days]                        - Clean old metrics (default: 30 days)');
            console.log('  resource-check                      - Show current resource usage');
            process.exit(1);
    }
}

module.exports = PipelineMonitor;