const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getGoals, getGoalsSummary, createGoal, updateGoal, addToGoal, deleteGoal } = require('../controllers/goalController');

router.use(authenticateToken);

router.get('/', getGoals);
router.get('/summary', getGoalsSummary);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.patch('/:id/add', addToGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
