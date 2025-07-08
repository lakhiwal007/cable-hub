export type PricingData = {
    id: string;
    material: string;
    price: string;
    change: string;
    trend: string;
  };
  
  export type MarketplaceListing = {
    id: number;
    type: 'supply' | 'demand';
    title: string;
    supplier?: string;
    manufacturer?: string;
    location: string;
    quantity: string;
    price?: string;
    minOrder?: string;
    budget?: string;
    deadline?: string;
    posted: string;
    category: string;
    verified?: boolean;
    urgent?: boolean;
  };

  // Enhanced marketplace types for comprehensive supply/demand system
  export type SupplierContact = {
    id: string;
    name: string;
    email: string;
    phone: string;
    company_name: string;
    company_address: string;
    gst_number?: string;
    website?: string;
    description?: string;
    verified: boolean;
    rating?: number;
    total_listings: number;
    created_at: string;
    updated_at: string;
  };

  export type SupplyListing = {
    id: string;
    supplier_id: string;
    title: string;
    description: string;
    category: string;
    material_type: string;
    grade_specification: string;
    available_quantity: number;
    unit: string;
    price_per_unit: number;
    currency: string;
    minimum_order: number;
    location: string;
    delivery_terms: string;
    certification?: string;
    image_url?: string;
    is_active: boolean;
    is_verified: boolean;
    is_urgent: boolean;
    expires_at?: string;
    created_at: string;
    updated_at: string;
    supplier?: SupplierContact;
    whatsapp_number?: string;
    spec_doc_url?: string;
  };

  export type DemandListing = {
    id: string;
    buyer_id: string;
    title: string;
    description: string;
    category: string;
    material_type: string;
    specifications: string;
    required_quantity: number;
    unit: string;
    budget_min: number;
    budget_max: number;
    currency: string;
    location: string;
    delivery_deadline: string;
    additional_requirements?: string;
    image_url?: string;
    is_active: boolean;
    is_urgent: boolean;
    expires_at?: string;
    created_at: string;
    updated_at: string;
    buyer?: {
      id: string;
      name: string;
      email: string;
      phone: string;
      company_name: string;
    };
    whatsapp_number?: string;
    spec_doc_url?: string;
  };

  export type MarketplaceContact = {
    id: string;
    listing_id: string;
    listing_type: 'supply' | 'demand';
    requester_id: string;
    requester_name: string;
    requester_email: string;
    requester_phone: string;
    message: string;
    status: 'pending' | 'responded' | 'closed';
    created_at: string;
    updated_at: string;
  };

  export type MarketplaceFilters = {
    category?: string;
    location?: string;
    price_min?: number;
    price_max?: number;
    material_type?: string;
    verified_only?: boolean;
    urgent_only?: boolean;
    search?: string;
  };

  // Chat system types
  export type ChatRoom = {
    id: string;
    listing_id: string;
    listing_type: 'supply' | 'demand';
    supplier_id: string;
    buyer_id: string;
    status: 'active' | 'closed' | 'archived';
    created_at: string;
    updated_at: string;
    last_message_at: string;
    listing?: SupplyListing | DemandListing;
    supplier?: SupplierContact;
    buyer?: {
      id: string;
      name: string;
      email: string;
      phone: string;
      company_name: string;
    };
    unread_count?: number;
    last_message?: ChatMessage;
  };

  export type ChatMessage = {
    id: string;
    chat_room_id: string;
    sender_id: string;
    sender_type: 'supplier' | 'buyer';
    message_text: string;
    message_type: 'text' | 'image' | 'file' | 'system';
    attachment_url?: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    sender?: {
      id: string;
      name: string;
      avatar?: string;
    };
  };

  export type ChatParticipant = {
    id: string;
    chat_room_id: string;
    user_id: string;
    user_type: 'supplier' | 'buyer';
    joined_at: string;
    last_read_at: string;
    is_active: boolean;
  };