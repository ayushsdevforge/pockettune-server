const Bill = require('../models/bill');

// Get all bills for user
const getBills = async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.userId })
            .populate('accountId', 'name type')
            .sort({ dueDate: 1 });
        res.json(bills);
    } catch (error) {
        console.error('Get bills error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get bills summary
const getBillsSummary = async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.userId });
        const now = new Date();
        
        const totalBills = bills.length;
        const unpaidBills = bills.filter(b => !b.isPaid);
        const overdueBills = unpaidBills.filter(b => new Date(b.dueDate) < now);
        
        const unpaidAmount = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
        const overdueAmount = overdueBills.reduce((sum, b) => sum + b.amount, 0);
        const monthlyTotal = bills.reduce((sum, b) => {
            if (b.frequency === 'monthly') return sum + b.amount;
            if (b.frequency === 'yearly') return sum + (b.amount / 12);
            if (b.frequency === 'quarterly') return sum + (b.amount / 3);
            if (b.frequency === 'weekly') return sum + (b.amount * 4);
            return sum;
        }, 0);
        
        res.json({
            totalBills: {
                label: 'Total Bills',
                value: totalBills,
                desc: 'Active Subscription',
            },
            unpaidBills: {
                label: 'Unpaid Bills',
                value: unpaidBills.length,
                desc: `₹${unpaidAmount.toLocaleString('en-IN')}`,
            },
            Overdue: {
                label: 'Overdue',
                value: overdueBills.length,
                desc: `₹${overdueAmount.toLocaleString('en-IN')}`,
            },
            MonthlyTotal: {
                label: 'Monthly Total',
                value: `₹${Math.round(monthlyTotal).toLocaleString('en-IN')}`,
                desc: 'All bills combined',
            },
        });
    } catch (error) {
        console.error('Get bills summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new bill
const createBill = async (req, res) => {
    try {
        const { name, description, amount, category, accountId, frequency, dueDate } = req.body;
        
        const bill = new Bill({
            userId: req.userId,
            name,
            description: description || '',
            amount: parseFloat(amount),
            category: category || 'Others',
            accountId,
            frequency: frequency || 'monthly',
            dueDate: new Date(dueDate),
        });
        
        await bill.save();
        res.status(201).json({ message: 'Bill created successfully', data: bill });
    } catch (error) {
        console.error('Create bill error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update bill
const updateBill = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const bill = await Bill.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: updateData },
            { new: true }
        );
        
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        
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
            { 
                $set: { 
                    isPaid: true, 
                    lastPaidDate: new Date() 
                } 
            },
            { new: true }
        );
        
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        
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
        
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        
        res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
        console.error('Delete bill error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getBills,
    getBillsSummary,
    createBill,
    updateBill,
    markBillPaid,
    deleteBill,
};
