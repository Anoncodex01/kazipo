import { create } from 'zustand';
import { AttendanceState, AttendanceRecord, AttendanceHistory, Office } from '../types';
import { useAuthStore } from './authStore';
import { useLocationStore } from './locationStore';
import { format } from 'date-fns';
import { calculateDistance } from '../utils/geoUtils';
import { supabase } from '../lib/supabase';

export const useAttendanceStore = create<AttendanceState & { office: Office | null; fetchOffice: () => Promise<void>; }>((set, get) => ({
  todayRecords: [],
  history: [],
  isLoading: false,
  error: null,
  office: null,
  fetchOffice: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from('offices').select('*').limit(1);
      if (error) throw error;
      set({ office: data && data.length > 0 ? data[0] : null, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch office' });
    }
  },
  
  checkIn: async (deviceId?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Get current user
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('You must be logged in to check in');
      }
      
      // Fetch allowed device IDs for this user
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('device_ids')
        .eq('id', user.id)
        .single();
      if (employeeError) throw employeeError;
      let allowedDeviceIds: string[] = Array.isArray(employeeData?.device_ids) ? employeeData.device_ids : [];
      // Check if deviceId is already registered to another user
      if (deviceId) {
        const { data: otherUsers, error: otherUsersError } = await supabase
          .from('employees')
          .select('id, device_ids')
          .neq('id', user.id);
        if (otherUsersError) throw otherUsersError;
        const deviceUsedByOther = (otherUsers || []).some((emp: any) => Array.isArray(emp.device_ids) && emp.device_ids.includes(deviceId));
        if (deviceUsedByOther) {
          throw new Error('This device is already registered to another employee. Please contact admin.');
        }
      }
      // If no device registered, register this one
      if (deviceId && (!allowedDeviceIds || allowedDeviceIds.length === 0)) {
        const { error: updateError } = await supabase
          .from('employees')
          .update({ device_ids: [deviceId] })
          .eq('id', user.id);
        if (updateError) throw updateError;
        allowedDeviceIds = [deviceId];
      }
      // Only allow check-in if deviceId is in allowed list
      if (deviceId && allowedDeviceIds.length > 0 && !allowedDeviceIds.includes(deviceId)) {
        throw new Error('Unrecognized device. Please contact admin.');
      }
      
      // Get current location
      await useLocationStore.getState().getCurrentLocation();
      const location = useLocationStore.getState().currentLocation;
      
      if (!location.latitude || !location.longitude) {
        throw new Error('Unable to get your current location');
      }
      
      const office = get().office;
      if (!office) {
        throw new Error('Office location not loaded');
      }
      
      // Calculate distance from office
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        office.coordinates.latitude,
        office.coordinates.longitude
      );
      
      // Check if within geofence
      if (distance > office.radius) {
        throw new Error(`You are ${distance >= 1000 ? (distance / 1000).toFixed(2) + ' km' : Math.round(distance) + ' meters'} away from the office. You must be within ${office.radius} meters to check in.`);
      }
      
      // Calculate status (on-time/late)
      let status: 'on-time' | 'late' = 'on-time';
      const now = new Date();
      const localNow = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // Africa/Dar_es_Salaam UTC+3
      const workingHours = office.workingHours || { start: '09:00', end: '17:00' }; // fallback if undefined
      const [startHour, startMinute] = workingHours.start.split(':').map(Number);
      const start = new Date(localNow);
      start.setHours(startHour, startMinute, 0, 0);
      const gracePeriodEnd = new Date(start.getTime() + 30 * 60 * 1000);
      if (localNow > gracePeriodEnd) {
        status = 'late';
      }
      
      // Create check-in record
      const checkInRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId: user.id,
        type: 'check-in',
        timestamp: now.toISOString(),
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        distance,
        deviceId,
        status
      };
      
      // Insert into Supabase with only valid DB fields
      const { error } = await supabase.from('attendance_records').insert([
        {
          user_id: checkInRecord.userId,
          type: checkInRecord.type,
          timestamp: checkInRecord.timestamp,
          coordinates: checkInRecord.coordinates,
          distance: Math.round(checkInRecord.distance ?? 0),
          device_id: deviceId,
          status: checkInRecord.status
        }
      ]);
      
      // Only update state if successful
      await get().fetchTodayRecords();
      
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Check-in failed'
      });
      throw error; // Rethrow so UI can show only the error
    }
  },
  
  checkOut: async (deviceId?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Get current user
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('You must be logged in to check out');
      }
      
      // Get current location
      await useLocationStore.getState().getCurrentLocation();
      const location = useLocationStore.getState().currentLocation;
      
      if (!location.latitude || !location.longitude) {
        throw new Error('Unable to get your current location');
      }
      
      const office = get().office;
      if (!office) {
        throw new Error('Office location not loaded');
      }
      
      // Calculate distance from office
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        office.coordinates.latitude,
        office.coordinates.longitude
      );
      
      // Check if within geofence
      if (distance > office.radius) {
        throw new Error(`You are outside the office geofence (${Math.round(distance / 1000)}km away)`);
      }
      
      // Optionally, calculate early-departure status here if you want to mark it on check-out
      // For now, we just set status to undefined for check-out
      const checkOutRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId: user.id,
        type: 'check-out',
        timestamp: new Date().toISOString(),
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        distance,
        deviceId
        // status: 'early-departure' // Optionally set if you want
      };
      
      // Insert into Supabase with only valid DB fields
      const { error: errorOut } = await supabase.from('attendance_records').insert([
        {
          user_id: checkOutRecord.userId,
          type: checkOutRecord.type,
          timestamp: checkOutRecord.timestamp,
          coordinates: checkOutRecord.coordinates,
          distance: Math.round(checkOutRecord.distance ?? 0),
          device_id: deviceId,
          status: checkOutRecord.status // will be undefined unless you set it
        }
      ]);
      
      // Update state
      await get().fetchTodayRecords();
      
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Check-out failed'
      });
    }
  },
  
  fetchTodayRecords: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Get current user
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get today's date
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Fetch records from Supabase
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', today)
        .lt('timestamp', new Date(new Date(today).getTime() + 86400000).toISOString());
      
      if (error) throw error;
      
      set({
        todayRecords: data || [],
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch today\'s records'
      });
    }
  },
  
  fetchHistory: async (month: number, year: number) => {
    set({ isLoading: true, error: null });
    
    try {
      // Get current user
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch records from Supabase
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', new Date(year, month - 1, 1).toISOString())
        .lt('timestamp', new Date(year, month, 1).toISOString());
      
      if (error) throw error;
      
      // Process data into history format
      const history: AttendanceHistory[] = [];
      const recordsByDate: Record<string, AttendanceRecord[]> = {};
      
      data.forEach(record => {
        const date = format(new Date(record.timestamp), 'yyyy-MM-dd');
        if (!recordsByDate[date]) {
          recordsByDate[date] = [];
        }
        recordsByDate[date].push(record);
      });
      
      const office = get().office;
      
      // Working days: Mon-Fri (1-5), Sat (6), Sun (0)
      // Mon-Fri: 09:00-18:00, Sat: 08:00-12:00, Sun: not a working day
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month - 1, d);
        const dateStr = format(dateObj, 'yyyy-MM-dd');
        const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        let isWorkingDay = false;
        let workingHours = { start: '09:00', end: '18:00' };
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          // Monday to Friday: 09:00–18:00
          isWorkingDay = true;
          workingHours = { start: '09:00', end: '18:00' };
        } else if (dayOfWeek === 6) {
          // Saturday: 08:00–12:00
          isWorkingDay = true;
          workingHours = { start: '08:00', end: '12:00' };
        } // Sunday (0) is not a working day
        if (!isWorkingDay) continue;
        const records = recordsByDate[dateStr] || [];
        // Find check-in and check-out records
        const checkIn = records.find(r => r.type === 'check-in');
        const checkOut = records.find(r => r.type === 'check-out');
        let status: 'on-time' | 'late' | 'absent' | 'early-departure' = 'absent';
        let hoursWorked: number | undefined = undefined;
        // Prefer status from DB if present
        if (checkIn && checkIn.status) {
          status = checkIn.status;
        } else if (checkIn) {
          const checkInTime = new Date(checkIn.timestamp);
          // Convert checkInTime to local time (Africa/Dar_es_Salaam, UTC+3)
          const localCheckIn = new Date(checkInTime.getTime() + (3 * 60 * 60 * 1000));
          const [startHour, startMinute] = workingHours.start.split(':').map(Number);
          const start = new Date(localCheckIn);
          start.setHours(startHour, startMinute, 0, 0);
          // Add 30-minute grace period
          const gracePeriodEnd = new Date(start.getTime() + 30 * 60 * 1000);
          // If check-in is after grace period, mark as late
          status = localCheckIn > gracePeriodEnd ? 'late' : 'on-time';
        }
        if (checkIn && checkOut) {
          const inTime = new Date(checkIn.timestamp).getTime();
          const outTime = new Date(checkOut.timestamp).getTime();
          hoursWorked = (outTime - inTime) / (1000 * 60 * 60); // hours
        }
        history.push({ date: dateStr, records, status, hoursWorked });
      }
      
      set({
        history,
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history'
      });
    }
  }
}));