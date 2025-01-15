const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
	appointment: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Appointment",
		required: true,
	},
	patient: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	status: {
		type: String,
		enum: ["PENDING", "APPROVED", "REJECTED"],
		default: "PENDING",
	},
	createdAt: { type: Date, default: Date.now },
});
