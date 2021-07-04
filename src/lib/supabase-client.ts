import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl: string = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
