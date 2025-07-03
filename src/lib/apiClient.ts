import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_BASE_URL = `${supabaseUrl}/functions/v1/cable-hub-admin`;

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  // Only register uses the Edge Function
  async register(userData: {
    email: string;
    password: string;
    name: string;
    userType?: string;
  }) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    };
    const session = await supabase.auth.getSession();
    if (session.data.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'auth/register', data: userData }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // All other methods use the direct Supabase client
  async login(credentials: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw new Error(error.message);
    if (data.session) await supabase.auth.setSession(data.session);
    return data;
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    this.token = null;
    // Clear all localStorage items set during login/registration
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
  }

  async getProfile() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    return data.user;
  }

  async getPricingData() {
    const { data, error } = await supabase.from('pricing').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async getMarketplaceListings() {
    const { data, error } = await supabase.from('marketplace').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async addPricingData(pricingData: {
    material: string;
    price: string;
    change: string;
    trend: string;
  }) {
    const { data, error } = await supabase.from('pricing').insert([pricingData]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async getUsers() {
    const { data, error } = await supabase.from('users').select('id, name, email, user_type, created_at, last_login, is_active').eq('user_type', 'user').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async updateUser(userId: string, userData: any) {
    const { data, error } = await supabase.from('users').update(userData).eq('id', userId).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteUser(userId: string) {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw new Error(error.message);
    return { message: 'User deleted successfully' };
  }

  async updatePricingData(pricingId: string, pricingData: any) {
    const { data, error } = await supabase.from('pricing').update(pricingData).eq('id', pricingId).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deletePricingData(pricingId: string) {
    const { error } = await supabase.from('pricing').delete().eq('id', pricingId);
    if (error) throw new Error(error.message);
    return { message: 'Pricing data deleted successfully' };
  }

  async calculateRawMaterial(calculationData: {
    cableType: string;
    length: number;
    conductorSize: number;
    insulationThickness?: number;
    sheathThickness?: number;
    conductorMaterial?: string;
    insulationMaterial?: string;
    sheathMaterial?: string;
  }) {
    const {
      cableType,
      length,
      conductorSize,
      insulationThickness = 2,
      sheathThickness = 1.5,
      conductorMaterial = 'copper',
      insulationMaterial = 'pvc',
      sheathMaterial = 'pvc',
    } = calculationData;

    // Material densities (kg/m³)
    const densities: Record<string, number> = {
      copper: 8960,
      aluminum: 2700,
      pvc: 1380,
      xlpe: 920,
      rubber: 1200,
    };

    // Calculate conductor volume and weight
    const conductorArea = (Math.PI * Math.pow(conductorSize / 2, 2)) / 1000000; // mm² to m²
    const conductorVolume = conductorArea * length;
    const conductorWeight = conductorVolume * densities[conductorMaterial];

    // Calculate insulation volume and weight
    const outerRadius = conductorSize / 2 + insulationThickness;
    const insulationArea =
      (Math.PI * (Math.pow(outerRadius, 2) - Math.pow(conductorSize / 2, 2))) / 1000000;
    const insulationVolume = insulationArea * length;
    const insulationWeight = insulationVolume * densities[insulationMaterial];

    // Calculate sheath volume and weight
    const sheathOuterRadius = outerRadius + sheathThickness;
    const sheathArea =
      (Math.PI * (Math.pow(sheathOuterRadius, 2) - Math.pow(outerRadius, 2))) / 1000000;
    const sheathVolume = sheathArea * length;
    const sheathWeight = sheathVolume * densities[sheathMaterial];

    // Total weight
    const totalWeight = conductorWeight + insulationWeight + sheathWeight;

    // Get current material prices from database
    const { data: pricingData } = await supabase.from('pricing').select('*');
    const prices: Record<string, number> = {};
    pricingData?.forEach((item: any) => {
      const materialName = item.material.toLowerCase();
      const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
      if (materialName.includes('copper')) prices['copper'] = price;
      else if (materialName.includes('aluminum') || materialName.includes('aluminium')) prices['aluminum'] = price;
      else if (materialName.includes('pvc')) prices['pvc'] = price;
      else if (materialName.includes('xlpe')) prices['xlpe'] = price;
      else if (materialName.includes('rubber')) prices['rubber'] = price;
    });
    const defaultPrices = {
      copper: 485,
      aluminum: 162,
      pvc: 89,
      xlpe: 145,
      rubber: 120,
    };
    const finalPrices = {
      copper: prices.copper || defaultPrices.copper,
      aluminum: prices.aluminum || defaultPrices.aluminum,
      pvc: prices.pvc || defaultPrices.pvc,
      xlpe: prices.xlpe || defaultPrices.xlpe,
      rubber: prices.rubber || defaultPrices.rubber,
    };
    // Calculate costs
    const conductorCost = conductorWeight * (finalPrices[conductorMaterial] || 0);
    const insulationCost = insulationWeight * (finalPrices[insulationMaterial] || 0);
    const sheathCost = sheathWeight * (finalPrices[sheathMaterial] || 0);
    const totalCost = conductorCost + insulationCost + sheathCost;
    return {
      specifications: {
        cableType,
        length: `${length}m`,
        conductorSize: `${conductorSize}mm²`,
        conductorMaterial,
        insulationMaterial,
        sheathMaterial,
      },
      weights: {
        conductor: conductorWeight.toFixed(2),
        insulation: insulationWeight.toFixed(2),
        sheath: sheathWeight.toFixed(2),
        total: totalWeight.toFixed(2),
      },
      costs: {
        conductor: conductorCost.toFixed(2),
        insulation: insulationCost.toFixed(2),
        sheath: sheathCost.toFixed(2),
        total: totalCost.toFixed(2),
      },
      materials: {
        conductor: `${conductorWeight.toFixed(2)}kg ${conductorMaterial}`,
        insulation: `${insulationWeight.toFixed(2)}kg ${insulationMaterial}`,
        sheath: `${sheathWeight.toFixed(2)}kg ${sheathMaterial}`,
      },
    };
  }

  async calculatePricing(pricingData: {
    baseCost: number;
    profitMargin: number;
    overhead?: number;
    taxes?: number;
    quantity?: number;
    bulkDiscount?: number;
  }) {
    const {
      baseCost,
      profitMargin,
      overhead = 0,
      taxes = 0,
      quantity = 1,
      bulkDiscount = 0,
    } = pricingData;
    // Calculate pricing
    const overheadCost = (baseCost * overhead) / 100;
    const subtotal = baseCost + overheadCost;
    const profitAmount = (subtotal * profitMargin) / 100;
    const preTaxTotal = subtotal + profitAmount;
    const taxAmount = (preTaxTotal * taxes) / 100;
    const unitPrice = preTaxTotal + taxAmount;
    // Apply bulk discount
    const discountAmount = (unitPrice * bulkDiscount) / 100;
    const finalUnitPrice = unitPrice - discountAmount;
    const totalPrice = finalUnitPrice * quantity;
    return {
      breakdown: {
        baseCost: parseFloat(baseCost as any).toFixed(2),
        overhead: overheadCost.toFixed(2),
        subtotal: subtotal.toFixed(2),
        profit: profitAmount.toFixed(2),
        preTaxTotal: preTaxTotal.toFixed(2),
        taxes: taxAmount.toFixed(2),
        unitPrice: unitPrice.toFixed(2),
        discount: discountAmount.toFixed(2),
        finalUnitPrice: finalUnitPrice.toFixed(2),
      },
      totals: {
        quantity: quantity || 1,
        totalPrice: totalPrice.toFixed(2),
        pricePerMeter: (totalPrice / (quantity || 1)).toFixed(2),
      },
    };
  }

  async calculateElectrical(electricalData: {
    voltage: number;
    current?: number;
    power?: number;
    length: number;
    conductorSize: number;
    conductorMaterial?: string;
  }) {
    const {
      voltage,
      current,
      power,
      length,
      conductorSize,
      conductorMaterial = 'copper',
    } = electricalData;
    if (!voltage || (!current && !power)) {
      throw new Error('Voltage and current or power are required');
    }
    // Calculate power if not provided
    const calculatedPower = power || voltage * (current as number);
    // Resistivity values (Ω·m)
    const resistivity: Record<string, number> = {
      copper: 1.68e-8,
      aluminum: 2.82e-8,
    };
    // Calculate resistance
    const conductorArea = (Math.PI * Math.pow(conductorSize / 2, 2)) / 1000000; // mm² to m²
    const resistance = (resistivity[conductorMaterial] * length) / conductorArea;
    // Calculate voltage drop
    const voltageDrop = (current as number) * resistance;
    const voltageDropPercentage = (voltageDrop / voltage) * 100;
    // Calculate power loss
    const powerLoss = Math.pow((current as number), 2) * resistance;
    // Calculate efficiency
    const efficiency = ((calculatedPower - powerLoss) / calculatedPower) * 100;
    return {
      electrical: {
        voltage: `${voltage}V`,
        current: `${current}A`,
        power: `${calculatedPower}W`,
        resistance: `${resistance.toFixed(4)}Ω`,
        voltageDrop: `${voltageDrop.toFixed(2)}V`,
        voltageDropPercentage: `${voltageDropPercentage.toFixed(2)}%`,
        powerLoss: `${powerLoss.toFixed(2)}W`,
        efficiency: `${efficiency.toFixed(2)}%`,
      },
      specifications: {
        length: `${length}m`,
        conductorSize: `${conductorSize}mm²`,
        conductorMaterial,
      },
    };
  }

  async promoteUserToAdmin(email: string) {
    const { data, error } = await supabase.from('users').update({ user_type: 'admin' }).eq('email', email).select().single();
    if (error) throw new Error(error.message);
    return data;
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

  getSupabase() {
    return supabase;
  }
}

export const apiClient = new ApiClient();
export default apiClient; 