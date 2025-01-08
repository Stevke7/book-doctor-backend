const Appointment = require("../models/Appointment");

const appointmentController = {
    //Create appointment but only for doctors
    createAppointment: async (req, res) => {
        try {
            if(req.user.role !== 'doctor') {
                return res.status(403).json({message: 'Not authorized'});
            }

            const appointment = new Appointment({
                datetime: new Date(req.body.datetime),
                doctor: req.user._id
            });

            await appointment.save();
            res.status(201).json(appointment);
        } catch (error) {
            res.status(400).json({error: error.message});
        }
    },

    /*GET ALL APPOINTMENTS*/
    getAllAppointments: async (req, res) => {
        try {
            let appointments;
            if(req.user.role === 'doctor') {
                appointments = await Appointment.find()
                    .populate('patient', 'name email')
                    .populate('doctor', 'name email');
            } else {
                appointments = await Appointment.find({
                    $or: [
                        {status: 'FREE'},
                        {patient: req.user._id},
                    ]
                }).populate('doctor', 'name email');
            }
            res.json(appointments);
        } catch(error) {
            res.status(500).json({message: error.message});
        }

    },

    /** BOOK APPOINTMENT */
    bookAppointment: async (req, res) => {
        try{
            if(req.user.role !== 'patient') {
                return res.status(403).json({message: 'Not authorized'});
            }

            const appointment = await Appointment.findById(req.params.id);

            if(!appointment) {
                return res.status(403).json({message: 'Appointment Not found'});
            }
            if(appointment.status !== 'FREE'){
                return res.status(400).json({message: 'Appointment Not Available'});
            }

            appointment.patient = req.user._id;
            appointment.status = 'PENDING';
            await appointment.save();

            res.json(appointment);
        } catch(error) {
            res.status(400).json({error: error.message});
        }
    },

    /** CHANGE THE STATUS OF APPOINTMENT */
    updateAppointmentStatus: async (req, res) => {
        try {
            if(req.user.role !== 'doctor') {
                return res.status(403).json({message: 'Not authorized'});
            }
            const {status} = req.body;
            const appointment = await Appointment.findById(req.params.id);

            if(!appointment) {
                return res.status(403).json({message: 'Appointment Not Found'});
            }
            if (status === 'APPROVED') {
                await Appointment.updateMany(
                    {
                        _id: { $ne: appointment._id},
                        datetime: appointment.datetime,
                        status: "PENDING"
                    },
                    {status: 'REJECTED'}
                );
            }

            appointment.status = status;
            await appointment.save();

            res.json(appointment);
        } catch (error) {
            res.status(400).json({error: error.message});
        }
    }
}

module.exports = appointmentController;