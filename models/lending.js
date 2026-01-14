const mongoose = require('mongoose');

const lendingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['lent', 'borrowed'],
        required: true,
    },
    personName: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        default: '',
    },
    amount: {
        type: Number,
        required: true,
    },
    interestRate: {
        type: Number,
        default: 0,
    },
    dueDate: {
        type: Date,
    },
    description: {
        type: String,
        default: '',
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    isSettled: {
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

lendingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Lending', lendingSchema);
