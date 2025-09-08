/**
 * Utility functions for financial reports and data visualization
 */

import { round, add, subtract } from './mathUtils';

/**
 * Generate data for a balance sheet report
 * @param {Object} accounts - Chart of accounts data
 * @param {Date} asOfDate - Date for the balance sheet
 * @param {boolean} compareWithPrevious - Whether to include comparison with previous period
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Formatted balance sheet data
 */
export const generateBalanceSheetData = (accounts, asOfDate, compareWithPrevious = false, precision = 2) => {
  if (!accounts || !Array.isArray(accounts.assets) || !Array.isArray(accounts.liabilities) || !Array.isArray(accounts.equity)) {
    return null;
  }
  
  // Helper function to calculate totals for a section
  const calculateSectionTotals = (items) => {
    return items.reduce((total, item) => {
      const currentBalance = Number(item.currentBalance) || 0;
      const previousBalance = compareWithPrevious ? (Number(item.previousBalance) || 0) : 0;
      
      return {
        current: add(total.current, currentBalance, precision),
        previous: compareWithPrevious ? add(total.previous, previousBalance, precision) : 0
      };
    }, { current: 0, previous: 0 });
  };
  
  // Calculate totals for each section
  const currentAssets = calculateSectionTotals(accounts.assets.filter(a => a.type === 'current'));
  const fixedAssets = calculateSectionTotals(accounts.assets.filter(a => a.type === 'fixed'));
  const otherAssets = calculateSectionTotals(accounts.assets.filter(a => a.type === 'other'));
  
  const currentLiabilities = calculateSectionTotals(accounts.liabilities.filter(l => l.type === 'current'));
  const longTermLiabilities = calculateSectionTotals(accounts.liabilities.filter(l => l.type === 'long-term'));
  
  const equityAccounts = calculateSectionTotals(accounts.equity);
  
  // Calculate totals
  const totalAssets = {
    current: add(add(currentAssets.current, fixedAssets.current, precision), otherAssets.current, precision),
    previous: compareWithPrevious ? 
      add(add(currentAssets.previous, fixedAssets.previous, precision), otherAssets.previous, precision) : 0
  };
  
  const totalLiabilities = {
    current: add(currentLiabilities.current, longTermLiabilities.current, precision),
    previous: compareWithPrevious ? 
      add(currentLiabilities.previous, longTermLiabilities.previous, precision) : 0
  };
  
  const totalLiabilitiesAndEquity = {
    current: add(totalLiabilities.current, equityAccounts.current, precision),
    previous: compareWithPrevious ? 
      add(totalLiabilities.previous, equityAccounts.previous, precision) : 0
  };
  
  // Format the date
  const formattedDate = asOfDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate previous date (typically 1 year before)
  const previousDate = new Date(asOfDate);
  previousDate.setFullYear(previousDate.getFullYear() - 1);
  const formattedPreviousDate = previousDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return {
    reportTitle: 'Balance Sheet',
    asOfDate: formattedDate,
    previousDate: compareWithPrevious ? formattedPreviousDate : null,
    assets: {
      current: accounts.assets.filter(a => a.type === 'current').map(a => ({
        ...a,
        currentBalance: round(Number(a.currentBalance) || 0, precision),
        previousBalance: compareWithPrevious ? round(Number(a.previousBalance) || 0, precision) : null
      })),
      fixed: accounts.assets.filter(a => a.type === 'fixed').map(a => ({
        ...a,
        currentBalance: round(Number(a.currentBalance) || 0, precision),
        previousBalance: compareWithPrevious ? round(Number(a.previousBalance) || 0, precision) : null
      })),
      other: accounts.assets.filter(a => a.type === 'other').map(a => ({
        ...a,
        currentBalance: round(Number(a.currentBalance) || 0, precision),
        previousBalance: compareWithPrevious ? round(Number(a.previousBalance) || 0, precision) : null
      })),
      totals: {
        currentAssets,
        fixedAssets,
        otherAssets,
        totalAssets
      }
    },
    liabilities: {
      current: accounts.liabilities.filter(l => l.type === 'current').map(l => ({
        ...l,
        currentBalance: round(Number(l.currentBalance) || 0, precision),
        previousBalance: compareWithPrevious ? round(Number(l.previousBalance) || 0, precision) : null
      })),
      longTerm: accounts.liabilities.filter(l => l.type === 'long-term').map(l => ({
        ...l,
        currentBalance: round(Number(l.currentBalance) || 0, precision),
        previousBalance: compareWithPrevious ? round(Number(l.previousBalance) || 0, precision) : null
      })),
      totals: {
        currentLiabilities,
        longTermLiabilities,
        totalLiabilities
      }
    },
    equity: {
      accounts: accounts.equity.map(e => ({
        ...e,
        currentBalance: round(Number(e.currentBalance) || 0, precision),
        previousBalance: compareWithPrevious ? round(Number(e.previousBalance) || 0, precision) : null
      })),
      total: equityAccounts
    },
    totalLiabilitiesAndEquity
  };
};

/**
 * Generate data for an income statement report
 * @param {Object} accounts - Chart of accounts data
 * @param {Date} startDate - Start date for the income statement
 * @param {Date} endDate - End date for the income statement
 * @param {boolean} compareWithPrevious - Whether to include comparison with previous period
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Formatted income statement data
 */
