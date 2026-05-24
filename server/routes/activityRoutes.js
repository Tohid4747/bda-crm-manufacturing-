const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createActivity,
  getActivitiesByLead,
  getUpcomingActivities,
  getDueTodayCount,
} = require('../controllers/activityController');

const router = express.Router();

router.use(authMiddleware);

router.get('/upcoming', getUpcomingActivities);
router.get('/due-today/count', getDueTodayCount);
router.get('/lead/:leadId', getActivitiesByLead);
router.post('/', createActivity);

module.exports = router;
