const mongoose = require('mongoose');
const Transaction = require('../models/transaction');
const Account = require('../models/account');
const UserData = require('../models/userData');

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
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid amount is required' });
        }
        
        if (!accountId) {
            return res.status(400).json({ message: 'Account is required' });
        }
        
        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }
        
        // Create the transaction
        const transaction = new Transaction({
            userId: new mongoose.Types.ObjectId(req.userId),
            type: 'income',
            amount,
            description: description || '',
            category,
            accountId: new mongoose.Types.ObjectId(accountId),
            date: date ? new Date(date) : new Date(),
            tags: tags || [],
            recurring: recurring || false,
        });
        
        await transaction.save();
        
        // Update account balance
        const account = await Account.findById(accountId);
        if (account) {
            account.balance += amount;
            await account.save();
        }
        
        // Update user data monthly income
        const userData = await UserData.findOne({ userId: req.userId });
        if (userData) {
            userData.monthlyIncome = (userData.monthlyIncome || 0) + amount;
            await userData.save();
        }
        
        res.status(201).json({ 
            message: 'Income added successfully', 
            data: transaction 
        });
    } catch (error) {
        console.error('Create income error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create expense transaction
const createExpense = async (req, res) => {
    try {
        const { amount, description, category, accountId, date, tags, recurring } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid amount is required' });
        }
        
        if (!accountId) {
            return res.status(400).json({ message: 'Account is required' });
        }
        
        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }
        
        // Create the transaction
        const transaction = new Transaction({
            userId: new mongoose.Types.ObjectId(req.userId),
            type: 'expense',
            amount,
            description: description || '',
            category,
            accountId: new mongoose.Types.ObjectId(accountId),
            date: date ? new Date(date) : new Date(),
            tags: tags || [],
            recurring: recurring || false,
        });
        
        await transaction.save();
        
        // Update account balance
        const account = await Account.findById(accountId);
        if (account) {
            account.balance -= amount;
            await account.save();
        }
        
        // Update user data monthly expenses and budget category
        const userData = await UserData.findOne({ userId: req.userId });
        if (userData) {
            userData.monthlyExpenses = (userData.monthlyExpenses || 0) + amount;
            
            // Update budget category spent
            const categoryMap = {
                'Food & Dining': 'foodDining',
                'Transportation': 'transportation',
                'Shopping': 'shopping',
                'Entertainment': 'entertainment',
                'Bills & Utilities': 'billsUtilities',
                'Healthcare': 'healthcare',
                'Education': 'education',
                'Personal Care': 'personalCare',
            };
            
            const budgetKey = categoryMap[category];
            if (budgetKey && userData.budgetCategories && userData.budgetCategories[budgetKey]) {
                userData.budgetCategories[budgetKey].spent = 
                    (userData.budgetCategories[budgetKey].spent || 0) + amount;
            }
            
            // Update monthly budget spent
            if (userData.budgetCategories && userData.budgetCategories.monthlyBudget) {
                userData.budgetCategories.monthlyBudget.spent = 
                    (userData.budgetCategories.monthlyBudget.spent || 0) + amount;
            }
            
            await userData.save();
        }
        
        res.status(201).json({ 
            message: 'Expense added successfully', 
            data: transaction 
        });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create transfer transaction
const createTransfer = async (req, res) => {
    try {
        const { amount, fromAccountId, toAccountId, description, date } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid amount is required' });
        }
        
        if (!fromAccountId || !toAccountId) {
            return res.status(400).json({ message: 'Both accounts are required' });
        }
        
        if (fromAccountId === toAccountId) {
            return res.status(400).json({ message: 'Cannot transfer to the same account' });
        }
        
        // Create the transfer transaction
        const transaction = new Transaction({
            userId: new mongoose.Types.ObjectId(req.userId),
            type: 'transfer',
            amount,
            description: description || 'Transfer',
            category: 'Transfer',
            accountId: new mongoose.Types.ObjectId(fromAccountId),
            toAccountId: new mongoose.Types.ObjectId(toAccountId),
            date: date ? new Date(date) : new Date(),
        });
        
        await transaction.save();
        
        // Update source account balance
        const fromAccount = await Account.findById(fromAccountId);
        if (fromAccount) {
            fromAccount.balance -= amount;
            await fromAccount.save();
        }
        
        // Update destination account balance
        const toAccount = await Account.findById(toAccountId);
        if (toAccount) {
            toAccount.balance += amount;
            await toAccount.save();
        }
        
        res.status(201).json({ 
            message: 'Transfer completed successfully', 
            data: transaction 
        });
    } catch (error) {
        console.error('Create transfer error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
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
        
        // Reverse the account balance change
        const account = await Account.findById(transaction.accountId);
        if (account) {
            if (transaction.type === 'income') {
                account.balance -= transaction.amount;
            } else if (transaction.type === 'expense') {
                account.balance += transaction.amount;
            } else if (transaction.type === 'transfer') {
                account.balance += transaction.amount;
                // Also update destination account
                const toAccount = await Account.findById(transaction.toAccountId);
                if (toAccount) {
                    toAccount.balance -= transaction.amount;
                    await toAccount.save();
                }
            }
            await account.save();
        }
        
        // Reverse user data changes
        const userData = await UserData.findOne({ userId: req.userId });
        if (userData) {
            if (transaction.type === 'income') {
                userData.monthlyIncome = Math.max(0, (userData.monthlyIncome || 0) - transaction.amount);
            } else if (transaction.type === 'expense') {
                userData.monthlyExpenses = Math.max(0, (userData.monthlyExpenses || 0) - transaction.amount);
            }
            await userData.save();
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
