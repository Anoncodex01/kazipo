import React from 'react';
import { Clock, Check, AlertTriangle, XCircle } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';
import { AttendanceHistory } from '../../types';

interface AttendanceStatusProps {
  history: AttendanceHistory[];
}

const AttendanceStatus: React.FC<AttendanceStatusProps> = ({ history }) => {
  // Calculate statistics
  const totalDays = history.length;
  const presentDays = history.filter(day => day.status !== 'absent').length;
  const lateDays = history.filter(day => day.status === 'late').length;
  const earlyDepartures = history.filter(day => day.status === 'early-departure').length;
  const onTimeDays = history.filter(day => day.status === 'on-time').length;
  
  // Calculate attendance rate
  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
  
  // Calculate punctuality rate
  const punctualityRate = presentDays > 0 ? (onTimeDays / presentDays) * 100 : 0;
  
  // Get status color and icon
  const getStatusDetails = (status: AttendanceHistory['status']) => {
    switch (status) {
      case 'on-time':
        return {
          icon: <Check className="h-5 w-5 text-green-500 dark:text-green-400" />,
          color: 'text-green-500 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20'
        };
      case 'late':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
          color: 'text-yellow-500 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
        };
      case 'absent':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
          color: 'text-red-500 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20'
        };
      case 'early-departure':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />,
          color: 'text-orange-500 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20'
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
          color: 'text-gray-500 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800'
        };
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardBody>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Attendance Overview
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Attendance Rate
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {attendanceRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Punctuality Rate
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {punctualityRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 dark:bg-green-400 h-2 rounded-full"
                  style={{ width: `${punctualityRate}%` }}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      
      <Card>
        <CardBody>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Attendance Statistics
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-md bg-blue-100 dark:bg-blue-900/20">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Present Days
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
                {presentDays}
              </p>
            </div>
            
            <div className="p-3 rounded-md bg-yellow-100 dark:bg-yellow-900/20">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Late Days
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
                {lateDays}
              </p>
            </div>
            
            <div className="p-3 rounded-md bg-orange-100 dark:bg-orange-900/20">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Early Departures
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
                {earlyDepartures}
              </p>
            </div>
            
            <div className="p-3 rounded-md bg-red-100 dark:bg-red-900/20">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Absent Days
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">
                {totalDays - presentDays}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AttendanceStatus;