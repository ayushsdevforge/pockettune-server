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
        const clientsOwingYou = clients.filter(c => c.balance > 0);
        const youOweClients = clients.filter(c => c.balance < 0);
        
        const owedToYou = clientsOwingYou.reduce((sum, c) => sum + c.balance, 0);
        const youOwe = Math.abs(youOweClients.reduce((sum, c) => sum + c.balance, 0));
        const netBalance = owedToYou - youOwe;
        
        res.json({
            totalClients: {
                label: 'Total Clients',
                value: totalClients,
            },
            netBalance: {
                label: 'Net Balance',
                value: `₹${Math.abs(netBalance).toLocaleString('en-IN')}`,
                isPositive: netBalance >= 0,
            },
            clientOwe: {
                label: 'Clients Owing You',
                value: `₹${owedToYou.toLocaleString('en-IN')}`,
                count: clientsOwingYou.length,
            },
            youOwe: {
                label: 'You Owe Clients',
                value: `₹${youOwe.toLocaleString('en-IN')}`,
                count: youOweClients.length,
            },
        });
    } catch (error) {
        console.error('Get clients summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new client
const createClient = async (req, res) => {
    try {
        const { name, type, contactPerson, email, phone, address, description, balance } = req.body;
        
        const client = new Client({
            userId: req.userId,
            name,
            type: type || 'Individual',
            contactPerson: contactPerson || '',
            email: email || '',
            phone: phone || '',
            address: address || '',
            description: description || '',
            balance: parseFloat(balance) || 0,
        });
        
        await client.save();
        res.status(201).json({ message: 'Client created successfully', data: client });
    } catch (error) {
        console.error('Create client error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update client
const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const client = await Client.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { $set: updateData },
            { new: true }
        );
        
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        res.json({ message: 'Client updated successfully', data: client });
    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update client balance
const updateClientBalance = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type } = req.body; // type: 'add' or 'subtract'
        
        const client = await Client.findOne({ _id: id, userId: req.userId });
        
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        if (type === 'add') {
            client.balance += parseFloat(amount);
        } else {
            client.balance -= parseFloat(amount);
        }
        
        await client.save();
        
        res.json({ message: 'Client balance updated', data: client });
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
        
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getClients,
    getClientsSummary,
    createClient,
    updateClient,
    updateClientBalance,
    deleteClient,
};
