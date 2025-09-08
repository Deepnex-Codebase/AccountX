import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for implementing infinite scrolling
 * @param {Object} options - Hook options
 * @param {Function} options.fetchMore - Function to fetch more data
 * @param {boolean} options.hasMore - Whether there is more data to fetch
 * @param {boolean} options.loading - Whether data is currently being loaded
 * @param {number} options.threshold - Distance from bottom to trigger loading (in pixels)
 * @param {HTMLElement} options.scrollContainer - Container to attach scroll listener to (defaults to window)
 * @returns {Object} Infinite scroll state and ref
 */
const useInfiniteScroll = ({
  fetchMore,
  hasMore = false,
  loading = false,
  threshold = 200,
  scrollContainer = null
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const observer = useRef(null);
  const lastElementRef = useRef(null);

  // Function to check if we should fetch more data
  const checkScrollPosition = useCallback(() => {
    if (loading || isFetching || !hasMore) return;

    const container = scrollContainer || window;
    const isWindow = container === window;

    const scrollHeight = isWindow
      ? document.documentElement.scrollHeight
      : container.scrollHeight;
    
    const scrollTop = isWindow
      ? window.scrollY
      : container.scrollTop;
    
    const clientHeight = isWindow
      ? window.innerHeight
      : container.clientHeight;

    // If we're close enough to the bottom, fetch more data
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      setIsFetching(true);
    }
  }, [loading, isFetching, hasMore, threshold, scrollContainer]);

  // Set up intersection observer for the last element
  const lastElementCallback = useCallback(
    (node) => {
      if (loading) return;

      // Disconnect previous observer if it exists
      if (observer.current) {
        observer.current.disconnect();
      }

      // Create a new observer
      observer.current = new IntersectionObserver(
        (entries) => {
          // If the last element is visible and we have more data to fetch
          if (entries[0].isIntersecting && hasMore && !loading && !isFetching) {
            setIsFetching(true);
          }
        },
        {
          root: scrollContainer || null,
          rootMargin: `0px 0px ${threshold}px 0px`,
          threshold: 0.1
        }
      );

      // Observe the new last element
      if (node) {
        lastElementRef.current = node;
        observer.current.observe(node);
      }
    },
    [hasMore, loading, isFetching, threshold, scrollContainer]
  );

  // Set up scroll event listener
  useEffect(() => {
    const container = scrollContainer || window;
    
    container.addEventListener('scroll', checkScrollPosition);
    
    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
    };
  }, [checkScrollPosition, scrollContainer]);

  // Fetch more data when isFetching becomes true
  useEffect(() => {
    if (!isFetching) return;

    const fetchData = async () => {
      try {
        await fetchMore();
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [isFetching, fetchMore]);

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return {
    lastElementRef: lastElementCallback,
    isFetching
  };
};

export default useInfiniteScroll;