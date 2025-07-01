export type PricingData = {
    id: number;
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