const Goal = require('../models/goal');

// Get all goals for user
const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get goals summary
const getGoalsSummary = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.userId });

        const totalGoals = goals.length;
        const completedGoals = goals.filter(g => g.isCompleted).length;
        const activeGoals = totalGoals - completedGoals;

        // Overall progress: average of all goals' progress percentages
        let overallProgress = 0;
        if (totalGoals > 0) {
            const totalProgress = goals.reduce((sum, g) => {
                const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
                return sum + Math.min(100, pct);
            }, 0);
            overallProgress = Math.round(totalProgress / totalGoals);
        }

        res.json({
            Total: { label: 'Overall Progress', value: `${overallProgress}%`, desc: `${totalGoals} total goals` },
            Credit: { label: 'Active Goals', value: activeGoals, desc: 'In progress' },
            Net: { label: 'Completed', value: completedGoals, desc: 'Goals achieved' },
        });
    } catch (error) {
        console.error('Get goals summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create goal
const createGoal = async (req, res) => {
    try {
        const { title, description, targetAmount, currentAmount, category, priority, targetDate } = req.body;

        if (!title) return res.status(400).json({ message: 'Goal title is required' });
        if (!targetAmount || targetAmount <= 0) return res.status(400).json({ message: 'Valid target amount is required' });

        const goal = new Goal({
            userId: req.userId,
            title,
            description: description || '',
            targetAmount,
            currentAmount: currentAmount || 0,
            category: category || 'Savings',
            priority: (priority || 'medium').toLowerCase(),
            targetDate: targetDate ? new Date(targetDate) : undefined,
        });

        await goal.save();
        res.status(201).json({ message: 'Goal created successfully', data: goal });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update goal
const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await Goal.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: req.body },
            { new: true }
        );
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.json({ message: 'Goal updated successfully', data: goal });
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add amount to goal
const addToGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount is required' });

        const goal = await Goal.findOne({ _id: id, userId: req.userId });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
        if (goal.currentAmount >= goal.targetAmount) {
            goal.isCompleted = true;
        }
        await goal.save();
        res.json({ message: 'Amount added to goal', data: goal });
    } catch (error) {
        console.error('Add to goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete goal
const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await Goal.findOneAndDelete({ _id: id, userId: req.userId });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getGoals, getGoalsSummary, createGoal, updateGoal, addToGoal, deleteGoal };
