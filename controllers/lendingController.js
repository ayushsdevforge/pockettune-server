const Lending = require('../models/lending');

// Get all lending records for user
const getLendingRecords = async (req, res) => {
    try {
        const records = await Lending.find({ userId: req.userId })
            .populate('accountId', 'name type')
            .sort({ createdAt: -1 });
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
        
        const moneyLent = lentRecords.reduce((sum, r) => sum + r.amount, 0);
        const moneyBorrowed = borrowedRecords.reduce((sum, r) => sum + r.amount, 0);
        const netAmount = moneyLent - moneyBorrowed;
        
        res.json({
            Total: {
                label: 'Money Lent',
                amount: `₹${moneyLent.toLocaleString('en-IN')}`,
                desc: `${lentRecords.length} active record${lentRecords.length !== 1 ? 's' : ''}`,
                record: lentRecords.length,
            },
            Credit: {
                label: 'Money Borrowed',
                amount: `₹${moneyBorrowed.toLocaleString('en-IN')}`,
                desc: `${borrowedRecords.length} active record${borrowedRecords.length !== 1 ? 's' : ''}`,
                record: borrowedRecords.length,
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

// Create new lending record
const createLendingRecord = async (req, res) => {
    try {
        const { type, personName, contact, amount, interestRate, dueDate, description, accountId } = req.body;
        
        const record = new Lending({
            userId: req.userId,
            type,
            personName,
            contact: contact || '',
            amount: parseFloat(amount),
            interestRate: parseFloat(interestRate) || 0,
            dueDate: dueDate ? new Date(dueDate) : null,
            description: description || '',
            accountId,
        });
        
        await record.save();
        res.status(201).json({ message: 'Lending record created successfully', data: record });
    } catch (error) {
        console.error('Create lending record error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update lending record
const updateLendingRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const record = await Lending.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: updateData },
            { new: true }
        );
        
        if (!record) {
            return res.status(404).json({ message: 'Lending record not found' });
        }
        
        res.json({ message: 'Lending record updated successfully', data: record });
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
        
        if (!record) {
            return res.status(404).json({ message: 'Lending record not found' });
        }
        
        res.json({ message: 'Lending record settled', data: record });
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
        
        if (!record) {
            return res.status(404).json({ message: 'Lending record not found' });
        }
        
        res.json({ message: 'Lending record deleted successfully' });
    } catch (error) {
        console.error('Delete lending record error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getLendingRecords,
    getLendingSummary,
    createLendingRecord,
    updateLendingRecord,
    settleLendingRecord,
    deleteLendingRecord,
};
