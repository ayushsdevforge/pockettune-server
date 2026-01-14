const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    getLendingRecords,
    getLendingSummary,
    createLendingRecord,
    updateLendingRecord,
    settleLendingRecord,
    deleteLendingRecord,
} = require('../controllers/lendingController');

// All routes require authentication
router.use(authenticateToken);

// Get all lending records
router.get('/', getLendingRecords);

// Get lending summary
router.get('/summary', getLendingSummary);

// Create new lending record
router.post('/', createLendingRecord);

// Update lending record
router.put('/:id', updateLendingRecord);

// Settle lending record
router.patch('/:id/settle', settleLendingRecord);

// Delete lending record
router.delete('/:id', deleteLendingRecord);

module.exports = router;
