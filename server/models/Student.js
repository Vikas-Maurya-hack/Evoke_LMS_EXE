import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    course: { type: String, required: true },
    status: {
        type: String,
        enum: ['Active', 'Pending', 'Inactive'],
        default: 'Active'
    },
    joinedDate: { type: String, required: true },
    progress: { type: Number, default: 0 },
    avatar: { type: String, default: '' },
    feeOffered: { type: Number, default: 50000 },
    downPayment: { type: Number, default: 10000 },
    phone: { type: String, default: '' },
    address: { type: String, default: '' }
});

export default mongoose.model('Student', StudentSchema);
