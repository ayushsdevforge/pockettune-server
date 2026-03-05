const Lending = require('../models/lending');

// Get all lending records for user
const getLendingRecords = async (req, res) => {
    try {
        const records = await Lending.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(records);
    } catch (error) {
        console.error('Get lending records error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get lending summary
const getLendingSummary = async (req, res) => {
    try {
        const records = await Lending.find({ userId: req.userId, isSettled: false });

        const lentRecords = records.filter(r => r.type === 'lent');
        const borrowedRecords = records.filter(r => r.type === 'borrowed');

        const totalLent = lentRecords.reduce((sum, r) => sum + r.amount, 0);
        const totalBorrowed = borrowedRecords.reduce((sum, r) => sum + r.amount, 0);
        const netAmount = totalLent - totalBorrowed;

        res.json({
            Total: {
                label: 'Money Lent',
                amount: `₹${totalLent.toLocaleString('en-IN')}`,
                desc: `${lentRecords.length} active records`,
            },
            Credit: {
                label: 'Money Borrowed',
                amount: `₹${totalBorrowed.toLocaleString('en-IN')}`,
                desc: `${borrowedRecords.length} active records`,
            },
            Net: {
                label: 'Net Amount',
                amount: `₹${Math.abs(netAmount).toLocaleString('en-IN')}`,
                desc: netAmount >= 0 ? 'You are owed' : 'You owe',
            },
        });
    } catch (error) {
        console.error('Get lending summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create lending record
const createLendingRecord = async (req, res) => {
    try {
        const { type, personName, contact, amount, interestRate, dueDate, description } = req.body;

        if (!personName) return res.status(400).json({ message: 'Person name is required' });
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount is required' });
        if (!type || !['lent', 'borrowed'].includes(type)) return res.status(400).json({ message: 'Type must be lent or borrowed' });

        const record = new Lending({
            userId: req.userId,
            type,
            personName,
            contact: contact || '',
            amount,
            interestRate: interestRate || 0,
            dueDate: dueDate ? new Date(dueDate) : null,
            description: description || '',
        });

        await record.save();
        res.status(201).json({ message: 'Lending record created successfully', data: record });
    } catch (error) {
        console.error('Create lending record error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update lending record
const updateLendingRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await Lending.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: req.body },
            { new: true }
        );
        if (!record) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: 'Record updated successfully', data: record });
    } catch (error) {
        console.error('Update lending record error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Settle lending record
const settleLendingRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await Lending.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: { isSettled: true } },
            { new: true }
        );
        if (!record) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: 'Record settled successfully', data: record });
    } catch (error) {
        console.error('Settle lending record error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete lending record
const deleteLendingRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await Lending.findOneAndDelete({ _id: id, userId: req.userId });
        if (!record) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Delete lending record error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getLendingRecords, getLendingSummary, createLendingRecord, updateLendingRecord, settleLendingRecord, deleteLendingRecord };
