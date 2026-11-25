const express = require('express');
const protect = require('../middleware/authMiddleware');
const {
  createBooking, getBookings, getBookingById, updateBooking, deleteBooking,
} = require('../controllers/bookingController');

const router = express.Router();
router.use(protect);
router.route('/').get(getBookings).post(createBooking);
router.route('/:id').get(getBookingById).put(updateBooking).delete(deleteBooking);

module.exports = router;
