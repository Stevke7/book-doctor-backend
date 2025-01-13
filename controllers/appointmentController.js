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
					$or: [{ status: "FREE" }, { patient: req.user._id }],
				})
					.populate("doctor", "name")
					.populate("patient", "name")
					.sort({ datetime: 1 });
			} else if (req.user.role === "doctor") {
				appointments = await Appointment.find({
					doctor: req.user._id,
				})
					.populate("doctor", "name")
					.populate("patient", "name")
					.sort({ datetime: 1 });
			}
			console.log("PROSAOO BAJO", res);
			if (req.user.role === "patient") {
				appointments = appointments.map((apt) => {
					const aptObj = apt.toObject();
					if (
						aptObj.patient?._id.toString() !== req.user._id.toString() &&
						aptObj.status !== "APPROVED"
					) {
						aptObj.status = "FREE";
					}
					return aptObj;
				});
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
			const appointment = await Appointment.findOneAndUpdate(
				{
					_id: req.params.id,
					status: "FREE",
					datetime: {
						$nin: await Appointment.distinct("datetime", {
							status: "APPROVED",
						}),
					},
				},
				{
					$set: {
						patient: req.user._id,
						status: "PENDING",
					},
				},
				{ new: true }
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