export const generateIncomeStatementData = (accounts, startDate, endDate, compareWithPrevious = false, precision = 2) => {
  if (!accounts || !Array.isArray(accounts.revenue) || !Array.isArray(accounts.expenses)) {
    return null;
  }
  
  // Helper function to calculate totals for a section
  const calculateSectionTotals = (items) => {
    return items.reduce((total, item) => {
      const currentAmount = Number(item.currentAmount) || 0;
      const previousAmount = compareWithPrevious ? (Number(item.previousAmount) || 0) : 0;
      
      return {
        current: add(total.current, currentAmount, precision),
        previous: compareWithPrevious ? add(total.previous, previousAmount, precision) : 0
      };
    }, { current: 0, previous: 0 });
  };
  
  // Calculate totals for each section
  const revenueTotal = calculateSectionTotals(accounts.revenue);
  const expensesTotal = calculateSectionTotals(accounts.expenses);
  
  // Calculate net income
  const netIncome = {
    current: subtract(revenueTotal.current, expensesTotal.current, precision),
    previous: compareWithPrevious ? 
      subtract(revenueTotal.previous, expensesTotal.previous, precision) : 0
  };
  
  // Format the dates
  const formatDate = (date) => date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  
  // Calculate previous period dates
  const dateRange = endDate.getTime() - startDate.getTime();
  const previousStartDate = new Date(startDate.getTime() - dateRange);
  const previousEndDate = new Date(startDate.getTime() - 1);
  
  const formattedPreviousStartDate = formatDate(previousStartDate);
  const formattedPreviousEndDate = formatDate(previousEndDate);
  
  return {
    reportTitle: 'Income Statement',
    period: `${formattedStartDate} to ${formattedEndDate}`,
    previousPeriod: compareWithPrevious ? `${formattedPreviousStartDate} to ${formattedPreviousEndDate}` : null,
    revenue: {
      accounts: accounts.revenue.map(r => ({
        ...r,
        currentAmount: round(Number(r.currentAmount) || 0, precision),
        previousAmount: compareWithPrevious ? round(Number(r.previousAmount) || 0, precision) : null
      })),
      total: revenueTotal
    },
    expenses: {
      accounts: accounts.expenses.map(e => ({
        ...e,
        currentAmount: round(Number(e.currentAmount) || 0, precision),
        previousAmount: compareWithPrevious ? round(Number(e.previousAmount) || 0, precision) : null
      })),
      total: expensesTotal
    },
    netIncome
  };
};

/**
 * Generate data for a cash flow statement
 * @param {Object} accounts - Chart of accounts data
 * @param {Date} startDate - Start date for the cash flow statement
 * @param {Date} endDate - End date for the cash flow statement
 * @param {boolean} compareWithPrevious - Whether to include comparison with previous period
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Formatted cash flow statement data
 */
export const generateCashFlowStatementData = (accounts, startDate, endDate, compareWithPrevious = false, precision = 2) => {
  if (!accounts || !Array.isArray(accounts.operating) || !Array.isArray(accounts.investing) || !Array.isArray(accounts.financing)) {
    return null;
  }
  
  // Helper function to calculate totals for a section
  const calculateSectionTotals = (items) => {
    return items.reduce((total, item) => {
      const currentAmount = Number(item.currentAmount) || 0;
      const previousAmount = compareWithPrevious ? (Number(item.previousAmount) || 0) : 0;
      
      return {
        current: add(total.current, currentAmount, precision),
        previous: compareWithPrevious ? add(total.previous, previousAmount, precision) : 0
      };
    }, { current: 0, previous: 0 });
  };
  
  // Calculate totals for each section
  const operatingTotal = calculateSectionTotals(accounts.operating);
  const investingTotal = calculateSectionTotals(accounts.investing);
  const financingTotal = calculateSectionTotals(accounts.financing);
  
  // Calculate net change in cash
  const netChange = {
    current: add(add(operatingTotal.current, investingTotal.current, precision), financingTotal.current, precision),
    previous: compareWithPrevious ? 
      add(add(operatingTotal.previous, investingTotal.previous, precision), financingTotal.previous, precision) : 0
  };
  
  // Format the dates
  const formatDate = (date) => date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  
  // Calculate previous period dates
  const dateRange = endDate.getTime() - startDate.getTime();
  const previousStartDate = new Date(startDate.getTime() - dateRange);
  const previousEndDate = new Date(startDate.getTime() - 1);
  
  const formattedPreviousStartDate = formatDate(previousStartDate);
  const formattedPreviousEndDate = formatDate(previousEndDate);
  
  // Get beginning and ending cash balances
  const beginningCash = {
    current: Number(accounts.beginningCash?.current) || 0,
    previous: compareWithPrevious ? (Number(accounts.beginningCash?.previous) || 0) : 0
  };
  
  const endingCash = {
    current: add(beginningCash.current, netChange.current, precision),
    previous: compareWithPrevious ? add(beginningCash.previous, netChange.previous, precision) : 0
  };
  
  return {
    reportTitle: 'Cash Flow Statement',
    period: `${formattedStartDate} to ${formattedEndDate}`,
    previousPeriod: compareWithPrevious ? `${formattedPreviousStartDate} to ${formattedPreviousEndDate}` : null,
    operating: {
      accounts: accounts.operating.map(o => ({
        ...o,
        currentAmount: round(Number(o.currentAmount) || 0, precision),
        previousAmount: compareWithPrevious ? round(Number(o.previousAmount) || 0, precision) : null
      })),
      total: operatingTotal
    },
    investing: {
      accounts: accounts.investing.map(i => ({
        ...i,
        currentAmount: round(Number(i.currentAmount) || 0, precision),
        previousAmount: compareWithPrevious ? round(Number(i.previousAmount) || 0, precision) : null
      })),
      total: investingTotal
    },
    financing: {
      accounts: accounts.financing.map(f => ({
        ...f,
        currentAmount: round(Number(f.currentAmount) || 0, precision),
        previousAmount: compareWithPrevious ? round(Number(f.previousAmount) || 0, precision) : null
      })),
      total: financingTotal
    },
    netChange,
    beginningCash: {
      current: round(beginningCash.current, precision),
      previous: compareWithPrevious ? round(beginningCash.previous, precision) : null
    },
    endingCash: {
      current: round(endingCash.current, precision),
      previous: compareWithPrevious ? round(endingCash.previous, precision) : null
    }
  };
};

