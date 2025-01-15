const Appointment = require("../models/Appointment");

const appointmentController = {
	/*CREATE A FREE APPOINTMENT JUST FOR DOCTOR */
	createAppointment: async (req, res) => {
		try {
			if (req.user.role !== "doctor") {
				return res.status(403).json({ message: "Not authorized" });
			}

			const appointment = new Appointment({
				datetime: new Date(req.body.datetime),
				status: "FREE",
				doctor: req.user._id,
				events: [],
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
					$or: [{ status: "FREE" }, { "events.patient": req.user._id }],
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
					.populate({
						path: "events.patient",
						select: "name",
					})
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
				status: "FREE",
			});

			if (!appointment) {
				return res
					.status(400)
					.json({ message: "This time slot is no longer available" });
			}

			const isAlreadyBooked = appointment.events.some(
				(event) => event.patient.toString() === req.user._id.toString()
			);

			if (isAlreadyBooked) {
				return res
					.status(400)
					.json({ message: "You have already booked this appointment" });
			}

			const newEvent = {
				patient: req.user._id,
				status: "PENDING",
			};

			appointment.events.push(newEvent);

			await appointment.save();

			res.json({
				message: "Appointment booked successfully",
				appointment,
			});
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
			const { status, eventId } = req.body;
			const appointment = await Appointment.findById(req.params.id);

			console.log("APPOINTMENT", appointment, eventId);

			if (!appointment) {
				return res.status(403).json({ message: "Appointment Not Found" });
			}

			const event = appointment.events.id(eventId);

			if (!event) {
				return res.status(404).json({ message: "Event not found" });
			}

			if (status === "APPROVED") {
				appointment.status = "BOOKED";
				await Appointment.updateMany(
					{
						datetime: appointment.datetime,
						"events.status": "PENDING",
					},
					{
						$set: { "events.$[pendingEvent].status": "REJECTED" },
					},
					{
						arrayFilters: [
							{
								"pendingEvent._id": { $ne: eventId },
								"pendingEvent.status": "PENDING",
							},
						],
					}
				);
			} else {
				appointment.status = "FREE";
			}

			event.status = status;
			await appointment.save();

			res.json(appointment);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},
};

module.exports = appointmentController;
