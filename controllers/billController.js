const Bill = require('../models/bill');

// Get all bills for user
const getBills = async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.userId }).sort({ dueDate: 1 });
        res.json(bills);
    } catch (error) {
        console.error('Get bills error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get bills summary
const getBillsSummary = async (req, res) => {
    try {
        const now = new Date();
        const bills = await Bill.find({ userId: req.userId });

        const totalBills = bills.length;
        const unpaidBills = bills.filter(b => !b.isPaid).length;
        const overdueBills = bills.filter(b => !b.isPaid && new Date(b.dueDate) < now).length;

        // Monthly total: sum all monthly-equivalent amounts
        let monthlyTotal = 0;
        bills.forEach(b => {
            const freqMap = { monthly: 1, weekly: 4.33, 'bi-weekly': 2.17, quarterly: 1/3, 'bi-annually': 1/6, annually: 1/12 };
            monthlyTotal += b.amount * (freqMap[b.frequency] || 1);
        });

        const unpaidAmount = bills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);

        res.json({
            totalBills: { label: 'Total Bills', value: totalBills, desc: 'Active subscriptions' },
            unpaidBills: { label: 'Unpaid Bills', value: unpaidBills, desc: `₹${unpaidAmount.toLocaleString('en-IN')}` },
            Overdue: { label: 'Overdue', value: overdueBills, desc: `₹${bills.filter(b => !b.isPaid && new Date(b.dueDate) < now).reduce((s, b) => s + b.amount, 0).toLocaleString('en-IN')}` },
            MonthlyTotal: { label: 'Monthly Total', value: `₹${Math.round(monthlyTotal).toLocaleString('en-IN')}`, desc: 'All bills combined' },
        });
    } catch (error) {
        console.error('Get bills summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create bill
const createBill = async (req, res) => {
    try {
        const { name, description, amount, category, frequency, dueDate } = req.body;

        if (!name) return res.status(400).json({ message: 'Bill name is required' });
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount is required' });
        if (!dueDate) return res.status(400).json({ message: 'Due date is required' });

        const bill = new Bill({
            userId: req.userId,
            name,
            description: description || '',
            amount,
            category: category || 'Others',
            frequency: frequency || 'monthly',
            dueDate: new Date(dueDate),
        });

        await bill.save();
        res.status(201).json({ message: 'Bill created successfully', data: bill });
    } catch (error) {
        console.error('Create bill error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update bill
const updateBill = async (req, res) => {
    try {
        const { id } = req.params;
        const bill = await Bill.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: req.body },
            { new: true }
        );
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json({ message: 'Bill updated successfully', data: bill });
    } catch (error) {
        console.error('Update bill error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark bill as paid
const markBillPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const bill = await Bill.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: { isPaid: true } },
            { new: true }
        );
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json({ message: 'Bill marked as paid', data: bill });
    } catch (error) {
        console.error('Mark bill paid error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete bill
const deleteBill = async (req, res) => {
    try {
        const { id } = req.params;
        const bill = await Bill.findOneAndDelete({ _id: id, userId: req.userId });
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
        console.error('Delete bill error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getBills, getBillsSummary, createBill, updateBill, markBillPaid, deleteBill };
