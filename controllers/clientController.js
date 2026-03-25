const Client = require('../models/client');

// Get all clients for user
const getClients = async (req, res) => {
    try {
        const clients = await Client.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(clients);
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get clients summary
const getClientsSummary = async (req, res) => {
    try {
        const clients = await Client.find({ userId: req.userId });

        const totalClients = clients.length;
        let clientsOwingYou = 0;
        let youOweClients = 0;

        clients.forEach(c => {
            if (c.balance > 0) clientsOwingYou += c.balance;
            else if (c.balance < 0) youOweClients += Math.abs(c.balance);
        });

        const netBalance = clientsOwingYou - youOweClients;

        res.json({
            totalClients: { label: 'Total Clients', value: totalClients },
            netBalance: { label: 'Net Balance', value: `₹${netBalance.toLocaleString('en-IN')}` },
            clientOwe: { label: 'Clients Owing You', value: `₹${clientsOwingYou.toLocaleString('en-IN')}` },
            youOwe: { label: 'You Owe Clients', value: `₹${youOweClients.toLocaleString('en-IN')}` },
        });
    } catch (error) {
        console.error('Get clients summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create client
const createClient = async (req, res) => {
    try {
        const { name, type, contactPerson, email, phone, address, description } = req.body;

        if (!name || !String(name).trim()) return res.status(400).json({ message: 'Client name is required' });

        const client = new Client({
            userId: req.userId,
            name: String(name).trim(),
            type: type || 'Individual',
            contactPerson: contactPerson || '',
            email: email || '',
            phone: phone || '',
            address: address || '',
            description: description || '',
            balance: 0,
        });

        await client.save();
        res.status(201).json({ message: 'Client created successfully', data: client });
    } catch (error) {
        console.error('Create client error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update client
const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: req.body },
            { new: true }
        );
        if (!client) return res.status(404).json({ message: 'Client not found' });
        res.json({ message: 'Client updated successfully', data: client });
    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update client balance (type: 'credit' adds to balance, 'debit' subtracts)
const updateClientBalance = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type } = req.body;

        if (!amount) return res.status(400).json({ message: 'Amount is required' });

        const client = await Client.findOne({ _id: id, userId: req.userId });
        if (!client) return res.status(404).json({ message: 'Client not found' });

        if (type === 'credit') {
            client.balance += amount;
        } else {
            client.balance -= amount;
        }
        await client.save();
        res.json({ message: 'Balance updated', data: client });
    } catch (error) {
        console.error('Update client balance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete client
const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findOneAndDelete({ _id: id, userId: req.userId });
        if (!client) return res.status(404).json({ message: 'Client not found' });
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getClients, getClientsSummary, createClient, updateClient, updateClientBalance, deleteClient };
