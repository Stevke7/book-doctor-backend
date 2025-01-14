const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const eventController = require("../controllers/eventController");

router.post("/", roleCheck("patient") eventController.bookEvent);
router.patch(
	"/:id/status",
	roleCheck("doctor"),
	eventController.updateEventStatus
);
router.get('/', eventController.getAllEvents)

module.exports = router;