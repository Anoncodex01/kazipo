import { create } from 'zustand';
import { LocationState } from '../types';

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: {
    latitude: null,
    longitude: null,
    accuracy: null
  },
  isLoading: false,
  error: null,
  
  getCurrentLocation: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }
      
      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      set({
        currentLocation: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        },
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get location'
      });
    }
  }
}));