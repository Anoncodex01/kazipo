// Vercel Serverless Function for creating an employee
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { name, email, password, role, avatar } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (authError || !authData.user) throw authError || new Error('Failed to create user');

    // 2. Insert profile in employees table
    const { error: profileError } = await supabase.from('employees').insert([
      {
        id: authData.user.id,
        name,
        email,
        role,
        avatar: avatar || ''
      }
    ]);
    if (profileError) throw profileError;

    res.status(201).json({ success: true, userId: authData.user.id });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to add employee' });
  }
} 