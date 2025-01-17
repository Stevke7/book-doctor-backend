const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

router.use(auth);

router.post("/", roleCheck("doctor"), appointmentController.createAppointment);
router.patch(
	"/:id/status",
	roleCheck("doctor"),
	appointmentController.updateAppointmentStatus
);

router.post(
	"/:id/book",
	roleCheck("patient"),
	appointmentController.bookAppointment
);

router.get("/", appointmentController.getAllAppointments);

module.exports = router;
