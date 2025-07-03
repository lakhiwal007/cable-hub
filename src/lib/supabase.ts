import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          user_type: string;
          created_at: string;
          updated_at: string;
          last_login: string;
          is_active: boolean;
          is_email_verified: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          user_type?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
          is_active?: boolean;
          is_email_verified?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          user_type?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
          is_active?: boolean;
          is_email_verified?: boolean;
        };
      };
      pricing: {
        Row: {
          id: string;
          material: string;
          price: string;
          change: string;
          trend: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          material: string;
          price: string;
          change: string;
          trend: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          material?: string;
          price?: string;
          change?: string;
          trend?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      marketplace: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: string;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}; 