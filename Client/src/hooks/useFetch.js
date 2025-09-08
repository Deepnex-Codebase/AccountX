import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for making API requests with loading, error, and data states
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Fetch options
 * @param {boolean} immediate - Whether to fetch immediately
 * @returns {Object} The fetch state and control functions
 */
const useFetch = (url, options = {}, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  
  // Store the latest url and options in refs to avoid unnecessary re-fetches
  const urlRef = useRef(url);
  const optionsRef = useRef(options);
  
  // Update refs when url or options change
  useEffect(() => {
    urlRef.current = url;
    optionsRef.current = options;
  }, [url, options]);
  
  // The fetch function
  const fetchData = useCallback(async (fetchUrl = urlRef.current, fetchOptions = optionsRef.current) => {
    setLoading(true);
    setError(null);
    setStatus(null);
    
    try {
      const response = await fetch(fetchUrl, fetchOptions);
      setStatus(response.status);
      
      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      // Parse the response as JSON
      const result = await response.json();
      setData(result);
      return { data: result, status: response.status, response };
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
      return { error: err.message, status: status };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch data immediately if immediate is true
  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }
  }, [immediate, url, fetchData]);
  
  // Function to manually trigger a refetch
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);
  
  // Function to update data manually
  const updateData = useCallback((newData) => {
    setData(newData);
  }, []);
  
  return { data, loading, error, status, fetchData, refetch, updateData };
};

export default useFetch;