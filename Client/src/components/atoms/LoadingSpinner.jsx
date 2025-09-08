const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  // Size classes
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
  };
  
  // Color classes
  const colorClasses = {
    primary: 'border-primary',
    white: 'border-white',
    gray: 'border-gray-300',
  };
  
  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent ${colorClasses[color]}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;