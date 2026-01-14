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
        
        // Calculate overall progress
        let overallProgress = 0;
        if (totalGoals > 0) {
            const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
            const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
            overallProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
        }
        
        res.json({
            Total: {
                label: 'Overall Progress',
                value: `${overallProgress}%`,
                record: totalGoals,
            },
            Credit: {
                label: 'Active Goals',
                value: activeGoals,
                desc: 'In progress',
            },
            Net: {
                label: 'Completed',
                value: completedGoals,
                desc: 'Goals achieved',
            },
        });
    } catch (error) {
        console.error('Get goals summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new goal
const createGoal = async (req, res) => {
    try {
        const { title, description, targetAmount, currentAmount, category, priority, targetDate } = req.body;
        
        const goal = new Goal({
            userId: req.userId,
            title,
            description: description || '',
            targetAmount: parseFloat(targetAmount),
            currentAmount: parseFloat(currentAmount) || 0,
            category: category || 'General',
            priority: priority || 'Medium',
            targetDate: new Date(targetDate),
        });
        
        // Check if goal is already completed
        if (goal.currentAmount >= goal.targetAmount) {
            goal.isCompleted = true;
        }
        
        await goal.save();
        res.status(201).json({ message: 'Goal created successfully', data: goal });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update goal
const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Check if goal should be marked as completed
        if (updateData.currentAmount !== undefined && updateData.targetAmount !== undefined) {
            updateData.isCompleted = updateData.currentAmount >= updateData.targetAmount;
        }
        
        const goal = await Goal.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: updateData },
            { new: true }
        );
        
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        
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
        
        const goal = await Goal.findOne({ _id: id, userId: req.userId });
        
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        
        goal.currentAmount += parseFloat(amount);
        
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
        
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        
        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getGoals,
    getGoalsSummary,
    createGoal,
    updateGoal,
    addToGoal,
    deleteGoal,
};
