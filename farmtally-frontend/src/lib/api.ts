/**
 * API Client for FarmTally Backend
 * Handles all HTTP requests to the backend server
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'FARM_ADMIN' | 'FIELD_MANAGER' | 'FARMER';
  organizationName?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: string;
  organization: {
    id: string;
    name: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('farmtally_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('farmtally_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('farmtally_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      ...(options.headers as Record<string, string>),
    };

    // If we have a user token, use it instead of the anon key
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile');
  }

  // Farmer endpoints
  async getFarmers(page = 1, limit = 20): Promise<ApiResponse<any>> {
    return this.request(`/farmers?page=${page}&limit=${limit}`);
  }

  async createFarmer(farmerData: any): Promise<ApiResponse<any>> {
    return this.request('/farmers', {
      method: 'POST',
      body: JSON.stringify(farmerData),
    });
  }

  async updateFarmer(id: string, farmerData: any): Promise<ApiResponse<any>> {
    return this.request(`/farmers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(farmerData),
    });
  }

  async deleteFarmer(id: string): Promise<ApiResponse<any>> {
    return this.request(`/farmers/${id}`, {
      method: 'DELETE',
    });
  }

  // Lorry endpoints
  async getLorries(page = 1, limit = 20): Promise<ApiResponse<any>> {
    return this.request(`/lorries?page=${page}&limit=${limit}`);
  }

  async createLorry(lorryData: any): Promise<ApiResponse<any>> {
    return this.request('/lorries', {
      method: 'POST',
      body: JSON.stringify(lorryData),
    });
  }

  async updateLorry(id: string, lorryData: any): Promise<ApiResponse<any>> {
    return this.request(`/lorries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lorryData),
    });
  }

  async deleteLorry(id: string): Promise<ApiResponse<any>> {
    return this.request(`/lorries/${id}`, {
      method: 'DELETE',
    });
  }

  // Delivery endpoints
  async getDeliveries(): Promise<ApiResponse<any>> {
    return this.request('/deliveries');
  }

  async addFarmerToLorry(lorryId: string, farmerId: string, deliveryData: any): Promise<ApiResponse<any>> {
    return this.request(`/deliveries/lorries/${lorryId}/farmers/${farmerId}`, {
      method: 'POST',
      body: JSON.stringify(deliveryData),
    });
  }

  async getLorryDeliveries(lorryId: string): Promise<ApiResponse<any>> {
    return this.request(`/deliveries/lorries/${lorryId}`);
  }

  async getLorryDeliverySummary(lorryId: string): Promise<ApiResponse<any>> {
    return this.request(`/deliveries/lorries/${lorryId}/summary`);
  }

  async updateDelivery(id: string, deliveryData: any): Promise<ApiResponse<any>> {
    return this.request(`/deliveries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deliveryData),
    });
  }

  async deleteDelivery(id: string): Promise<ApiResponse<any>> {
    return this.request(`/deliveries/${id}`, {
      method: 'DELETE',
    });
  }

  async clearPendingDeliveries(lorryId: string): Promise<ApiResponse<any>> {
    return this.request(`/deliveries/lorries/${lorryId}/clear-pending`, {
      method: 'POST',
    });
  }

  async submitLorryForProcessing(lorryId: string): Promise<ApiResponse<any>> {
    return this.request(`/deliveries/lorries/${lorryId}/submit`, {
      method: 'POST',
    });
  }

  async sendLorryToDealer(lorryId: string): Promise<ApiResponse<any>> {
    return this.request(`/deliveries/lorries/${lorryId}/send-to-dealer`, {
      method: 'POST',
    });
  }

  // Admin endpoints
  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.request('/admin/stats');
  }

  async getPendingFarmAdmins(): Promise<ApiResponse<any>> {
    return this.request('/admin/pending-farm-admins');
  }

  async reviewFarmAdmin(userId: string, approved: boolean, rejectionReason?: string): Promise<ApiResponse<any>> {
    return this.request('/admin/review-farm-admin', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        approved,
        rejectionReason,
      }),
    });
  }

  async getAllFarmAdmins(): Promise<ApiResponse<any>> {
    return this.request('/admin/all-farm-admins');
  }

  // Advance Payment endpoints
  async createAdvancePayment(paymentData: any): Promise<ApiResponse<any>> {
    return this.request('/advance-payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getFarmerAdvancePayments(farmerId: string): Promise<ApiResponse<any>> {
    return this.request(`/advance-payments/farmer/${farmerId}`);
  }

  async getAdvancePaymentSummary(): Promise<ApiResponse<any>> {
    return this.request('/advance-payments/summary');
  }

  // Invitation endpoints
  async sendFieldManagerInvitation(invitationData: {
    email: string;
    firstName: string;
    lastName: string;
    message?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/invitations/field-manager', {
      method: 'POST',
      body: JSON.stringify(invitationData),
    });
  }

  async getMyInvitations(): Promise<ApiResponse<any>> {
    return this.request('/invitations/my-invitations');
  }

  async getFieldManagers(): Promise<ApiResponse<any>> {
    return this.request('/invitations/field-managers');
  }

  async validateInvitation(token: string): Promise<ApiResponse<any>> {
    return this.request(`/invitations/validate/${token}`);
  }

  // Lorry Request endpoints
  async createLorryRequest(requestData: {
    requestedDate: string;
    estimatedGunnyBags: number;
    location: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/lorry-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getLorryRequests(): Promise<ApiResponse<any>> {
    return this.request('/lorry-requests');
  }

  async updateLorryRequestStatus(requestId: string, status: string, lorryId?: string): Promise<ApiResponse<any>> {
    return this.request(`/lorry-requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, lorryId }),
    });
  }

  // Lorry Management endpoints

  async getOrganizationLorries(): Promise<ApiResponse<any>> {
    return this.request('/lorries/organization');
  }

  async updateLorryStatus(lorryId: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/lorries/${lorryId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;