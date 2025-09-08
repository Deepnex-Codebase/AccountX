/**
 * Utility functions for mathematical calculations
 * Especially useful for accounting and financial calculations
 */

/**
 * Add two numbers with precision to avoid floating point errors
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Sum with proper precision
 */
export const add = (a, b, precision = 2) => {
  const factor = Math.pow(10, precision);
  return Math.round((a + b) * factor) / factor;
};

/**
 * Subtract two numbers with precision to avoid floating point errors
 * @param {number} a - First number
 * @param {number} b - Second number to subtract from first
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Difference with proper precision
 */
export const subtract = (a, b, precision = 2) => {
  const factor = Math.pow(10, precision);
  return Math.round((a - b) * factor) / factor;
};

/**
 * Multiply two numbers with precision to avoid floating point errors
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Product with proper precision
 */
export const multiply = (a, b, precision = 2) => {
  const factor = Math.pow(10, precision);
  return Math.round(a * b * factor) / factor;
};

/**
 * Divide two numbers with precision to avoid floating point errors
 * @param {number} a - Numerator
 * @param {number} b - Denominator
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Quotient with proper precision
 */
export const divide = (a, b, precision = 2) => {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  
  const factor = Math.pow(10, precision);
  return Math.round((a / b) * factor) / factor;
};

/**
 * Round a number to a specified precision
 * @param {number} value - The number to round
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Rounded number
 */
export const round = (value, precision = 2) => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

/**
 * Calculate the sum of an array of numbers
 * @param {Array<number>} numbers - Array of numbers to sum
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Sum of all numbers
 */
export const sum = (numbers, precision = 2) => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }
  
  const total = numbers.reduce((acc, val) => acc + (Number(val) || 0), 0);
  return round(total, precision);
};

/**
 * Calculate the average of an array of numbers
 * @param {Array<number>} numbers - Array of numbers
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Average value
 */
export const average = (numbers, precision = 2) => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }
  
  return divide(sum(numbers), numbers.length, precision);
};

/**
 * Calculate the percentage of a value
 * @param {number} value - The value to calculate percentage of
 * @param {number} total - The total value
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Percentage value
 */
export const percentage = (value, total, precision = 2) => {
  if (total === 0) {
    return 0;
  }
  
  return round((value / total) * 100, precision);
};

/**
 * Calculate the percentage change between two values
 * @param {number} oldValue - The original value
 * @param {number} newValue - The new value
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Percentage change
 */
export const percentageChange = (oldValue, newValue, precision = 2) => {
  if (oldValue === 0) {
    return newValue === 0 ? 0 : 100;
  }
  
  return round(((newValue - oldValue) / Math.abs(oldValue)) * 100, precision);
};

/**
 * Calculate compound interest
 * @param {number} principal - Principal amount
 * @param {number} rate - Interest rate (as a decimal, e.g., 0.05 for 5%)
 * @param {number} time - Time in years
 * @param {number} n - Number of times interest is compounded per year (default: 1)
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Final amount after compound interest
 */
export const compoundInterest = (principal, rate, time, n = 1, precision = 2) => {
  const amount = principal * Math.pow(1 + rate / n, n * time);
  return round(amount, precision);
};

/**
 * Calculate simple interest
 * @param {number} principal - Principal amount
 * @param {number} rate - Interest rate (as a decimal, e.g., 0.05 for 5%)
 * @param {number} time - Time in years
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Interest amount
 */
export const simpleInterest = (principal, rate, time, precision = 2) => {
  const interest = principal * rate * time;
  return round(interest, precision);
};

/**
 * Calculate future value of an investment
 * @param {number} pv - Present value
 * @param {number} r - Interest rate per period (as a decimal)
 * @param {number} n - Number of periods
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Future value
 */
export const futureValue = (pv, r, n, precision = 2) => {
  const fv = pv * Math.pow(1 + r, n);
  return round(fv, precision);
};

/**
 * Calculate present value of a future amount
 * @param {number} fv - Future value
 * @param {number} r - Interest rate per period (as a decimal)
 * @param {number} n - Number of periods
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Present value
 */
