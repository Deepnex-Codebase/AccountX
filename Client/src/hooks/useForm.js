import { useState, useCallback } from 'react';

/**
 * Custom hook for form handling with validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Function to call on form submission
 * @param {Function} validate - Optional validation function
 * @returns {Object} Form state and handlers
 */
const useForm = (initialValues = {}, onSubmit = () => {}, validate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsSubmitted(false);
  }, [initialValues]);
  
  // Set a specific field value
  const setFieldValue = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);
  
  // Handle field change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFieldValue(name, fieldValue);
  }, [setFieldValue]);
  
  // Set a field as touched
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: isTouched
    }));
  }, []);
  
  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setFieldTouched(name, true);
    
    // Validate field on blur if validate function is provided
    if (validate) {
      const validationErrors = validate(values);
      setErrors(prevErrors => ({
        ...prevErrors,
        ...(validationErrors[name] ? { [name]: validationErrors[name] } : {})
      }));
    }
  }, [values, validate, setFieldTouched]);
  
  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validate) return {};
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return validationErrors;
  }, [values, validate]);
  
  // Handle form submission
  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    setIsSubmitted(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate form
    const validationErrors = validateForm();
    const hasErrors = Object.keys(validationErrors).length > 0;
    
    if (!hasErrors) {
      // Call onSubmit if no errors
      Promise.resolve(onSubmit(values))
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, validateForm]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    resetForm,
    validateForm
  };
};

export default useForm;