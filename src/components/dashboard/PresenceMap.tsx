import React from 'react';
import { MapPin, Users } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import MapComponent from '../ui/MapComponent';
import { useAdminStore } from '../../store/adminStore';

const PresenceMap: React.FC = () => {
  const { offices, fetchOffices } = useAdminStore();
  React.useEffect(() => { fetchOffices(); }, [fetchOffices]);
  const office = offices[0];
  if (!office) return null;
  // Map working_hours (from Supabase) to workingHours for TS compatibility
  const workingHours = (office as any).working_hours || office.workingHours;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {office.name} Presence
          </h2>
        </div>
      </CardHeader>
      <CardBody>
        <div className="relative rounded-lg overflow-hidden mb-4">
          <MapComponent
            center={{ lat: office.coordinates.latitude, lng: office.coordinates.longitude }}
            radius={office.radius}
            height="300px"
          />
        </div>
        {workingHours && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Working Hours: {workingHours.start} - {workingHours.end}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PresenceMap;