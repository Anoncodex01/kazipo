import React from 'react';
import { format, parseISO } from 'date-fns';
import { Check, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { AttendanceHistory } from '../../types';

interface AttendanceTableProps {
  history: AttendanceHistory[];
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ history }) => {
  // Sort history by date (most recent first)
  const sortedHistory = [...history].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Get status badge
  const getStatusBadge = (status: AttendanceHistory['status']) => {
    switch (status) {
      case 'on-time':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <Check className="h-3 w-3 mr-1" />
            On Time
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Late
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Absent
          </span>
        );
      case 'early-departure':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Early Departure
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Check In
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Check Out
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Hours Worked
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {sortedHistory.map((day) => {
            const checkInRecord = day.records.find(r => r.type === 'check-in');
            const checkOutRecord = day.records.find(r => r.type === 'check-out');
            
            return (
              <tr key={day.date} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {format(new Date(day.date), 'EEE, MMM d, yyyy')}
                  <span className="ml-2 text-xs text-gray-400">
                    ({format(new Date(day.date), 'EEEE')})
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {checkInRecord 
                    ? format(new Date(checkInRecord.timestamp), 'h:mm a')
                    : day.status === 'absent'
                    ? '—'
                    : 'No record'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {checkOutRecord 
                    ? format(new Date(checkOutRecord.timestamp), 'h:mm a')
                    : day.status === 'absent'
                    ? '—'
                    : 'No record'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {day.hoursWorked !== undefined && day.hoursWorked > 0
                    ? `${day.hoursWorked.toFixed(1)}h`
                    : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(day.status)}
                </td>
              </tr>
            );
          })}
          
          {sortedHistory.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No attendance records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;