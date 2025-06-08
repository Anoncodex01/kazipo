import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bhghunmlcludapkpawav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZ2h1bm1sY2x1ZGFwa3Bhd2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5ODc0MDAsImV4cCI6MjA2NDU2MzQwMH0.PGjD-ZIlhc--P9zVZUjy5-9Hv5J6mTiqfP1aSrIIznw';
export const supabase = createClient(supabaseUrl, supabaseKey); 