/**
 * Generate data for a trial balance report
 * @param {Array} accounts - Chart of accounts data
 * @param {Date} asOfDate - Date for the trial balance
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Formatted trial balance data
 */
export const generateTrialBalanceData = (accounts, asOfDate, precision = 2) => {
  if (!Array.isArray(accounts)) {
    return null;
  }
  
  let totalDebits = 0;
  let totalCredits = 0;
  
  const accountsWithBalances = accounts.map(account => {
    const balance = Number(account.balance) || 0;
    const type = account.type.toLowerCase();
    let debit = 0;
    let credit = 0;
    
    // Assets and expenses with positive balances go on the debit side
    if (['asset', 'expense'].includes(type) && balance > 0) {
      debit = balance;
      totalDebits = add(totalDebits, debit, precision);
    }
    // Assets and expenses with negative balances go on the credit side
    else if (['asset', 'expense'].includes(type) && balance < 0) {
      credit = Math.abs(balance);
      totalCredits = add(totalCredits, credit, precision);
    }
    // Liabilities, equity, and revenue with positive balances go on the credit side
    else if (['liability', 'equity', 'revenue'].includes(type) && balance > 0) {
      credit = balance;
      totalCredits = add(totalCredits, credit, precision);
    }
    // Liabilities, equity, and revenue with negative balances go on the debit side
    else if (['liability', 'equity', 'revenue'].includes(type) && balance < 0) {
      debit = Math.abs(balance);
      totalDebits = add(totalDebits, debit, precision);
    }
    
    return {
      ...account,
      debit: round(debit, precision),
      credit: round(credit, precision)
    };
  });
  
  // Format the date
  const formattedDate = asOfDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return {
    reportTitle: 'Trial Balance',
    asOfDate: formattedDate,
    accounts: accountsWithBalances,
    totals: {
      debits: round(totalDebits, precision),
      credits: round(totalCredits, precision),
      balanced: Math.abs(totalDebits - totalCredits) < Math.pow(10, -precision)
    }
  };
};

/**
 * Generate data for a general ledger report
 * @param {Array} accounts - Chart of accounts data
 * @param {Array} transactions - Transaction data
 * @param {Date} startDate - Start date for the general ledger
 * @param {Date} endDate - End date for the general ledger
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Formatted general ledger data
 */
export const generateGeneralLedgerData = (accounts, transactions, startDate, endDate, precision = 2) => {
  if (!Array.isArray(accounts) || !Array.isArray(transactions)) {
    return null;
  }
  
  // Filter transactions by date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
  
  // Group transactions by account
  const transactionsByAccount = {};
  
  filteredTransactions.forEach(transaction => {
    transaction.entries.forEach(entry => {
      const accountId = entry.accountId;
      
      if (!transactionsByAccount[accountId]) {
        transactionsByAccount[accountId] = [];
      }
      
      transactionsByAccount[accountId].push({
        date: transaction.date,
        description: transaction.description,
        reference: transaction.reference,
        debit: entry.debit || 0,
        credit: entry.credit || 0
      });
    });
  });
  
  // Create ledger for each account
  const ledger = accounts.map(account => {
    const accountTransactions = transactionsByAccount[account.id] || [];
    let runningBalance = Number(account.beginningBalance) || 0;
    const type = account.type.toLowerCase();
    const isDebitNormal = ['asset', 'expense'].includes(type);
    
    const entries = accountTransactions.map(transaction => {
      const debit = Number(transaction.debit) || 0;
      const credit = Number(transaction.credit) || 0;
      
      // Update running balance based on account type
      if (isDebitNormal) {
        runningBalance = add(runningBalance, subtract(debit, credit, precision), precision);
      } else {
        runningBalance = add(runningBalance, subtract(credit, debit, precision), precision);
      }
      
      return {
        ...transaction,
        debit: round(debit, precision),
        credit: round(credit, precision),
        balance: round(runningBalance, precision)
      };
    });
    
    return {
      account: {
        id: account.id,
        number: account.number,
        name: account.name,
        type: account.type
      },
      beginningBalance: round(Number(account.beginningBalance) || 0, precision),
      entries,
      endingBalance: round(runningBalance, precision)
    };
  }).filter(account => account.entries.length > 0 || account.beginningBalance !== 0 || account.endingBalance !== 0);
  
  // Format the dates
  const formatDate = (date) => date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  
  return {
    reportTitle: 'General Ledger',
    period: `${formattedStartDate} to ${formattedEndDate}`,
    accounts: ledger
  };
};

/**
 * Generate data for an accounts receivable aging report
 * @param {Array} customers - Customer data
 * @param {Array} invoices - Invoice data
 * @param {Date} asOfDate - Date for the aging report
 * @param {Array} agingPeriods - Array of aging periods in days (default: [0, 30, 60, 90])
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Formatted accounts receivable aging data
 */
