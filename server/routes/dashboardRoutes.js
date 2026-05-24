const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getAdminDashboard,
  getBdaDashboard,
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(authMiddleware);

router.get('/admin', roleMiddleware('Admin'), getAdminDashboard);
router.get('/bda', roleMiddleware('BDA'), getBdaDashboard);

module.exports = router;
