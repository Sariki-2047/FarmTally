// FarmTally API Client - PostgreSQL Backend
// Clean implementation without Supabase dependencies

export class FarmTallyAPI {
  private baseURL: string

  constructor() {
    // Use environment variable or default to VPS backend
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://147.93.153.247:8082'
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    
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
    return this.request('/health')
  }

  async healthDb() {
    return this.request('/api/health/db')
  }

  // User management
  async getUsers() {
    return this.request('/api/users')
  }

  async createUser(userData: {
    email: string
    role: string
    name?: string
    phone?: string
  }) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getUserById(userId: string) {
    return this.request(`/api/users/${userId}`)
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(userId: string) {
    return this.request(`/api/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // Organization management
  async getOrganizations() {
    return this.request('/api/organizations')
  }

  async createOrganization(orgData: {
    name: string
    code: string
    address?: string
    phone?: string
    email?: string
  }) {
    return this.request('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(orgData),
    })
  }

  async getOrganizationById(orgId: string) {
    return this.request(`/api/organizations/${orgId}`)
  }

  async updateOrganization(orgId: string, orgData: any) {
    return this.request(`/api/organizations/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(orgData),
    })
  }

  async deleteOrganization(orgId: string) {
    return this.request(`/api/organizations/${orgId}`, {
      method: 'DELETE',
    })
  }

  // Authentication (for future implementation)
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    })
  }

  // System status
  async getSystemStatus() {
    return this.request('/api/system/status')
  }

  // Test connectivity
  async testConnection() {
    try {
      const health = await this.health()
      const dbHealth = await this.healthDb()
      return {
        backend: health,
        database: dbHealth,
        status: 'connected'
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

// Export default for convenience
export default farmTallyAPI