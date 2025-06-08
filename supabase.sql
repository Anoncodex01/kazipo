-- Create employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  avatar TEXT,
  phone TEXT
);

-- Create offices table
CREATE TABLE offices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  radius INTEGER NOT NULL,
  working_hours JSONB NOT NULL,
  working_days INTEGER[] NOT NULL
);

-- Create attendance_records table
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES employees(id),
  type TEXT NOT NULL CHECK (type IN ('check-in', 'check-out')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  coordinates JSONB NOT NULL,
  distance INTEGER,
  device_id TEXT
);

-- Create leave_records table
CREATE TABLE leave_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES employees(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create holidays table
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

-- Enable RLS (Row Level Security)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Employees can view their own profile" ON employees FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all employees" ON employees FOR SELECT USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can insert employees" ON employees FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update employees" ON employees FOR UPDATE USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete employees" ON employees FOR DELETE USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can view offices" ON offices FOR SELECT USING (true);
CREATE POLICY "Admins can manage offices" ON offices FOR ALL USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Employees can view their own attendance" ON attendance_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all attendance" ON attendance_records FOR SELECT USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Employees can insert their own attendance" ON attendance_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all attendance" ON attendance_records FOR ALL USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Employees can view their own leave" ON leave_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all leave" ON leave_records FOR SELECT USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Employees can insert their own leave" ON leave_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all leave" ON leave_records FOR ALL USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can view holidays" ON holidays FOR SELECT USING (true);
CREATE POLICY "Admins can manage holidays" ON holidays FOR ALL USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin')); 