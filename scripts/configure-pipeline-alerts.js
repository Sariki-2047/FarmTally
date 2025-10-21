#!/usr/bin/env node

/**
 * Pipeline Alerting Configuration
 * Configures alerts for pipeline performance issues
 */

const fs = require('fs');
const path = require('path');

class PipelineAlerting {
    constructor() {
        this.configFile = path.join(__dirname, '../pipeline-alerts-config.json');
        this.defaultConfig = {
            enabled: true,
            thresholds: {
                buildTimeMinutes: 15,
                stageTimeMinutes: 10,
                failureRatePercent: 20,
                memoryUsagePercent: 80,
                cpuUsagePercent: 85,
                consecutiveFailures: 3
            },
            notifications: {
                email: {
                    enabled: false,
                    recipients: [],
                    smtpConfig: {
                        host: '',
                        port: 587,
                        secure: false,
                        auth: {
                            user: '',
                            pass: ''
                        }
                    }
                },
                slack: {
                    enabled: false,
                    webhookUrl: '',
                    channel: '#deployments',
                    username: 'Jenkins Pipeline'
                },
                webhook: {
                    enabled: false,
                    url: '',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            },
            alertTypes: {
                SLOW_BUILD: {
                    enabled: true,
                    severity: 'warning',
                    message: 'Build is taking longer than expected'
                },
                HIGH_MEMORY: {
                    enabled: true,
                    severity: 'warning',
                    message: 'High memory usage detected'
                },
                HIGH_CPU: {
                    enabled: true,
                    severity: 'warning',
                    message: 'High CPU usage detected'
                },
                HIGH_FAILURE_RATE: {
                    enabled: true,
                    severity: 'critical',
                    message: 'High failure rate detected'
                },
                CONSECUTIVE_FAILURES: {
                    enabled: true,
                    severity: 'critical',
                    message: 'Multiple consecutive failures detected'
                },
                STAGE_TIMEOUT: {
                    enabled: true,
                    severity: 'error',
                    message: 'Stage execution timeout'
                }
            }
        };
    }

    /**
     * Load configuration
     */
    loadConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                const data = fs.readFileSync(this.configFile, 'utf8');
                return { ...this.defaultConfig, ...JSON.parse(data) };
            }
        } catch (error) {
            console.warn(`Warning: Error loading alert config: ${error.message}`);
        }
        return this.defaultConfig;
    }

    /**
     * Save configuration
     */
    saveConfig(config) {
        try {
            fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
            console.log(`Alert configuration saved to: ${this.configFile}`);
        } catch (error) {
            console.error(`Error saving alert config: ${error.message}`);
        }
    }

    /**
     * Initialize default configuration
     */
    initializeConfig() {
        const config = this.loadConfig();
        this.saveConfig(config);
        
        console.log('Pipeline alerting configuration initialized');
        console.log('Edit the configuration file to customize settings:');
        console.log(`  ${this.configFile}`);
        
        return config;
    }

    /**
     * Send alert notification
     */
    async sendAlert(alertType, message, severity = 'warning', metadata = {}) {
        const config = this.loadConfig();
        
        if (!config.enabled) {
            console.log('Alerting is disabled');
            return;
        }

        const alertConfig = config.alertTypes[alertType];
        if (!alertConfig || !alertConfig.enabled) {
            console.log(`Alert type ${alertType} is disabled`);
            return;
        }

        const alert = {
            type: alertType,
            severity: severity,
            message: message,
            timestamp: new Date().toISOString(),
            buildNumber: process.env.BUILD_NUMBER || 'unknown',
            jobName: process.env.JOB_NAME || 'unknown',
            buildUrl: process.env.BUILD_URL || '',
            metadata: metadata
        };

        console.log(`[ALERT-${severity.toUpperCase()}] ${alertType}: ${message}`);

        // Send notifications
        const notifications = [];
        
        if (config.notifications.email.enabled) {
            notifications.push(this.sendEmailAlert(alert, config.notifications.email));
        }
        
        if (config.notifications.slack.enabled) {
            notifications.push(this.sendSlackAlert(alert, config.notifications.slack));
        }
        
        if (config.notifications.webhook.enabled) {
            notifications.push(this.sendWebhookAlert(alert, config.notifications.webhook));
        }

        try {
            await Promise.allSettled(notifications);
        } catch (error) {
            console.error(`Error sending notifications: ${error.message}`);
        }

        return alert;
    }

    /**
     * Send email alert
     */
    async sendEmailAlert(alert, emailConfig) {
        // This is a placeholder - you would integrate with your email service
        console.log('Email alert would be sent to:', emailConfig.recipients);
        console.log('Subject:', `Pipeline Alert: ${alert.type}`);
        console.log('Body:', this.formatAlertMessage(alert));
        
        // Example integration with nodemailer:
        /*
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransporter(emailConfig.smtpConfig);
        
        const mailOptions = {
            from: emailConfig.smtpConfig.auth.user,
            to: emailConfig.recipients.join(','),
            subject: `Pipeline Alert: ${alert.type}`,
            html: this.formatAlertMessage(alert, 'html')
        };
        
        return transporter.sendMail(mailOptions);
        */
    }

    /**
     * Send Slack alert
     */
    async sendSlackAlert(alert, slackConfig) {
        // This is a placeholder - you would integrate with Slack API
        console.log('Slack alert would be sent to:', slackConfig.channel);
        console.log('Message:', this.formatAlertMessage(alert, 'slack'));
        
        // Example integration with Slack webhook:
        /*
        const axios = require('axios');
        
        const payload = {
            channel: slackConfig.channel,
            username: slackConfig.username,
            text: this.formatAlertMessage(alert, 'slack'),
            attachments: [{
                color: this.getSeverityColor(alert.severity),
                fields: [
                    { title: 'Build', value: alert.buildNumber, short: true },
                    { title: 'Job', value: alert.jobName, short: true },
                    { title: 'Time', value: alert.timestamp, short: true }
                ]
            }]
        };
        
        return axios.post(slackConfig.webhookUrl, payload);
        */
    }

    /**
     * Send webhook alert
     */
    async sendWebhookAlert(alert, webhookConfig) {
        // This is a placeholder - you would make HTTP request to webhook
        console.log('Webhook alert would be sent to:', webhookConfig.url);
        console.log('Payload:', JSON.stringify(alert, null, 2));
        
        // Example webhook integration:
        /*
        const axios = require('axios');
        
        return axios({
            method: webhookConfig.method,
            url: webhookConfig.url,
            headers: webhookConfig.headers,
            data: alert
        });
        */
    }

    /**
     * Format alert message
     */
    formatAlertMessage(alert, format = 'text') {
        const baseMessage = `
Pipeline Alert: ${alert.type}
Severity: ${alert.severity.toUpperCase()}
Message: ${alert.message}
Build: ${alert.buildNumber}
Job: ${alert.jobName}
Time: ${alert.timestamp}
`;

        if (alert.buildUrl) {
            return baseMessage + `Build URL: ${alert.buildUrl}\n`;
        }

        switch (format) {
            case 'html':
                return `
<h2>Pipeline Alert: ${alert.type}</h2>
<p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
<p><strong>Message:</strong> ${alert.message}</p>
<p><strong>Build:</strong> ${alert.buildNumber}</p>
<p><strong>Job:</strong> ${alert.jobName}</p>
<p><strong>Time:</strong> ${alert.timestamp}</p>
${alert.buildUrl ? `<p><a href="${alert.buildUrl}">View Build</a></p>` : ''}
`;
            
            case 'slack':
                return `🚨 *Pipeline Alert: ${alert.type}*\n*Severity:* ${alert.severity.toUpperCase()}\n*Message:* ${alert.message}\n*Build:* ${alert.buildNumber}\n*Job:* ${alert.jobName}${alert.buildUrl ? `\n<${alert.buildUrl}|View Build>` : ''}`;
            
            default:
                return baseMessage;
        }
    }

    /**
     * Get severity color for Slack
     */
    getSeverityColor(severity) {
        switch (severity) {
            case 'critical': return 'danger';
            case 'error': return 'warning';
            case 'warning': return 'warning';
            default: return 'good';
        }
    }

    /**
     * Test alert configuration
     */
    async testAlerts() {
        console.log('Testing alert configuration...');
        
        const testAlerts = [
            {
                type: 'SLOW_BUILD',
                message: 'Test slow build alert',
                severity: 'warning'
            },
            {
                type: 'HIGH_FAILURE_RATE',
                message: 'Test high failure rate alert',
                severity: 'critical'
            }
        ];

        for (const alert of testAlerts) {
            await this.sendAlert(alert.type, alert.message, alert.severity, { test: true });
            console.log(`Test alert sent: ${alert.type}`);
        }
    }

    /**
     * Check metrics and send alerts if needed
     */
    checkMetricsAndAlert(metricsFile = '../pipeline-metrics.json') {
        try {
            const metricsPath = path.resolve(__dirname, metricsFile);
            if (!fs.existsSync(metricsPath)) {
                console.log('No metrics file found, skipping alert check');
                return;
            }

            const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
            const config = this.loadConfig();
            
            this.analyzeMetricsForAlerts(metrics, config);
            
        } catch (error) {
            console.error(`Error checking metrics for alerts: ${error.message}`);
        }
    }

    /**
     * Analyze metrics and trigger alerts
     */
    async analyzeMetricsForAlerts(metrics, config) {
        const builds = Object.values(metrics.builds || {});
        if (builds.length === 0) return;

        const recentBuilds = builds.slice(-10);
        const latestBuild = builds[builds.length - 1];

        // Check failure rate
        const failedBuilds = recentBuilds.filter(build => {
            const stages = Object.values(build.stages || {});
            return stages.some(stage => stage.status === 'failed' || stage.status === 'error');
        });

        const failureRate = (failedBuilds.length / recentBuilds.length) * 100;
        if (failureRate > config.thresholds.failureRatePercent) {
            await this.sendAlert(
                'HIGH_FAILURE_RATE',
                `Failure rate is ${Math.round(failureRate)}% (${failedBuilds.length}/${recentBuilds.length} builds)`,
                'critical',
                { failureRate, recentBuilds: recentBuilds.length }
            );
        }

        // Check consecutive failures
        let consecutiveFailures = 0;
        for (let i = builds.length - 1; i >= 0; i--) {
            const build = builds[i];
            const stages = Object.values(build.stages || {});
            const hasFailed = stages.some(stage => stage.status === 'failed' || stage.status === 'error');
            
            if (hasFailed) {
                consecutiveFailures++;
            } else {
                break;
            }
        }

        if (consecutiveFailures >= config.thresholds.consecutiveFailures) {
            await this.sendAlert(
                'CONSECUTIVE_FAILURES',
                `${consecutiveFailures} consecutive build failures detected`,
                'critical',
                { consecutiveFailures }
            );
        }

        // Check latest build performance
        if (latestBuild && latestBuild.stages) {
            const stages = Object.values(latestBuild.stages);
            
            for (const stage of stages) {
                // Check stage duration
                if (stage.durationMinutes && stage.durationMinutes > config.thresholds.stageTimeMinutes) {
                    await this.sendAlert(
                        'SLOW_BUILD',
                        `Stage "${stage.name}" took ${stage.durationMinutes} minutes`,
                        'warning',
                        { stageName: stage.name, duration: stage.durationMinutes }
                    );
                }

                // Check memory usage
                if (stage.resourceUsage && stage.resourceUsage.memoryUsagePercent > config.thresholds.memoryUsagePercent) {
                    await this.sendAlert(
                        'HIGH_MEMORY',
                        `Stage "${stage.name}" used ${stage.resourceUsage.memoryUsagePercent}% memory`,
                        'warning',
                        { stageName: stage.name, memoryUsage: stage.resourceUsage.memoryUsagePercent }
                    );
                }
            }
        }
    }
}

// CLI interface
if (require.main === module) {
    const alerting = new PipelineAlerting();
    const command = process.argv[2];

    switch (command) {
        case 'init':
            alerting.initializeConfig();
            break;

        case 'test':
            alerting.testAlerts();
            break;

        case 'check':
            alerting.checkMetricsAndAlert();
            break;

        case 'send':
            const alertType = process.argv[3];
            const message = process.argv[4];
            const severity = process.argv[5] || 'warning';
            
            if (!alertType || !message) {
                console.error('Usage: configure-pipeline-alerts.js send <alert-type> <message> [severity]');
                process.exit(1);
            }
            
            alerting.sendAlert(alertType, message, severity);
            break;

        default:
            console.log('Usage: configure-pipeline-alerts.js <command>');
            console.log('Commands:');
            console.log('  init                                    - Initialize alert configuration');
            console.log('  test                                    - Test alert notifications');
            console.log('  check                                   - Check metrics and send alerts');
            console.log('  send <type> <message> [severity]        - Send test alert');
            process.exit(1);
    }
}

module.exports = PipelineAlerting;