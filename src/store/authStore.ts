import { create } from 'zustand';
import { AuthState, User } from '../types';
import { supabase } from '../lib/supabase';

function mapSupabaseUserToUser(supabaseUser: any, profile: any): User {
  return {
    id: supabaseUser.id,
    name: profile?.name || '',
    email: supabaseUser.email,
    role: profile?.role || 'employee',
    avatar: profile?.avatar || undefined,
    phone: profile?.phone || undefined
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (identifier: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      let data, error;
      if (/^\+\d{7,}$/.test(identifier)) {
        // Phone login (E.164 format)
        ({ data, error } = await supabase.auth.signInWithPassword({ phone: identifier, password }));
      } else {
        // Email login
        ({ data, error } = await supabase.auth.signInWithPassword({ email: identifier, password }));
      }
      if (error || !data.user) throw error || new Error('No user');
      // Fetch profile from employees table
      const { data: profile, error: profileError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', data.user.id)
        .single();
      if (profileError) throw profileError;
      const user = mapSupabaseUserToUser(data.user, profile);
      set({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      isAuthenticated: false
    });
  }
}));

// Initialize auth state from localStorage on app load
export const initAuth = async () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    // Check if user still exists in Supabase
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('id', user.id)
        .single();
      if (error || !data) {
        // User no longer exists, clear localStorage and state
        localStorage.removeItem('user');
        useAuthStore.setState({ user: null, isAuthenticated: false });
      } else {
        useAuthStore.setState({ user, isAuthenticated: true });
      }
    } catch (err) {
      // On error, clear auth state for safety
      localStorage.removeItem('user');
      useAuthStore.setState({ user: null, isAuthenticated: false });
    }
  }
};