const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { categorizeTransaction, getSpendingInsights, getBillReminders } = require('../controllers/aiController');

// All AI routes require authentication
router.use(authenticateToken);

// POST /api/ai/categorize  — Categorize a transaction using Gemini AI
router.post('/categorize', categorizeTransaction);

// GET  /api/ai/insights    — Get AI-generated spending insights for the last 30 days
router.get('/insights', getSpendingInsights);

// GET  /api/ai/bill-reminders — Get AI-generated bill reminder messages
router.get('/bill-reminders', getBillReminders);

module.exports = router;
