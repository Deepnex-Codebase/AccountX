const express = require('express');
const controller = require('../controllers/gst/hsnCodes.controller');
const router = express.Router();

// Placeholders for middleware (uncomment and implement as needed)
// const auth = require('../middleware/authMiddleware');
// const tenant = require('../middleware/tenantMiddleware');
// const rbac = require('../middleware/rbacMiddleware');

// router.use(auth);
// router.use(tenant);
// router.use(rbac('hsnCodes:access'));

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router; 