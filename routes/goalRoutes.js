const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    getGoals,
    getGoalsSummary,
    createGoal,
    updateGoal,
    addToGoal,
    deleteGoal,
} = require('../controllers/goalController');

// All routes require authentication
router.use(authenticateToken);

// Get all goals
router.get('/', getGoals);

// Get goals summary
router.get('/summary', getGoalsSummary);

// Create new goal
router.post('/', createGoal);

// Update goal
router.put('/:id', updateGoal);

// Add amount to goal
router.patch('/:id/add', addToGoal);

// Delete goal
router.delete('/:id', deleteGoal);

module.exports = router;
