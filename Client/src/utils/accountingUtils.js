/**
 * Utility functions for accounting and financial calculations
 */

import { round, add, subtract, multiply, divide } from './mathUtils';

/**
 * Calculate the balance of an account based on debits and credits
 * @param {Array<{amount: number, type: string}>} transactions - Array of transactions with amount and type ('debit' or 'credit')
 * @param {string} accountType - Type of account ('asset', 'expense', 'liability', 'equity', 'revenue')
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Account balance
 */
export const calculateAccountBalance = (transactions, accountType, precision = 2) => {
  if (!Array.isArray(transactions)) {
    return 0;
  }
  
  // Determine which type increases the account balance
  const increaseType = ['asset', 'expense'].includes(accountType.toLowerCase()) ? 'debit' : 'credit';
  
  let balance = 0;
  
  transactions.forEach(transaction => {
    const { amount, type } = transaction;
    const transactionAmount = Number(amount) || 0;
    
    if (type.toLowerCase() === increaseType) {
      balance = add(balance, transactionAmount, precision);
    } else {
      balance = subtract(balance, transactionAmount, precision);
    }
  });
  
  return round(balance, precision);
};

/**
 * Calculate the total debits and credits to ensure they balance
 * @param {Array<{debit: number, credit: number}>} entries - Array of journal entries with debit and credit amounts
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Object with total debits, total credits, and whether they balance
 */
export const checkJournalBalance = (entries, precision = 2) => {
  if (!Array.isArray(entries)) {
    return { totalDebits: 0, totalCredits: 0, balanced: true };
  }
  
  let totalDebits = 0;
  let totalCredits = 0;
  
  entries.forEach(entry => {
    totalDebits = add(totalDebits, Number(entry.debit) || 0, precision);
    totalCredits = add(totalCredits, Number(entry.credit) || 0, precision);
  });
  
  const balanced = Math.abs(totalDebits - totalCredits) < Math.pow(10, -precision);
  
  return {
    totalDebits: round(totalDebits, precision),
    totalCredits: round(totalCredits, precision),
    balanced
  };
};

/**
 * Calculate the trial balance from a chart of accounts
 * @param {Array<{id: string, name: string, type: string, balance: number}>} accounts - Array of accounts
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Object with debit total, credit total, and whether they balance
 */
export const calculateTrialBalance = (accounts, precision = 2) => {
  if (!Array.isArray(accounts)) {
    return { debitTotal: 0, creditTotal: 0, balanced: true };
  }
  
  let debitTotal = 0;
  let creditTotal = 0;
  
  accounts.forEach(account => {
    const balance = Number(account.balance) || 0;
    const type = account.type.toLowerCase();
    
    // Assets and expenses with positive balances go on the debit side
    if (['asset', 'expense'].includes(type) && balance > 0) {
      debitTotal = add(debitTotal, balance, precision);
    }
    // Assets and expenses with negative balances go on the credit side
    else if (['asset', 'expense'].includes(type) && balance < 0) {
      creditTotal = add(creditTotal, Math.abs(balance), precision);
    }
    // Liabilities, equity, and revenue with positive balances go on the credit side
    else if (['liability', 'equity', 'revenue'].includes(type) && balance > 0) {
      creditTotal = add(creditTotal, balance, precision);
    }
    // Liabilities, equity, and revenue with negative balances go on the debit side
    else if (['liability', 'equity', 'revenue'].includes(type) && balance < 0) {
      debitTotal = add(debitTotal, Math.abs(balance), precision);
    }
  });
  
  const balanced = Math.abs(debitTotal - creditTotal) < Math.pow(10, -precision);
  
  return {
    debitTotal: round(debitTotal, precision),
    creditTotal: round(creditTotal, precision),
    balanced
  };
};

/**
 * Calculate financial ratios from balance sheet and income statement data
 * @param {Object} financialData - Object containing financial data
 * @param {Object} financialData.balanceSheet - Balance sheet data
 * @param {Object} financialData.incomeStatement - Income statement data
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Object containing various financial ratios
 */
