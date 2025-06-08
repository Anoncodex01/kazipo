export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  avatar?: string;
  phone?: string;
  password?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  type: 'check-in' | 'check-out';
  timestamp: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // Distance from office in meters
  deviceId?: string; // Device identifier
  status?: 'on-time' | 'late' | 'absent' | 'early-departure';
}

export interface AttendanceHistory {
  date: string;
  records: AttendanceRecord[];
  hoursWorked?: number;
  status?: 'on-time' | 'late' | 'absent' | 'early-departure';
}

export interface Office {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number; // Geofence radius in meters
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  workingDays: number[]; // 0-6 (Sunday-Saturday)
}

export interface LocationState {
  currentLocation: {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
  };
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
}

export interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface AttendanceState {
  todayRecords: AttendanceRecord[];
  history: AttendanceHistory[];
  isLoading: boolean;
  error: string | null;
  checkIn: (deviceId?: string) => Promise<void>;
  checkOut: (deviceId?: string) => Promise<void>;
  fetchTodayRecords: () => Promise<void>;
  fetchHistory: (month: number, year: number) => Promise<void>;
}

export interface AdminState {
  employees: User[];
  offices: Office[];
  attendanceRecords?: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  fetchOffices: () => Promise<void>;
  addEmployee: (employee: Omit<User, 'id'>) => Promise<void>;
  updateEmployee: (id: string, data: Partial<User>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addOffice: (office: Omit<Office, 'id'>) => Promise<void>;
  updateOffice: (id: string, data: Partial<Office>) => Promise<void>;
  deleteOffice: (id: string) => Promise<void>;
  fetchAllAttendanceRecords?: (month: number, year: number) => Promise<void>;
}