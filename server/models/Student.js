import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        immutable: true // Cannot be changed after creation
    },
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    course: { type: String, required: true },
    status: {
        type: String,
        enum: ['Active', 'Pending', 'Inactive'],
        default: 'Pending'
    },
    joinedDate: {
        type: String,
        required: true,
        immutable: true // Cannot be changed after creation
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    avatar: { type: String, default: '' },

    // FINANCIAL FIELDS - Critical for payment tracking
    feeOffered: {
        type: Number,
        required: true,
        min: [0, 'Fee cannot be negative']
    },
    downPayment: {
        type: Number,
        default: 0,
        min: [0, 'Down payment cannot be negative'],
        immutable: true // Down payment is set once during enrollment
    },
    feesPaid: {
        type: Number,
        default: 0,
        min: [0, 'Fees paid cannot be negative']
        // Note: This should ONLY be modified by the payment collection API
    },
    emiMonths: {
        type: Number,
        default: 0, // 0 means full payment/no EMI
        min: 0,
        max: 24
    },

    phone: { type: String, default: '' },
    address: { type: String, default: '' }
}, {
    timestamps: true // Adds createdAt and updatedAt for audit trail
});

// Virtual field for pending amount
StudentSchema.virtual('pendingAmount').get(function () {
    return Math.max(0, this.feeOffered - this.feesPaid);
});

// Virtual field for payment completion percentage
StudentSchema.virtual('paymentPercentage').get(function () {
    if (this.feeOffered === 0) return 0;
    return Math.min(100, (this.feesPaid / this.feeOffered) * 100);
});

// Index for faster queries (id is already indexed via unique: true)
StudentSchema.index({ email: 1 });
StudentSchema.index({ course: 1 });

// Ensure virtuals are included in JSON output
StudentSchema.set('toJSON', { virtuals: true });
StudentSchema.set('toObject', { virtuals: true });

export default mongoose.model('Student', StudentSchema);
