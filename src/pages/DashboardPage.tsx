import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import CheckInOutCard from '../components/attendance/CheckInOutCard';
import StatsGrid from '../components/dashboard/StatsGrid';
import PresenceMap from '../components/dashboard/PresenceMap';
import { useAdminStore } from '../store/adminStore';
import { useAttendanceStore } from '../store/attendanceStore';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { history, todayRecords, fetchHistory, isLoading } = useAttendanceStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch monthly history on mount
  useEffect(() => {
    const today = new Date();
    fetchHistory(today.getMonth() + 1, today.getFullYear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate summary values
  const totalDays = history.length;
  const presentDays = history.filter(day => day.status !== 'absent').length;
  const onTimeDays = history.filter(day => day.status === 'on-time').length;
  const lateDays = history.filter(day => day.status === 'late').length;
  const avgHours = history.filter(day => day.hoursWorked !== undefined && day.hoursWorked > 0).reduce((sum, day) => sum + (day.hoursWorked || 0), 0) / (presentDays || 1);
  const punctualityRate = presentDays > 0 ? (onTimeDays / presentDays) * 100 : 0;
  // Today's status
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayDayOfWeek = new Date().getDay(); // 0=Sun
  const todayHistory = history.find(day => day.date === todayDate);
  let todayStatus = 'Absent';
  let todayStatusColor = 'text-red-600 dark:text-red-400';
  // If today is Sunday (0), not a working day
  if (todayDayOfWeek === 0) {
    todayStatus = 'Not a working day';
    todayStatusColor = 'text-gray-500 dark:text-gray-400';
  } else if (todayHistory) {
    if (todayHistory.status === 'on-time') {
      todayStatus = 'Present';
      todayStatusColor = 'text-green-600 dark:text-green-400';
    } else if (todayHistory.status === 'late') {
      todayStatus = 'Late';
      todayStatusColor = 'text-yellow-600 dark:text-yellow-400';
    } else if (todayHistory.status === 'early-departure') {
      todayStatus = 'Early Departure';
      todayStatusColor = 'text-orange-600 dark:text-orange-400';
    }
  }
  
  if (!isAuthenticated) {
    return null;
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
          <Clock className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          <h1 className="ml-3 text-2xl font-bold text-gray-800 dark:text-white">
            Dashboard
          </h1>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Welcome back, {user?.name}! Track your attendance and view your stats.
        </p>
        {user?.role === 'admin' && (
          <div className="mt-6">
            <StatsGrid />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {user?.role !== 'admin' ? (
          <div className="lg:col-span-1">
            <CheckInOutCard />
          </div>
        ) : (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Recent Activity
              </h2>
              <RecentActivity />
            </div>
          </div>
        )}
        <div className="lg:col-span-2">
          {user?.role === 'admin' ? (
            <PresenceMap />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Your Attendance Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Today's Status</span>
                  <span className={`font-medium ${todayStatusColor}`}>{todayStatus}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">This Month</span>
                  <span className="font-medium text-gray-800 dark:text-white">{presentDays}/{totalDays} days</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Avg. Working Hours</span>
                  <span className="font-medium text-gray-800 dark:text-white">{avgHours.toFixed(1)} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Punctuality Rate</span>
                  <span className="font-medium text-gray-800 dark:text-white">{punctualityRate.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const RecentActivity: React.FC = () => {
  const { attendanceRecords, employees } = useAdminStore();
  const recent = (attendanceRecords || [])
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {recent.length === 0 && (
        <li className="py-2 text-gray-500 dark:text-gray-400 text-sm">No recent activity.</li>
      )}
      {recent.map((rec, idx) => {
        const emp = employees.find(e => e.id === rec.userId);
        return (
          <li key={rec.id || idx} className="py-2 flex items-center gap-2">
            {emp?.avatar && (
              <img src={emp.avatar} alt={emp.name} className="h-7 w-7 rounded-full object-cover border" />
            )}
            <span className="font-medium text-gray-800 dark:text-white">{emp ? emp.name : rec.userId}</span>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 ml-2">
              {rec.type.replace('-', ' ')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default DashboardPage;