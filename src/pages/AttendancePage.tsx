import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parse, startOfMonth, addMonths, subMonths } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useAttendanceStore } from '../store/attendanceStore';
import { useAdminStore } from '../store/adminStore';
import AttendanceStatus from '../components/attendance/AttendanceStatus';
import AttendanceTable from '../components/attendance/AttendanceTable';

const AttendancePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { history, isLoading, error, fetchHistory } = useAttendanceStore();
  const {
    employees,
    attendanceRecords,
    fetchEmployees,
    fetchAllAttendanceRecords
  } = useAdminStore();
  const navigate = useNavigate();
  
  // Current month state
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  
  // For admin: selected employee
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    if (user?.role === 'admin') {
      if (fetchEmployees) fetchEmployees();
      if (fetchAllAttendanceRecords) fetchAllAttendanceRecords(month, year);
    } else {
      fetchHistory(month, year);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, user]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const currentMonthName = format(currentDate, 'MMMM yyyy');
  
  // Admin: filter attendanceRecords for selected employee
  let adminHistory: any[] = [];
  if (user?.role === 'admin' && selectedEmployeeId && attendanceRecords) {
    // Group records by date
    const recordsByDate: Record<string, any[]> = {};
    attendanceRecords.filter(r => r.userId === selectedEmployeeId).forEach(record => {
      const date = new Date(record.timestamp).toISOString().slice(0, 10);
      if (!recordsByDate[date]) recordsByDate[date] = [];
      recordsByDate[date].push(record);
    });
    const allDates = Object.keys(recordsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    adminHistory = allDates.map(date => {
      const records = recordsByDate[date];
      let status: 'on-time' | 'late' | 'absent' | 'early-departure' = 'absent';
      let hoursWorked: number | undefined = undefined;
      const checkIn = records.find(r => r.type === 'check-in');
      const checkOut = records.find(r => r.type === 'check-out');
      if (checkIn && checkIn.status) status = checkIn.status;
      if (checkIn && checkOut) {
        const inTime = new Date(checkIn.timestamp).getTime();
        const outTime = new Date(checkOut.timestamp).getTime();
        hoursWorked = (outTime - inTime) / (1000 * 60 * 60);
      }
      return { date, records, status, hoursWorked };
    });
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <Calendar className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          <h1 className="ml-3 text-2xl font-bold text-gray-800 dark:text-white">
            Attendance History
          </h1>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          View and manage your attendance records.
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-0">
              Monthly Overview
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreviousMonth}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {currentMonthName}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={currentDate >= startOfMonth(new Date())}
              >
                <ChevronRight className={`h-5 w-5 ${
                  currentDate >= startOfMonth(new Date())
                    ? 'text-gray-400 dark:text-gray-600'
                    : 'text-gray-600 dark:text-gray-300'
                }`} />
              </button>
            </div>
          </div>
          {/* Admin: employee selector */}
          {user?.role === 'admin' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Employee:</label>
              <select
                className="rounded-md border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                value={selectedEmployeeId || ''}
                onChange={e => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">-- Select --</option>
                {employees.filter(e => e.role !== 'admin').map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="space-y-8">
              {user?.role === 'admin' && selectedEmployeeId ? (
                <>
                  <AttendanceStatus history={adminHistory} />
                  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
                      Daily Records
                    </h3>
                    <AttendanceTable history={adminHistory} />
                  </div>
                </>
              ) : (
                <>
                  <AttendanceStatus history={history} />
                  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
                      Daily Records
                    </h3>
                    <AttendanceTable history={history} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AttendancePage;