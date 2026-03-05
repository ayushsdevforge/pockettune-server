const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    targetAmount: {
        type: Number,
        required: true,
    },
    currentAmount: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        default: 'Savings',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    targetDate: {
        type: Date,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Goal', goalSchema);
