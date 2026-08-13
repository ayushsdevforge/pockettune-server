const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    getAccounts,
    getAccountSummary,
    createAccount,
    updateAccount,
    deleteAccount,
} = require('../controllers/accountController');

// All routes require authentication
router.use(authenticateToken);

// Get all accounts
router.get('/', getAccounts);

// Get account summary (stats)
router.get('/summary', getAccountSummary);

// Create new account
router.post('/', createAccount);

// Update account
router.put('/:id', updateAccount);

// Delete account
router.delete('/:id', deleteAccount);

module.exports = router;
