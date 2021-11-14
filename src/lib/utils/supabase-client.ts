import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://localhost:8000';
const PUBLIC_ANON_KEY =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYwMzk2ODgzNCwiZXhwIjoyNTUwNjUzNjM0LCJyb2xlIjoiYW5vbiJ9.36fUebxgx1mcBo4s19v0SzqmzunP--hm_hep0uLX0ew';

export const supabase = createClient(SUPABASE_URL, PUBLIC_ANON_KEY);
