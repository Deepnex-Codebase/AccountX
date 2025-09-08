import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Custom hook that integrates React Hook Form with Zod validation
 * @param {Object} options - Hook options
 * @param {Object} options.schema - Zod schema for validation
 * @param {Object} options.defaultValues - Default form values
 * @param {Object} options.formOptions - Additional React Hook Form options
 * @returns {Object} React Hook Form methods and state
 */
const useZodReactHookForm = ({
  schema,
  defaultValues = {},
  formOptions = {}
}) => {
  // Initialize React Hook Form with Zod resolver
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
    ...formOptions
  });

  // Destructure commonly used methods and state
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty, isValid, touchedFields },
    watch,
    setValue,
    getValues,
    trigger,
    clearErrors,
    setError,
    register
  } = methods;

  // Helper function to set multiple field values at once
  const setValues = (values) => {
    Object.entries(values).forEach(([name, value]) => {
      setValue(name, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    });
  };

  // Helper function to reset the form with new values
  const resetForm = (values = defaultValues) => {
    reset(values);
  };

  // Helper function to check if a field has an error
  const hasError = (fieldName) => {
    return Boolean(errors[fieldName]);
  };

  // Helper function to get error message for a field
  const getErrorMessage = (fieldName) => {
    return errors[fieldName]?.message || '';
  };

  // Helper function to check if a field has been touched
  const isTouched = (fieldName) => {
    return Boolean(touchedFields[fieldName]);
  };

  return {
    // Original methods
    ...methods,
    
    // Destructured for convenience
    handleSubmit,
    reset,
    control,
    errors,
    isSubmitting,
    isDirty,
    isValid,
    touchedFields,
    watch,
    setValue,
    getValues,
    trigger,
    clearErrors,
    setError,
    register,
    
    // Additional helper methods
    setValues,
    resetForm,
    hasError,
    getErrorMessage,
    isTouched
  };
};

export default useZodReactHookForm;