export const generateARAgingData = (customers, invoices, asOfDate, agingPeriods = [0, 30, 60, 90], precision = 2) => {
  if (!Array.isArray(customers) || !Array.isArray(invoices)) {
    return null;
  }
  
  // Filter to only include unpaid or partially paid invoices
  const unpaidInvoices = invoices.filter(invoice => {
    return invoice.status !== 'paid' && new Date(invoice.date) <= asOfDate;
  });
  
  // Calculate aging for each invoice
  const invoicesWithAging = unpaidInvoices.map(invoice => {
    const invoiceDate = new Date(invoice.date);
    const daysOutstanding = Math.floor((asOfDate - invoiceDate) / (1000 * 60 * 60 * 24));
    
    // Determine which aging period this invoice falls into
    let agingPeriodIndex = 0;
    for (let i = 1; i < agingPeriods.length; i++) {
      if (daysOutstanding >= agingPeriods[i]) {
        agingPeriodIndex = i;
      }
    }
    
    // If beyond the last period, put in the last bucket
    if (agingPeriodIndex >= agingPeriods.length - 1) {
      agingPeriodIndex = agingPeriods.length - 1;
    }
    
    return {
      ...invoice,
      daysOutstanding,
      agingPeriodIndex
    };
  });
  
  // Group by customer
  const customerMap = {};
  customers.forEach(customer => {
    customerMap[customer.id] = {
      ...customer,
      invoices: [],
      agingBuckets: Array(agingPeriods.length).fill(0),
      total: 0
    };
  });
  
  // Add invoices to customers and calculate totals
  invoicesWithAging.forEach(invoice => {
    const customerId = invoice.customerId;
    if (customerMap[customerId]) {
      const remainingAmount = round(Number(invoice.amount) - Number(invoice.amountPaid || 0), precision);
      
      customerMap[customerId].invoices.push(invoice);
      customerMap[customerId].agingBuckets[invoice.agingPeriodIndex] = 
        add(customerMap[customerId].agingBuckets[invoice.agingPeriodIndex], remainingAmount, precision);
      customerMap[customerId].total = add(customerMap[customerId].total, remainingAmount, precision);
    }
  });
  
  // Calculate totals for each aging period
  const totals = Array(agingPeriods.length).fill(0);
  let grandTotal = 0;
  
  Object.values(customerMap).forEach(customer => {
    customer.agingBuckets.forEach((amount, index) => {
      totals[index] = add(totals[index], amount, precision);
    });
    grandTotal = add(grandTotal, customer.total, precision);
  });
  
  // Format the date
  const formattedDate = asOfDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create aging period labels
  const agingLabels = agingPeriods.map((period, index) => {
    if (index === 0) {
      return `Current`;
    } else if (index === agingPeriods.length - 1) {
      return `${period}+ days`;
    } else {
      return `${period}-${agingPeriods[index + 1] - 1} days`;
    }
  });
  
  return {
    reportTitle: 'Accounts Receivable Aging',
    asOfDate: formattedDate,
    agingPeriods: agingLabels,
    customers: Object.values(customerMap)
      .filter(customer => customer.total > 0)
      .map(customer => ({
        id: customer.id,
        name: customer.name,
        agingBuckets: customer.agingBuckets.map(amount => round(amount, precision)),
        total: round(customer.total, precision)
      })),
    totals: totals.map(amount => round(amount, precision)),
    grandTotal: round(grandTotal, precision)
  };
};

/**
 * Generate data for an accounts payable aging report
 * @param {Array} vendors - Vendor data
 * @param {Array} bills - Bill data
 * @param {Date} asOfDate - Date for the aging report
 * @param {Array} agingPeriods - Array of aging periods in days (default: [0, 30, 60, 90])
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Formatted accounts payable aging data
 */
export const generateAPAgingData = (vendors, bills, asOfDate, agingPeriods = [0, 30, 60, 90], precision = 2) => {
  if (!Array.isArray(vendors) || !Array.isArray(bills)) {
    return null;
  }
  
  // Filter to only include unpaid or partially paid bills
  const unpaidBills = bills.filter(bill => {
    return bill.status !== 'paid' && new Date(bill.date) <= asOfDate;
  });
  
  // Calculate aging for each bill
  const billsWithAging = unpaidBills.map(bill => {
    const billDate = new Date(bill.date);
    const daysOutstanding = Math.floor((asOfDate - billDate) / (1000 * 60 * 60 * 24));
    
    // Determine which aging period this bill falls into
    let agingPeriodIndex = 0;
    for (let i = 1; i < agingPeriods.length; i++) {
      if (daysOutstanding >= agingPeriods[i]) {
        agingPeriodIndex = i;
      }
    }
    
    // If beyond the last period, put in the last bucket
    if (agingPeriodIndex >= agingPeriods.length - 1) {
      agingPeriodIndex = agingPeriods.length - 1;
    }
    
    return {
      ...bill,
      daysOutstanding,
      agingPeriodIndex
    };
  });
  
  // Group by vendor
  const vendorMap = {};
  vendors.forEach(vendor => {
    vendorMap[vendor.id] = {
      ...vendor,
      bills: [],
      agingBuckets: Array(agingPeriods.length).fill(0),
      total: 0
    };
  });
  
  // Add bills to vendors and calculate totals
  billsWithAging.forEach(bill => {
    const vendorId = bill.vendorId;
    if (vendorMap[vendorId]) {
      const remainingAmount = round(Number(bill.amount) - Number(bill.amountPaid || 0), precision);
      
      vendorMap[vendorId].bills.push(bill);
      vendorMap[vendorId].agingBuckets[bill.agingPeriodIndex] = 
        add(vendorMap[vendorId].agingBuckets[bill.agingPeriodIndex], remainingAmount, precision);
      vendorMap[vendorId].total = add(vendorMap[vendorId].total, remainingAmount, precision);
    }
  });
  
  // Calculate totals for each aging period
  const totals = Array(agingPeriods.length).fill(0);
  let grandTotal = 0;
  
  Object.values(vendorMap).forEach(vendor => {
    vendor.agingBuckets.forEach((amount, index) => {
      totals[index] = add(totals[index], amount, precision);
    });
    grandTotal = add(grandTotal, vendor.total, precision);
  });
  
  // Format the date
  const formattedDate = asOfDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create aging period labels
  const agingLabels = agingPeriods.map((period, index) => {
    if (index === 0) {
      return `Current`;
    } else if (index === agingPeriods.length - 1) {
      return `${period}+ days`;
    } else {
      return `${period}-${agingPeriods[index + 1] - 1} days`;
    }
  });
  
  return {
    reportTitle: 'Accounts Payable Aging',
    asOfDate: formattedDate,
    agingPeriods: agingLabels,
    vendors: Object.values(vendorMap)
      .filter(vendor => vendor.total > 0)
      .map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        agingBuckets: vendor.agingBuckets.map(amount => round(amount, precision)),
        total: round(vendor.total, precision)
      })),
    totals: totals.map(amount => round(amount, precision)),
    grandTotal: round(grandTotal, precision)
  };
};

