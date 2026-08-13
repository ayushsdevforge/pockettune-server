const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getAnalyticsSummary, getSpendingByCategory, getIncomeExpenseTrend, getDailySpending } = require('../controllers/analyticsController');

router.use(authenticateToken);

router.get('/summary', getAnalyticsSummary);
router.get('/spending-by-category', getSpendingByCategory);
router.get('/income-expense-trend', getIncomeExpenseTrend);
router.get('/daily-spending', getDailySpending);

module.exports = router;
