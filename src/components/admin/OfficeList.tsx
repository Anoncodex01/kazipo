import React, { useState, useEffect } from 'react';
import { MapPin, Trash2, Edit, Plus, Search } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import { useAdminStore } from '../../store/adminStore';
import { formatDistance } from '../../utils/geoUtils';

const OfficeList: React.FC = () => {
  const { offices, isLoading, error, fetchOffices, deleteOffice } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  
  useEffect(() => {
    fetchOffices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this office?')) {
      try {
        await deleteOffice(id);
        setAlertType('success');
        setAlertMessage('Office deleted successfully');
      } catch (error) {
        setAlertType('error');
        setAlertMessage(error instanceof Error ? error.message : 'Failed to delete office');
      }
    }
  };
  
  // Filter offices by search term
  const filteredOffices = searchTerm
    ? offices.filter(
        office => office.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : offices;
  
  // Format working days
  const formatWorkingDays = (days: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => dayNames[day]).join(', ');
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Offices
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search offices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-full sm:w-64"
          />
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => alert('Add office modal would open here')}
          >
            Add Office
          </Button>
        </div>
      </CardHeader>
      
      <CardBody>
        {error && (
          <Alert
            variant="error"
            message={error}
            className="mb-4"
          />
        )}
        
        {alertMessage && (
          <Alert
            variant={alertType === 'success' ? 'success' : 'error'}
            message={alertMessage}
            className="mb-4"
            onClose={() => setAlertMessage(null)}
          />
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Office
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Geofence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Working Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Working Days
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredOffices.map((office) => {
                  // Defensive checks for required fields
                  if (!office.coordinates || typeof office.coordinates.latitude !== 'number' || typeof office.coordinates.longitude !== 'number') {
                    return (
                      <tr key={office.id} className="bg-red-50 dark:bg-red-900/30">
                        <td colSpan={5} className="px-6 py-4 text-red-600 dark:text-red-400">
                          Error: Office "{office.name}" is missing valid coordinates.
                        </td>
                      </tr>
                    );
                  }
                  if (!office.workingHours || typeof office.workingHours.start !== 'string' || typeof office.workingHours.end !== 'string') {
                    return (
                      <tr key={office.id} className="bg-red-50 dark:bg-red-900/30">
                        <td colSpan={5} className="px-6 py-4 text-red-600 dark:text-red-400">
                          Error: Office "{office.name}" is missing valid working hours.
                        </td>
                      </tr>
                    );
                  }
                  if (!Array.isArray(office.workingDays)) {
                    return (
                      <tr key={office.id} className="bg-red-50 dark:bg-red-900/30">
                        <td colSpan={5} className="px-6 py-4 text-red-600 dark:text-red-400">
                          Error: Office "{office.name}" is missing valid working days.
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={office.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {office.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {office.coordinates.latitude.toFixed(6)}, {office.coordinates.longitude.toFixed(6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {formatDistance(office.radius)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {office.workingHours.start} - {office.workingHours.end}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {formatWorkingDays(office.workingDays)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit className="h-4 w-4" />}
                          className="mr-2"
                          onClick={() => alert(`Edit office ${office.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                          onClick={() => handleDelete(office.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                
                {filteredOffices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No matching offices found' : 'No offices found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default OfficeList;