export const calculateFinancialRatios = (financialData, precision = 2) => {
  const { balanceSheet, incomeStatement } = financialData;
  
  // Extract values with fallbacks to 0
  const currentAssets = Number(balanceSheet?.currentAssets) || 0;
  const totalAssets = Number(balanceSheet?.totalAssets) || 0;
  const fixedAssets = Number(balanceSheet?.fixedAssets) || 0;
  const currentLiabilities = Number(balanceSheet?.currentLiabilities) || 0;
  const totalLiabilities = Number(balanceSheet?.totalLiabilities) || 0;
  const equity = Number(balanceSheet?.equity) || 0;
  const inventory = Number(balanceSheet?.inventory) || 0;
  
  const revenue = Number(incomeStatement?.revenue) || 0;
  const netIncome = Number(incomeStatement?.netIncome) || 0;
  const operatingIncome = Number(incomeStatement?.operatingIncome) || 0;
  const costOfGoodsSold = Number(incomeStatement?.costOfGoodsSold) || 0;
  
  // Calculate ratios
  const ratios = {
    // Liquidity Ratios
    currentRatio: currentLiabilities ? round(currentAssets / currentLiabilities, precision) : 0,
    quickRatio: currentLiabilities ? round((currentAssets - inventory) / currentLiabilities, precision) : 0,
    cashRatio: currentLiabilities ? round((Number(balanceSheet?.cash) || 0) / currentLiabilities, precision) : 0,
    
    // Profitability Ratios
    grossProfitMargin: revenue ? round((revenue - costOfGoodsSold) / revenue * 100, precision) : 0,
    operatingProfitMargin: revenue ? round(operatingIncome / revenue * 100, precision) : 0,
    netProfitMargin: revenue ? round(netIncome / revenue * 100, precision) : 0,
    returnOnAssets: totalAssets ? round(netIncome / totalAssets * 100, precision) : 0,
    returnOnEquity: equity ? round(netIncome / equity * 100, precision) : 0,
    
    // Solvency Ratios
    debtToEquityRatio: equity ? round(totalLiabilities / equity, precision) : 0,
    debtRatio: totalAssets ? round(totalLiabilities / totalAssets, precision) : 0,
    interestCoverageRatio: (Number(incomeStatement?.interestExpense) || 0) ?
      round(operatingIncome / (Number(incomeStatement?.interestExpense) || 1), precision) : 0,
    
    // Efficiency Ratios
    assetTurnoverRatio: totalAssets ? round(revenue / totalAssets, precision) : 0,
    inventoryTurnoverRatio: inventory ? round(costOfGoodsSold / inventory, precision) : 0,
    receivablesTurnoverRatio: (Number(balanceSheet?.accountsReceivable) || 0) ?
      round(revenue / (Number(balanceSheet?.accountsReceivable) || 1), precision) : 0,
    payablesTurnoverRatio: (Number(balanceSheet?.accountsPayable) || 0) ?
      round(costOfGoodsSold / (Number(balanceSheet?.accountsPayable) || 1), precision) : 0,
    
    // Valuation Ratios
    earningsPerShare: (Number(incomeStatement?.outstandingShares) || 0) ?
      round(netIncome / (Number(incomeStatement?.outstandingShares) || 1), precision) : 0,
    priceEarningsRatio: (netIncome && Number(incomeStatement?.marketPrice) || 0) ?
      round((Number(incomeStatement?.marketPrice) || 0) / 
            (netIncome / (Number(incomeStatement?.outstandingShares) || 1)), precision) : 0,
    bookValuePerShare: (equity && Number(incomeStatement?.outstandingShares) || 0) ?
      round(equity / (Number(incomeStatement?.outstandingShares) || 1), precision) : 0,
  };
  
  return ratios;
};

/**
 * Calculate depreciation for an asset
 * @param {Object} asset - Asset information
 * @param {number} asset.cost - Original cost of the asset
 * @param {number} asset.salvageValue - Estimated salvage value
 * @param {number} asset.usefulLife - Useful life in years
 * @param {string} asset.method - Depreciation method ('straight-line', 'declining-balance', 'units-of-production')
 * @param {number} asset.year - Year to calculate depreciation for (1-based)
 * @param {number} asset.unitsProduced - Units produced in the year (for units-of-production method)
 * @param {number} asset.totalEstimatedUnits - Total estimated units over the asset's life
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Depreciation information for the year
 */
