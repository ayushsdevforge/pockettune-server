const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['savings', 'checking', 'credit', 'investment', 'cash', 'wallet'],
        default: 'savings',
    },
    balance: {
        type: Number,
        default: 0,
    },
    institution: {
        type: String,
        default: '',
    },
    accountNumber: {
        type: String,
        default: '',
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

accountSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Account', accountSchema);
