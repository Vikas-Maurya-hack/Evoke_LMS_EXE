import mongoose from 'mongoose';

const InstallmentSchema = new mongoose.Schema({
    installmentNumber: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [1, 'Amount must be at least ₹1']
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Overdue', 'Partially Paid'],
        default: 'Pending'
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    paidDate: {
        type: Date,
        default: null
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null
    }
});

const EMIPlanSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        unique: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [1, 'Total amount must be at least ₹1']
    },
    downPayment: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        required: true
    },
    numberOfInstallments: {
        type: Number,
        required: true,
        min: [1, 'At least 1 installment required'],
        max: [24, 'Maximum 24 installments allowed']
    },
    frequency: {
        type: String,
        enum: ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Custom'],
        default: 'Monthly'
    },
    startDate: {
        type: Date,
        required: true
    },
    installments: [InstallmentSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Virtual for overdue count
EMIPlanSchema.virtual('overdueCount').get(function () {
    const now = new Date();
    return this.installments.filter(i =>
        i.status === 'Pending' && new Date(i.dueDate) < now
    ).length;
});

// Virtual for next due installment
EMIPlanSchema.virtual('nextDue').get(function () {
    return this.installments.find(i => i.status === 'Pending' || i.status === 'Partially Paid');
});

// Virtual for completion percentage
EMIPlanSchema.virtual('completionPercentage').get(function () {
    const paidCount = this.installments.filter(i => i.status === 'Paid').length;
    return Math.round((paidCount / this.numberOfInstallments) * 100);
});

// Method to update overdue statuses
EMIPlanSchema.methods.updateOverdueStatuses = function () {
    const now = new Date();
    let updated = false;

    this.installments.forEach(installment => {
        if (installment.status === 'Pending' && new Date(installment.dueDate) < now) {
            installment.status = 'Overdue';
            updated = true;
        }
    });

    return updated;
};

// Include virtuals in JSON
EMIPlanSchema.set('toJSON', { virtuals: true });
EMIPlanSchema.set('toObject', { virtuals: true });

// Indexes (studentId is already indexed via unique: true)
EMIPlanSchema.index({ 'installments.dueDate': 1 });
EMIPlanSchema.index({ 'installments.status': 1 });

export default mongoose.model('EMIPlan', EMIPlanSchema);
