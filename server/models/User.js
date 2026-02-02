import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
