const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: { type: String, required: true, trim: true, maxlength: 120 },
    bookingDate: { type: Date, required: true },
    bookingNumber: { type: String, required: true, trim: true, maxlength: 50 },
    projectName: { type: String, required: true, trim: true, maxlength: 150 },
    plotNumber: { type: String, trim: true, default: '' },
    plotSize: { type: String, trim: true, default: '' },
    brokerName: { type: String, trim: true, default: '' },
    totalAmount: { type: Number, min: 0, default: 0 },
    remainingAmount: { type: Number, min: 0, default: 0 },
    miscellaneous: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Overdue'],
      default: 'Pending',
    },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Booking numbers must be unique per account, not across the whole application.
bookingSchema.index({ userId: 1, bookingNumber: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