export const calculateDepreciation = (asset, precision = 2) => {
  const {
    cost = 0,
    salvageValue = 0,
    usefulLife = 1,
    method = 'straight-line',
    year = 1,
    unitsProduced = 0,
    totalEstimatedUnits = 0,
    rate = 2 // For declining balance (2 = double declining)
  } = asset;
  
  let annualDepreciation = 0;
  let accumulatedDepreciation = 0;
  let bookValue = cost;
  
  switch (method.toLowerCase()) {
    case 'straight-line':
      annualDepreciation = round((cost - salvageValue) / usefulLife, precision);
      accumulatedDepreciation = round(annualDepreciation * Math.min(year, usefulLife), precision);
      break;
      
    case 'declining-balance':
      const straightLineRate = 1 / usefulLife;
      const decliningRate = straightLineRate * rate;
      
      // Calculate depreciation for each year up to the requested year
      let remainingBookValue = cost;
      
      for (let i = 1; i <= Math.min(year, usefulLife); i++) {
        // Switch to straight-line if it gives higher depreciation
        const remainingLife = usefulLife - i + 1;
        const straightLineDep = (remainingBookValue - salvageValue) / remainingLife;
        const decliningDep = remainingBookValue * decliningRate;
        
        // Use the higher of the two methods, but don't depreciate below salvage value
        const yearDepreciation = Math.min(
          Math.max(straightLineDep, decliningDep),
          remainingBookValue - salvageValue
        );
        
        if (i === year) {
          annualDepreciation = round(yearDepreciation, precision);
        }
        
        accumulatedDepreciation = round(accumulatedDepreciation + yearDepreciation, precision);
        remainingBookValue = round(remainingBookValue - yearDepreciation, precision);
        
        // Stop if we've reached salvage value
        if (remainingBookValue <= salvageValue) {
          remainingBookValue = salvageValue;
          break;
        }
      }
      break;
      
    case 'units-of-production':
      if (totalEstimatedUnits <= 0) {
        return {
          annualDepreciation: 0,
          accumulatedDepreciation: 0,
          bookValue: cost,
          error: 'Total estimated units must be greater than zero'
        };
      }
      
      const depreciationPerUnit = (cost - salvageValue) / totalEstimatedUnits;
      annualDepreciation = round(depreciationPerUnit * unitsProduced, precision);
      
      // We would need historical units produced data to calculate accumulated depreciation accurately
      // This is a simplified version assuming constant production each year
      accumulatedDepreciation = round(annualDepreciation * year, precision);
      
      // Ensure we don't depreciate below salvage value
      accumulatedDepreciation = Math.min(accumulatedDepreciation, cost - salvageValue);
      break;
      
    default:
      return {
        annualDepreciation: 0,
        accumulatedDepreciation: 0,
        bookValue: cost,
        error: 'Invalid depreciation method'
      };
  }
  
  // Ensure we don't depreciate below salvage value
  accumulatedDepreciation = Math.min(accumulatedDepreciation, cost - salvageValue);
  bookValue = round(cost - accumulatedDepreciation, precision);
  
  return {
    annualDepreciation,
    accumulatedDepreciation,
    bookValue
  };
};

/**
 * Calculate the present value of future cash flows
 * @param {Array<{amount: number, period: number}>} cashFlows - Array of cash flows with amount and period
 * @param {number} discountRate - Annual discount rate as a decimal
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Present value
 */
export const calculatePresentValue = (cashFlows, discountRate, precision = 2) => {
  if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
    return 0;
  }
  
  let presentValue = 0;
  
  cashFlows.forEach(cashFlow => {
    const { amount, period } = cashFlow;
    const discountFactor = Math.pow(1 + discountRate, period);
    presentValue = add(presentValue, amount / discountFactor, precision);
  });
  
  return round(presentValue, precision);
};

/**
 * Calculate the future value of present cash flows
 * @param {Array<{amount: number, period: number}>} cashFlows - Array of cash flows with amount and period
 * @param {number} interestRate - Annual interest rate as a decimal
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Future value
 */
export const calculateFutureValue = (cashFlows, interestRate, precision = 2) => {
  if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
    return 0;
  }
  
  let futureValue = 0;
  
  // Find the maximum period to calculate future value at that point
  const maxPeriod = Math.max(...cashFlows.map(cf => cf.period));
  
  cashFlows.forEach(cashFlow => {
    const { amount, period } = cashFlow;
    const growthFactor = Math.pow(1 + interestRate, maxPeriod - period);
    futureValue = add(futureValue, amount * growthFactor, precision);
  });
  
  return round(futureValue, precision);
};

/**
 * Calculate the net present value (NPV) of a project
 * @param {number} initialInvestment - Initial investment (negative number)
 * @param {Array<number>} cashFlows - Array of cash flows
 * @param {number} discountRate - Annual discount rate as a decimal
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Net present value
 */
