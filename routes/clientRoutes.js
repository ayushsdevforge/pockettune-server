const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getClients, getClientsSummary, createClient, updateClient, updateClientBalance, deleteClient } = require('../controllers/clientController');

router.use(authenticateToken);

router.get('/', getClients);
router.get('/summary', getClientsSummary);
router.post('/', createClient);
router.put('/:id', updateClient);
router.patch('/:id/balance', updateClientBalance);
router.delete('/:id', deleteClient);

module.exports = router;
