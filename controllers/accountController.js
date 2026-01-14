const Account = require('../models/account');

// Get all accounts for user
const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(accounts);
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get account summary stats
const getAccountSummary = async (req, res) => {
    try {
        const accounts = await Account.find({ userId: req.userId });
        
        let totalBalance = 0;
        let creditUsed = 0;
        
        accounts.forEach(account => {
            if (account.type === 'credit') {
                creditUsed += Math.abs(account.balance);
            } else {
                totalBalance += account.balance;
            }
        });
        
        const netWorth = totalBalance - creditUsed;
        
        res.json({
            Total: {
                label: 'Total Balance',
                amount: `₹${totalBalance.toLocaleString('en-IN')}`,
                desc: `Across ${accounts.length} accounts`,
            },
            Credit: {
                label: 'Credit Used',
                amount: `₹${creditUsed.toLocaleString('en-IN')}`,
                desc: 'Credit cards',
            },
            Net: {
                label: 'Net Worth',
                amount: `₹${netWorth.toLocaleString('en-IN')}`,
                desc: 'Total assets - liabilities',
            },
        });
    } catch (error) {
        console.error('Get account summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new account
const createAccount = async (req, res) => {
    try {
        const { name, type, balance, institution, accountNumber } = req.body;
        
        const account = new Account({
            userId: req.userId,
            name,
            type: type || 'savings',
            balance: balance || 0,
            institution: institution || '',
            accountNumber: accountNumber || '',
        });
        
        await account.save();
        res.status(201).json({ message: 'Account created successfully', data: account });
    } catch (error) {
        console.error('Create account error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update account
const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const account = await Account.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: updateData },
            { new: true }
        );
        
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        
        res.json({ message: 'Account updated successfully', data: account });
    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete account
const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        
        const account = await Account.findOneAndDelete({ _id: id, userId: req.userId });
        
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAccounts,
    getAccountSummary,
    createAccount,
    updateAccount,
    deleteAccount,
};
