const mongoose = require('mongoose');
const Booking = require('../models/Booking');

const allowedFields = [
  'customerName', 'bookingDate', 'bookingNumber', 'projectName', 'plotNumber',
  'plotSize', 'brokerName', 'totalAmount', 'remainingAmount', 'miscellaneous',
  'status', 'dueDate',
];

function pickBookingFields(body) {
  return Object.fromEntries(allowedFields
    .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
    .map((field) => [field, body[field]]));
}

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.createBooking = async (req, res, next) => {
  try {
    const data = pickBookingFields(req.body);
    if (!data.customerName?.trim() || !data.bookingNumber?.trim() || !data.projectName?.trim() || !data.bookingDate) {
      return res.status(400).json({ message: 'Customer name, booking number, project name and booking date are required.' });
    }
    if (Number(data.remainingAmount || 0) > Number(data.totalAmount || 0)) {
      return res.status(400).json({ message: 'Remaining amount cannot be greater than total amount.' });
    }

    const booking = await Booking.create({ ...data, userId: req.user._id });
    return res.status(201).json({ message: 'Booking created successfully.', booking });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You already have a booking with this booking number.' });
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const filter = { userId: req.user._id };

    if (req.query.status && ['Pending', 'Completed', 'Overdue'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.search?.trim()) {
      const escaped = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { customerName: regex }, { bookingNumber: regex },
        { projectName: regex }, { plotNumber: regex },
      ];
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Booking.countDocuments(filter),
    ]);

    return res.json({ bookings, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid booking ID.' });
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    return res.json({ booking });
  } catch (error) { next(error); }
};

exports.updateBooking = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid booking ID.' });
    const data = pickBookingFields(req.body);
    if (Object.keys(data).length === 0) return res.status(400).json({ message: 'No valid booking fields supplied.' });

    const existing = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existing) return res.status(404).json({ message: 'Booking not found.' });

    const total = data.totalAmount ?? existing.totalAmount;
    const remaining = data.remainingAmount ?? existing.remainingAmount;
    if (Number(remaining) > Number(total)) {
      return res.status(400).json({ message: 'Remaining amount cannot be greater than total amount.' });
    }

    Object.assign(existing, data);
    await existing.save();
    return res.json({ message: 'Booking updated successfully.', booking: existing });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You already have a booking with this booking number.' });
    next(error);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid booking ID.' });
    const booking = await Booking.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    return res.json({ message: 'Booking deleted successfully.' });
  } catch (error) { next(error); }
};
