"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Mail, 
  Shield, 
  Database, 
  Bell,
  Save,
  RefreshCw,
  Key,
  Globe,
  Server
} from "lucide-react";
import { toast } from "sonner";

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    timezone: string;
    language: string;
  };
  email: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromName: string;
    fromEmail: string;
  };
  security: {
    requireEmailVerification: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    systemAlerts: boolean;
    userRegistrations: boolean;
    organizationUpdates: boolean;
  };
  database: {
    backupEnabled: boolean;
    backupFrequency: string;
    retentionDays: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: "FarmTally",
      siteDescription: "Corn Procurement Management System",
      adminEmail: "admin@farmtally.in",
      timezone: "UTC",
      language: "en"
    },
    email: {
      enabled: true,
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
      fromName: "FarmTally",
      fromEmail: "noreply@farmtally.in"
    },
    security: {
      requireEmailVerification: true,
      passwordMinLength: 8,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      enableTwoFactor: false
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true,
      userRegistrations: true,
      organizationUpdates: true
    },
    database: {
      backupEnabled: true,
      backupFrequency: "daily",
      retentionDays: 30
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = async (section: keyof SystemSettings) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${section} settings saved successfully`);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const testEmailConnection = async () => {
    setLoading(true);
    try {
      // Mock email test - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Email connection test successful");
    } catch (error) {
      toast.error("Email connection test failed");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Settings className="h-3 w-3" />
          <span>Admin Only</span>
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Database</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settings.general.timezone} 
                    onValueChange={(value) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings.general.language} 
                    onValueChange={(value) => updateSetting('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => handleSave('general')} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.email.enabled}
                  onCheckedChange={(checked) => updateSetting('email', 'enabled', checked)}
                />
                <Label>Enable Email Notifications</Label>
              </div>
              
              {settings.email.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.email.smtpHost}
                        onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={settings.email.smtpUser}
                        onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.email.smtpPassword}
                        onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={settings.email.fromName}
                        onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={testEmailConnection} variant="outline" disabled={loading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button onClick={() => handleSave('email')} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Email Settings
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => updateSetting('security', 'requireEmailVerification', checked)}
                  />
                  <Label>Require Email Verification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
                  />
                  <Label>Enable Two-Factor Authentication</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="20"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              
              <Button onClick={() => handleSave('security')} disabled={loading}>
                <Shield className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                  />
                  <Label>Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.notifications.systemAlerts}
                    onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
                  />
                  <Label>System Alerts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.notifications.userRegistrations}
                    onCheckedChange={(checked) => updateSetting('notifications', 'userRegistrations', checked)}
                  />
                  <Label>User Registration Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.notifications.organizationUpdates}
                    onCheckedChange={(checked) => updateSetting('notifications', 'organizationUpdates', checked)}
                  />
                  <Label>Organization Update Notifications</Label>
                </div>
              </div>
              
              <Button onClick={() => handleSave('notifications')} disabled={loading}>
                <Bell className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>Configure database backup and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.database.backupEnabled}
                  onCheckedChange={(checked) => updateSetting('database', 'backupEnabled', checked)}
                />
                <Label>Enable Automatic Backups</Label>
              </div>
              
              {settings.database.backupEnabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select 
                        value={settings.database.backupFrequency} 
                        onValueChange={(value) => updateSetting('database', 'backupFrequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retentionDays">Retention Period (days)</Label>
                      <Input
                        id="retentionDays"
                        type="number"
                        min="1"
                        max="365"
                        value={settings.database.retentionDays}
                        onChange={(e) => updateSetting('database', 'retentionDays', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup Now
                </Button>
                <Button onClick={() => handleSave('database')} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Database Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}