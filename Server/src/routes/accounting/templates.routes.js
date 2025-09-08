const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../../middleware/authMiddleware');
const tenantMiddleware = require('../../middleware/tenantMiddleware');
const templateController = require('../../controllers/accounting/template.controller');

// List recurring templates
router.get('/', protect, tenantMiddleware, templateController.getTemplates);
// Create a new template
router.post('/', protect, tenantMiddleware, hasPermission('template:create'), templateController.createTemplate);
// Update template
router.put('/:id', protect, tenantMiddleware, hasPermission('template:update'), templateController.updateTemplate);
// Delete template
router.delete('/:id', protect, tenantMiddleware, hasPermission('template:delete'), templateController.deleteTemplate);
// Enable a template
router.post('/:id/enable', protect, tenantMiddleware, hasPermission('template:enable'), templateController.enableTemplate);
// Disable a template
router.post('/:id/disable', protect, tenantMiddleware, hasPermission('template:disable'), templateController.disableTemplate);

module.exports = router; 