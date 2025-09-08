import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing modal state
 * @param {boolean} initialState - Initial open state of the modal
 * @returns {Object} Modal state and handlers
 */
const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  // Open the modal with optional data
  const openModal = useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }, []);

  // Close the modal and clear data
  const closeModal = useCallback(() => {
    setIsOpen(false);
    
    // Restore body scrolling when modal is closed
    document.body.style.overflow = 'auto';
    
    // Clear data after animation completes
    setTimeout(() => {
      setData(null);
    }, 300); // Adjust timing based on your animation duration
  }, []);

  // Toggle the modal state
  const toggleModal = useCallback(() => {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  }, [isOpen, openModal, closeModal]);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, closeModal]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Ensure body scrolling is restored when component unmounts
      document.body.style.overflow = 'auto';
    };
  }, []);

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    toggleModal
  };
};

export default useModal;