const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
	{
		datetime: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ["FREE", "PENDING", "APPROVED", "REJECTED"],
			default: "FREE",
		},
		patient: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: null,
			},
		],
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

const Appointment =
	mongoose.models.Appointment ||
	mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