export const calculateNPV = (initialInvestment, cashFlows, discountRate, precision = 2) => {
  if (!Array.isArray(cashFlows)) {
    return -initialInvestment;
  }
  
  let npv = -Math.abs(initialInvestment);
  
  cashFlows.forEach((cashFlow, index) => {
    const period = index + 1;
    const discountFactor = Math.pow(1 + discountRate, period);
    npv = add(npv, cashFlow / discountFactor, precision);
  });
  
  return round(npv, precision);
};

/**
 * Calculate the internal rate of return (IRR) of a project
 * @param {number} initialInvestment - Initial investment (negative number)
 * @param {Array<number>} cashFlows - Array of cash flows
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number|null} Internal rate of return or null if not found
 */
export const calculateIRR = (initialInvestment, cashFlows, precision = 2) => {
  if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
    return null;
  }
  
  // Combine initial investment with cash flows
  const allCashFlows = [-Math.abs(initialInvestment), ...cashFlows];
  
  // IRR calculation using Newton-Raphson method
  const maxIterations = 1000;
  const tolerance = Math.pow(10, -precision);
  
  let guess = 0.1; // Initial guess
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivativeNpv = 0;
    
    allCashFlows.forEach((cashFlow, index) => {
      const denominator = Math.pow(1 + guess, index);
      npv += cashFlow / denominator;
      if (index > 0) {
        derivativeNpv -= (index * cashFlow) / Math.pow(1 + guess, index + 1);
      }
    });
    
    if (Math.abs(npv) < tolerance) {
      return round(guess * 100, precision); // Convert to percentage
    }
    
    // Newton-Raphson formula
    const newGuess = guess - npv / derivativeNpv;
    
    if (Math.abs(newGuess - guess) < tolerance) {
      return round(newGuess * 100, precision); // Convert to percentage
    }
    
    guess = newGuess;
    
    // Check for non-convergence
    if (guess < -1) {
      return null;
    }
  }
  
  return null; // Failed to converge
};

/**
 * Calculate the payback period of an investment
 * @param {number} initialInvestment - Initial investment (positive number)
 * @param {Array<number>} cashFlows - Array of cash flows
 * @param {boolean} discounted - Whether to use discounted cash flows
 * @param {number} discountRate - Annual discount rate as a decimal (used if discounted is true)
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number|null} Payback period in years or null if investment is not recovered
 */
export const calculatePaybackPeriod = (initialInvestment, cashFlows, discounted = false, discountRate = 0, precision = 2) => {
  if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
    return null;
  }
  
  const investment = Math.abs(initialInvestment);
  let cumulativeCashFlow = 0;
  let paybackPeriod = null;
  
  for (let i = 0; i < cashFlows.length; i++) {
    const period = i + 1;
    let periodCashFlow = cashFlows[i];
    
    // Apply discount if required
    if (discounted) {
      periodCashFlow = periodCashFlow / Math.pow(1 + discountRate, period);
    }
    
    cumulativeCashFlow += periodCashFlow;
    
    // Check if investment has been recovered
    if (cumulativeCashFlow >= investment) {
      // Calculate fractional period
      const previousCumulativeCashFlow = cumulativeCashFlow - periodCashFlow;
      const fractionOfPeriod = (investment - previousCumulativeCashFlow) / periodCashFlow;
      paybackPeriod = period - 1 + fractionOfPeriod;
      break;
    }
  }
  
  return paybackPeriod !== null ? round(paybackPeriod, precision) : null;
};

/**
 * Calculate the break-even point
 * @param {number} fixedCosts - Total fixed costs
 * @param {number} pricePerUnit - Selling price per unit
 * @param {number} variableCostPerUnit - Variable cost per unit
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Break-even point in units and sales amount
 */
export const calculateBreakEvenPoint = (fixedCosts, pricePerUnit, variableCostPerUnit, precision = 2) => {
  if (pricePerUnit <= variableCostPerUnit) {
    return {
      units: null,
      salesAmount: null,
      error: 'Price per unit must be greater than variable cost per unit'
    };
  }
  
  const contributionMargin = subtract(pricePerUnit, variableCostPerUnit, precision);
  const breakEvenUnits = divide(fixedCosts, contributionMargin, 0); // Round up to whole units
  const breakEvenSalesAmount = multiply(breakEvenUnits, pricePerUnit, precision);
  
  return {
    units: breakEvenUnits,
    salesAmount: breakEvenSalesAmount
  };
};

