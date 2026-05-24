const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
  assignLead,
} = require('../controllers/leadController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('Admin'), createLead);
router.get('/', getLeads);
router.put('/:id/assign', roleMiddleware('Admin'), assignLead);
router.put('/:id', updateLead);
router.delete('/:id', roleMiddleware('Admin'), deleteLead);

module.exports = router;
