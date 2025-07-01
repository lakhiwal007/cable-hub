

import { supabase } from './supabaseClient';
import { MarketplaceListing, PricingData } from './types';

export async function getPricingData(): Promise<PricingData[]> {
  const { data, error } = await supabase
    .from('pricing')
    .select('*');

  if (error) throw error;
  return data as PricingData[];
}

export async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  const { data, error } = await supabase
    .from('marketplace')
    .select('*');

  if (error) throw error;
  return data as MarketplaceListing[];
} 