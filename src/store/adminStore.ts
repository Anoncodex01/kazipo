import { create } from 'zustand';
import { AdminState, User, Office } from '../types';
import { supabase } from '../lib/supabase';

export const useAdminStore = create<AdminState>((set) => ({
  employees: [],
  offices: [],
  attendanceRecords: [],
  isLoading: false,
  error: null,
  
  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from('employees').select('*');
      if (error) throw error;
      set({
        employees: data || [],
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch employees'
      });
    }
  },
  
  fetchOffices: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from('offices').select('*');
      if (error) throw error;
      const normalized = (data || []).map((office: any) => ({
        ...office,
        workingHours: office.working_hours,
        workingDays: office.working_days,
      }));
      set({
        offices: normalized,
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch offices'
      });
    }
  },
  
  addEmployee: async (employee) => {
    set({ isLoading: true, error: null });
    try {
      // Call backend endpoint to create employee
      const response = await fetch('/api/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: employee.name,
          email: employee.email,
          password: employee.password,
          role: employee.role,
          avatar: employee.avatar
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add employee');
      await (useAdminStore.getState().fetchEmployees());
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add employee'
      });
    }
  },
  
  updateEmployee: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('employees').update(data).eq('id', id);
      if (error) throw error;
      await (useAdminStore.getState().fetchEmployees());
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update employee'
      });
    }
  },
  
  deleteEmployee: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Delete from employees table
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
      await (useAdminStore.getState().fetchEmployees());
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete employee'
      });
    }
  },
  
  addOffice: async (office) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('offices').insert([office]);
      if (error) throw error;
      await (useAdminStore.getState().fetchOffices());
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add office'
      });
    }
  },
  
  updateOffice: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('offices').update(data).eq('id', id);
      if (error) throw error;
      await (useAdminStore.getState().fetchOffices());
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update office'
      });
    }
  },
  
  deleteOffice: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('offices').delete().eq('id', id);
      if (error) throw error;
      await (useAdminStore.getState().fetchOffices());
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete office'
      });
    }
  },
  
  fetchAllAttendanceRecords: async (month: number, year: number) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all attendance records for the given month
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('timestamp', new Date(year, month - 1, 1).toISOString())
        .lt('timestamp', new Date(year, month, 1).toISOString());
      if (error) throw error;
      // Normalize keys from snake_case to camelCase
      const normalized = (data || []).map((r: any) => ({
        ...r,
        userId: r.user_id,
        deviceId: r.device_id,
        // keep other fields as is
      }));
      set({ attendanceRecords: normalized, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch attendance records'
      });
    }
  }
}));

function toE164(phone: string): string {
  if (phone && phone.startsWith('07')) {
    return '+255' + phone.slice(1);
  }
  return phone;
}