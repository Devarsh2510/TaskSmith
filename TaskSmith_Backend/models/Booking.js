// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Use serviceName consistently across backend + frontend
    serviceName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    // statuses providers will set: pending / accepted / declined / completed / cancelled
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed", "cancelled"],
      default: "pending",
    },
    // provider assigned (optional)
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
