const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getBills, getBillsSummary, createBill, updateBill, markBillPaid, deleteBill } = require('../controllers/billController');

router.use(authenticateToken);

router.get('/', getBills);
router.get('/summary', getBillsSummary);
router.post('/', createBill);
router.put('/:id', updateBill);
router.patch('/:id/paid', markBillPaid);
router.delete('/:id', deleteBill);

module.exports = router;
