const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
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
        enum: ['Individual', 'Business'],
        default: 'Individual',
    },
    contactPerson: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    // Positive = client owes you, Negative = you owe client
    balance: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Client', clientSchema);
