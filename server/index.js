import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Course from './models/Course.js';
import Student from './models/Student.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// SECURITY: All sensitive credentials MUST be in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Validate required environment variables on startup
const validateEnvVariables = () => {
    const required = ['MONGO_URI', 'JWT_SECRET', 'SUPER_ADMIN_PASSWORD', 'ADMIN_PASSWORD'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ FATAL ERROR: Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        console.error('\nPlease add these to your .env file:');
        console.error('MONGO_URI=your_mongodb_connection_string');
        console.error('JWT_SECRET=your_secure_random_secret_key');
        console.error('SUPER_ADMIN_PASSWORD=your_super_admin_password');
        console.error('ADMIN_PASSWORD=your_admin_password');
        process.exit(1);
    }
    console.log('✅ All required environment variables validated.');
};

// Middleware
app.use(cors());
app.use(express.json());

// --- AUTHENTICATION & USERS ---

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Seed Users - Credentials from Environment Variables ONLY
const seedUsers = async () => {
    try {
        // Check for Safdar (Super Admin)
        const superAdmin = await User.findOne({ username: 'Safdar' });
        if (!superAdmin) {
            const salt = await bcrypt.genSalt(12); // Industry standard: 12 rounds
            const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, salt);
            await User.create({
                username: 'Safdar',
                password: hashedPassword,
                role: 'super_admin',
                name: 'Safdar'
            });
            console.log('✅ Super Admin (Safdar) created with secure password from environment.');
        }

        // Check for Admin
        const admin = await User.findOne({ username: 'Admin' });
        if (!admin) {
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
            await User.create({
                username: 'Admin',
                password: hashedPassword,
                role: 'admin',
                name: 'Admin'
            });
            console.log('✅ Admin user created with secure password from environment.');
        }

        console.log('✅ User seeding check complete.');
    } catch (error) {
        console.error('❌ Error seeding users:', error);
    }
};

// Auth Middleware - Protected Routes
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'API is running successfully!' });
});

// POST: Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await User.findOne({ username });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                name: user.name,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// PUT: Change Own Password
app.put('/api/auth/change-password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (user && (await bcrypt.compare(currentPassword, user.password))) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(400).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT: Admin Reset Password (Only Super Admin can do this)
app.put('/api/auth/admin-reset-password', protect, async (req, res) => {
    const { targetUsername, newPassword } = req.body;

    // Check if requester is Super Admin
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Not authorized. Only Super Admin can perform this action.' });
    }

    if (!targetUsername || !newPassword) {
        return res.status(400).json({ message: 'Target username and new password are required' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    try {
        const userToUpdate = await User.findOne({ username: targetUsername });
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(12);
        userToUpdate.password = await bcrypt.hash(newPassword, salt);
        await userToUpdate.save();

        res.json({ message: `Password for ${targetUsername} has been reset.` });
    } catch (error) {
        console.error('Admin reset error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// --- COURSES ---

// GET: Database connection status
app.get('/api/status', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const statusMap = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        const isConnected = dbState === 1;
        const host = mongoose.connection.host || 'N/A';
        const dbName = mongoose.connection.name || 'N/A';

        res.json({
            database: {
                status: statusMap[dbState] || 'unknown',
                connected: isConnected,
                host: isConnected ? host : null,
                name: isConnected ? dbName : null,
                timestamp: new Date().toISOString()
            },
            server: {
                status: 'running',
                port: PORT,
                uptime: process.uptime()
            }
        });
    } catch (error) {
        res.status(500).json({
            database: { status: 'error', connected: false, error: error.message },
            server: { status: 'running', port: PORT }
        });
    }
});

// GET: All courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ lastUpdated: -1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Create a new course
app.post('/api/courses', async (req, res) => {
    try {
        const { name, instructor, category, status, price } = req.body;
        const newCourse = new Course({
            name,
            instructor,
            category,
            status,
            revenue: price ? `₹0` : "₹0",
            lastUpdated: new Date()
        });
        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// --- STUDENTS ---

// GET: Fetch all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ joinedDate: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Create a new student
app.post('/api/students', async (req, res) => {
    try {
        const { name, email, course, status, feeOffered, downPayment } = req.body;

        // Generate a unique ID
        const count = await Student.countDocuments();
        const id = `STU${String(count + 1).padStart(3, "0")}`;

        const newStudent = new Student({
            id,
            name,
            email,
            course,
            status: status || 'Active',
            joinedDate: new Date().toLocaleDateString('en-GB'),
            progress: 0,
            feeOffered: feeOffered || 50000,
            downPayment: downPayment || 10000,
            avatar: '',
            phone: '',
            address: ''
        });

        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(400).json({ message: error.message });
    }
});

// PUT: Update a student by ID
app.put('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Try to find by MongoDB _id first, then by custom id field
        let updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedStudent) {
            updatedStudent = await Student.findOneAndUpdate({ id: id }, updates, { new: true });
        }

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(updatedStudent);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE: Remove a student by ID
app.delete('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Try to find by MongoDB _id first, then by custom id field
        let deletedStudent = await Student.findByIdAndDelete(id);

        if (!deletedStudent) {
            // Try finding by custom id field (e.g., "STU001")
            deletedStudent = await Student.findOneAndDelete({ id: id });
        }

        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log(`Deleted student: ${deletedStudent.name}`);
        res.status(200).json({ message: 'Student deleted successfully', student: deletedStudent });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: error.message });
    }
});

// Database Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Seed users after connection
        await seedUsers();

    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Start Server
validateEnvVariables();
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
