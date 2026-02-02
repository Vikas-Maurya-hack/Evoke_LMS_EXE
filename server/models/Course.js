import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    instructor: { type: String, required: true },
    students: { type: Number, default: 0 },
    revenue: { type: String, default: "₹0" },
    status: {
        type: String,
        enum: ['Active', 'Draft', 'Archived'],
        default: 'Draft'
    },
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Course', CourseSchema);
