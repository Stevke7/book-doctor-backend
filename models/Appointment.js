const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
	{
		datetime: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ["FREE", "BOOKED"],
			default: "FREE",
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
		events: [
			{
				patient: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
					defaut: null,
				},
				status: {
					type: String,
					enum: ["PENDING", "APPROVED", "REJECTED"],
					required: true,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

const Appointment =
	mongoose.models.Appointment ||
	mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
