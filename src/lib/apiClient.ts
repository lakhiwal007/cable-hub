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
    // Fetch the old price first
    const { data: oldData, error: oldError } = await supabase.from('pricing').select('price').eq('id', pricingId).single();
    if (oldError) throw new Error(oldError.message);
    const oldPrice = oldData?.price;
    const newPrice = pricingData.price;

    // Update the pricing data
    const { data, error } = await supabase.from('pricing').update(pricingData).eq('id', pricingId).select().single();
    if (error) throw new Error(error.message);

    // If price changed, insert into material_price_history
    if (oldPrice !== newPrice) {
      // Get current user/admin id (if available)
      let changedBy = null;
      if (supabase.auth && supabase.auth.getUser) {
        const user = await supabase.auth.getUser();
        changedBy = user?.data?.user?.id || null;
      }
      await supabase.from('material_price_history').insert([
        {
          pricing_id: pricingId,
          old_price: oldPrice.split("/")[0],
          new_price: newPrice.split("/")[0],
          changed_by: changedBy,
        },
      ]);
    }
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

    // Fetch material densities from database
    const densities = await this.getConstantsByCategory('material_densities');
    
    // Fallback to default densities if database values are not available
    const defaultDensities: Record<string, number> = {
      copper: 8960,
      aluminum: 2700,
      pvc: 1380,
      xlpe: 920,
      rubber: 1200,
    };

    const finalDensities = { ...defaultDensities, ...densities };

    // Calculate conductor volume and weight
    const conductorArea = (Math.PI * Math.pow(conductorSize / 2, 2)) / 1000000; // mm² to m²
    const conductorVolume = conductorArea * length;
    const conductorWeight = conductorVolume * finalDensities[conductorMaterial];

    // Calculate insulation volume and weight
    const outerRadius = conductorSize / 2 + insulationThickness;
    const insulationArea =
      (Math.PI * (Math.pow(outerRadius, 2) - Math.pow(conductorSize / 2, 2))) / 1000000;
    const insulationVolume = insulationArea * length;
    const insulationWeight = insulationVolume * finalDensities[insulationMaterial];

    // Calculate sheath volume and weight
    const sheathOuterRadius = outerRadius + sheathThickness;
    const sheathArea =
      (Math.PI * (Math.pow(sheathOuterRadius, 2) - Math.pow(outerRadius, 2))) / 1000000;
    const sheathVolume = sheathArea * length;
    const sheathWeight = sheathVolume * finalDensities[sheathMaterial];

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

    // Fetch default prices from database
    const defaultPrices = await this.getConstantsByCategory('default_prices');
    
    // Fallback to hardcoded default prices if database values are not available
    const fallbackPrices = {
      copper: 485,
      aluminum: 162,
      pvc: 89,
      xlpe: 145,
      rubber: 120,
    };

    const finalPrices = { ...fallbackPrices, ...defaultPrices, ...prices };

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
    
    // Fetch resistivity values from database
    const resistivityConstants = await this.getConstantsByCategory('electrical_constants');
    
    // Fallback to default resistivity values if database values are not available
    const defaultResistivity: Record<string, number> = {
      copper: 1.68e-8,
      aluminum: 2.82e-8,
    };

    const resistivity = { ...defaultResistivity, ...resistivityConstants };
    
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

  // =================== ENHANCED MARKETPLACE APIs ===================

  // === SUPPLY LISTINGS ===
  async getSupplyListings(filters?: {
    category?: string;
    location?: string;
    price_min?: number;
    price_max?: number;
    material_type?: string;
    verified_only?: boolean;
    urgent_only?: boolean;
    search?: string;
  }) {
    let query = supabase
      .from('supply_listings')
      .select(`
        *,
        supplier:users!supplier_id(id, name, email, user_type)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.location) query = query.ilike('location', `%${filters.location}%`);
      if (filters.price_min) query = query.gte('price_per_unit', filters.price_min);
      if (filters.price_max) query = query.lte('price_per_unit', filters.price_max);
      if (filters.material_type) query = query.eq('material_type', filters.material_type);
      if (filters.verified_only) query = query.eq('is_verified', true);
      if (filters.urgent_only) query = query.eq('is_urgent', true);
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,material_type.ilike.%${filters.search}%`
        );
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async getSupplyListingById(id: string) {
    const { data, error } = await supabase
      .from('supply_listings')
      .select(`
        *,
        supplier:users!supplier_id(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async uploadListingImage(file: File): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async createSupplyListing(listingData: {
    title: string;
    description: string;
    category: string;
    material_type: string;
    grade_specification: string;
    available_quantity: number;
    unit: string;
    price_per_unit: number;
    currency?: string;
    minimum_order: number;
    location: string;
    delivery_terms: string;
    certification?: string;
    image_url?: string;
    is_urgent?: boolean;
    expires_at?: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('supply_listings')
      .insert([{
        ...listingData,
        supplier_id: user.user.id,
        currency: listingData.currency || 'INR',
        is_active: true,
        is_verified: false,
        is_urgent: listingData.is_urgent || false,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateSupplyListing(id: string, listingData: Partial<{
    title: string;
    description: string;
    category: string;
    material_type: string;
    grade_specification: string;
    available_quantity: number;
    unit: string;
    price_per_unit: number;
    minimum_order: number;
    location: string;
    delivery_terms: string;
    certification?: string;
    image_url?: string;
    is_urgent?: boolean;
    expires_at?: string;
  }>) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('supply_listings')
      .update(listingData)
      .eq('id', id)
      .eq('supplier_id', user.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteSupplyListing(id: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { error } = await supabase
      .from('supply_listings')
      .delete()
      .eq('id', id)
      .eq('supplier_id', user.user.id);

    if (error) throw new Error(error.message);
    return { message: 'Supply listing deleted successfully' };
  }

  // === DEMAND LISTINGS ===
  async getDemandListings(filters?: {
    category?: string;
    location?: string;
    budget_min?: number;
    budget_max?: number;
    material_type?: string;
    urgent_only?: boolean;
    search?: string;
  }) {
    let query = supabase
      .from('demand_listings')
      .select(`
        *,
        buyer:users!buyer_id(id, name, email, user_type)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.location) query = query.ilike('location', `%${filters.location}%`);
      if (filters.budget_min) query = query.gte('budget_min', filters.budget_min);
      if (filters.budget_max) query = query.lte('budget_max', filters.budget_max);
      if (filters.material_type) query = query.eq('material_type', filters.material_type);
      if (filters.urgent_only) query = query.eq('is_urgent', true);
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,material_type.ilike.%${filters.search}%`
        );
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async getDemandListingById(id: string) {
    const { data, error } = await supabase
      .from('demand_listings')
      .select(`
        *,
        buyer:users!buyer_id(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async createDemandListing(listingData: {
    title: string;
    description: string;
    category: string;
    material_type: string;
    specifications: string;
    required_quantity: number;
    unit: string;
    budget_min: number;
    budget_max: number;
    currency?: string;
    location: string;
    delivery_deadline: string;
    additional_requirements?: string;
    is_urgent?: boolean;
    expires_at?: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('demand_listings')
      .insert([{
        ...listingData,
        buyer_id: user.user.id,
        currency: listingData.currency || 'INR',
        is_active: true,
        is_urgent: listingData.is_urgent || false,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateDemandListing(id: string, listingData: Partial<{
    title: string;
    description: string;
    category: string;
    material_type: string;
    specifications: string;
    required_quantity: number;
    unit: string;
    budget_min: number;
    budget_max: number;
    location: string;
    delivery_deadline: string;
    additional_requirements?: string;
    is_urgent?: boolean;
    expires_at?: string;
  }>) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('demand_listings')
      .update(listingData)
      .eq('id', id)
      .eq('buyer_id', user.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteDemandListing(id: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { error } = await supabase
      .from('demand_listings')
      .delete()
      .eq('id', id)
      .eq('buyer_id', user.user.id);

    if (error) throw new Error(error.message);
    return { message: 'Demand listing deleted successfully' };
  }

  // === SUPPLIER CONTACTS ===
  async getSupplierProfile(id: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async createSupplierProfile(supplierData: {
    name: string;
    email: string;
    phone: string;
    company_name: string;
    company_address: string;
    gst_number?: string;
    website?: string;
    description?: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('suppliers')
      .insert([{
        ...supplierData,
        id: user.user.id,
        verified: false,
        rating: 0,
        total_listings: 0,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateSupplierProfile(supplierData: Partial<{
    name: string;
    email: string;
    phone: string;
    company_name: string;
    company_address: string;
    gst_number?: string;
    website?: string;
    description?: string;
  }>) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('suppliers')
      .update(supplierData)
      .eq('id', user.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // === CONTACT SUPPLIER ===
  async contactSupplier(contactData: {
    listing_id: string;
    listing_type: 'supply' | 'demand';
    requester_name: string;
    requester_email: string;
    requester_phone: string;
    message: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('marketplace_contacts')
      .insert([{
        ...contactData,
        requester_id: user.user.id,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getContactRequests() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('marketplace_contacts')
      .select('*')
      .eq('requester_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async updateContactStatus(contactId: string, status: 'pending' | 'responded' | 'closed') {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('marketplace_contacts')
      .update({ status })
      .eq('id', contactId)
      .eq('requester_id', user.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // === SEARCH & FILTER ===
  async searchMarketplace(searchTerm: string, type?: 'supply' | 'demand') {
    const results = {
      supply: [],
      demand: [],
    };

    if (!type || type === 'supply') {
      const { data: supplyData } = await supabase
        .from('supply_listings')
        .select(`
          *,
          supplier:users!supplier_id(name, email, user_type)
        `)
        .eq('is_active', true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,material_type.ilike.%${searchTerm}%`)
        .limit(10);
      results.supply = supplyData || [];
    }

    if (!type || type === 'demand') {
      const { data: demandData } = await supabase
        .from('demand_listings')
        .select(`
          *,
          buyer:users!buyer_id(name, email, user_type)
        `)
        .eq('is_active', true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,material_type.ilike.%${searchTerm}%`)
        .limit(10);
      results.demand = demandData || [];
    }

    return results;
  }

  async getMarketplaceStats() {
    const [supplyCount, demandCount, activeUsers] = await Promise.all([
      supabase.from('supply_listings').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('demand_listings').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('users').select('id', { count: 'exact' }).eq('is_active', true),
    ]);

    return {
      total_supply_listings: supplyCount.count || 0,
      total_demand_listings: demandCount.count || 0,
      active_suppliers: activeUsers.count || 0,
    };
  }

  // =================== CHAT SYSTEM APIs ===================

  // === CHAT ROOMS ===
  async getChatRooms() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    // Get chat rooms without problematic joins
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .or(`supplier_id.eq.${user.user.id},buyer_id.eq.${user.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    // Fetch related data separately
    const roomsWithData = await Promise.all((data || []).map(async (room) => {
      // Get user data
      const [supplier, buyer] = await Promise.all([
        supabase.from('users').select('id, name, email, user_type').eq('id', room.supplier_id).single(),
        supabase.from('users').select('id, name, email, user_type').eq('id', room.buyer_id).single()
      ]);
      
      // Get listing data based on type
      let listing = null;
      if (room.listing_type === 'supply') {
        const { data: supplyListing } = await supabase
          .from('supply_listings')
          .select('id, title, material_type, price_per_unit, unit')
          .eq('id', room.listing_id)
          .single();
        listing = supplyListing;
      } else if (room.listing_type === 'demand') {
        const { data: demandListing } = await supabase
          .from('demand_listings')
          .select('id, title, material_type, budget_min, budget_max, unit')
          .eq('id', room.listing_id)
          .single();
        listing = demandListing;
      }
      
      return {
        ...room,
        supplier: supplier.data,
        buyer: buyer.data,
        listing
      };
    }));
    
    return roomsWithData;
  }

  async getChatRoom(roomId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    // Get chat room without problematic joins
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .or(`supplier_id.eq.${user.user.id},buyer_id.eq.${user.user.id}`)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Chat room not found or access denied');
    
    // Fetch related data separately
    const [supplier, buyer] = await Promise.all([
      supabase.from('users').select('id, name, email, user_type').eq('id', data.supplier_id).single(),
      supabase.from('users').select('id, name, email, user_type').eq('id', data.buyer_id).single()
    ]);
    
    // Get listing data based on type
    let listing = null;
    if (data.listing_type === 'supply') {
      const { data: supplyListing } = await supabase
        .from('supply_listings')
        .select('id, title, description, material_type, price_per_unit, unit, location')
        .eq('id', data.listing_id)
        .single();
      listing = supplyListing;
    } else if (data.listing_type === 'demand') {
      const { data: demandListing } = await supabase
        .from('demand_listings')
        .select('id, title, description, material_type, budget_min, budget_max, unit, location')
        .eq('id', data.listing_id)
        .single();
      listing = demandListing;
    }
    
    return {
      ...data,
      supplier: supplier.data,
      buyer: buyer.data,
      listing
    };
  }

  async createChatRoom(data: {
    listing_id: string;
    listing_type: 'supply' | 'demand';
    supplier_id: string;
    buyer_id: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    // Check if chat room already exists for this listing and these participants
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('listing_id', data.listing_id)
      .eq('listing_type', data.listing_type)
      .eq('supplier_id', data.supplier_id)
      .eq('buyer_id', data.buyer_id)
      .single();

    if (existingRoom) {
      return existingRoom;
    }

    // Create new chat room
    const { data: newRoom, error } = await supabase
      .from('chat_rooms')
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newRoom;
  }

  // === CHAT MESSAGES ===
  async getChatMessages(roomId: string, limit: number = 50, offset: number = 0) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    // Verify user has access to this chat room
    const { data: room } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('id', roomId)
      .or(`supplier_id.eq.${user.user.id},buyer_id.eq.${user.user.id}`)
      .single();

    if (!room) throw new Error('Chat room not found or access denied');

    // Get messages without the problematic join
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_room_id', roomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    
    // Get unique sender IDs to fetch user data
    const senderIds = [...new Set(data?.map(msg => msg.sender_id) || [])];
    
    // Fetch user data separately to avoid relationship conflicts
    let users: any[] = [];
    if (senderIds.length > 0) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', senderIds);
      users = userData || [];
    }
    
    // Combine messages with user data
    const messagesWithUsers = data?.map(message => {
      const sender = users.find(u => u.id === message.sender_id);
      return {
        ...message,
        sender: sender ? { id: sender.id, name: sender.name, email: sender.email } : null
      };
    }) || [];
    
    return messagesWithUsers.reverse();
  }

  async sendMessage(data: {
    chat_room_id: string;
    message_text: string;
    message_type?: 'text' | 'image' | 'file' | 'system';
    attachment_url?: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    // Determine sender type
    const { data: room } = await supabase
      .from('chat_rooms')
      .select('supplier_id, buyer_id')
      .eq('id', data.chat_room_id)
      .single();

    if (!room) throw new Error('Chat room not found');

    const sender_type = room.supplier_id === user.user.id ? 'supplier' : 'buyer';

    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert([{
        ...data,
        sender_id: user.user.id,
        sender_type,
        message_type: data.message_type || 'text',
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return message;
  }

  async markMessagesAsRead(roomId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('chat_room_id', roomId)
      .neq('sender_id', user.user.id);

    if (error) throw new Error(error.message);
  }

  async getUnreadMessageCount(roomId?: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    let query = supabase
      .from('chat_messages')
      .select('id', { count: 'exact' })
      .eq('is_read', false)
      .neq('sender_id', user.user.id);

    if (roomId) {
      query = query.eq('chat_room_id', roomId);
    } else {
      // Get unread count across all user's chat rooms
      const { data: rooms } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`supplier_id.eq.${user.user.id},buyer_id.eq.${user.user.id}`);

      if (rooms && rooms.length > 0) {
        const roomIds = rooms.map(r => r.id);
        query = query.in('chat_room_id', roomIds);
      }
    }

    const { count, error } = await query;
    if (error) throw new Error(error.message);
    return count || 0;
  }

  // === REAL-TIME SUBSCRIPTIONS ===
  subscribeToChatRoom(roomId: string, callback: (message: any) => void) {
    return supabase
      .channel(`chat_room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToChatRooms(userId: string, callback: (room: any) => void) {
    return supabase
      .channel('chat_rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: `supplier_id=eq.${userId}`,
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: `buyer_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  unsubscribeFromChannel(channel: any) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }

  // === ENHANCED CONTACT SUPPLIER WITH CHAT ===
  async contactSupplierWithChat(contactData: {
    listing_id: string;
    listing_type: 'supply' | 'demand';
    supplier_id: string;
    requester_name: string;
    requester_email: string;
    requester_phone: string;
    message: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    // Check if chat room already exists for this listing and these participants
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('listing_id', contactData.listing_id)
      .eq('listing_type', contactData.listing_type)
      .eq('supplier_id', contactData.supplier_id)
      .eq('buyer_id', user.user.id)
      .single();

    let chatRoom;
    let isNewRoom = false;

    if (existingRoom) {
      // Chat room already exists, just return it
      chatRoom = existingRoom;
    } else {
      // Create new chat room
      chatRoom = await this.createChatRoom({
        listing_id: contactData.listing_id,
        listing_type: contactData.listing_type,
        supplier_id: contactData.supplier_id,
        buyer_id: user.user.id,
      });
      isNewRoom = true;
    }

    // Only send initial message if this is a new chat room
    if (isNewRoom) {
      await this.sendMessage({
        chat_room_id: chatRoom.id,
        message_text: contactData.message,
        message_type: 'text',
      });
    }

    // Also create traditional contact record for backwards compatibility
    const contact = await this.contactSupplier({
      listing_id: contactData.listing_id,
      listing_type: contactData.listing_type,
      requester_name: contactData.requester_name,
      requester_email: contactData.requester_email,
      requester_phone: contactData.requester_phone,
      message: contactData.message,
    });

    return {
      chat_room: chatRoom,
      contact: contact,
    };
  }

  // === ENHANCED CONTACT CONSUMER WITH CHAT ===
  async contactConsumerWithChat(contactData: {
    listing_id: string;
    listing_type: 'demand';
    buyer_id: string;
    supplier_name: string;
    supplier_email: string;
    supplier_phone: string;
    message: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Authentication required');

    // Check if chat room already exists for this listing and these participants
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('listing_id', contactData.listing_id)
      .eq('listing_type', contactData.listing_type)
      .eq('supplier_id', user.user.id)
      .eq('buyer_id', contactData.buyer_id)
      .single();

    let chatRoom;
    let isNewRoom = false;

    if (existingRoom) {
      // Chat room already exists, just return it
      chatRoom = existingRoom;
    } else {
      // Create new chat room
      chatRoom = await this.createChatRoom({
        listing_id: contactData.listing_id,
        listing_type: contactData.listing_type,
        supplier_id: user.user.id, // Current user (supplier)
        buyer_id: contactData.buyer_id, // Buyer who created the demand
      });
      isNewRoom = true;
    }

    // Only send initial message if this is a new chat room
    if (isNewRoom) {
      await this.sendMessage({
        chat_room_id: chatRoom.id,
        message_text: contactData.message,
        message_type: 'text',
      });
    }

    // Also create traditional contact record for backwards compatibility
    const contact = await this.contactSupplier({
      listing_id: contactData.listing_id,
      listing_type: contactData.listing_type,
      requester_name: contactData.supplier_name,
      requester_email: contactData.supplier_email,
      requester_phone: contactData.supplier_phone,
      message: contactData.message,
    });

    return {
      chat_room: chatRoom,
      contact: contact,
    };
  }

  async getMaterialPriceHistory(pricingId: string) {
    const { data, error } = await supabase
      .from('material_price_history')
      .select('old_price, new_price, changed_at')
      .eq('pricing_id', pricingId)
      .order('changed_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  }

  async getMaterialCategories() {
    const { data, error } = await supabase
      .from('material_categories')
      .select('id, name, image_url')
      .order('name', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  }

  async addMaterialCategory(categoryData: { name: string; image_url?: string }) {
    const { data, error } = await supabase
      .from('material_categories')
      .insert([categoryData])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateMaterialCategory(categoryId: string, categoryData: { name: string; image_url?: string }) {
    const { data, error } = await supabase
      .from('material_categories')
      .update(categoryData)
      .eq('id', categoryId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteMaterialCategory(categoryId: string) {
    const { error } = await supabase
      .from('material_categories')
      .delete()
      .eq('id', categoryId);
    if (error) throw new Error(error.message);
    return { message: 'Material category deleted successfully' };
  }

  // === CALCULATION CONSTANTS MANAGEMENT ===
  async getCalculationConstants(category?: string) {
    let query = supabase
      .from('calculation_constants')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async updateCalculationConstant(constantId: string, updateData: {
    value: number;
    unit?: string;
    description?: string;
  }) {
    const { data, error } = await supabase
      .from('calculation_constants')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', constantId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async addCalculationConstant(constantData: {
    category: string;
    name: string;
    value: number;
    unit?: string;
    description?: string;
  }) {
    const { data, error } = await supabase
      .from('calculation_constants')
      .insert([constantData])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteCalculationConstant(constantId: string) {
    const { error } = await supabase
      .from('calculation_constants')
      .update({ is_active: false })
      .eq('id', constantId);
    if (error) throw new Error(error.message);
    return { message: 'Calculation constant deactivated successfully' };
  }

  // Helper method to get constants by category as a record
  async getConstantsByCategory(category: string): Promise<Record<string, number>> {
    const constants = await this.getCalculationConstants(category);
    const result: Record<string, number> = {};
    constants?.forEach(constant => {
      result[constant.name] = parseFloat(constant.value);
    });
    return result;
  }

  async uploadFileToStorage(file: File, folder: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { data, error } = await supabase.storage.from('marketplace-files').upload(fileName, file, { upsert: false });
    if (error) throw new Error(error.message);
    const { publicUrl } = supabase.storage.from('marketplace-files').getPublicUrl(fileName).data;
    return publicUrl;
  }

  async createUsedMachine(data: any) {
    const { data: result, error } = await supabase.from('used_machines').insert([data]).select().single();
    if (error) throw new Error(error.message);
    return result;
  }

  async createDeadStock(data: any) {
    const { data: result, error } = await supabase.from('dead_stock').insert([data]).select().single();
    if (error) throw new Error(error.message);
    return result;
  }

  async getUsedMachines() {
    const { data, error } = await supabase.from('used_machines').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async getDeadStock() {
    const { data, error } = await supabase.from('dead_stock').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async getConsultants() {
    const { data, error } = await supabase.from('consultants').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async getConsultingRequests() {
    const { data, error } = await supabase.from('consulting_requests').select('*');
    if (error) throw new Error(error.message);
    return data;
  }
}

export const apiClient = new ApiClient();
export default apiClient; 