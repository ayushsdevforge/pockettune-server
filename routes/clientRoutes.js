const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    getClients,
    getClientsSummary,
    createClient,
    updateClient,
    updateClientBalance,
    deleteClient,
} = require('../controllers/clientController');

// All routes require authentication
router.use(authenticateToken);

// Get all clients
router.get('/', getClients);

// Get clients summary
router.get('/summary', getClientsSummary);

// Create new client
router.post('/', createClient);

// Update client
router.put('/:id', updateClient);

// Update client balance
router.patch('/:id/balance', updateClientBalance);

// Delete client
router.delete('/:id', deleteClient);

module.exports = router;
