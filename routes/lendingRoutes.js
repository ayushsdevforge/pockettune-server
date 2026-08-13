const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getLendingRecords, getLendingSummary, createLendingRecord, updateLendingRecord, settleLendingRecord, deleteLendingRecord } = require('../controllers/lendingController');

router.use(authenticateToken);

router.get('/', getLendingRecords);
router.get('/summary', getLendingSummary);
router.post('/', createLendingRecord);
router.put('/:id', updateLendingRecord);
router.patch('/:id/settle', settleLendingRecord);
router.delete('/:id', deleteLendingRecord);

module.exports = router;
