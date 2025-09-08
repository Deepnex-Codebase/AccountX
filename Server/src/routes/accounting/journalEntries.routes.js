const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const journalEntryController = require('../../controllers/accounting/journalEntry.controller');

// List journal entries (filterable)
router.get('/', protect, tenantMiddleware, journalEntryController.getJournalEntries);
// Create journal entry
router.post('/', protect, tenantMiddleware, hasPermission('journal:create'), journalEntryController.createJournalEntry);
// Retrieve single entry
router.get('/:id', protect, tenantMiddleware, journalEntryController.getJournalEntryById);
// Update journal entry
router.put('/:id', protect, tenantMiddleware, hasPermission('journal:update'), journalEntryController.updateJournalEntry);
// Delete journal entry
router.delete('/:id', protect, tenantMiddleware, hasPermission('journal:delete'), journalEntryController.deleteJournalEntry);
// Post entry
router.post('/:id/post', protect, tenantMiddleware, hasPermission('journal:post'), journalEntryController.postJournalEntry);
// Unpost entry
router.post('/:id/unpost', protect, tenantMiddleware, hasPermission('journal:unpost'), journalEntryController.unpostJournalEntry);
// Submit for approval
router.post('/:id/submit-for-approval', protect, tenantMiddleware, hasPermission('journal:submit'), journalEntryController.submitForApproval);
// Approve entry
router.post('/:id/approve', protect, tenantMiddleware, hasPermission('journal:approve'), journalEntryController.approveJournalEntry);
// Reject entry
router.post('/:id/reject', protect, tenantMiddleware, hasPermission('journal:reject'), journalEntryController.rejectJournalEntry);

module.exports = router; 