/**
 * Generate data for a profit and loss (income statement) comparison report
 * @param {Object} currentPeriodData - Current period income statement data
 * @param {Object} previousPeriodData - Previous period income statement data
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Formatted profit and loss comparison data
 */
export const generateProfitLossComparisonData = (currentPeriodData, previousPeriodData, precision = 2) => {
  if (!currentPeriodData || !previousPeriodData) {
    return null;
  }
  
  // Helper function to calculate variance
  const calculateVariance = (current, previous) => {
    const absoluteVariance = subtract(current, previous, precision);
    const percentageVariance = previous !== 0 ? 
      round((absoluteVariance / Math.abs(previous)) * 100, precision) : 
      (current !== 0 ? 100 : 0);
    
    return {
      absolute: absoluteVariance,
      percentage: percentageVariance
    };
  };
  
  // Calculate revenue comparison
  const revenueComparison = {
    accounts: currentPeriodData.revenue.accounts.map(currentAccount => {
      const previousAccount = previousPeriodData.revenue.accounts.find(a => a.id === currentAccount.id) || 
        { currentAmount: 0 };
      
      return {
        ...currentAccount,
        previousAmount: round(Number(previousAccount.currentAmount) || 0, precision),
        variance: calculateVariance(
          Number(currentAccount.currentAmount) || 0,
          Number(previousAccount.currentAmount) || 0
        )
      };
    }),
    total: {
      current: currentPeriodData.revenue.total.current,
      previous: previousPeriodData.revenue.total.current,
      variance: calculateVariance(
        currentPeriodData.revenue.total.current,
        previousPeriodData.revenue.total.current
      )
    }
  };
  
  // Calculate expenses comparison
  const expensesComparison = {
    accounts: currentPeriodData.expenses.accounts.map(currentAccount => {
      const previousAccount = previousPeriodData.expenses.accounts.find(a => a.id === currentAccount.id) || 
        { currentAmount: 0 };
      
      return {
        ...currentAccount,
        previousAmount: round(Number(previousAccount.currentAmount) || 0, precision),
        variance: calculateVariance(
          Number(currentAccount.currentAmount) || 0,
          Number(previousAccount.currentAmount) || 0
        )
      };
    }),
    total: {
      current: currentPeriodData.expenses.total.current,
      previous: previousPeriodData.expenses.total.current,
      variance: calculateVariance(
        currentPeriodData.expenses.total.current,
        previousPeriodData.expenses.total.current
      )
    }
  };
  
  // Calculate net income comparison
  const netIncomeComparison = {
    current: currentPeriodData.netIncome.current,
    previous: previousPeriodData.netIncome.current,
    variance: calculateVariance(
      currentPeriodData.netIncome.current,
      previousPeriodData.netIncome.current
    )
  };
  
  return {
    reportTitle: 'Profit and Loss Comparison',
    currentPeriod: currentPeriodData.period,
    previousPeriod: previousPeriodData.period,
    revenue: revenueComparison,
    expenses: expensesComparison,
    netIncome: netIncomeComparison
  };
};

/**
 * Generate data for a budget vs. actual report
 * @param {Object} actualData - Actual financial data
 * @param {Object} budgetData - Budget financial data
 * @param {Date} startDate - Start date for the report
 * @param {Date} endDate - End date for the report
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Formatted budget vs. actual data
 */
