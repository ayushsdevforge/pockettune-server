const UserData = require('../models/userData');

// Initialize user data with default values
const initializeUserData = async (req, res) => {
    try {
        const existingData = await UserData.findOne({ userId: req.userId });
        if (existingData) {
            return res.status(400).json({ message: 'User data already exists' });
        }

        const userData = new UserData({ userId: req.userId });
        await userData.save();
        res.status(201).json({ message: 'User data initialized successfully', data: userData });
    } catch (error) {
        console.error('Initialize user data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user data
const getUserData = async (req, res) => {
    try {
        let userData = await UserData.findOne({ userId: req.userId });

        // If no data exists, create default data
        if (!userData) {
            userData = new UserData({ userId: req.userId });
            await userData.save();
        }

        res.json(userData);
    } catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user data
const updateUserData = async (req, res) => {
    try {
        const updateData = req.body;

        let userData = await UserData.findOneAndUpdate(
            { userId: req.userId },
            { $set: updateData },
            { new: true, upsert: true }
        );

        res.json({ message: 'User data updated successfully', data: userData });
    } catch (error) {
        console.error('Update user data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get financial summary (hero section data)
const getFinancialSummary = async (req, res) => {
    try {
        let userData = await UserData.findOne({ userId: req.userId });

        if (!userData) {
            userData = new UserData({ userId: req.userId });
            await userData.save();
        }

        const summary = {
            totalBalance: {
                isblue: true,
                label: 'Total Balance',
                value: `₹${userData.totalBalance.toLocaleString('en-IN')}.00`,
                valueChangedFromLastMonth: 0,
                iconColor: 'text-white',
            },
            income: {
                label: 'Monthly Income',
                value: `₹${userData.monthlyIncome.toLocaleString('en-IN')}.00`,
                valueChangedFromLastMonth: 0,
                iconColor: 'text-green-500',
            },
            expense: {
                label: 'Monthly Expenses',
                value: `₹${userData.monthlyExpenses.toLocaleString('en-IN')}.00`,
                valueChangedFromLastMonth: 0,
                iconColor: 'text-red-500',
            },
            saving: {
                label: 'Saving Rate',
                value: userData.savingRate,
                isProgressBarVisible: true,
                progressBarValue: userData.savingRate,
                valueChangedFromLastMonth: userData.savingRate,
                iconColor: 'text-blue-500',
            },
            Health: {
                label: 'Financial Health',
                value: userData.financialHealth,
                isProgressBarVisible: true,
                progressBarValue: userData.financialHealth,
                valueChangedFromLastMonth: userData.financialHealth,
                iconColor: 'text-violet-500',
            },
            budget: {
                label: 'Budget Used',
                value: userData.budgetUsed,
                isProgressBarVisible: true,
                progressBarValue: userData.budgetUsed,
                valueChangedFromLastMonth: userData.budgetUsed,
                iconColor: 'text-red-500',
            },
        };

        res.json(summary);
    } catch (error) {
        console.error('Get financial summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get budget data
const getBudgetData = async (req, res) => {
    try {
        let userData = await UserData.findOne({ userId: req.userId });

        if (!userData) {
            userData = new UserData({ userId: req.userId });
            await userData.save();
        }

        const categories = userData.budgetCategories;

        const budgetData = {
            monthlyBudget: {
                label: 'Monthly Budget',
                budget: categories.monthlyBudget.budget,
                spent: `₹${categories.monthlyBudget.spent}.00 spent`,
                left: `₹${(categories.monthlyBudget.budget - categories.monthlyBudget.spent).toLocaleString('en-IN')} remaining`,
            },
            foodDining: {
                label: 'Food & Dining',
                budget: categories.foodDining.budget,
                spent: `₹${categories.foodDining.spent}.00 spent`,
                left: `₹${(categories.foodDining.budget - categories.foodDining.spent).toLocaleString('en-IN')} remaining`,
            },
            transportation: {
                label: 'Transportation',
                budget: categories.transportation.budget,
                spent: `₹${categories.transportation.spent}.00 spent`,
                left: `₹${(categories.transportation.budget - categories.transportation.spent).toLocaleString('en-IN')} remaining`,
            },
            shopping: {
                label: 'Shopping',
                budget: categories.shopping.budget,
                spent: `₹${categories.shopping.spent}.00 spent`,
                left: `₹${(categories.shopping.budget - categories.shopping.spent).toLocaleString('en-IN')} remaining`,
            },
            entertainment: {
                label: 'Entertainment',
                budget: categories.entertainment.budget,
                spent: `₹${categories.entertainment.spent}.00 spent`,
                left: `₹${(categories.entertainment.budget - categories.entertainment.spent).toLocaleString('en-IN')} remaining`,
            },
            billsUtilities: {
                label: 'Bills & Utilities',
                budget: categories.billsUtilities.budget,
                spent: `₹${categories.billsUtilities.spent}.00 spent`,
                left: `₹${(categories.billsUtilities.budget - categories.billsUtilities.spent).toLocaleString('en-IN')} remaining`,
            },
            healthcare: {
                label: 'Healthcare',
                budget: categories.healthcare.budget,
                spent: `₹${categories.healthcare.spent}.00 spent`,
                left: `₹${(categories.healthcare.budget - categories.healthcare.spent).toLocaleString('en-IN')} remaining`,
            },
            education: {
                label: 'Education',
                budget: categories.education.budget,
                spent: `₹${categories.education.spent}.00 spent`,
                left: `₹${(categories.education.budget - categories.education.spent).toLocaleString('en-IN')} remaining`,
            },
            personalCare: {
                label: 'Personal Care',
                budget: categories.personalCare.budget,
                spent: `₹${categories.personalCare.spent}.00 spent`,
                left: `₹${(categories.personalCare.budget - categories.personalCare.spent).toLocaleString('en-IN')} remaining`,
            },
        };

        res.json(budgetData);
    } catch (error) {
        console.error('Get budget data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    initializeUserData,
    getUserData,
    updateUserData,
    getFinancialSummary,
    getBudgetData,
};
