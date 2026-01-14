const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        default: 'Others',
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly', 'one-time'],
        default: 'monthly',
    },
    dueDate: {
        type: Date,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    lastPaidDate: {
        type: Date,
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

billSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Bill', billSchema);
