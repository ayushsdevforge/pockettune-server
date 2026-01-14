const mongoose = require('mongoose');
const Transaction = require('../models/transaction');
const Account = require('../models/account');

// Get analytics summary
const getAnalyticsSummary = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const today = new Date();
        const dayOfMonth = today.getDate();
        
        // Get all expenses for this month
        const expenses = await Transaction.find({
            userId: req.userId,
            type: 'expense',
            date: { $gte: startOfMonth }
        });
        
        // Get all income for this month
        const income = await Transaction.find({
            userId: req.userId,
            type: 'income',
            date: { $gte: startOfMonth }
        });
        
        const totalSpending = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const avgDailySpend = dayOfMonth > 0 ? Math.round(totalSpending / dayOfMonth) : 0;
        const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalSpending) / totalIncome) * 100) : 0;
        
        // Find top spending category
        const categorySpending = {};
        expenses.forEach(e => {
            categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
        });
        
        let topCategory = 'N/A';
        let maxSpending = 0;
        Object.entries(categorySpending).forEach(([category, amount]) => {
            if (amount > maxSpending) {
                maxSpending = amount;
                topCategory = category;
            }
        });
        
        res.json({
            totalSpending: {
                label: 'Total Spending',
                value: `₹${totalSpending.toLocaleString('en-IN')}`,
            },
            avgDaily: {
                label: 'Avg Daily Spend',
                value: `₹${avgDailySpend.toLocaleString('en-IN')}`,
            },
            savingRate: {
                label: 'Savings Rate',
                value: `${savingsRate}%`,
            },
            topCategory: {
                label: 'Top Category',
                value: topCategory,
            },
        });
    } catch (error) {
        console.error('Get analytics summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get spending by category
const getSpendingByCategory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
        const end = endDate ? new Date(endDate) : new Date();
        
        const userObjectId = new mongoose.Types.ObjectId(req.userId);
        const expenses = await Transaction.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    type: 'expense',
                    date: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);
        
        res.json(expenses);
    } catch (error) {
        console.error('Get spending by category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get income vs expense trend
const getIncomeExpenseTrend = async (req, res) => {
    try {
        const { months = 6 } = req.query;
        
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(months));
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        
        const userObjectId = new mongoose.Types.ObjectId(req.userId);
        const transactions = await Transaction.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    type: { $in: ['income', 'expense'] },
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        // Format the data
        const monthlyData = {};
        transactions.forEach(t => {
            const key = `${t._id.year}-${String(t._id.month).padStart(2, '0')}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { month: key, income: 0, expense: 0 };
            }
            monthlyData[key][t._id.type] = t.total;
        });
        
        res.json(Object.values(monthlyData));
    } catch (error) {
        console.error('Get income expense trend error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get daily spending for current month
const getDailySpending = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const userObjectId = new mongoose.Types.ObjectId(req.userId);
        const spending = await Transaction.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    type: 'expense',
                    date: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: '$date' },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        res.json(spending.map(s => ({ day: s._id, amount: s.total })));
    } catch (error) {
        console.error('Get daily spending error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAnalyticsSummary,
    getSpendingByCategory,
    getIncomeExpenseTrend,
    getDailySpending,
};
