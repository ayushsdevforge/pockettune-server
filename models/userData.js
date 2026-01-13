const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    // Financial Summary
    totalBalance: {
        type: Number,
        default: 0,
    },
    monthlyIncome: {
        type: Number,
        default: 0,
    },
    monthlyExpenses: {
        type: Number,
        default: 0,
    },
    savingRate: {
        type: Number,
        default: 0,
    },
    financialHealth: {
        type: Number,
        default: 0,
    },
    budgetUsed: {
        type: Number,
        default: 0,
    },
    // Budget Categories
    budgetCategories: {
        monthlyBudget: { budget: { type: Number, default: 61000 }, spent: { type: Number, default: 0 } },
        foodDining: { budget: { type: Number, default: 15000 }, spent: { type: Number, default: 0 } },
        transportation: { budget: { type: Number, default: 8000 }, spent: { type: Number, default: 0 } },
        shopping: { budget: { type: Number, default: 10000 }, spent: { type: Number, default: 0 } },
        entertainment: { budget: { type: Number, default: 5000 }, spent: { type: Number, default: 0 } },
        billsUtilities: { budget: { type: Number, default: 12000 }, spent: { type: Number, default: 0 } },
        healthcare: { budget: { type: Number, default: 5000 }, spent: { type: Number, default: 0 } },
        education: { budget: { type: Number, default: 3000 }, spent: { type: Number, default: 0 } },
        personalCare: { budget: { type: Number, default: 3000 }, spent: { type: Number, default: 0 } },
    },
    // Account Data
    accounts: [{
        name: String,
        type: { type: String, enum: ['savings', 'checking', 'credit', 'investment', 'cash'] },
        balance: { type: Number, default: 0 },
        institution: String,
    }],
    // Lending Data
    lending: {
        moneyLent: { type: Number, default: 0 },
        moneyBorrowed: { type: Number, default: 0 },
        lentRecords: { type: Number, default: 0 },
        borrowedRecords: { type: Number, default: 0 },
    },
    // Goals Data
    goals: {
        totalGoals: { type: Number, default: 0 },
        activeGoals: { type: Number, default: 0 },
        completedGoals: { type: Number, default: 0 },
        overallProgress: { type: Number, default: 0 },
    },
    // Clients Data
    clients: {
        totalClients: { type: Number, default: 0 },
        netBalance: { type: Number, default: 0 },
        clientsOwingYou: { type: Number, default: 0 },
        youOweClients: { type: Number, default: 0 },
    },
    // Bills Data
    bills: {
        totalBills: { type: Number, default: 0 },
        unpaidBills: { type: Number, default: 0 },
        overdue: { type: Number, default: 0 },
        monthlyTotal: { type: Number, default: 0 },
    },
    // Analytics Data
    analytics: {
        totalSpending: { type: Number, default: 0 },
        avgDailySpend: { type: Number, default: 0 },
        savingsRate: { type: Number, default: 0 },
        topCategory: { type: String, default: '' },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt field before saving
userDataSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('UserData', userDataSchema);