export const presentValue = (fv, r, n, precision = 2) => {
  const pv = fv / Math.pow(1 + r, n);
  return round(pv, precision);
};

/**
 * Calculate the net present value (NPV) of a series of cash flows
 * @param {number} rate - Discount rate per period (as a decimal)
 * @param {Array<number>} cashFlows - Array of cash flows (negative for outflows, positive for inflows)
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Net present value
 */
export const npv = (rate, cashFlows, precision = 2) => {
  if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
    return 0;
  }
  
  const npvValue = cashFlows.reduce((acc, flow, index) => {
    return acc + flow / Math.pow(1 + rate, index);
  }, 0);
  
  return round(npvValue, precision);
};

/**
 * Calculate the internal rate of return (IRR) of a series of cash flows
 * Uses an iterative approach to find the rate that makes NPV = 0
 * @param {Array<number>} cashFlows - Array of cash flows (first one is usually negative)
 * @param {number} precision - Decimal precision (default: 2)
 * @param {number} guess - Initial guess for IRR (default: 0.1)
 * @returns {number|null} Internal rate of return or null if not found
 */
export const irr = (cashFlows, precision = 2, guess = 0.1) => {
  if (!Array.isArray(cashFlows) || cashFlows.length <= 1) {
    return null;
  }
  
  const maxIterations = 1000;
  const tolerance = Math.pow(10, -precision);
  
  let rate = guess;
  
  for (let i = 0; i < maxIterations; i++) {
    const npvValue = npv(rate, cashFlows, precision + 4);
    
    if (Math.abs(npvValue) < tolerance) {
      return round(rate, precision);
    }
    
    // Calculate derivative of NPV function
    const derivative = cashFlows.reduce((acc, flow, index) => {
      return acc - (index * flow) / Math.pow(1 + rate, index + 1);
    }, 0);
    
    // Newton-Raphson method
    const newRate = rate - npvValue / derivative;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return round(newRate, precision);
    }
    
    rate = newRate;
  }
  
  return null; // Failed to converge
};

/**
 * Calculate depreciation using the straight-line method
 * @param {number} cost - Initial cost of the asset
 * @param {number} salvage - Salvage value at the end of useful life
 * @param {number} life - Useful life in years
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Annual depreciation amount
 */
export const straightLineDepreciation = (cost, salvage, life, precision = 2) => {
  const depreciation = (cost - salvage) / life;
  return round(depreciation, precision);
};

/**
 * Calculate depreciation using the declining balance method
 * @param {number} cost - Initial cost of the asset
 * @param {number} salvage - Salvage value at the end of useful life
 * @param {number} life - Useful life in years
 * @param {number} rate - Depreciation rate (default: 2 for double declining)
 * @param {number} year - Year to calculate depreciation for (1-based)
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Depreciation amount for the specified year
 */
export const decliningBalanceDepreciation = (cost, salvage, life, rate = 2, year = 1, precision = 2) => {
  if (year < 1 || year > life) {
    return 0;
  }
  
  const straightLineRate = 1 / life;
  const decliningRate = straightLineRate * rate;
  
  let bookValue = cost;
  let depreciation = 0;
  
  for (let i = 1; i <= year; i++) {
    // Switch to straight-line if it gives higher depreciation
    const remainingLife = life - i + 1;
    const straightLineDep = (bookValue - salvage) / remainingLife;
    const decliningDep = bookValue * decliningRate;
    
    depreciation = Math.max(straightLineDep, decliningDep, 0);
    
    if (i === year) {
      break;
    }
    
    bookValue -= depreciation;
    
    // Ensure we don't depreciate below salvage value
    if (bookValue <= salvage) {
      return 0;
    }
  }
  
  return round(depreciation, precision);
};

/**
 * Calculate weighted average
 * @param {Array<{value: number, weight: number}>} items - Array of items with value and weight
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Weighted average
 */
export const weightedAverage = (items, precision = 2) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  
  const totalWeight = items.reduce((acc, item) => acc + (item.weight || 0), 0);
  
  if (totalWeight === 0) {
    return 0;
  }
  
  const weightedSum = items.reduce((acc, item) => {
    return acc + (item.value || 0) * (item.weight || 0);
  }, 0);
  
  return round(weightedSum / totalWeight, precision);
};

