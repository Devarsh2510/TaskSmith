// controllers/providerController.js
const Booking = require("../models/Booking");
const User = require("../models/User");

// ✅ Get all bookings assigned to a specific provider
const getProviderBookings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({
        success: false,
        message: "Provider authentication required",
      });
    }

    const providerId = req.user._id;

    // Only providers should access this route
    if (req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Access denied — only providers can view these bookings",
      });
    }

    // Fetch all bookings assigned to this provider
    const bookings = await Booking.find({ provider: providerId })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("getProviderBookings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Provider accepts or declines a booking
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'accepted' or 'declined'.",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Ensure the provider owns this booking
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this booking",
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getProviderBookings, updateBookingStatus };
