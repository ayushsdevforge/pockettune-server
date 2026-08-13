const User = require('../models/user');
const UserData = require('../models/userData');
const Account = require('../models/account');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: username,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        console.log('User created:', newUser._id);

        // Initialize user data for the new user
        try {
            const userData = new UserData({ userId: newUser._id });
            await userData.save();
            console.log('UserData created');
        } catch (userDataError) {
            console.error('Error creating UserData:', userDataError.message);
            // Continue even if UserData fails, it will be created on first access
        }

        // Create a default Cash account for the new user  
        try {
            const defaultAccount = new Account({
                userId: newUser._id,
                name: 'Cash',
                type: 'cash',
                balance: 0,
            });
            await defaultAccount.save();
            console.log('Default account created');
        } catch (accountError) {
            console.error('Error creating default account:', accountError.message);
            // Continue even if account creation fails
        }

        // Auto-login: Generate token and return user data
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, getUserProfile };