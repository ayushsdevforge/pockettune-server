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

        // Safe access with default values
        const totalBalance = userData.totalBalance ?? 0;
        const monthlyIncome = userData.monthlyIncome ?? 0;
        const monthlyExpenses = userData.monthlyExpenses ?? 0;
        const savingRate = userData.savingRate ?? 0;
        const financialHealth = userData.financialHealth ?? 0;
        const budgetUsed = userData.budgetUsed ?? 0;

        const summary = {
            totalBalance: {
                isblue: true,
                label: 'Total Balance',
                value: `₹${totalBalance.toLocaleString('en-IN')}.00`,
                valueChangedFromLastMonth: 0,
                iconColor: 'text-white',
            },
            income: {
                label: 'Monthly Income',
                value: `₹${monthlyIncome.toLocaleString('en-IN')}.00`,
                valueChangedFromLastMonth: 0,
                iconColor: 'text-green-500',
            },
            expense: {
                label: 'Monthly Expenses',
                value: `₹${monthlyExpenses.toLocaleString('en-IN')}.00`,
                valueChangedFromLastMonth: 0,
                iconColor: 'text-red-500',
            },
            saving: {
                label: 'Saving Rate',
                value: savingRate,
                isProgressBarVisible: true,
                progressBarValue: savingRate,
                valueChangedFromLastMonth: savingRate,
                iconColor: 'text-blue-500',
            },
            Health: {
                label: 'Financial Health',
                value: financialHealth,
                isProgressBarVisible: true,
                progressBarValue: financialHealth,
                valueChangedFromLastMonth: financialHealth,
                iconColor: 'text-violet-500',
            },
            budget: {
                label: 'Budget Used',
                value: budgetUsed,
                isProgressBarVisible: true,
                progressBarValue: budgetUsed,
                valueChangedFromLastMonth: budgetUsed,
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

        // Safe access with default values
        const categories = userData.budgetCategories || {};

        const getCategory = (cat) => ({
            budget: cat?.budget ?? 0,
            spent: cat?.spent ?? 0
        });

        const monthlyBudget = getCategory(categories.monthlyBudget);
        const foodDining = getCategory(categories.foodDining);
        const transportation = getCategory(categories.transportation);
        const shopping = getCategory(categories.shopping);
        const entertainment = getCategory(categories.entertainment);
        const billsUtilities = getCategory(categories.billsUtilities);
        const healthcare = getCategory(categories.healthcare);
        const education = getCategory(categories.education);
        const personalCare = getCategory(categories.personalCare);

        const budgetData = {
            monthlyBudget: {
                label: 'Monthly Budget',
                budget: monthlyBudget.budget,
                spent: `₹${monthlyBudget.spent}.00 spent`,
                left: `₹${(monthlyBudget.budget - monthlyBudget.spent).toLocaleString('en-IN')} remaining`,
            },
            foodDining: {
                label: 'Food & Dining',
                budget: foodDining.budget,
                spent: `₹${foodDining.spent}.00 spent`,
                left: `₹${(foodDining.budget - foodDining.spent).toLocaleString('en-IN')} remaining`,
            },
            transportation: {
                label: 'Transportation',
                budget: transportation.budget,
                spent: `₹${transportation.spent}.00 spent`,
                left: `₹${(transportation.budget - transportation.spent).toLocaleString('en-IN')} remaining`,
            },
            shopping: {
                label: 'Shopping',
                budget: shopping.budget,
                spent: `₹${shopping.spent}.00 spent`,
                left: `₹${(shopping.budget - shopping.spent).toLocaleString('en-IN')} remaining`,
            },
            entertainment: {
                label: 'Entertainment',
                budget: entertainment.budget,
                spent: `₹${entertainment.spent}.00 spent`,
                left: `₹${(entertainment.budget - entertainment.spent).toLocaleString('en-IN')} remaining`,
            },
            billsUtilities: {
                label: 'Bills & Utilities',
                budget: billsUtilities.budget,
                spent: `₹${billsUtilities.spent}.00 spent`,
                left: `₹${(billsUtilities.budget - billsUtilities.spent).toLocaleString('en-IN')} remaining`,
            },
            healthcare: {
                label: 'Healthcare',
                budget: healthcare.budget,
                spent: `₹${healthcare.spent}.00 spent`,
                left: `₹${(healthcare.budget - healthcare.spent).toLocaleString('en-IN')} remaining`,
            },
            education: {
                label: 'Education',
                budget: education.budget,
                spent: `₹${education.spent}.00 spent`,
                left: `₹${(education.budget - education.spent).toLocaleString('en-IN')} remaining`,
            },
            personalCare: {
                label: 'Personal Care',
                budget: personalCare.budget,
                spent: `₹${personalCare.spent}.00 spent`,
                left: `₹${(personalCare.budget - personalCare.spent).toLocaleString('en-IN')} remaining`,
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
