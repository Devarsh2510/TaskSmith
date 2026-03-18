const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * ✅ GET /api/provider/bookings
 * Get all bookings related to the provider
 * Includes both pending (unassigned) and assigned bookings
 */
router.get("/bookings", protect, authorize("provider"), async (req, res) => {
  try {
    console.log("🔍 Fetching provider bookings for:", req.user._id);

    const bookings = await Booking.find({
      $or: [
        { status: "pending" }, // waiting for provider to accept
        { provider: req.user._id }, // already accepted/declined by this provider
      ],
    })
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });

    console.log("✅ Found bookings:", bookings.length);

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching provider bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching provider bookings",
      error: error.message,
    });
  }
});

/**
 * ✅ PUT /api/provider/bookings/:id/accept
 * Provider accepts a booking
 */
router.put("/bookings/:id/accept", protect, authorize("provider"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Update status and assign provider
    booking.status = "accepted";
    booking.provider = req.user._id;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error accepting booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error accepting booking",
      error: error.message,
    });
  }
});


// PUT /api/providers/bookings/:id/complete
router.put("/bookings/:id/complete", protect, authorize("provider"), async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
  
      if (booking.status !== "accepted") {
        return res.status(400).json({
          success: false,
          message: "Only accepted bookings can be marked as completed",
        });
      }
  
      booking.status = "completed";
      await booking.save();
  
      res.json({ success: true, message: "Booking marked as completed", booking });
    } catch (error) {
      console.error("Error marking completed:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  
/**
 * ✅ PUT /api/provider/bookings/:id/decline
 * Provider declines a booking
 */
router.put("/bookings/:id/decline", protect, authorize("provider"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = "declined";
    booking.provider = req.user._id;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking declined successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error declining booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error declining booking",
      error: error.message,
    });
  }
});

module.exports = router;
