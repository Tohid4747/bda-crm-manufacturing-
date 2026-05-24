const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createActivity,
  getActivitiesByLead,
  getUpcomingActivities,
} = require('../controllers/activityController');

const router = express.Router();

router.use(authMiddleware);

router.get('/upcoming', getUpcomingActivities);
router.get('/lead/:leadId', getActivitiesByLead);
router.post('/', createActivity);

module.exports = router;
