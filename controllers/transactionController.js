const mongoose = require('mongoose');
const Transaction = require('../models/transaction');
const Account = require('../models/account');
const UserData = require('../models/userData');

// Category mapping for budget tracking
const categoryBudgetMap = {
    'Food & Dining': 'foodDining',
    'Transportation': 'transportation',
    'Shopping': 'shopping',
    'Entertainment': 'entertainment',
    'Bills & Utilities': 'billsUtilities',
    'Healthcare': 'healthcare',
    'Education': 'education',
    'Personal Care': 'personalCare',
};

// Get all transactions for user
const getTransactions = async (req, res) => {
    try {
        const { type, startDate, endDate, limit = 50 } = req.query;
        
        const query = { userId: req.userId };
        
        if (type) {
            query.type = type;
        }
        
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }
        
        const transactions = await Transaction.find(query)
            .populate('accountId', 'name type')
            .sort({ date: -1 })
            .limit(parseInt(limit));
        
        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get recent transactions
const getRecentTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.userId })
            .populate('accountId', 'name type')
            .sort({ date: -1 })
            .limit(10);
        
        res.json(transactions);
    } catch (error) {
        console.error('Get recent transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create income transaction
const createIncome = async (req, res) => {
    try {
        const { amount, description, category, accountId, date, tags, recurring } = req.body;
        
        const transaction = new Transaction({
            userId: req.userId,
            type: 'income',
            amount: parseFloat(amount),
            description,
            category,
            accountId,
            date: date ? new Date(date) : new Date(),
            tags: tags || [],
            recurring: recurring || false,
        });
        
        await transaction.save();
        
        // Update account balance
        if (accountId) {
            await Account.findByIdAndUpdate(accountId, {
                $inc: { balance: parseFloat(amount) }
            });
        }
        
        // Update user data monthly income
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const userObjectId = new mongoose.Types.ObjectId(req.userId);
        const monthlyIncome = await Transaction.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    type: 'income',
                    date: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        await UserData.findOneAndUpdate(
            { userId: req.userId },
            { $set: { monthlyIncome: monthlyIncome[0]?.total || 0 } },
            { upsert: true }
        );
        
        res.status(201).json({ message: 'Income added successfully', data: transaction });
    } catch (error) {
        console.error('Create income error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create expense transaction
const createExpense = async (req, res) => {
    try {
        const { amount, description, category, accountId, date, tags, recurring } = req.body;
        
        const transaction = new Transaction({
            userId: req.userId,
            type: 'expense',
            amount: parseFloat(amount),
            description,
            category,
            accountId,
            date: date ? new Date(date) : new Date(),
            tags: tags || [],
            recurring: recurring || false,
        });
        
        await transaction.save();
        
        // Update account balance
        if (accountId) {
            await Account.findByIdAndUpdate(accountId, {
                $inc: { balance: -parseFloat(amount) }
            });
        }
        
        // Update budget category spending
        const budgetKey = categoryBudgetMap[category];
        if (budgetKey) {
            const updatePath = `budgetCategories.${budgetKey}.spent`;
            await UserData.findOneAndUpdate(
                { userId: req.userId },
                { $inc: { [updatePath]: parseFloat(amount) } },
                { upsert: true }
            );
        }
        
        // Update monthly expenses
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const userObjectId = new mongoose.Types.ObjectId(req.userId);
        const monthlyExpenses = await Transaction.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    type: 'expense',
                    date: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        await UserData.findOneAndUpdate(
            { userId: req.userId },
            { $set: { monthlyExpenses: monthlyExpenses[0]?.total || 0 } },
            { upsert: true }
        );
        
        res.status(201).json({ message: 'Expense added successfully', data: transaction });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create transfer transaction
const createTransfer = async (req, res) => {
    try {
        const { amount, description, fromAccountId, toAccountId, date } = req.body;
        
        const transaction = new Transaction({
            userId: req.userId,
            type: 'transfer',
            amount: parseFloat(amount),
            description,
            category: 'Transfer',
            fromAccountId,
            toAccountId,
            date: date ? new Date(date) : new Date(),
        });
        
        await transaction.save();
        
        // Update account balances
        if (fromAccountId) {
            await Account.findByIdAndUpdate(fromAccountId, {
                $inc: { balance: -parseFloat(amount) }
            });
        }
        
        if (toAccountId) {
            await Account.findByIdAndUpdate(toAccountId, {
                $inc: { balance: parseFloat(amount) }
            });
        }
        
        res.status(201).json({ message: 'Transfer completed successfully', data: transaction });
    } catch (error) {
        console.error('Create transfer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        
        const transaction = await Transaction.findOne({ _id: id, userId: req.userId });
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        // Reverse the account balance changes
        if (transaction.type === 'income' && transaction.accountId) {
            await Account.findByIdAndUpdate(transaction.accountId, {
                $inc: { balance: -transaction.amount }
            });
        } else if (transaction.type === 'expense' && transaction.accountId) {
            await Account.findByIdAndUpdate(transaction.accountId, {
                $inc: { balance: transaction.amount }
            });
        } else if (transaction.type === 'transfer') {
            if (transaction.fromAccountId) {
                await Account.findByIdAndUpdate(transaction.fromAccountId, {
                    $inc: { balance: transaction.amount }
                });
            }
            if (transaction.toAccountId) {
                await Account.findByIdAndUpdate(transaction.toAccountId, {
                    $inc: { balance: -transaction.amount }
                });
            }
        }
        
        await Transaction.findByIdAndDelete(id);
        
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTransactions,
    getRecentTransactions,
    createIncome,
    createExpense,
    createTransfer,
    deleteTransaction,
};
