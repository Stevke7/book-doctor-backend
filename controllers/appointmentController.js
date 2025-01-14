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
			let appointments;

			if (req.user.role === "patient") {
				appointments = await Appointment.find({
					$or: [
						{ status: "FREE" },
						{ status: "PENDING" },
						{ patient: req.user._id },
					],
				})
					.populate("doctor", "name")
					.populate("patient", "name")
					.sort({ datetime: 1 });

				appointments = appointments.map((apt) => {
					const aptObj = apt.toObject();

					// Check if the current user is in the patients array
					const isPatient = aptObj.patient.some(
						(patient) => patient._id.toString() === req.user._id.toString()
					);

					if (isPatient) {
						// Set status to PENDING if the user has booked this appointment
						aptObj.status =
							aptObj.status === "APPROVED" ? "APPROVED" : "PENDING";
					}

					return aptObj;
				});
			} else if (req.user.role === "doctor") {
				appointments = await Appointment.find({
					doctor: req.user._id,
					$or: [
						{ status: "PENDING" },
						{ status: "APPROVED" },
						{ status: "FREE" },
						{ status: "REJECTED" },
					],
				})
					.populate("doctor", "name")
					.populate("patient", "name")
					.sort({ datetime: 1 });
			}

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
			const appointment = await Appointment.findOne({
				_id: req.params.id,
				$or: [
					{ status: "FREE" }, // Appointment is available
					{ status: "PENDING" }, // Appointment is already reserved but not approved
				],
				datetime: {
					$nin: await Appointment.distinct("datetime", { status: "APPROVED" }), // Ensure the time is not already approved
				},
			});

			if (!appointment) {
				return res
					.status(400)
					.json({ message: "This time slot is no longer available" });
			}

			const updatedAppointment = await Appointment.findOneAndUpdate(
				{ _id: req.params.id },
				{
					$addToSet: { patient: { _id: req.user._id, name: req.user.name } }, // Add current user to patients array
					$set: { status: "PENDING" }, // Ensure status is PENDING for the current user
				},
				{ new: true }
			);

			return res.json(updatedAppointment);
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
