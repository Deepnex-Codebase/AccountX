import { useState, useCallback } from 'react';
import { z } from 'zod';

/**
 * Custom hook for form handling with Zod validation
 * @param {Object} options - Hook options
 * @param {Object} options.initialValues - Initial form values
 * @param {z.ZodType} options.schema - Zod schema for validation
 * @param {Function} options.onSubmit - Function to call on successful form submission
 * @returns {Object} Form state and handlers
 */
const useZodForm = ({
  initialValues = {},
  schema,
  onSubmit = () => {}
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validate the entire form or a specific field
  const validate = useCallback((data = values, field = null) => {
    try {
      // Parse the data with the schema
      schema.parse(data);
      
      // If validation passes, clear errors for the field or all errors
      if (field) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      } else {
        setErrors({});
      }
      
      return {};
    } catch (error) {
      // If validation fails, format the errors
      const formattedErrors = {};
      
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;
        });
      }
      
      // Update only the relevant errors
      if (field) {
        setErrors(prev => ({
          ...prev,
          ...(formattedErrors[field] ? { [field]: formattedErrors[field] } : {})
        }));
      } else {
        setErrors(formattedErrors);
      }
      
      return formattedErrors;
    }
  }, [schema, values]);

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
    setValues(prev => {
      const newValues = { ...prev, [name]: value };
      
      // Validate the field if it was previously touched or form was submitted
      if (touched[name] || isSubmitted) {
        validate(newValues, name);
      }
      
      return newValues;
    });
  }, [touched, isSubmitted, validate]);

  // Handle field change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFieldValue(name, fieldValue);
  }, [setFieldValue]);

  // Set a field as touched
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
    
    // Validate the field when it's marked as touched
    if (isTouched) {
      validate(values, name);
    }
  }, [values, validate]);

  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setFieldTouched(name, true);
  }, [setFieldTouched]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    setIsSubmitted(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate the entire form
    const validationErrors = validate();
    const hasErrors = Object.keys(validationErrors).length > 0;
    
    if (!hasErrors) {
      try {
        // Call onSubmit if no errors
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
    
    return !hasErrors;
  }, [values, validate, onSubmit]);

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
    validate
  };
};

export default useZodForm;