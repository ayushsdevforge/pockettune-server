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
        default: null,
    },
    description: {
        type: String,
        default: '',
    },
    isSettled: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Lending', lendingSchema);
