/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Check if a location is within a geofence
 * @param lat Latitude of point to check
 * @param lon Longitude of point to check
 * @param centerLat Latitude of geofence center
 * @param centerLon Longitude of geofence center
 * @param radius Radius of geofence in meters
 * @returns Boolean indicating if point is within geofence
 */
export const isWithinGeofence = (
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
  radius: number
): boolean => {
  const distance = calculateDistance(lat, lon, centerLat, centerLon);
  return distance <= radius;
};

/**
 * Format a distance in meters to a human-readable string
 * @param distance Distance in meters
 * @returns Formatted distance string
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(2)}km`;
  }
};