/**
 * Calculate the median of an array of numbers
 * @param {Array<number>} numbers - Array of numbers
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Median value
 */
export const median = (numbers, precision = 2) => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return round((sorted[middle - 1] + sorted[middle]) / 2, precision);
  }
  
  return round(sorted[middle], precision);
};

/**
 * Calculate the variance of an array of numbers
 * @param {Array<number>} numbers - Array of numbers
 * @param {boolean} isSample - Whether this is a sample (n-1) or population (n) variance
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Variance
 */
export const variance = (numbers, isSample = true, precision = 2) => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }
  
  if (numbers.length === 1) {
    return 0;
  }
  
  const avg = average(numbers, precision + 4);
  const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
  const divisor = isSample ? numbers.length - 1 : numbers.length;
  
  return round(sum(squaredDiffs) / divisor, precision);
};

/**
 * Calculate the standard deviation of an array of numbers
 * @param {Array<number>} numbers - Array of numbers
 * @param {boolean} isSample - Whether this is a sample (n-1) or population (n) standard deviation
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Standard deviation
 */
export const standardDeviation = (numbers, isSample = true, precision = 2) => {
  return round(Math.sqrt(variance(numbers, isSample, precision + 4)), precision);
};

/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale code (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Parse a currency string to a number
 * @param {string} value - The currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (value) => {
  if (typeof value !== 'string') {
    return Number(value) || 0;
  }
  
  // Remove currency symbols, commas, and other non-numeric characters except decimal point
  const numericString = value.replace(/[^\d.-]/g, '');
  return Number(numericString) || 0;
};

/**
 * Calculate the payment for a loan or annuity
 * @param {number} principal - Loan amount or present value
 * @param {number} rate - Interest rate per period (as a decimal)
 * @param {number} periods - Number of payments
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Payment amount per period
 */
export const calculatePayment = (principal, rate, periods, precision = 2) => {
  if (rate === 0) {
    return round(principal / periods, precision);
  }
  
  const payment = principal * (rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1);
  return round(payment, precision);
};

/**
 * Calculate the remaining loan balance after a number of payments
 * @param {number} principal - Original loan amount
 * @param {number} rate - Interest rate per period (as a decimal)
 * @param {number} periods - Total number of payments
 * @param {number} paymentsMade - Number of payments already made
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Remaining balance
 */
export const calculateRemainingBalance = (principal, rate, periods, paymentsMade, precision = 2) => {
  if (paymentsMade >= periods) {
    return 0;
  }
  
  const payment = calculatePayment(principal, rate, periods, precision + 4);
  const remainingPeriods = periods - paymentsMade;
  
  const balance = payment * ((1 - Math.pow(1 + rate, -remainingPeriods)) / rate);
  return round(balance, precision);
};

/**
 * Generate an amortization schedule for a loan
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as a decimal)
 * @param {number} years - Loan term in years
 * @param {number} paymentsPerYear - Number of payments per year (default: 12)
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Array<{period: number, payment: number, principal: number, interest: number, balance: number}>} Amortization schedule
 */
export const generateAmortizationSchedule = (principal, annualRate, years, paymentsPerYear = 12, precision = 2) => {
  const periods = years * paymentsPerYear;
  const rate = annualRate / paymentsPerYear;
  const payment = calculatePayment(principal, rate, periods, precision + 4);
  
  let balance = principal;
  const schedule = [];
  
  for (let period = 1; period <= periods; period++) {
    const interestPayment = round(balance * rate, precision);
    const principalPayment = round(payment - interestPayment, precision);
    
    balance = round(balance - principalPayment, precision);
    
    // Adjust final payment to account for rounding errors
    if (period === periods) {
      const finalPrincipalPayment = round(principalPayment + balance, precision);
      balance = 0;
      
      schedule.push({
        period,
        payment: round(interestPayment + finalPrincipalPayment, precision),
        principal: finalPrincipalPayment,
        interest: interestPayment,
        balance
      });
    } else {
      schedule.push({
        period,
        payment: round(payment, precision),
        principal: principalPayment,
        interest: interestPayment,
        balance
      });
    }
  }
  
  return schedule;
};