import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Card, { CardBody, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import MapComponent from '../ui/MapComponent';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useLocationStore } from '../../store/locationStore';
import { formatDistance, calculateDistance } from '../../utils/geoUtils';
import { format } from 'date-fns';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const CheckInOutCard: React.FC = () => {
  const { todayRecords, isLoading, error, checkIn, checkOut, fetchTodayRecords, office, fetchOffice } = useAttendanceStore();
  const { currentLocation, getCurrentLocation } = useLocationStore();
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTodayRecords();
    getCurrentLocation();
    fetchOffice(); // Always fetch latest office location on mount
    // Collect device fingerprint
    const getDeviceId = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceId(result.visitorId);
    };
    getDeviceId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Fetch office location whenever user location changes
  useEffect(() => {
    fetchOffice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation.latitude, currentLocation.longitude]);

  // Fetch office location after check-in or check-out
  useEffect(() => {
    fetchOffice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayRecords.length]);
  
  const handleCheckIn = async () => {
    setAlertMessage(''); // Clear previous message
    if (!deviceId) {
      setAlertType('error');
      setAlertMessage('Device ID not available. Please refresh the page.');
      return;
    }
    try {
      await checkIn(deviceId);
      setAlertType('success');
      setAlertMessage('Successfully checked in!');
    } catch (error) {
      setAlertType('error');
      setAlertMessage(error instanceof Error ? error.message : 'Failed to check in');
    }
  };
  
  const handleCheckOut = async () => {
    setAlertMessage(''); // Clear previous message
    if (!deviceId) {
      setAlertType('error');
      setAlertMessage('Device ID not available. Please refresh the page.');
      return;
    }
    try {
      await checkOut(deviceId);
      setAlertType('success');
      setAlertMessage('Successfully checked out!');
    } catch (error) {
      setAlertType('error');
      setAlertMessage(error instanceof Error ? error.message : 'Failed to check out');
    }
  };
  
  // Determine if user has checked in today
  const hasCheckedIn = todayRecords.some(record => record.type === 'check-in');
  
  // Determine if user has checked out today
  const hasCheckedOut = todayRecords.some(record => record.type === 'check-out');
  
  // Get the latest check-in/out time
  const getLatestTime = (type: 'check-in' | 'check-out') => {
    const records = todayRecords.filter(record => record.type === type);
    if (records.length === 0) return null;
    
    const latestRecord = records.reduce((latest, current) => {
      return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
    });
    
    return format(new Date(latestRecord.timestamp), 'h:mm a');
  };

  // Convert current location to map format
  const userLocation = currentLocation.latitude && currentLocation.longitude
    ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
    : undefined;

  // Use office location for map and distance (from Supabase)
  const officeLocation = office
    ? { lat: office.coordinates.latitude, lng: office.coordinates.longitude }
    : undefined;
  const officeRadius = office ? office.radius : 100;

  // Calculate distance from office if location is available
  const distanceFromOffice = userLocation && officeLocation
    ? formatDistance(
        calculateDistance(
          userLocation.lat,
          userLocation.lng,
          officeLocation.lat,
          officeLocation.lng
        )
      )
    : null;
  
  // Show loading spinner if office or user location is not available
  if (!officeLocation || !currentLocation.latitude || !currentLocation.longitude) {
    return (
      <Card className="overflow-hidden">
        <CardBody className="flex flex-col items-center p-6">
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
            <div className="text-gray-600 dark:text-gray-300">
              { !officeLocation ? 'Loading office location...' : 'Getting your location...' }
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Show error if user location cannot be determined
  if (currentLocation.latitude === undefined || currentLocation.longitude === undefined) {
    return (
      <Card className="overflow-hidden">
        <CardBody className="flex flex-col items-center p-6">
          <div className="flex flex-col items-center justify-center h-48">
            <div className="text-red-500 mb-4">Unable to determine your location. Please enable location services and refresh the page.</div>
          </div>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <CardBody className="flex flex-col items-center p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        <div className="flex items-center mb-6">
          <div className="relative">
            <div className="absolute -inset-1 bg-blue-500 rounded-full opacity-25 animate-ping" />
            <div className="relative h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              {hasCheckedIn && !hasCheckedOut ? (
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              ) : hasCheckedIn && hasCheckedOut ? (
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
            {hasCheckedIn && !hasCheckedOut
              ? 'You\'re checked in!'
              : hasCheckedIn && hasCheckedOut
              ? 'You\'ve completed your day!'
              : 'Ready to start your day?'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {hasCheckedIn && !hasCheckedOut
              ? `Checked in at ${getLatestTime('check-in')}`
              : hasCheckedIn && hasCheckedOut
              ? `Checked out at ${getLatestTime('check-out')}`
              : 'Check in when you arrive at your workplace'}
          </p>
        </motion.div>
        
        {/* Location Map */}
        <div className="w-full mb-6 rounded-lg overflow-hidden">
          {officeLocation ? (
            <MapComponent
              center={officeLocation}
              userLocation={userLocation}
              radius={officeRadius}
              height="200px"
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
              Loading office location...
            </div>
          )}
        </div>
        
        {currentLocation.latitude && currentLocation.longitude && (
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center">
            <MapPin className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {distanceFromOffice ? `You are ${distanceFromOffice} from the office` : 'Location available'}
            </span>
          </div>
        )}
        
        {alertMessage !== '' && (
          <Alert
            variant={alertType === 'success' ? 'success' : 'error'}
            message={alertMessage}
            className="mb-4 w-full"
            onClose={() => setAlertMessage('')}
          />
        )}
      </CardBody>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-800 px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<MapPin className="h-5 w-5" />}
            onClick={handleCheckIn}
            disabled={isLoading || hasCheckedIn}
            isLoading={isLoading && !hasCheckedIn}
          >
            Check In
          </Button>
          
          <Button
            variant={hasCheckedOut ? 'outline' : 'secondary'}
            size="lg"
            fullWidth
            leftIcon={<Clock className="h-5 w-5" />}
            onClick={handleCheckOut}
            disabled={isLoading || !hasCheckedIn || hasCheckedOut}
            isLoading={isLoading && hasCheckedIn && !hasCheckedOut}
          >
            Check Out
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CheckInOutCard;