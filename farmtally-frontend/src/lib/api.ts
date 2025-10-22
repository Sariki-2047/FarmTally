// FarmTally API Client - Microservices Backend
// Clean implementation connecting to microservices

// Type definitions
export interface User {
  id: string
  email: string
  role: string
  name?: string
  phone?: string
  organizationId?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  organizationId?: string
}

export class FarmTallyAPI {
  private gatewayURL: string
  private authURL: string
  private fieldManagerURL: string
  private farmAdminURL: string

  constructor() {
    // Use port 8080 with /farmtally/ subdirectory for all services
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://147.93.153.247:8085/farmtally'
    this.gatewayURL = process.env.NEXT_PUBLIC_API_URL || `${baseURL}/api-gateway`
    this.authURL = process.env.NEXT_PUBLIC_AUTH_URL || `${baseURL}/auth-service`
    this.fieldManagerURL = process.env.NEXT_PUBLIC_FIELD_MANAGER_URL || `${baseURL}/field-manager-service`
    this.farmAdminURL = process.env.NEXT_PUBLIC_FARM_ADMIN_URL || `${baseURL}/farm-admin-service`
  }

  private async request(baseURL: string, endpoint: string, options: RequestInit = {}) {
    const url = `${baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      
      return data
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // Health check endpoints
  async health() {
    return this.request(this.gatewayURL, '/health')
  }

  async healthDb() {
    return this.request(this.gatewayURL, '/api/health/db')
  }

  // User management via Auth Service
  async getUsers() {
    return this.request(this.authURL, '/users')
  }

  async createUser(userData: {
    email: string
    role: string
    name?: string
    phone?: string
  }) {
    return this.request(this.authURL, '/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getUserById(userId: string) {
    return this.request(this.authURL, `/users/${userId}`)
  }

  async updateUser(userId: string, userData: any) {
    return this.request(this.authURL, `/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(userId: string) {
    return this.request(this.authURL, `/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // Organization management via API Gateway
  async getOrganizations() {
    return this.request(this.gatewayURL, '/api/organizations')
  }

  async createOrganization(orgData: {
    name: string
    code: string
    address?: string
    phone?: string
    email?: string
  }) {
    return this.request(this.gatewayURL, '/api/organizations', {
      method: 'POST',
      body: JSON.stringify(orgData),
    })
  }

  async getOrganizationById(orgId: string) {
    return this.request(this.gatewayURL, `/api/organizations/${orgId}`)
  }

  async updateOrganization(orgId: string, orgData: any) {
    return this.request(this.gatewayURL, `/api/organizations/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(orgData),
    })
  }

  async deleteOrganization(orgId: string) {
    return this.request(this.gatewayURL, `/api/organizations/${orgId}`, {
      method: 'DELETE',
    })
  }

  // Authentication via Auth Service
  async login(email: string, password: string) {
    return this.request(this.authURL, '/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request(this.authURL, '/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request(this.authURL, '/logout', {
      method: 'POST',
    })
  }

  async verifyToken(token: string) {
    return this.request(this.authURL, '/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  // System Admin creation (for testing)
  async createSystemAdmin(adminData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) {
    return this.request(this.authURL, '/admin/create', {
      method: 'POST',
      body: JSON.stringify(adminData),
    })
  }

  // Field Manager Service endpoints
  async getLorryRequests() {
    return this.request(this.fieldManagerURL, '/lorry-requests')
  }

  async createLorryRequest(requestData: any) {
    return this.request(this.fieldManagerURL, '/lorry-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async getDeliveries() {
    return this.request(this.fieldManagerURL, '/deliveries')
  }

  async createDelivery(deliveryData: any) {
    return this.request(this.fieldManagerURL, '/deliveries', {
      method: 'POST',
      body: JSON.stringify(deliveryData),
    })
  }

  async getAdvancePayments() {
    return this.request(this.fieldManagerURL, '/advance-payments')
  }

  async getFieldManagerStats() {
    return this.request(this.fieldManagerURL, '/dashboard/stats')
  }

  // Farm Admin Service endpoints
  async getPendingRequests() {
    return this.request(this.farmAdminURL, '/lorry-requests/pending')
  }

  async approveLorryRequest(requestId: string) {
    return this.request(this.farmAdminURL, `/lorry-requests/${requestId}/approve`, {
      method: 'POST',
    })
  }

  async rejectLorryRequest(requestId: string, reason?: string) {
    return this.request(this.farmAdminURL, `/lorry-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async getLorries() {
    return this.request(this.farmAdminURL, '/lorries')
  }

  async getPricingRules() {
    return this.request(this.farmAdminURL, '/pricing-rules')
  }

  async getPendingSettlements() {
    return this.request(this.farmAdminURL, '/settlements/pending')
  }

  async getFarmAdminStats() {
    return this.request(this.farmAdminURL, '/dashboard/stats')
  }

  // System status
  async getSystemStatus() {
    return this.request(this.gatewayURL, '/api/system/status')
  }

  // Test connectivity to all services
  async testConnection() {
    try {
      const results = await Promise.allSettled([
        this.request(this.gatewayURL, '/'),
        this.request(this.authURL, '/health'),
        this.request(this.fieldManagerURL, '/health'),
        this.request(this.farmAdminURL, '/health'),
      ])

      return {
        gateway: results[0].status === 'fulfilled' ? 'connected' : 'failed',
        auth: results[1].status === 'fulfilled' ? 'connected' : 'failed',
        fieldManager: results[2].status === 'fulfilled' ? 'connected' : 'failed',
        farmAdmin: results[3].status === 'fulfilled' ? 'connected' : 'failed',
        status: results.every(r => r.status === 'fulfilled') ? 'all_connected' : 'partial_connection'
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const farmTallyAPI = new FarmTallyAPI()

// Export as apiClient for backward compatibility
export const apiClient = farmTallyAPI

// Export default for convenience
export default farmTallyAPI