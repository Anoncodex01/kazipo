import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCog, TabletSmartphone, Users, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import EmployeeList from '../components/admin/EmployeeList';
import OfficeList from '../components/admin/OfficeList';
import { useAdminStore } from '../store/adminStore';
import { startOfMonth, addMonths, subMonths } from 'date-fns';

const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'employees' | 'offices' | 'audit' | 'summary'>('employees');
  const { employees, attendanceRecords, fetchAllAttendanceRecords, isLoading } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [summaryPage, setSummaryPage] = useState(1);
  const summaryPageSize = 10;
  const [detailsPage, setDetailsPage] = useState(1);
  const detailsPageSize = 10;
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  useEffect(() => {
    if (user?.role === 'admin' && fetchAllAttendanceRecords) {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      fetchAllAttendanceRecords(month, year);
    }
  }, [user, fetchAllAttendanceRecords, currentDate]);
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }
  
  // Process attendanceRecords into history-like structure for summary
  const recordsByDate: Record<string, any[]> = {};
  (attendanceRecords || []).forEach(record => {
    const date = new Date(record.timestamp).toISOString().slice(0, 10);
    if (!recordsByDate[date]) recordsByDate[date] = [];
    recordsByDate[date].push(record);
  });
  const allDates = Object.keys(recordsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const history = allDates.map(date => {
    const records = recordsByDate[date];
    // Calculate status and hoursWorked for each employee
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

  // Flatten all attendance records for audit log
  const allRecords = (attendanceRecords || []);

  // Build attendance summary: for each day, for each employee
  const summaryRows = allDates.flatMap(date => {
    const dayRecords = recordsByDate[date] || [];
    return employees
      .filter(emp => emp.role !== 'admin')
      .map(emp => {
        const record = dayRecords.find(r => r.userId === emp.id);
        const checkIn = dayRecords.find(r => r.userId === emp.id && r.type === 'check-in');
        const checkOut = dayRecords.find(r => r.userId === emp.id && r.type === 'check-out');
        let status: any = 'absent';
        if (checkIn && checkIn.status) status = checkIn.status;
        return {
          date,
          employee: emp,
          checkIn: checkIn ? checkIn.timestamp : null,
          checkOut: checkOut ? checkOut.timestamp : null,
          hoursWorked: checkIn && checkOut ? (new Date(checkOut.timestamp).getTime() - new Date(checkIn.timestamp).getTime()) / (1000 * 60 * 60) : undefined,
          status,
          statusRaw: status
        };
      });
  });
  // Filter by status if needed
  const filteredSummaryRows = statusFilter === 'all'
    ? summaryRows
    : summaryRows.filter(row => (row.statusRaw || 'absent') === statusFilter);
  const totalDetailsPages = Math.ceil(filteredSummaryRows.length / detailsPageSize);
  const paginatedDetailsRows = filteredSummaryRows.slice((detailsPage - 1) * detailsPageSize, detailsPage * detailsPageSize);

  // Per-employee monthly summary
  const employeeMonthlyStats = employees
    .filter(emp => emp.role !== 'admin')
    .map(emp => {
      const empRows = summaryRows.filter(row => row.employee.id === emp.id);
      const presentDays = empRows.filter(row => row.status !== 'absent').length;
      const absentDays = empRows.filter(row => row.status === 'absent').length;
      const lateDays = empRows.filter(row => row.status === 'late').length;
      const earlyDepartures = empRows.filter(row => row.status === 'early-departure').length;
      return {
        employee: emp,
        presentDays,
        absentDays,
        lateDays,
        earlyDepartures,
        details: empRows
      };
    });

  // Helper to get user name by ID
  const getUserName = (userId: string) => {
    const emp = employees.find(e => e.id === userId);
    return emp ? emp.name : userId;
  };

  // Find suspicious device usage: deviceId used by multiple userIds
  const deviceUserMap: Record<string, Set<string>> = {};
  allRecords.forEach(record => {
    if (record.deviceId) {
      if (!deviceUserMap[record.deviceId]) {
        deviceUserMap[record.deviceId] = new Set();
      }
      deviceUserMap[record.deviceId].add(record.userId);
    }
  });
  const suspiciousDeviceIds = Object.entries(deviceUserMap)
    .filter(([_, userSet]) => userSet.size > 1)
    .map(([deviceId]) => deviceId);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <UserCog className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          <h1 className="ml-3 text-2xl font-bold text-gray-800 dark:text-white">
            Admin Dashboard
          </h1>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Manage employees, offices, and system settings.
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
                activeTab === 'employees'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('employees')}
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Employees
              </div>
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
                activeTab === 'offices'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('offices')}
            >
              <div className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Offices
              </div>
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('audit')}
            >
              <div className="flex items-center">
                <TabletSmartphone className="h-5 w-5 mr-2" />
                Device Audit Log
              </div>
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 focus:outline-none ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('summary')}
            >
              <div className="flex items-center">
                <span className="h-5 w-5 mr-2">📊</span>
                Attendance Summary
              </div>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'employees' ? <EmployeeList /> : activeTab === 'offices' ? <OfficeList /> : activeTab === 'audit' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {allRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                  {allRecords.map((record) => {
                    const emp = employees.find(e => e.id === record.userId);
                    return (
                      <tr
                        key={record.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                          record.deviceId && suspiciousDeviceIds.includes(record.deviceId)
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : ''
                        }`}
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          {emp?.avatar && (
                            <img src={emp.avatar} alt={emp.name} className="h-7 w-7 rounded-full object-cover border" />
                          )}
                          {emp ? emp.name : record.userId}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{record.type}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-mono">{record.deviceId || '—'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(record.timestamp).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'summary' ? (
            <div>
              <div className="mb-4 flex flex-wrap gap-2 items-center">
                <span className="font-medium text-gray-700 dark:text-gray-200">Filter by status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="rounded-md border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="on-time">On Time</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="early-departure">Early Departure</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check In</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check Out</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hours Worked</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {paginatedDetailsRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No attendance records found
                        </td>
                      </tr>
                    )}
                    {paginatedDetailsRows.map((row, idx) => (
                      <tr key={row.date + '-' + row.employee.id + '-' + idx}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          {row.employee.avatar && (
                            <img src={row.employee.avatar} alt={row.employee.name} className="h-7 w-7 rounded-full object-cover border" />
                          )}
                          {row.employee.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{row.hoursWorked ? row.hoursWorked.toFixed(1) + 'h' : '—'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {row.status === 'on-time' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">On Time</span>}
                          {row.status === 'late' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Late</span>}
                          {row.status === 'absent' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Absent</span>}
                          {row.status === 'early-departure' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Early Departure</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination Controls for Details Table */}
                {totalDetailsPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                      onClick={() => setDetailsPage(p => Math.max(1, p - 1))}
                      disabled={detailsPage === 1}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Page {detailsPage} of {totalDetailsPages}
                    </span>
                    <button
                      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                      onClick={() => setDetailsPage(p => Math.min(totalDetailsPages, p + 1))}
                      disabled={detailsPage === totalDetailsPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
              {/* Per-employee monthly summary table */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Employee Monthly Attendance Summary</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Present Days</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Absent Days</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Late Days</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Early Departures</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {employeeMonthlyStats.map((stat) => (
                        <tr key={stat.employee.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            {stat.employee.avatar && (
                              <img src={stat.employee.avatar} alt={stat.employee.name} className="h-7 w-7 rounded-full object-cover border" />
                            )}
                            {stat.employee.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stat.presentDays}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stat.absentDays}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stat.lateDays}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stat.earlyDepartures}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 cursor-pointer underline" onClick={() => setSelectedEmployeeId(stat.employee.id)}>
                            View Details
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Per-employee daily details if selected */}
              {selectedEmployeeId && (
                <div className="mb-8">
                  <div className="flex items-center mb-2">
                    <button className="mr-2 text-blue-600 dark:text-blue-400 underline text-sm" onClick={() => setSelectedEmployeeId(null)}>&larr; Back</button>
                    <h4 className="text-md font-semibold text-gray-800 dark:text-white">Attendance Details for {employees.find(e => e.id === selectedEmployeeId)?.name}</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check In</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check Out</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hours Worked</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {employeeMonthlyStats.find(e => e.employee.id === selectedEmployeeId)?.details.map((row, idx) => (
                          <tr key={row.date + '-' + idx}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{row.hoursWorked ? row.hoursWorked.toFixed(1) + 'h' : '—'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {row.status === 'on-time' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">On Time</span>}
                              {row.status === 'late' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Late</span>}
                              {row.status === 'absent' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Absent</span>}
                              {row.status === 'early-departure' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Early Departure</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;