import { create } from 'zustand';
import { ThemeState } from '../types';

export const useThemeStore = create<ThemeState>((set) => ({
  theme: localStorage.getItem('theme') as 'light' | 'dark' || 'light',
  
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      
      // Apply theme to document
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return { theme: newTheme };
    });
  }
}));

// Initialize theme from localStorage on app load
export const initTheme = () => {
  const theme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
  
  if (theme === 'dark' || 
      (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    useThemeStore.setState({ theme: 'dark' });
  }
};