import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// API client for FarmTally Edge Functions
export class FarmTallyAPI {
  private baseURL: string
  private apiKey: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://placeholder.supabase.co/functions/v1/farmtally-api'
    this.apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'apikey': this.apiKey,
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

  // Health check
  async health() {
    return this.request('/health')
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // System Admin
  async createSystemAdmin(adminData: any) {
    return this.request('/system-admin/setup', {
      method: 'POST',
      body: JSON.stringify(adminData),
    })
  }

  async getDashboardStats() {
    return this.request('/system-admin/dashboard')
  }

  async getPendingUsers() {
    return this.request('/system-admin/users/pending')
  }

  async approveUser(userId: string, notes?: string) {
    return this.request(`/system-admin/users/${userId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvalNotes: notes }),
    })
  }

  async rejectUser(userId: string, reason: string) {
    return this.request(`/system-admin/users/${userId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason: reason }),
    })
  }

  // Email
  async testEmail(testEmail: string) {
    return this.request('/email/test', {
      method: 'POST',
      body: JSON.stringify({ testEmail }),
    })
  }

  async getEmailStatus() {
    return this.request('/email/status')
  }
}

export const farmTallyAPI = new FarmTallyAPI()