const mongoose = require("mongoose");

const eventsSchema = new mongoose.Schema(
	{
		datetime: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ["PENDING", "APPROVED", "REJECTED"],
			default: "PENDING",
		},
		patient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},

		doctor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

const Events = mongoose.models.Events || mongoose.model("Events", eventsSchema);

module.exports = Events;
