console.log("Express server starting...");
console.log('BODY:', req.body);
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = 'https://bhghunmlcludapkpawav.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZ2h1bm1sY2x1ZGFwa3Bhd2F2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk4NzQwMCwiZXhwIjoyMDY0NTYzNDAwfQ.ENiR81EqGM9fxpZqxgYwHFP96f06AUp74awe0U0QUyY';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

app.post('/api/employee', async (req, res) => {
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
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}); 