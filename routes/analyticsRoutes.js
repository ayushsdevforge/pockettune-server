const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    getAnalyticsSummary,
    getSpendingByCategory,
    getIncomeExpenseTrend,
    getDailySpending,
} = require('../controllers/analyticsController');

// All routes require authentication
router.use(authenticateToken);

// Get analytics summary
router.get('/summary', getAnalyticsSummary);

// Get spending by category
router.get('/spending-by-category', getSpendingByCategory);

// Get income vs expense trend
router.get('/income-expense-trend', getIncomeExpenseTrend);

// Get daily spending
router.get('/daily-spending', getDailySpending);

module.exports = router;
