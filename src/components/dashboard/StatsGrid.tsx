import React, { useEffect } from 'react';
import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import { useAdminStore } from '../../store/adminStore';
import { format } from 'date-fns';

const StatsGrid: React.FC = () => {
  const {
    employees,
    attendanceRecords,
    fetchEmployees,
    fetchAllAttendanceRecords
  } = useAdminStore();

  // Fetch data if not loaded
  useEffect(() => {
    if (employees.length === 0 && fetchEmployees) {
      fetchEmployees();
    }
    // Only fetch attendance records if function exists and not loaded
    if (fetchAllAttendanceRecords) {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      // Only fetch if not loaded for today
      if (!attendanceRecords || attendanceRecords.length === 0 || !attendanceRecords.some(r => r.timestamp && r.timestamp.startsWith(format(today, 'yyyy-MM-dd')))) {
        fetchAllAttendanceRecords(month, year);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exclude admins from employee count
  const employeeList = (employees || []).filter(e => e.role !== 'admin');
  const totalEmployees = employeeList.length;

  // Today's date in yyyy-MM-dd
  const today = format(new Date(), 'yyyy-MM-dd');
  // Attendance records for today
  const todayRecords = (attendanceRecords || []).filter(r => r.timestamp && r.timestamp.startsWith(today));
  // Present today: unique userIds with a check-in today
  const presentToday = [...new Set(todayRecords.filter(r => r.type === 'check-in').map(r => r.userId))].length;
  // Late today: unique userIds with a check-in today and status 'late'
  const lateToday = [...new Set(todayRecords.filter(r => r.type === 'check-in' && r.status === 'late').map(r => r.userId))].length;
  // Avg. hours/day: average hours worked for all users today
  let avgHours = 0;
  if (employeeList.length > 0) {
    const userHours: number[] = employeeList.map(emp => {
      const checkIn = todayRecords.find(r => r.userId === emp.id && r.type === 'check-in');
      const checkOut = todayRecords.find(r => r.userId === emp.id && r.type === 'check-out');
      if (checkIn && checkOut) {
        const inTime = new Date(checkIn.timestamp).getTime();
        const outTime = new Date(checkOut.timestamp).getTime();
        return (outTime - inTime) / (1000 * 60 * 60);
      }
      return 0;
    });
    const total = userHours.reduce((a, b) => a + b, 0);
    avgHours = userHours.filter(h => h > 0).length > 0 ? total / userHours.filter(h => h > 0).length : 0;
  }

  const stats = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      icon: <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />,
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Present Today',
      value: presentToday,
      icon: <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />,
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Late Today',
      value: lateToday,
      icon: <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />,
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      title: 'Avg. Hours/Day',
      value: avgHours.toFixed(1),
      icon: <Clock className="h-6 w-6 text-purple-500 dark:text-purple-400" />,
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardBody className="flex items-center p-6">
            <div className={`rounded-full p-3 ${stat.bgColor} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                {stat.value}
              </p>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;