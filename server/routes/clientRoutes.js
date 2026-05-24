const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getClients, getClientById } = require('../controllers/clientController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getClients);
router.get('/:id', getClientById);

module.exports = router;