export const generateBudgetVsActualData = (actualData, budgetData, startDate, endDate, precision = 2) => {
  if (!actualData || !budgetData) {
    return null;
  }
  
  // Helper function to calculate variance
  const calculateVariance = (actual, budget, accountCategory) => {
    const absoluteVariance = subtract(actual, budget, precision);
    const percentageVariance = budget !== 0 ? 
      round((absoluteVariance / Math.abs(budget)) * 100, precision) : 
      (actual !== 0 ? 100 : 0);
    
    return {
      absolute: absoluteVariance,
      percentage: percentageVariance,
      favorable: (actual > budget && accountCategory === 'revenue') || 
                (actual < budget && accountCategory === 'expenses')
    };
  };
  
  // Format the dates
  const formatDate = (date) => date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  
  // Process revenue accounts
  const revenueComparison = {
    accounts: [],
    total: {
      actual: 0,
      budget: 0,
      variance: { absolute: 0, percentage: 0, favorable: false }
    }
  };
  
  // Process expense accounts
  const expensesComparison = {
    accounts: [],
    total: {
      actual: 0,
      budget: 0,
      variance: { absolute: 0, percentage: 0, favorable: false }
    }
  };
  
  // Process all accounts
  Object.keys(actualData).forEach(category => {
    if (category === 'revenue') {
      actualData[category].forEach(actualAccount => {
        const budgetAccount = budgetData[category].find(a => a.id === actualAccount.id) || { amount: 0 };
        
        const accountComparison = {
          id: actualAccount.id,
          name: actualAccount.name,
          actual: round(Number(actualAccount.amount) || 0, precision),
          budget: round(Number(budgetAccount.amount) || 0, precision),
          variance: calculateVariance(
            Number(actualAccount.amount) || 0,
            Number(budgetAccount.amount) || 0,
            'revenue'
          )
        };
        
        revenueComparison.accounts.push(accountComparison);
        revenueComparison.total.actual = add(revenueComparison.total.actual, accountComparison.actual, precision);
        revenueComparison.total.budget = add(revenueComparison.total.budget, accountComparison.budget, precision);
      });
      
      revenueComparison.total.variance = calculateVariance(
        revenueComparison.total.actual,
        revenueComparison.total.budget,
        'revenue'
      );
    } else if (category === 'expenses') {
      actualData[category].forEach(actualAccount => {
        const budgetAccount = budgetData[category].find(a => a.id === actualAccount.id) || { amount: 0 };
        
        const accountComparison = {
          id: actualAccount.id,
          name: actualAccount.name,
          actual: round(Number(actualAccount.amount) || 0, precision),
          budget: round(Number(budgetAccount.amount) || 0, precision),
          variance: calculateVariance(
            Number(actualAccount.amount) || 0,
            Number(budgetAccount.amount) || 0,
            'expenses'
          )
        };
        
        expensesComparison.accounts.push(accountComparison);
        expensesComparison.total.actual = add(expensesComparison.total.actual, accountComparison.actual, precision);
        expensesComparison.total.budget = add(expensesComparison.total.budget, accountComparison.budget, precision);
      });
      
      expensesComparison.total.variance = calculateVariance(
        expensesComparison.total.actual,
        expensesComparison.total.budget,
        'expenses'
      );
    }
  });
  
  // Calculate net income comparison
  const netIncomeComparison = {
    actual: subtract(revenueComparison.total.actual, expensesComparison.total.actual, precision),
    budget: subtract(revenueComparison.total.budget, expensesComparison.total.budget, precision),
    variance: calculateVariance(
      subtract(revenueComparison.total.actual, expensesComparison.total.actual, precision),
      subtract(revenueComparison.total.budget, expensesComparison.total.budget, precision),
      'revenue' // Net income is treated like revenue (higher is better)
    )
  };
  
  return {
    reportTitle: 'Budget vs. Actual',
    period: `${formattedStartDate} to ${formattedEndDate}`,
    revenue: revenueComparison,
    expenses: expensesComparison,
    netIncome: netIncomeComparison
  };
};

/**
 * Generate data for a financial ratio analysis report
 * @param {Object} currentPeriodData - Current period financial data
 * @param {Object} previousPeriodData - Previous period financial data (optional)
 * @param {Object} industryAverages - Industry average ratios (optional)
 * @param {number} precision - Decimal precision (default: 2)
 * @returns {Object} Formatted financial ratio analysis data
 */
export const generateFinancialRatioAnalysisData = (currentPeriodData, previousPeriodData = null, industryAverages = null, precision = 2) => {
  if (!currentPeriodData) {
    return null;
  }
  
  // Helper function to calculate variance
  const calculateVariance = (current, previous) => {
    if (previous === null) return null;
    
    const absoluteVariance = subtract(current, previous, precision);
    const percentageVariance = previous !== 0 ? 
      round((absoluteVariance / Math.abs(previous)) * 100, precision) : 
      (current !== 0 ? 100 : 0);
    
    return {
      absolute: absoluteVariance,
      percentage: percentageVariance
    };
  };
  
  // Helper function to compare with industry average
  const compareWithIndustry = (value, industryValue) => {
    if (industryValue === null) return null;
    
    const absoluteDifference = subtract(value, industryValue, precision);
    const percentageDifference = industryValue !== 0 ? 
      round((absoluteDifference / Math.abs(industryValue)) * 100, precision) : 
      (value !== 0 ? 100 : 0);
    
    return {
      absolute: absoluteDifference,
      percentage: percentageDifference,
      favorable: absoluteDifference > 0
    };
  };
  
  // Process all ratios
  const ratioCategories = [
    {
      name: 'Liquidity Ratios',
      ratios: [
        { id: 'currentRatio', name: 'Current Ratio', higherIsBetter: true },
        { id: 'quickRatio', name: 'Quick Ratio', higherIsBetter: true },
        { id: 'cashRatio', name: 'Cash Ratio', higherIsBetter: true }
      ]
    },
    {
      name: 'Profitability Ratios',
      ratios: [
        { id: 'grossProfitMargin', name: 'Gross Profit Margin', higherIsBetter: true },
        { id: 'operatingProfitMargin', name: 'Operating Profit Margin', higherIsBetter: true },
        { id: 'netProfitMargin', name: 'Net Profit Margin', higherIsBetter: true },
        { id: 'returnOnAssets', name: 'Return on Assets (ROA)', higherIsBetter: true },
        { id: 'returnOnEquity', name: 'Return on Equity (ROE)', higherIsBetter: true }
      ]
    },
    {
      name: 'Solvency Ratios',
      ratios: [
        { id: 'debtToEquityRatio', name: 'Debt to Equity Ratio', higherIsBetter: false },
        { id: 'debtRatio', name: 'Debt Ratio', higherIsBetter: false },
        { id: 'interestCoverageRatio', name: 'Interest Coverage Ratio', higherIsBetter: true }
      ]
    },
    {
      name: 'Efficiency Ratios',
      ratios: [
        { id: 'assetTurnoverRatio', name: 'Asset Turnover Ratio', higherIsBetter: true },
        { id: 'inventoryTurnoverRatio', name: 'Inventory Turnover Ratio', higherIsBetter: true },
        { id: 'receivablesTurnoverRatio', name: 'Receivables Turnover Ratio', higherIsBetter: true },
        { id: 'payablesTurnoverRatio', name: 'Payables Turnover Ratio', higherIsBetter: true }
      ]
    }
  ];
  
  const processedRatios = ratioCategories.map(category => {
    const ratios = category.ratios.map(ratio => {
      const currentValue = round(currentPeriodData[ratio.id] || 0, precision);
      const previousValue = previousPeriodData ? round(previousPeriodData[ratio.id] || 0, precision) : null;
      const industryValue = industryAverages ? round(industryAverages[ratio.id] || 0, precision) : null;
      
      const variance = calculateVariance(currentValue, previousValue);
      const industryComparison = compareWithIndustry(currentValue, industryValue);
      
      // Determine if the current value is favorable compared to previous and industry
      const isFavorableVsPrevious = variance ? 
        (ratio.higherIsBetter ? variance.absolute > 0 : variance.absolute < 0) : 
        null;
      
      const isFavorableVsIndustry = industryComparison ? 
        (ratio.higherIsBetter ? industryComparison.absolute > 0 : industryComparison.absolute < 0) : 
        null;
      
      return {
        id: ratio.id,
        name: ratio.name,
        current: currentValue,
        previous: previousValue,
        industry: industryValue,
        variance: variance ? { ...variance, favorable: isFavorableVsPrevious } : null,
        industryComparison: industryComparison ? { ...industryComparison, favorable: isFavorableVsIndustry } : null
      };
    });
    
    return {
      name: category.name,
      ratios
    };
  });
  
  return {
    reportTitle: 'Financial Ratio Analysis',
    currentPeriod: currentPeriodData.period || 'Current Period',
    previousPeriod: previousPeriodData ? (previousPeriodData.period || 'Previous Period') : null,
    industryBenchmark: industryAverages ? (industryAverages.name || 'Industry Average') : null,
    ratioCategories: processedRatios
  };
};

