const mongoose = require('mongoose');
const Transaction = require('../models/transaction');

// Get analytics summary (cards at top of analytics page)
const getAnalyticsSummary = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const transactions = await Transaction.find({
            userId: req.userId,
            date: { $gte: startOfMonth },
        });

        let totalSpending = 0;
        let totalIncome = 0;
        const categoryTotals = {};

        transactions.forEach(t => {
            if (t.type === 'expense') {
                totalSpending += t.amount;
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            } else if (t.type === 'income') {
                totalIncome += t.amount;
            }
        });

        const daysInMonth = now.getDate();
        const avgDailySpend = daysInMonth > 0 ? totalSpending / daysInMonth : 0;

        let savingRate = 0;
        if (totalIncome > 0) {
            savingRate = Math.max(0, Math.round(((totalIncome - totalSpending) / totalIncome) * 100));
        }

        const topCategory = Object.keys(categoryTotals).reduce(
            (top, cat) => (categoryTotals[cat] > (categoryTotals[top] || 0) ? cat : top),
            ''
        ) || 'N/A';

        res.json({
            totalSpending: { label: 'Total Spending', value: `₹${Math.round(totalSpending).toLocaleString('en-IN')}` },
            avgDaily: { label: 'Avg Daily Spend', value: `₹${Math.round(avgDailySpend).toLocaleString('en-IN')}` },
            savingRate: { label: 'Savings Rate', value: `${savingRate}%` },
            topCategory: { label: 'Top Category', value: topCategory },
        });
    } catch (error) {
        console.error('Get analytics summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get spending by category (pie chart)
const getSpendingByCategory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const now = new Date();
        const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        const end = endDate ? new Date(endDate) : now;

        const result = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.userId),
                    type: 'expense',
                    date: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { total: -1 } },
        ]);

        res.json(result);
    } catch (error) {
        console.error('Get spending by category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get income vs expense trend (line chart, last N months)
const getIncomeExpenseTrend = async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

        const result = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.userId),
                    type: { $in: ['income', 'expense'] },
                    date: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        type: '$type',
                    },
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Format into { month: 'Jan 24', income: 0, expense: 0 }
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendMap = {};

        result.forEach(({ _id, total }) => {
            const key = `${monthNames[_id.month - 1]} ${String(_id.year).slice(2)}`;
            if (!trendMap[key]) trendMap[key] = { month: key, income: 0, expense: 0 };
            trendMap[key][_id.type] = total;
        });

        res.json(Object.values(trendMap));
    } catch (error) {
        console.error('Get income expense trend error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get daily spending for current month (for bar chart)
const getDailySpending = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const result = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.userId),
                    type: 'expense',
                    date: { $gte: startOfMonth },
                },
            },
            {
                $group: {
                    _id: { $dayOfMonth: '$date' },
                    amount: { $sum: '$amount' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json(result.map(r => ({ day: r._id, amount: r.amount })));
    } catch (error) {
        console.error('Get daily spending error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAnalyticsSummary, getSpendingByCategory, getIncomeExpenseTrend, getDailySpending };
