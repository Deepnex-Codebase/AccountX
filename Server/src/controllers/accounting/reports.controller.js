const { asyncHandler } = require('../../utils/appError');
const Account = require('../../models/accounting/account.model');
const JournalEntry = require('../../models/accounting/journalEntry.model');
const { Parser } = require('json2csv');
const mongoose = require('mongoose');

// Helper: Get all account balances for a tenant as of a date
async function getAccountBalances(tenantId, asOfDate = new Date()) {
  // Get all accounts
  const accounts = await Account.find({ tenantId, isArchived: false });
  const accountMap = {};
  accounts.forEach(acc => {
    accountMap[acc._id.toString()] = {
      _id: acc._id,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      balance: 0,
      debitTotal: 0,
      creditTotal: 0
    };
  });

  // Get all posted journal entries up to asOfDate
  const journalEntries = await JournalEntry.find({
    tenantId,
    status: 'Posted',
    date: { $lte: asOfDate }
  });

  // Sum debits and credits per account
  journalEntries.forEach(entry => {
    entry.lines.forEach(line => {
      const acc = accountMap[line.account.toString()];
      if (!acc) return;
      acc.debitTotal += line.debit || 0;
      acc.creditTotal += line.credit || 0;
    });
  });

  // Calculate balances
  Object.values(accountMap).forEach(acc => {
    if (acc.type === 'Asset' || acc.type === 'Expense') {
      acc.balance = acc.debitTotal - acc.creditTotal;
    } else {
      acc.balance = acc.creditTotal - acc.debitTotal;
    }
  });

  return Object.values(accountMap);
}

exports.getTrialBalance = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId || req.headers['x-tenant-id'];
  const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate) : new Date();
  if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
    return res.status(400).json({ success: false, error: 'Valid tenantId required' });
  }
  const balances = await getAccountBalances(tenantId, asOfDate);
  res.status(200).json({ success: true, asOfDate, data: balances });
});

exports.getBalanceSheet = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId || req.headers['x-tenant-id'];
  const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate) : new Date();
  if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
    return res.status(400).json({ success: false, error: 'Valid tenantId required' });
  }
  const balances = await getAccountBalances(tenantId, asOfDate);
  const assets = balances.filter(a => a.type === 'Asset');
  const liabilities = balances.filter(a => a.type === 'Liability');
  const equity = balances.filter(a => a.type === 'Equity');
  res.status(200).json({
    success: true,
    asOfDate,
    assets,
    liabilities,
    equity,
    totals: {
      assets: assets.reduce((sum, a) => sum + a.balance, 0),
      liabilities: liabilities.reduce((sum, a) => sum + a.balance, 0),
      equity: equity.reduce((sum, a) => sum + a.balance, 0)
    }
  });
});

exports.getProfitLoss = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId || req.headers['x-tenant-id'];
  const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
  if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
    return res.status(400).json({ success: false, error: 'Valid tenantId required' });
  }
  // Get all accounts
  const accounts = await Account.find({ tenantId, isArchived: false });
  const accountMap = {};
  accounts.forEach(acc => {
    accountMap[acc._id.toString()] = {
      _id: acc._id,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      balance: 0,
      debitTotal: 0,
      creditTotal: 0
    };
  });
  // Get all posted journal entries in period
  const journalEntries = await JournalEntry.find({
    tenantId,
    status: 'Posted',
    date: { $gte: startDate, $lte: endDate }
  });
  journalEntries.forEach(entry => {
    entry.lines.forEach(line => {
      const acc = accountMap[line.account.toString()];
      if (!acc) return;
      acc.debitTotal += line.debit || 0;
      acc.creditTotal += line.credit || 0;
    });
  });
  // Calculate balances
  Object.values(accountMap).forEach(acc => {
    if (acc.type === 'Income') {
      acc.balance = acc.creditTotal - acc.debitTotal;
    } else if (acc.type === 'Expense') {
      acc.balance = acc.debitTotal - acc.creditTotal;
    }
  });
  const income = Object.values(accountMap).filter(a => a.type === 'Income');
  const expenses = Object.values(accountMap).filter(a => a.type === 'Expense');
  const totalIncome = income.reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
  const netProfit = totalIncome - totalExpenses;
  res.status(200).json({
    success: true,
    startDate,
    endDate,
    income,
    expenses,
    totalIncome,
    totalExpenses,
    netProfit
  });
});

exports.exportReport = asyncHandler(async (req, res) => {
  // Accept type: trialBalance, balanceSheet, profitLoss
  const { type } = req.query;
  if (!type) return res.status(400).json({ success: false, error: 'Report type required' });
  let data = [];
  if (type === 'trialBalance') {
    req.query.asOfDate = req.query.asOfDate || new Date();
    const tenantId = req.user.tenantId || req.headers['x-tenant-id'];
    data = await getAccountBalances(tenantId, new Date(req.query.asOfDate));
  } else if (type === 'balanceSheet') {
    req.query.asOfDate = req.query.asOfDate || new Date();
    const tenantId = req.user.tenantId || req.headers['x-tenant-id'];
    const balances = await getAccountBalances(tenantId, new Date(req.query.asOfDate));
    data = balances;
  } else if (type === 'profitLoss') {
    req.query.startDate = req.query.startDate || new Date(new Date().getFullYear(), 0, 1);
    req.query.endDate = req.query.endDate || new Date();
    const tenantId = req.user.tenantId || req.headers['x-tenant-id'];
    // Reuse logic from getProfitLoss
    const accounts = await Account.find({ tenantId, isArchived: false });
    const accountMap = {};
    accounts.forEach(acc => {
      accountMap[acc._id.toString()] = {
        _id: acc._id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        balance: 0,
        debitTotal: 0,
        creditTotal: 0
      };
    });
    const journalEntries = await JournalEntry.find({
      tenantId,
      status: 'Posted',
      date: { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) }
    });
    journalEntries.forEach(entry => {
      entry.lines.forEach(line => {
        const acc = accountMap[line.account.toString()];
        if (!acc) return;
        acc.debitTotal += line.debit || 0;
        acc.creditTotal += line.credit || 0;
      });
    });
    Object.values(accountMap).forEach(acc => {
      if (acc.type === 'Income') {
        acc.balance = acc.creditTotal - acc.debitTotal;
      } else if (acc.type === 'Expense') {
        acc.balance = acc.debitTotal - acc.creditTotal;
      }
    });
    data = Object.values(accountMap).filter(a => a.type === 'Income' || a.type === 'Expense');
  } else {
    return res.status(400).json({ success: false, error: 'Invalid report type' });
  }
  // Export as CSV
  const parser = new Parser();
  const csv = parser.parse(data);
  res.header('Content-Type', 'text/csv');
  res.attachment(`${type}_report.csv`);
  return res.send(csv);
});

exports.scheduleReport = asyncHandler(async (req, res) => {
  // TODO: Implement scheduling logic (e.g., using cron jobs, email, etc.)
  res.status(501).json({ success: false, error: 'Report scheduling not implemented yet.' });
}); 