/**
 * Format report data for export to CSV
 * @param {Object} reportData - The report data to format
 * @param {string} reportType - The type of report
 * @returns {Array} Array of objects ready for CSV export
 */
export const formatReportForCSV = (reportData, reportType) => {
  if (!reportData) {
    return [];
  }
  
  switch (reportType.toLowerCase()) {
    case 'balance-sheet':
      return formatBalanceSheetForCSV(reportData);
    case 'income-statement':
      return formatIncomeStatementForCSV(reportData);
    case 'cash-flow':
      return formatCashFlowForCSV(reportData);
    case 'trial-balance':
      return formatTrialBalanceForCSV(reportData);
    case 'ar-aging':
      return formatARAgingForCSV(reportData);
    case 'ap-aging':
      return formatAPAgingForCSV(reportData);
    case 'budget-vs-actual':
      return formatBudgetVsActualForCSV(reportData);
    default:
      return [];
  }
};

// Helper functions for CSV formatting
const formatBalanceSheetForCSV = (data) => {
  const rows = [
    // Header row
    {
      'Account': 'BALANCE SHEET',
      'Current Period': data.asOfDate,
      ...(data.previousDate ? { 'Previous Period': data.previousDate } : {})
    },
    { 'Account': '' }, // Empty row for spacing
    { 'Account': 'ASSETS' }
  ];
  
  // Current Assets
  rows.push({ 'Account': 'Current Assets' });
  data.assets.current.forEach(asset => {
    rows.push({
      'Account': asset.name,
      'Current Period': asset.currentBalance,
      ...(data.previousDate ? { 'Previous Period': asset.previousBalance } : {})
    });
  });
  rows.push({
    'Account': 'Total Current Assets',
    'Current Period': data.assets.totals.currentAssets.current,
    ...(data.previousDate ? { 'Previous Period': data.assets.totals.currentAssets.previous } : {})
  });
  
  // Fixed Assets
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({ 'Account': 'Fixed Assets' });
  data.assets.fixed.forEach(asset => {
    rows.push({
      'Account': asset.name,
      'Current Period': asset.currentBalance,
      ...(data.previousDate ? { 'Previous Period': asset.previousBalance } : {})
    });
  });
  rows.push({
    'Account': 'Total Fixed Assets',
    'Current Period': data.assets.totals.fixedAssets.current,
    ...(data.previousDate ? { 'Previous Period': data.assets.totals.fixedAssets.previous } : {})
  });
  
  // Other Assets
  if (data.assets.other.length > 0) {
    rows.push({ 'Account': '' }); // Empty row for spacing
    rows.push({ 'Account': 'Other Assets' });
    data.assets.other.forEach(asset => {
      rows.push({
        'Account': asset.name,
        'Current Period': asset.currentBalance,
        ...(data.previousDate ? { 'Previous Period': asset.previousBalance } : {})
      });
    });
    rows.push({
      'Account': 'Total Other Assets',
      'Current Period': data.assets.totals.otherAssets.current,
      ...(data.previousDate ? { 'Previous Period': data.assets.totals.otherAssets.previous } : {})
    });
  }
  
  // Total Assets
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({
    'Account': 'TOTAL ASSETS',
    'Current Period': data.assets.totals.totalAssets.current,
    ...(data.previousDate ? { 'Previous Period': data.assets.totals.totalAssets.previous } : {})
  });
  
  // Liabilities and Equity
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({ 'Account': 'LIABILITIES AND EQUITY' });
  
  // Current Liabilities
  rows.push({ 'Account': 'Current Liabilities' });
  data.liabilities.current.forEach(liability => {
    rows.push({
      'Account': liability.name,
      'Current Period': liability.currentBalance,
      ...(data.previousDate ? { 'Previous Period': liability.previousBalance } : {})
    });
  });
  rows.push({
    'Account': 'Total Current Liabilities',
    'Current Period': data.liabilities.totals.currentLiabilities.current,
    ...(data.previousDate ? { 'Previous Period': data.liabilities.totals.currentLiabilities.previous } : {})
  });
  
  // Long-Term Liabilities
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({ 'Account': 'Long-Term Liabilities' });
  data.liabilities.longTerm.forEach(liability => {
    rows.push({
      'Account': liability.name,
      'Current Period': liability.currentBalance,
      ...(data.previousDate ? { 'Previous Period': liability.previousBalance } : {})
    });
  });
  rows.push({
    'Account': 'Total Long-Term Liabilities',
    'Current Period': data.liabilities.totals.longTermLiabilities.current,
    ...(data.previousDate ? { 'Previous Period': data.liabilities.totals.longTermLiabilities.previous } : {})
  });
  
  // Total Liabilities
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({
    'Account': 'TOTAL LIABILITIES',
    'Current Period': data.liabilities.totals.totalLiabilities.current,
    ...(data.previousDate ? { 'Previous Period': data.liabilities.totals.totalLiabilities.previous } : {})
  });
  
  // Equity
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({ 'Account': 'Equity' });
  data.equity.accounts.forEach(equity => {
    rows.push({
      'Account': equity.name,
      'Current Period': equity.currentBalance,
      ...(data.previousDate ? { 'Previous Period': equity.previousBalance } : {})
    });
  });
  rows.push({
    'Account': 'Total Equity',
    'Current Period': data.equity.total.current,
    ...(data.previousDate ? { 'Previous Period': data.equity.total.previous } : {})
  });
  
  // Total Liabilities and Equity
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({
    'Account': 'TOTAL LIABILITIES AND EQUITY',
    'Current Period': data.totalLiabilitiesAndEquity.current,
    ...(data.previousDate ? { 'Previous Period': data.totalLiabilitiesAndEquity.previous } : {})
  });
  
  return rows;
};

