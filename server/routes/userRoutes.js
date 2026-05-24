const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getBdaUsers,
  getAllBdaMembers,
  getBdaPerformance,
  deactivateBda,
} = require('../controllers/userController');

const router = express.Router();

router.get('/bdas', authMiddleware, roleMiddleware('Admin'), getBdaUsers);
router.get(
  '/',
  authMiddleware,
  roleMiddleware('Admin'),
  getAllBdaMembers
);
router.get(
  '/:id/performance',
  authMiddleware,
  roleMiddleware('Admin'),
  getBdaPerformance
);
router.put(
  '/:id/deactivate',
  authMiddleware,
  roleMiddleware('Admin'),
  deactivateBda
);

module.exports = router;
