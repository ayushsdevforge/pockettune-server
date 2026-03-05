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
    frequency: {
        type: String,
        enum: ['monthly', 'quarterly', 'bi-annually', 'annually', 'weekly', 'bi-weekly'],
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Bill', billSchema);