/**
 * Calculate the cost of goods sold (COGS)
 * @param {number} beginningInventory - Beginning inventory value
 * @param {number} purchases - Purchases during the period
 * @param {number} endingInventory - Ending inventory value
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Cost of goods sold
 */
export const calculateCOGS = (beginningInventory, purchases, endingInventory, precision = 2) => {
  const cogs = add(beginningInventory, purchases, precision) - endingInventory;
  return round(cogs, precision);
};

/**
 * Calculate inventory valuation using different methods
 * @param {Array<{quantity: number, cost: number}>} purchases - Array of purchases with quantity and cost
 * @param {number} quantitySold - Quantity sold
 * @param {string} method - Valuation method ('fifo', 'lifo', 'average')
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Inventory valuation information
 */
export const calculateInventoryValuation = (purchases, quantitySold, method = 'fifo', precision = 2) => {
  if (!Array.isArray(purchases) || purchases.length === 0) {
    return {
      costOfGoodsSold: 0,
      remainingInventory: [],
      averageCost: 0
    };
  }
  
  // Create a copy of purchases to avoid modifying the original
  const inventory = [...purchases];
  let costOfGoodsSold = 0;
  let remainingInventory = [];
  let remainingQuantity = 0;
  let totalInventoryCost = 0;
  
  // Calculate total inventory
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
  const averageCost = totalQuantity > 0 ? round(totalCost / totalQuantity, precision) : 0;
  
  // If quantity sold is greater than total inventory, return all as COGS
  if (quantitySold >= totalQuantity) {
    return {
      costOfGoodsSold: round(totalCost, precision),
      remainingInventory: [],
      averageCost
    };
  }
  
  switch (method.toLowerCase()) {
    case 'fifo': // First-In-First-Out
      let quantityToSell = quantitySold;
      
      // Process each purchase batch until we've accounted for all sold items
      for (let i = 0; i < inventory.length; i++) {
        const { quantity, cost } = inventory[i];
        
        if (quantityToSell <= 0) {
          // Add remaining inventory as is
          remainingInventory.push({ ...inventory[i] });
          remainingQuantity += quantity;
          totalInventoryCost += quantity * cost;
        } else if (quantityToSell >= quantity) {
          // Sell entire batch
          costOfGoodsSold = add(costOfGoodsSold, multiply(quantity, cost, precision), precision);
          quantityToSell -= quantity;
        } else {
          // Sell part of batch
          costOfGoodsSold = add(costOfGoodsSold, multiply(quantityToSell, cost, precision), precision);
          const remaining = subtract(quantity, quantityToSell, 0);
          remainingInventory.push({ quantity: remaining, cost });
          remainingQuantity += remaining;
          totalInventoryCost += remaining * cost;
          quantityToSell = 0;
        }
      }
      break;
      
    case 'lifo': // Last-In-First-Out
      let lifoQuantityToSell = quantitySold;
      
      // Process each purchase batch in reverse order
      for (let i = inventory.length - 1; i >= 0; i--) {
        const { quantity, cost } = inventory[i];
        
        if (lifoQuantityToSell <= 0) {
          // Add remaining inventory as is
          remainingInventory.unshift({ ...inventory[i] });
          remainingQuantity += quantity;
          totalInventoryCost += quantity * cost;
        } else if (lifoQuantityToSell >= quantity) {
          // Sell entire batch
          costOfGoodsSold = add(costOfGoodsSold, multiply(quantity, cost, precision), precision);
          lifoQuantityToSell -= quantity;
        } else {
          // Sell part of batch
          costOfGoodsSold = add(costOfGoodsSold, multiply(lifoQuantityToSell, cost, precision), precision);
          const remaining = subtract(quantity, lifoQuantityToSell, 0);
          remainingInventory.unshift({ quantity: remaining, cost });
          remainingQuantity += remaining;
          totalInventoryCost += remaining * cost;
          lifoQuantityToSell = 0;
        }
      }
      break;
      
    case 'average': // Weighted Average Cost
      costOfGoodsSold = round(quantitySold * averageCost, precision);
      remainingQuantity = totalQuantity - quantitySold;
      totalInventoryCost = round(remainingQuantity * averageCost, precision);
      
      // Create a single entry for remaining inventory at average cost
      if (remainingQuantity > 0) {
        remainingInventory = [{
          quantity: remainingQuantity,
          cost: averageCost
        }];
      }
      break;
      
    default:
      return {
        costOfGoodsSold: 0,
        remainingInventory: [],
        averageCost: 0,
        error: 'Invalid inventory valuation method'
      };
  }
  
  const remainingAverageCost = remainingQuantity > 0 ? 
    round(totalInventoryCost / remainingQuantity, precision) : 0;
  
  return {
    costOfGoodsSold,
    remainingInventory,
    averageCost: remainingAverageCost
  };
};

