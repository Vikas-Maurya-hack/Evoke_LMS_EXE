import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import Student from './models/Student.js'; // Import Student Model

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'API is running successfully!' });
});

// --- COURSES ---

// GET: Fetch all courses
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
        if (!process.env.MONGO_URI) {
            console.error("Error: MONGO_URI is missing in .env file");
            return;
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
