const User = require('../models/User');
const jwt = require('jsonwebtoken');

const AuthController = {
    // Register new user
    register: async (req, res) => {
        try {
            console.log(req.body);
            const { username, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email or username already exists'
                });
            }

            // Create new user
            const user = await User.create({ username, password });
            
            // Generate JWT token
            const token = user.createJwt();

            // Return success response
            res.status(201).json({
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Something went wrong during registration'
            });
        }
    }
    ,
    // Login user
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Check if user exists
            const user = await User.findOne({ username });
            if (!user) {
                console.log('no user');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check password
            const isPasswordCorrect = await user.comparePassword(password);
            if (!isPasswordCorrect) {
                console.log('wrong pas')
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate JWT token
            const token = user.createJwt();

            // Set token in HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                sameSite: 'strict', // Protect against CSRF
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            // Return success response
            res.status(200).json({
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Something went wrong during login'
            });
        }
    }
    ,
    // Logout user
    logout: async (req, res) => {
        try {
            // Clear the token cookie
            res.clearCookie('token');
            
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Something went wrong during logout'
            });
        }
    }
}

module.exports = AuthController;