/**
 * Calculate the cost of capital (WACC - Weighted Average Cost of Capital)
 * @param {number} equityCost - Cost of equity (as a decimal)
 * @param {number} equityWeight - Weight of equity in capital structure (as a decimal)
 * @param {number} debtCost - Cost of debt (as a decimal)
 * @param {number} debtWeight - Weight of debt in capital structure (as a decimal)
 * @param {number} taxRate - Corporate tax rate (as a decimal)
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {number} Weighted Average Cost of Capital
 */
export const calculateWACC = (equityCost, equityWeight, debtCost, debtWeight, taxRate, precision = 2) => {
  // Validate weights sum to 1
  if (Math.abs(equityWeight + debtWeight - 1) > 0.01) {
    throw new Error('Equity weight and debt weight must sum to 1');
  }
  
  // WACC = (E/V * Re) + (D/V * Rd * (1 - Tc))
  // Where:
  // E/V = Equity weight
  // Re = Cost of equity
  // D/V = Debt weight
  // Rd = Cost of debt
  // Tc = Corporate tax rate
  
  const equityComponent = multiply(equityCost, equityWeight, precision + 2);
  const debtComponent = multiply(
    multiply(debtCost, debtWeight, precision + 2),
    subtract(1, taxRate, precision + 2),
    precision + 2
  );
  
  const wacc = add(equityComponent, debtComponent, precision);
  return round(wacc, precision);
};

/**
 * Calculate the economic order quantity (EOQ)
 * @param {number} annualDemand - Annual demand in units
 * @param {number} orderCost - Cost per order
 * @param {number} holdingCost - Annual holding cost per unit
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} EOQ information
 */
export const calculateEOQ = (annualDemand, orderCost, holdingCost, precision = 2) => {
  if (annualDemand <= 0 || orderCost <= 0 || holdingCost <= 0) {
    return {
      economicOrderQuantity: 0,
      numberOfOrders: 0,
      totalCost: 0,
      error: 'All input values must be positive'
    };
  }
  
  // EOQ = sqrt(2 * D * S / H)
  // Where:
  // D = Annual demand
  // S = Order cost
  // H = Holding cost per unit per year
  
  const eoq = Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
  const roundedEOQ = Math.round(eoq); // EOQ should be a whole number of units
  
  const numberOfOrders = round(annualDemand / roundedEOQ, precision);
  
  // Total annual cost = Annual ordering cost + Annual holding cost
  const annualOrderingCost = multiply(orderCost, numberOfOrders, precision);
  const annualHoldingCost = multiply(holdingCost, roundedEOQ / 2, precision); // Average inventory = EOQ/2
  const totalCost = add(annualOrderingCost, annualHoldingCost, precision);
  
  return {
    economicOrderQuantity: roundedEOQ,
    numberOfOrders,
    totalCost
  };
};

/**
 * Calculate the reorder point for inventory
 * @param {number} leadTime - Lead time in days
 * @param {number} dailyUsage - Average daily usage
 * @param {number} safetyStock - Safety stock quantity
 * @returns {number} Reorder point
 */
export const calculateReorderPoint = (leadTime, dailyUsage, safetyStock = 0) => {
  return Math.ceil(leadTime * dailyUsage + safetyStock);
};

/**
 * Calculate the safety stock level
 * @param {number} leadTime - Lead time in days
 * @param {number} maxDailyUsage - Maximum daily usage
 * @param {number} avgDailyUsage - Average daily usage
 * @param {number} serviceLevel - Service level factor (e.g., 1.65 for 95% service level)
 * @param {number} stdDevDailyUsage - Standard deviation of daily usage
 * @returns {number} Safety stock level
 */
export const calculateSafetyStock = (leadTime, maxDailyUsage, avgDailyUsage, serviceLevel = 1.65, stdDevDailyUsage = null) => {
  if (stdDevDailyUsage !== null) {
    // Statistical method using standard deviation
    return Math.ceil(serviceLevel * stdDevDailyUsage * Math.sqrt(leadTime));
  }
  
  // Simple method using max usage
  return Math.ceil((maxDailyUsage - avgDailyUsage) * leadTime);
};