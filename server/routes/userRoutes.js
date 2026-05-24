const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getBdaUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/bdas', authMiddleware, roleMiddleware('Admin'), getBdaUsers);

module.exports = router;
