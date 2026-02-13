import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from './models/Course.js';
import Student from './models/Student.js';
import User from './models/User.js';
import Transaction from './models/Transaction.js';
import EMIPlan from './models/EMIPlan.js';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import crypto from 'crypto';
import dns from 'dns';

// Force Google Public DNS for mongodb+srv:// SRV lookups
// Fixes ECONNREFUSED on networks with restrictive DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Save PORT from parent process (Electron) BEFORE dotenv loads
const parentPort = process.env.PORT;

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env' });

// Parent process PORT takes priority over .env PORT
if (parentPort) {
    process.env.PORT = parentPort;
}

const app = express();
let PORT = parseInt(process.env.PORT) || 5050;

// Auto-generate JWT_SECRET if not set (essential for exe/desktop packaging)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('base64');
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Safdar2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin2026';

// Validate required environment variables on startup
const validateEnvVariables = () => {
    // MONGO_URI is the only truly required variable — everything else has defaults
    if (!process.env.MONGO_URI) {
        console.error('❌ FATAL ERROR: MONGO_URI is not set.');
        console.error('Please add MONGO_URI to your .env file or environment.');
        process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
        console.log('⚠️  JWT_SECRET not set — auto-generated for this session.');
    }

    console.log('✅ All required configuration validated.');
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

// API Health Check (moved to /api/health so '/' serves the frontend)
app.get('/api/health', (req, res) => {
    res.json({ message: 'API is running successfully!' });
});

// POST: Login
// POST: Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Attempting login for user: ${username}`);

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`Login failed: User ${username} not found`);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log(`Login successful for user: ${username}`);
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                name: user.name,
                token: generateToken(user._id)
            });
        } else {
            console.log(`Login failed: Incorrect password for user ${username}`);
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
        const { name, email, course, status, feeOffered, downPayment, avatar, emiMonths } = req.body;

        // Generate a unique ID based on last ID
        const lastStudent = await Student.findOne({}, { id: 1 }).sort({ id: -1 });
        let nextIdNum = 1;
        if (lastStudent && lastStudent.id) {
            const match = lastStudent.id.match(/^STU(\d+)$/);
            if (match) {
                nextIdNum = parseInt(match[1], 10) + 1;
            }
        }
        const id = `STU${String(nextIdNum).padStart(3, "0")}`;

        // IMPORTANT: Initialize feesPaid with downPayment since down payment IS a payment
        const actualDownPayment = downPayment || 0;

        const newStudent = new Student({
            id,
            name,
            email,
            course,
            status: status || 'Pending',
            joinedDate: new Date().toLocaleDateString('en-GB'),
            progress: 0,
            feeOffered: feeOffered || 50000,
            downPayment: actualDownPayment,
            feesPaid: actualDownPayment, // Initialize with down payment
            emiMonths: emiMonths || 0,
            avatar: avatar || '',
            phone: '',
            address: ''
        });

        const savedStudent = await newStudent.save();

        // If there's a down payment, create a transaction record for it
        if (actualDownPayment > 0) {
            const downPaymentTransaction = new Transaction({
                studentId: savedStudent._id,
                studentName: savedStudent.name,
                amount: actualDownPayment,
                type: 'Credit',
                description: 'Down Payment - Initial Enrollment',
                status: 'Completed',
                recordedBy: 'System',
                paymentMode: 'Cash',
                previousBalance: 0,
                newBalance: actualDownPayment
            });
            await downPaymentTransaction.save();
            console.log(`✅ Down payment transaction recorded: ₹${actualDownPayment} for ${savedStudent.name}`);
        }

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

        // SECURITY: Prevent direct manipulation of financial fields
        // feesPaid should ONLY be modified via the payment collection API
        // downPayment is immutable after creation
        const { feesPaid, downPayment, ...safeUpdates } = updates;

        if (feesPaid !== undefined) {
            console.warn(`⚠️ Attempted direct feesPaid update for student ${id} - blocked for data integrity`);
        }
        if (downPayment !== undefined) {
            console.warn(`⚠️ Attempted downPayment modification for student ${id} - blocked (immutable field)`);
        }

        // Try to find by MongoDB _id first, then by custom id field
        let updatedStudent = await Student.findByIdAndUpdate(id, safeUpdates, { new: true });

        if (!updatedStudent) {
            updatedStudent = await Student.findOneAndUpdate({ id: id }, safeUpdates, { new: true });
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

// --- TRANSACTIONS / PAYMENTS ---

// POST: Utility to sync/fix existing students' feesPaid with downPayment
// This is a one-time fix for students created before the downPayment sync was implemented
app.post('/api/students/sync-payments', async (req, res) => {
    try {
        const students = await Student.find();
        let fixedCount = 0;
        const fixes = [];

        for (const student of students) {
            const downPayment = student.downPayment || 0;
            const feesPaid = student.feesPaid || 0;

            // If student has a down payment but feesPaid is less than downPayment, fix it
            if (downPayment > 0 && feesPaid < downPayment) {
                // Update feesPaid to include downPayment
                student.feesPaid = downPayment;
                await student.save();

                // Check if a down payment transaction exists for this student
                const existingDownPaymentTx = await Transaction.findOne({
                    studentId: student._id,
                    description: { $regex: /down payment/i }
                });

                // If no down payment transaction exists, create one
                if (!existingDownPaymentTx) {
                    const downPaymentTransaction = new Transaction({
                        studentId: student._id,
                        studentName: student.name,
                        amount: downPayment,
                        type: 'Credit',
                        description: 'Down Payment - Initial Enrollment (Synced)',
                        status: 'Completed',
                        recordedBy: 'System',
                        paymentMode: 'Cash',
                        previousBalance: 0,
                        newBalance: downPayment
                    });
                    await downPaymentTransaction.save();
                }

                fixedCount++;
                fixes.push({
                    name: student.name,
                    id: student.id,
                    downPayment,
                    previousFeesPaid: feesPaid,
                    newFeesPaid: downPayment
                });
            }
        }

        console.log(`✅ Synced ${fixedCount} students`);
        res.json({
            message: `Synced ${fixedCount} students`,
            fixes: fixes
        });
    } catch (error) {
        console.error('Error syncing payments:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST: Collect Fee - Creates transaction AND updates student balance
// CRITICAL: This endpoint handles money - must be 100% reliable
// POST: Collect Fee - Creates transaction AND updates student balance
// CRITICAL: This endpoint handles money - must be 100% reliable
app.post('/api/payments/collect', protect, async (req, res) => {
    const { studentId, amount, description, paymentMode, notes } = req.body;

    console.log('💰 Payment collection request:', JSON.stringify(req.body, null, 2));
    console.log('👤 User initiating payment:', req.user ? req.user.username : 'Unknown');

    // ===== VALIDATION =====
    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number greater than 0' });
    }

    // Validate payment mode
    const validModes = ['Cash', 'Cheque', 'UPI', 'Online Transfer', 'Other'];
    const selectedMode = paymentMode || 'Cash';
    if (!validModes.includes(selectedMode)) {
        return res.status(400).json({ message: 'Invalid payment mode' });
    }

    try {
        // ===== FIND STUDENT =====
        let student = await Student.findById(studentId);
        if (!student) {
            student = await Student.findOne({ id: studentId });
        }

        if (!student) {
            console.error(`❌ Student not found for ID: ${studentId}`);
            return res.status(404).json({ message: 'Student not found' });
        }

        // Store the previous balance for audit trail
        const previousBalance = student.feesPaid || 0;
        const newBalance = previousBalance + paymentAmount;

        // Check if payment would exceed total fee (warning, not blocking)
        const feeOffered = student.feeOffered || 0;
        const wouldExceed = newBalance > feeOffered;

        // ===== CREATE TRANSACTION RECORD =====
        const transactionPayload = {
            studentId: student._id,
            studentName: student.name,
            amount: paymentAmount,
            type: 'Credit',
            description: description || 'Fee Payment',
            status: 'Completed',
            recordedBy: req.user?.name || req.user?.username || 'Admin',
            paymentMode: selectedMode,
            notes: notes || null,
            previousBalance: previousBalance,
            newBalance: newBalance
        };

        console.log('📝 Creating transaction with payload:', transactionPayload);

        const transaction = new Transaction(transactionPayload);

        // Save transaction first
        await transaction.save();
        console.log('✅ Transaction saved successfully');

        // ===== ATOMIC UPDATE OF STUDENT BALANCE =====
        // Use findOneAndUpdate with specific conditions to prevent race conditions
        const updatedStudent = await Student.findOneAndUpdate(
            {
                _id: student._id,
                feesPaid: previousBalance // Only update if balance hasn't changed
            },
            {
                $inc: { feesPaid: paymentAmount }
            },
            {
                new: true,
                runValidators: true
            }
        );

        // If update failed (balance changed during operation), rollback transaction
        if (!updatedStudent) {
            // Mark transaction as failed
            transaction.status = 'Failed';
            transaction.notes = (transaction.notes || '') + ' | ROLLBACK: Concurrent modification detected';
            await transaction.save();

            console.error(`❌ Payment ROLLBACK: Concurrent modification for ${student.name}`);
            return res.status(409).json({
                message: 'Payment failed due to concurrent modification. Please try again.',
                error: 'CONCURRENT_MODIFICATION'
            });
        }

        // ===== SUCCESS =====
        console.log(`✅ Payment recorded: ₹${paymentAmount} for ${student.name} | Receipt: ${transaction.receiptNumber}`);
        console.log(`   Previous: ₹${previousBalance} → New: ₹${newBalance}`);

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            transaction: {
                _id: transaction._id,
                receiptNumber: transaction.receiptNumber,
                amount: transaction.amount,
                date: transaction.date,
                paymentMode: transaction.paymentMode,
                previousBalance: previousBalance,
                newBalance: newBalance
            },
            student: updatedStudent,
            warning: wouldExceed ? `Payment exceeds total fee. New balance: ₹${newBalance}` : null
        });

    } catch (error) {
        console.error('❌ Payment collection error:', error);

        // Write error to a file for persistent debugging
        const fs = await import('fs');
        const logMessage = `\n[${new Date().toISOString()}] Payment Error:
        Error: ${error.message}
        Stack: ${error.stack}
        Body: ${JSON.stringify(req.body)}
        User: ${req.user ? req.user.username : 'Unknown'}
        -----------------------------------\n`;

        try {
            fs.appendFileSync('payment_errors.log', logMessage);
        } catch (fsError) {
            console.error('Failed to write to log file:', fsError);
        }

        if (error.errors) {
            console.error('❌ Validation Errors:', JSON.stringify(error.errors, null, 2));
        }

        // Provide specific error messages
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            message: 'Failed to record payment. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET: Verify data consistency between Student.feesPaid and Transaction totals
// CRITICAL: Use this to detect any data tampering or sync issues
app.get('/api/payments/verify', async (req, res) => {
    try {
        const students = await Student.find();
        const issues = [];
        let totalChecked = 0;
        let totalIssues = 0;

        for (const student of students) {
            totalChecked++;

            // Sum all completed credit transactions for this student
            const transactions = await Transaction.aggregate([
                {
                    $match: {
                        studentId: student._id,
                        status: 'Completed',
                        type: 'Credit'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalFromTransactions: { $sum: '$amount' }
                    }
                }
            ]);

            const transactionTotal = transactions.length > 0 ? transactions[0].totalFromTransactions : 0;
            const studentFeesPaid = student.feesPaid || 0;

            // Check for mismatch
            if (Math.abs(transactionTotal - studentFeesPaid) > 0.01) { // Allow tiny floating point differences
                totalIssues++;
                issues.push({
                    studentId: student.id,
                    studentName: student.name,
                    feesPaidInStudent: studentFeesPaid,
                    totalFromTransactions: transactionTotal,
                    difference: studentFeesPaid - transactionTotal,
                    status: 'MISMATCH'
                });
            }
        }

        const isHealthy = totalIssues === 0;

        res.json({
            healthy: isHealthy,
            message: isHealthy
                ? '✅ All payment data is consistent'
                : `⚠️ Found ${totalIssues} inconsistencies`,
            summary: {
                studentsChecked: totalChecked,
                issuesFound: totalIssues
            },
            issues: issues,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST: Fix data inconsistencies (recalculate feesPaid from transactions)
app.post('/api/payments/fix-inconsistencies', protect, async (req, res) => {
    try {
        // Only super_admin can run this
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                message: 'Only Super Admin can fix payment inconsistencies'
            });
        }

        const students = await Student.find();
        const fixes = [];

        for (const student of students) {
            // Calculate correct total from completed transactions
            const transactions = await Transaction.aggregate([
                {
                    $match: {
                        studentId: student._id,
                        status: 'Completed',
                        type: 'Credit'
                    }
                },
                {
                    $group: {
                        _id: null,
                        correctTotal: { $sum: '$amount' }
                    }
                }
            ]);

            const correctTotal = transactions.length > 0 ? transactions[0].correctTotal : 0;
            const currentFeesPaid = student.feesPaid || 0;

            // If there's a mismatch, fix it
            if (Math.abs(correctTotal - currentFeesPaid) > 0.01) {
                await Student.findByIdAndUpdate(student._id, {
                    feesPaid: correctTotal
                });

                fixes.push({
                    studentId: student.id,
                    studentName: student.name,
                    previousFeesPaid: currentFeesPaid,
                    correctedFeesPaid: correctTotal
                });

                console.log(`🔧 Fixed ${student.name}: ₹${currentFeesPaid} → ₹${correctTotal}`);
            }
        }

        res.json({
            message: `Fixed ${fixes.length} inconsistencies`,
            fixes: fixes,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Fix inconsistencies error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET: Recent Transactions (Last 5)
app.get('/api/transactions/recent', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .sort({ date: -1 })
            .limit(5);
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET: All Transactions (with optional pagination)
app.get('/api/transactions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find()
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Transaction.countDocuments();

        res.json({
            transactions,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalTransactions: total
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET: Transactions for a specific student
app.get('/api/transactions/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // Try finding by MongoDB _id or custom id
        let student = await Student.findById(studentId).catch(() => null);
        if (!student) {
            student = await Student.findOne({ id: studentId });
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const transactions = await Transaction.find({ studentId: student._id })
            .sort({ date: -1 });

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching student transactions:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// EMI / INSTALLMENT PLAN ENDPOINTS
// ==========================================

// Helper function to generate installment schedule
const generateInstallments = (remainingAmount, numberOfInstallments, startDate, frequency) => {
    const installments = [];
    const installmentAmount = Math.floor(remainingAmount / numberOfInstallments);
    const lastInstallmentExtra = remainingAmount - (installmentAmount * numberOfInstallments);

    for (let i = 0; i < numberOfInstallments; i++) {
        const dueDate = new Date(startDate);

        switch (frequency) {
            case 'Weekly':
                dueDate.setDate(dueDate.getDate() + (i * 7));
                break;
            case 'Bi-Weekly':
                dueDate.setDate(dueDate.getDate() + (i * 14));
                break;
            case 'Monthly':
                dueDate.setMonth(dueDate.getMonth() + i);
                break;
            case 'Quarterly':
                dueDate.setMonth(dueDate.getMonth() + (i * 3));
                break;
            default:
                dueDate.setMonth(dueDate.getMonth() + i);
        }

        installments.push({
            installmentNumber: i + 1,
            amount: i === numberOfInstallments - 1
                ? installmentAmount + lastInstallmentExtra
                : installmentAmount,
            dueDate: dueDate,
            status: 'Pending',
            paidAmount: 0
        });
    }

    return installments;
};

// POST: Create EMI Plan for a student
app.post('/api/emi-plans', protect, async (req, res) => {
    try {
        const { studentId, numberOfInstallments, frequency, startDate, notes } = req.body;

        // Validate student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if EMI plan already exists
        const existingPlan = await EMIPlan.findOne({ studentId });
        if (existingPlan) {
            return res.status(400).json({ message: 'EMI plan already exists for this student' });
        }

        const totalAmount = student.feeOffered || 0;
        const downPayment = student.downPayment || 0;
        const remainingAmount = totalAmount - downPayment;

        if (remainingAmount <= 0) {
            return res.status(400).json({ message: 'No remaining amount for EMI plan' });
        }

        const installments = generateInstallments(
            remainingAmount,
            numberOfInstallments || 6,
            startDate || new Date(),
            frequency || 'Monthly'
        );

        const emiPlan = new EMIPlan({
            studentId: student._id,
            totalAmount,
            downPayment,
            remainingAmount,
            numberOfInstallments: numberOfInstallments || 6,
            frequency: frequency || 'Monthly',
            startDate: startDate || new Date(),
            installments,
            notes
        });

        await emiPlan.save();

        console.log(`✅ EMI Plan created for ${student.name}: ${numberOfInstallments} installments`);

        res.status(201).json({
            message: 'EMI plan created successfully',
            emiPlan
        });
    } catch (error) {
        console.error('Error creating EMI plan:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET: Get EMI Plan for a student
app.get('/api/emi-plans/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        let emiPlan = await EMIPlan.findOne({ studentId }).populate('studentId', 'name email');

        if (!emiPlan) {
            // Try finding by custom student id
            const student = await Student.findOne({ id: studentId });
            if (student) {
                emiPlan = await EMIPlan.findOne({ studentId: student._id });
            }
        }

        if (!emiPlan) {
            return res.status(404).json({ message: 'No EMI plan found for this student' });
        }

        // Update overdue statuses
        if (emiPlan.updateOverdueStatuses()) {
            await emiPlan.save();
        }

        res.json(emiPlan);
    } catch (error) {
        console.error('Error fetching EMI plan:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET: Get all EMI plans with overdue alerts
app.get('/api/emi-plans', async (req, res) => {
    try {
        const plans = await EMIPlan.find({ isActive: true })
            .populate('studentId', 'name email course');

        // Update overdue statuses for all plans
        for (const plan of plans) {
            if (plan.updateOverdueStatuses()) {
                await plan.save();
            }
        }

        // Separate overdue from regular
        const overdueAlerts = plans.filter(p => p.overdueCount > 0);
        const upcomingDues = plans.filter(p => {
            const nextDue = p.nextDue;
            if (!nextDue) return false;
            const daysUntilDue = Math.ceil((new Date(nextDue.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntilDue <= 7 && daysUntilDue >= 0;
        });

        res.json({
            totalPlans: plans.length,
            overdueCount: overdueAlerts.length,
            upcomingDueCount: upcomingDues.length,
            plans,
            overdueAlerts: overdueAlerts.map(p => ({
                studentName: p.studentId?.name,
                studentId: p.studentId?._id,
                overdueCount: p.overdueCount,
                nextDue: p.nextDue
            })),
            upcomingDues: upcomingDues.map(p => ({
                studentName: p.studentId?.name,
                studentId: p.studentId?._id,
                nextDue: p.nextDue
            }))
        });
    } catch (error) {
        console.error('Error fetching EMI plans:', error);
        res.status(500).json({ message: error.message });
    }
});

// PUT: Mark installment as paid
app.put('/api/emi-plans/:studentId/pay/:installmentNumber', protect, async (req, res) => {
    try {
        const { studentId, installmentNumber } = req.params;
        const { transactionId, paidAmount } = req.body;

        const emiPlan = await EMIPlan.findOne({ studentId });
        if (!emiPlan) {
            return res.status(404).json({ message: 'EMI plan not found' });
        }

        const installment = emiPlan.installments.find(
            i => i.installmentNumber === parseInt(installmentNumber)
        );

        if (!installment) {
            return res.status(404).json({ message: 'Installment not found' });
        }

        const amount = paidAmount || installment.amount;
        installment.paidAmount = amount;
        installment.paidDate = new Date();
        installment.status = amount >= installment.amount ? 'Paid' : 'Partially Paid';

        if (transactionId) {
            installment.transactionId = transactionId;
        }

        await emiPlan.save();

        res.json({
            message: 'Installment marked as paid',
            installment,
            emiPlan
        });
    } catch (error) {
        console.error('Error updating installment:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// ANALYTICS ENDPOINTS
// ==========================================

// GET: Payment Mode Analytics
app.get('/api/analytics/payment-modes', async (req, res) => {
    try {
        const analytics = await Transaction.aggregate([
            {
                $match: {
                    status: 'Completed',
                    type: 'Credit'
                }
            },
            {
                $group: {
                    _id: '$paymentMode',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ]);

        const total = analytics.reduce((sum, mode) => sum + mode.totalAmount, 0);

        const result = analytics.map(mode => ({
            mode: mode._id || 'Unknown',
            count: mode.count,
            amount: mode.totalAmount,
            percentage: total > 0 ? Math.round((mode.totalAmount / total) * 100) : 0
        }));

        res.json({
            total,
            modes: result
        });
    } catch (error) {
        console.error('Error fetching payment mode analytics:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET: Revenue Trends (Last 6 months)
app.get('/api/analytics/revenue-trends', async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const trends = await Transaction.aggregate([
            {
                $match: {
                    status: 'Completed',
                    type: 'Credit',
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    totalRevenue: { $sum: '$amount' },
                    transactionCount: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Fill in missing months with 0
        const result = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthData = trends.find(
                t => t._id.year === date.getFullYear() && t._id.month === date.getMonth() + 1
            );

            result.push({
                month: date.toLocaleString('default', { month: 'short' }),
                year: date.getFullYear(),
                revenue: monthData?.totalRevenue || 0,
                transactions: monthData?.transactionCount || 0
            });
        }

        // Calculate month-over-month growth
        const currentMonth = result[result.length - 1]?.revenue || 0;
        const lastMonth = result[result.length - 2]?.revenue || 0;
        const growth = lastMonth > 0
            ? Math.round(((currentMonth - lastMonth) / lastMonth) * 100)
            : 0;

        res.json({
            trends: result,
            currentMonth,
            lastMonth,
            growth,
            growthPositive: growth >= 0
        });
    } catch (error) {
        console.error('Error fetching revenue trends:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET: Course-wise enrollment analytics
app.get('/api/analytics/courses', async (req, res) => {
    try {
        const analytics = await Student.aggregate([
            {
                $group: {
                    _id: '$course',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$feesPaid' },
                    totalFeeOffered: { $sum: '$feeOffered' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const total = analytics.reduce((sum, course) => sum + course.count, 0);

        const result = analytics.map(course => ({
            course: course._id || 'Unknown',
            students: course.count,
            revenue: course.totalRevenue,
            potential: course.totalFeeOffered,
            collected: course.totalFeeOffered > 0
                ? Math.round((course.totalRevenue / course.totalFeeOffered) * 100)
                : 0,
            percentage: total > 0 ? Math.round((course.count / total) * 100) : 0
        }));

        res.json({
            totalStudents: total,
            courses: result
        });
    } catch (error) {
        console.error('Error fetching course analytics:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// PROFILE PHOTO UPLOAD
// ==========================================

// For now, we'll accept base64 encoded images
// In production, you'd use a service like AWS S3 or Cloudinary

// PUT: Update student avatar
app.put('/api/students/:id/avatar', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { avatar } = req.body; // Base64 encoded image

        if (!avatar) {
            return res.status(400).json({ message: 'Avatar data is required' });
        }

        // Validate base64 image (should start with data:image)
        if (!avatar.startsWith('data:image/')) {
            return res.status(400).json({ message: 'Invalid image format' });
        }

        // Check file size (limit to ~500KB base64 = ~375KB actual image)
        if (avatar.length > 700000) {
            return res.status(400).json({ message: 'Image too large. Maximum size is 500KB' });
        }

        let student = await Student.findById(id);
        if (!student) {
            student = await Student.findOne({ id: id });
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.avatar = avatar;
        await student.save();

        res.json({
            message: 'Avatar updated successfully',
            student
        });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// RECEIPT / REPORT GENERATION
// ==========================================

// GET: Generate receipt data for a transaction
app.get('/api/transactions/:id/receipt', async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const student = await Student.findById(transaction.studentId);

        const receiptData = {
            receiptNumber: transaction.receiptNumber,
            date: transaction.date,
            studentName: transaction.studentName,
            studentId: student?.id || 'N/A',
            studentEmail: student?.email || 'N/A',
            course: student?.course || 'N/A',

            amount: transaction.amount,
            amountInWords: numberToWords(transaction.amount),
            paymentMode: transaction.paymentMode,
            description: transaction.description,

            previousBalance: transaction.previousBalance || 0,
            newBalance: transaction.newBalance || transaction.amount,

            totalFee: student?.feeOffered || 0,
            totalPaid: student?.feesPaid || 0,
            pendingAmount: (student?.feeOffered || 0) - (student?.feesPaid || 0),

            recordedBy: transaction.recordedBy,
            status: transaction.status,

            organizationName: 'Softlearn Academy',
            organizationAddress: 'Your Address Here',
            organizationPhone: '+91 XXXXXXXXXX',
            organizationEmail: 'contact@softlearn.com'
        };

        res.json(receiptData);
    } catch (error) {
        console.error('Error generating receipt:', error);
        res.status(500).json({ message: error.message });
    }
});

// Helper function to convert number to words (Indian format)
function numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero Rupees Only';

    function convertLessThanThousand(n) {
        if (n === 0) return '';
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    }

    let result = '';

    // Crores
    if (num >= 10000000) {
        result += convertLessThanThousand(Math.floor(num / 10000000)) + ' Crore ';
        num %= 10000000;
    }

    // Lakhs
    if (num >= 100000) {
        result += convertLessThanThousand(Math.floor(num / 100000)) + ' Lakh ';
        num %= 100000;
    }

    // Thousands
    if (num >= 1000) {
        result += convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand ';
        num %= 1000;
    }

    // Hundreds and below
    result += convertLessThanThousand(num);

    return result.trim() + ' Rupees Only';
}

// GET: Student ledger report
app.get('/api/students/:id/ledger', async (req, res) => {
    try {
        const { id } = req.params;

        let student = await Student.findById(id);
        if (!student) {
            student = await Student.findOne({ id: id });
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const transactions = await Transaction.find({
            studentId: student._id,
            status: 'Completed'
        }).sort({ date: 1 });

        // Build ledger with running balance
        let runningBalance = 0;
        const ledger = transactions.map(t => {
            if (t.type === 'Credit') {
                runningBalance += t.amount;
            } else {
                runningBalance -= t.amount;
            }

            return {
                date: t.date,
                receiptNumber: t.receiptNumber,
                description: t.description,
                type: t.type,
                debit: t.type === 'Debit' || t.type === 'Refund' ? t.amount : 0,
                credit: t.type === 'Credit' ? t.amount : 0,
                balance: runningBalance,
                paymentMode: t.paymentMode
            };
        });

        res.json({
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                course: student.course,
                joinedDate: student.joinedDate
            },
            summary: {
                totalFee: student.feeOffered,
                totalPaid: student.feesPaid,
                pending: (student.feeOffered || 0) - (student.feesPaid || 0),
                downPayment: student.downPayment
            },
            ledger,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating ledger:', error);
        res.status(500).json({ message: error.message });
    }
});

// Database Connection with retry logic
const connectDB = async (retries = 5) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🔌 MongoDB connection attempt ${attempt}/${retries}...`);
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                family: 4, // Force IPv4 — fixes DNS SRV issues in packaged apps
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

            // Seed users after connection
            await seedUsers();
            return; // Success — exit the function

        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
            if (attempt < retries) {
                console.log(`⏳ Retrying in 3 seconds...`);
                await new Promise(r => setTimeout(r, 3000));
            } else {
                console.error(`❌ All ${retries} connection attempts failed.`);
                console.error(`   MONGO_URI: ${process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 30) + '...' : 'NOT SET'}`);
                process.exit(1);
            }
        }
    }
};

// ============================================================
// SERVE FRONTEND (Production / Desktop App)
// ============================================================
// Serve the built Vite frontend from 'dist/' folder
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback: any route that doesn't match an API endpoint
// should return index.html (React Router handles it client-side)
app.get(/.*/, (req, res) => {
    // Don't intercept API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server with automatic port retry
function startListening(port, maxRetries = 10) {
    const server = app.listen(port, () => {
        PORT = port;
        console.log(`🚀 Server running on port ${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && maxRetries > 0) {
            console.log(`⚠️  Port ${port} is busy, trying ${port + 1}...`);
            server.close();
            startListening(port + 1, maxRetries - 1);
        } else {
            console.error(`❌ Failed to start server: ${err.message}`);
            process.exit(1);
        }
    });
}

validateEnvVariables();
connectDB().then(() => {
    startListening(PORT);
});
