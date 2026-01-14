const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    getTransactions,
    getRecentTransactions,
    createIncome,
    createExpense,
    createTransfer,
    deleteTransaction,
} = require('../controllers/transactionController');

// All routes require authentication
router.use(authenticateToken);

// Get all transactions (with optional filters)
router.get('/', getTransactions);

// Get recent transactions
router.get('/recent', getRecentTransactions);

// Create income
router.post('/income', createIncome);

// Create expense
router.post('/expense', createExpense);

// Create transfer
router.post('/transfer', createTransfer);

// Delete transaction
router.delete('/:id', deleteTransaction);

module.exports = router;
