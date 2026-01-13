const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    initializeUserData,
    getUserData,
    updateUserData,
    getFinancialSummary,
    getBudgetData,
} = require('../controllers/userDataController');

// All routes require authentication
router.use(authenticateToken);

// Initialize user data (called after registration)
router.post('/initialize', initializeUserData);

// Get all user data
router.get('/', getUserData);

// Update user data
router.put('/', updateUserData);

// Get financial summary (for hero section)
router.get('/summary', getFinancialSummary);

// Get budget data (for recent budget section)
router.get('/budget', getBudgetData);

module.exports = router;
