const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    getBills,
    getBillsSummary,
    createBill,
    updateBill,
    markBillPaid,
    deleteBill,
} = require('../controllers/billController');

// All routes require authentication
router.use(authenticateToken);

// Get all bills
router.get('/', getBills);

// Get bills summary
router.get('/summary', getBillsSummary);

// Create new bill
router.post('/', createBill);

// Update bill
router.put('/:id', updateBill);

// Mark bill as paid
router.patch('/:id/paid', markBillPaid);

// Delete bill
router.delete('/:id', deleteBill);

module.exports = router;
