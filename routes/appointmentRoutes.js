const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/AppointmentController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAllAppointments);
router.post('/:id/book', appointmentController.bookAppointment);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;