const formatIncomeStatementForCSV = (data) => {
  const rows = [
    // Header row
    {
      'Account': 'INCOME STATEMENT',
      'Current Period': data.period,
      ...(data.previousPeriod ? { 'Previous Period': data.previousPeriod } : {})
    },
    { 'Account': '' } // Empty row for spacing
  ];
  
  // Revenue
  rows.push({ 'Account': 'REVENUE' });
  data.revenue.accounts.forEach(account => {
    rows.push({
      'Account': account.name,
      'Current Period': account.currentAmount,
      ...(data.previousPeriod ? { 'Previous Period': account.previousAmount } : {})
    });
  });
  rows.push({
    'Account': 'Total Revenue',
    'Current Period': data.revenue.total.current,
    ...(data.previousPeriod ? { 'Previous Period': data.revenue.total.previous } : {})
  });
  
  // Expenses
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({ 'Account': 'EXPENSES' });
  data.expenses.accounts.forEach(account => {
    rows.push({
      'Account': account.name,
      'Current Period': account.currentAmount,
      ...(data.previousPeriod ? { 'Previous Period': account.previousAmount } : {})
    });
  });
  rows.push({
    'Account': 'Total Expenses',
    'Current Period': data.expenses.total.current,
    ...(data.previousPeriod ? { 'Previous Period': data.expenses.total.previous } : {})
  });
  
  // Net Income
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({
    'Account': 'NET INCOME',
    'Current Period': data.netIncome.current,
    ...(data.previousPeriod ? { 'Previous Period': data.netIncome.previous } : {})
  });
  
  return rows;
};

const formatCashFlowForCSV = (data) => {
  const rows = [
    // Header row
    {
      'Account': 'CASH FLOW STATEMENT',
      'Current Period': data.period,
      ...(data.previousPeriod ? { 'Previous Period': data.previousPeriod } : {})
    },
    { 'Account': '' } // Empty row for spacing
  ];
  
  // Beginning Cash Balance
  rows.push({
    'Account': 'Beginning Cash Balance',
    'Current Period': data.beginningCash.current,
    ...(data.previousPeriod ? { 'Previous Period': data.beginningCash.previous } : {})
  });
  
  // Operating Activities
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({ 'Account': 'CASH FLOWS FROM OPERATING ACTIVITIES' });
  data.operating.accounts.forEach(account => {
    rows.push({
      'Account': account.name,
      'Current Period': account.currentAmount,
      ...(data.previousPeriod ? { 'Previous Period': account.previousAmount } : {})
    });
  });
  rows.push({
    'Account': 'Net Cash from Operating Activities',
    'Current Period': data.operating.total.current,
    ...(data.previousPeriod ? { 'Previous Period': data.operating.total.previous } : {})
  });
  
  // Investing Activities
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({ 'Account': 'CASH FLOWS FROM INVESTING ACTIVITIES' });
  data.investing.accounts.forEach(account => {
    rows.push({
      'Account': account.name,
      'Current Period': account.currentAmount,
      ...(data.previousPeriod ? { 'Previous Period': account.previousAmount } : {})
    });
  });
  
  rows.push({
    'Account': 'Net Cash from Investing Activities',
    'Current Period': data.investing.total.current,
    ...(data.previousPeriod ? { 'Previous Period': data.investing.total.previous } : {})
  });
  
  // Financing Activities
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({ 'Account': 'CASH FLOWS FROM FINANCING ACTIVITIES' });
  data.financing.accounts.forEach(account => {
    rows.push({
      'Account': account.name,
      'Current Period': account.currentAmount,
      ...(data.previousPeriod ? { 'Previous Period': account.previousAmount } : {})
    });
  });
  
  rows.push({
    'Account': 'Net Cash from Financing Activities',
    'Current Period': data.financing.total.current,
    ...(data.previousPeriod ? { 'Previous Period': data.financing.total.previous } : {})
  });
  
  // Net Change in Cash
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({
    'Account': 'NET CHANGE IN CASH',
    'Current Period': data.netChange.current,
    ...(data.previousPeriod ? { 'Previous Period': data.netChange.previous } : {})
  });
  
  // Ending Cash Balance
  rows.push({ 'Account': '' }); // Empty row for spacing
  rows.push({
    'Account': 'Ending Cash Balance',
    'Current Period': data.endingCash.current,
    ...(data.previousPeriod ? { 'Previous Period': data.endingCash.previous } : {})
  });
  
  return rows;
};