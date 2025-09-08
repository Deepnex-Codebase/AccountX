import { useState, useEffect } from 'react';

/**
 * Custom hook to track online/offline status
 * @returns {boolean} Whether the user is currently online
 */
const useOnlineStatus = () => {
  // Initialize with the current online status
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Handler to update state when browser goes online
    const handleOnline = () => {
      setIsOnline(true);
    };

    // Handler to update state when browser goes offline
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useOnlineStatus;