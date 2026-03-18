// controllers/bookingController.js
const Booking = require("../models/Booking");

// Create booking (customer)
const createBooking = async (req, res) => {
  try {
    const { serviceName, date, time, address, phone, notes } = req.body;

    if (!serviceName || !date || !time || !address) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      serviceName,
      date,
      time,
      address,
      phone,
      notes,
      // status default is 'pending' from schema
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error("Create booking error:", error.message);
    res.status(500).json({ success: false, message: "Server error while creating booking" });
  }
};

// Get bookings belonging to logged-in customer
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Get bookings error:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching bookings" });
  }
};

// Delete booking (hard delete) — customer cancels
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this booking" });
    }

    await booking.deleteOne(); // hard delete

    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete booking error:", error.message);
    res.status(500).json({ success: false, message: "Server error while deleting booking" });
  }
};

module.exports = { createBooking, getMyBookings, deleteBooking };
