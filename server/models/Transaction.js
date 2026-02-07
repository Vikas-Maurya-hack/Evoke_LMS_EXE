import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    // Reference to student - immutable once set
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        immutable: true // Cannot be changed after creation
    },

    // Cached student name for display (in case student is deleted)
    studentName: {
        type: String,
        required: true,
        immutable: true // Snapshot at time of transaction
    },

    // CRITICAL: Amount - immutable after creation
    amount: {
        type: Number,
        required: true,
        min: [1, 'Amount must be at least ₹1'],
        immutable: true // CANNOT be modified after creation - prevents tampering
    },

    // Transaction date - immutable
    date: {
        type: Date,
        default: Date.now,
        immutable: true // Cannot be backdated
    },

    // Transaction type
    type: {
        type: String,
        enum: ['Credit', 'Debit', 'Refund'],
        required: true,
        immutable: true // Type cannot be changed
    },

    // Description
    description: {
        type: String,
        default: 'Fee Payment',
        maxlength: [500, 'Description cannot exceed 500 characters']
    },

    // Status - only specific transitions allowed
    status: {
        type: String,
        enum: ['Completed', 'Pending', 'Failed', 'Cancelled'],
        default: 'Completed'
    },

    // Who recorded this transaction - for audit
    recordedBy: {
        type: String,
        required: true,
        immutable: true // Cannot change who recorded it
    },

    // Payment mode
    paymentMode: {
        type: String,
        enum: ['Cash', 'Cheque', 'UPI', 'Online Transfer', 'Other'],
        default: 'Cash',
        immutable: true // Payment mode cannot be changed after recording
    },

    // Receipt number for physical tracking (optional)
    receiptNumber: {
        type: String,
        default: null
    },

    // Notes for any additional information
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },

    // Flag to mark if this transaction has been verified/audited
    isVerified: {
        type: Boolean,
        default: false
    },

    // Previous balance before this transaction (for audit trail)
    previousBalance: {
        type: Number,
        immutable: true
    },

    // New balance after this transaction (for audit trail)
    newBalance: {
        type: Number,
        immutable: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// IMPORTANT: Prevent deletion of transactions - soft delete only
TransactionSchema.pre('deleteOne', function (next) {
    const error = new Error('Transactions cannot be deleted. Use status: Cancelled instead.');
    next(error);
});

TransactionSchema.pre('findOneAndDelete', function (next) {
    const error = new Error('Transactions cannot be deleted. Use status: Cancelled instead.');
    next(error);
});

// Generate a unique receipt number before saving
TransactionSchema.pre('save', async function () {
    if (this.isNew && !this.receiptNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        // Find last transaction with same year/month prefix to increment correctly
        const prefix = `RCP-${year}${month}-`;
        const lastTrans = await mongoose.model('Transaction').findOne({
            receiptNumber: { $regex: new RegExp(`^${prefix}`) }
        }).sort({ receiptNumber: -1 });

        let nextNum = 1;
        if (lastTrans && lastTrans.receiptNumber) {
            const parts = lastTrans.receiptNumber.split('-');
            if (parts.length === 3) {
                nextNum = parseInt(parts[2], 10) + 1;
            }
        }

        this.receiptNumber = `${prefix}${String(nextNum).padStart(5, '0')}`;
    }
});

// Index for faster queries
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ studentId: 1, date: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ receiptNumber: 1 });
TransactionSchema.index({ createdAt: -1 });

export default mongoose.model('Transaction', TransactionSchema);
