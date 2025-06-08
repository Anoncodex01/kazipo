import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface LeaveRecord {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

interface LeaveState {
  leaves: LeaveRecord[];
  isLoading: boolean;
  error: string | null;
  fetchLeaves: (userId?: string) => Promise<void>;
  addLeave: (leave: Omit<LeaveRecord, 'id' | 'status' | 'created_at'>) => Promise<void>;
  updateLeave: (id: string, data: Partial<LeaveRecord>) => Promise<void>;
  deleteLeave: (id: string) => Promise<void>;
}

export const useLeaveStore = create<LeaveState>((set, get) => ({
  leaves: [],
  isLoading: false,
  error: null,

  fetchLeaves: async (userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase.from('leave_records').select('*').order('start_date', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error) throw error;
      set({ leaves: data || [], isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch leave records' });
    }
  },

  addLeave: async (leave) => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase.from('leave_records').insert([
        {
          user_id: user.id,
          start_date: leave.start_date,
          end_date: leave.end_date,
          reason: leave.reason,
          status: 'pending',
        }
      ]);
      if (error) throw error;
      await get().fetchLeaves(user.id);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to add leave' });
    }
  },

  updateLeave: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('leave_records').update(data).eq('id', id);
      if (error) throw error;
      // Refetch leaves for the current user (or all if admin)
      const user = useAuthStore.getState().user;
      await get().fetchLeaves(user?.role === 'admin' ? undefined : user?.id);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to update leave' });
    }
  },

  deleteLeave: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('leave_records').delete().eq('id', id);
      if (error) throw error;
      const user = useAuthStore.getState().user;
      await get().fetchLeaves(user?.role === 'admin' ? undefined : user?.id);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to delete leave' });
    }
  },
})); 