const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createBooking, getMyBookings, deleteBooking } = require("../controllers/bookingController");

const router = express.Router();

// Create new booking
router.post("/", protect, createBooking);

// Get all bookings for logged-in user
router.get("/my", protect, getMyBookings);

// Delete booking
router.delete("/:id", protect, deleteBooking);

module.exports = router;
