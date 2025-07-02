const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If token is invalid or expired, logout user
    if (response.status === 401 && this.token) {
      this.logout();
      // Reload the page to trigger redirect to login
      window.location.reload();
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication methods
  async register(userData: {
    email: string;
    password: string;
    name: string;
    userType?: string;
  }) {
    const response = await this.request<{
      message: string;
      user: any;
      token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{
      message: string;
      user: any;
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    return response;
  }

  async getProfile() {
    return this.request<{ user: any }>('/user/profile');
  }

  // Data methods
  async getPricingData() {
    return this.request<any[]>('/pricing');
  }

  async getMarketplaceListings() {
    return this.request<any[]>('/marketplace');
  }

  // Admin methods
  async addPricingData(pricingData: {
    material: string;
    price: string;
    change: string;
    trend: string;
  }) {
    return this.request<any>('/admin/pricing', {
      method: 'POST',
      body: JSON.stringify(pricingData),
    });
  }

  async getUsers() {
    return this.request('/admin/users');
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async updatePricingData(pricingId: string, pricingData: any) {
    return this.request(`/admin/pricing/${pricingId}`, {
      method: 'PUT',
      body: JSON.stringify(pricingData),
    });
  }

  async deletePricingData(pricingId: string) {
    return this.request(`/admin/pricing/${pricingId}`, {
      method: 'DELETE',
    });
  }

  // Calculation settings methods
  async getCalculationSettings() {
    return this.request<any>('/admin/calculation-settings');
  }

  async updateCalculationSettings(settings: any) {
    return this.request<any>('/admin/calculation-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Calculator methods
  async calculateRawMaterial(calculationData: {
    cableType: string;
    length: number;
    conductorSize: number;
    insulationThickness?: number;
    sheathThickness?: number;
    conductorMaterial?: string;
    insulationMaterial?: string;
    sheathMaterial?: string;
    calculationSettings?: any;
  }) {
    return this.request<any>('/calculator/raw-material', {
      method: 'POST',
      body: JSON.stringify(calculationData),
    });
  }

  async calculatePricing(pricingData: {
    baseCost: number;
    profitMargin: number;
    overhead?: number;
    taxes?: number;
    quantity?: number;
    bulkDiscount?: number;
  }) {
    return this.request<any>('/calculator/pricing', {
      method: 'POST',
      body: JSON.stringify(pricingData),
    });
  }

  async calculateElectrical(electricalData: {
    voltage: number;
    current?: number;
    power?: number;
    length: number;
    conductorSize: number;
    conductorMaterial?: string;
  }) {
    return this.request<any>('/calculator/electrical', {
      method: 'POST',
      body: JSON.stringify(electricalData),
    });
  }

  // Utility methods
  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }
}

export const apiClient = new ApiClient();
export default apiClient; 