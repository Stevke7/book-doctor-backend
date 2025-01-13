const Appointment = require("../models/Appointment");

const appointmentController = {
	//Create appointment but only for doctors
	createAppointment: async (req, res) => {
		try {
			if (req.user.role !== "doctor") {
				return res.status(403).json({ message: "Not authorized" });
			}

			const appointment = new Appointment({
				datetime: new Date(req.body.datetime),
				status: "FREE",
				doctor: req.user._id,
			});

			await appointment.save();
			res
				.status(201)
				.json({ message: '"Appointment created successfully"', appointment });
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},

	/*GET ALL APPOINTMENTS*/
	getAllAppointments: async (req, res) => {
		try {
			// Ensure user role and ID are defined
			if (!req.user || !req.user._id || !req.user.role) {
				return res.status(400).json({ message: "User information is missing" });
			}

			let appointments;

			// Fetch appointments based on user role
			if (req.user.role === "patient") {
				appointments = await Appointment.find({
					$or: [
						{ status: { $in: ["FREE", "PENDING"] } },
						{ patient: req.user._id },
					],
				})
					.populate("doctor", "name")
					.populate("patient", "name")
					.sort({ datetime: 1 });

				// Adjust appointment status for patient role
				appointments = appointments.map((apt) => {
					const aptObj = apt.toObject();
					if (
						aptObj.status === "PENDING" &&
						(!aptObj.patient ||
							!aptObj.patient.some((p) => p._id.equals(req.user._id)))
					) {
						aptObj.status = "FREE";
					}
					return aptObj;
				});
			} else if (req.user.role === "doctor") {
				appointments = await Appointment.find({
					doctor: req.user._id,
				})
					.populate("doctor", "name")
					.populate("patient", "name")
					.sort({ datetime: 1 });
			}

			// Return the appointments data
			res.json(appointments);
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	},

	/** BOOK APPOINTMENT */
	bookAppointment: async (req, res) => {
		try {
			if (req.user.role !== "patient") {
				return res.status(403).json({ message: "Not authorized" });
			}
			const appointment = await Appointment.findOneAndUpdate(
				{
					_id: req.params.id,
					status: { $in: ["FREE", "PENDING"] }, // Allow booking if status is FREE or PENDING
				},
				{
					$addToSet: { patient: req.user._id }, // Add patient to the array without duplicates
					$set: { status: "PENDING" }, // Update status to PENDING
				},
				{ new: true } // Return the updated document
			);

			if (!appointment) {
				return res
					.status(400)
					.json({ message: "This time slot is no longer available" });
			}

			res.json(appointment);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},

	/** CHANGE THE STATUS OF APPOINTMENT */
	updateAppointmentStatus: async (req, res) => {
		try {
			if (req.user.role !== "doctor") {
				return res.status(403).json({ message: "Not authorized" });
			}
			const { status } = req.body;
			const appointment = await Appointment.findById(req.params.id);

			if (!appointment) {
				return res.status(403).json({ message: "Appointment Not Found" });
			}
			if (status === "APPROVED") {
				await Appointment.updateMany(
					{
						_id: { $ne: appointment._id },
						datetime: appointment.datetime,
						status: "PENDING",
					},
					{ status: "REJECTED" }
				);
			}

			appointment.status = status;
			await appointment.save();

			res.json(appointment);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
};

module.exports = appointmentController;
