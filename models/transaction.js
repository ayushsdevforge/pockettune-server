const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['income', 'expense', 'transfer'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        required: true,
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    },
    toAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    tags: [{
        type: String,
    }],
    recurring: {
        type: Boolean,
        default: false,
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

transactionSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Transaction', transactionSchema);
