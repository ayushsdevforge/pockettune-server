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

<<<<<<< HEAD

=======
>>>>>>> 3f79da5b7b9c97da1c73f17132cfc66b3161fa65
module.exports = router;
