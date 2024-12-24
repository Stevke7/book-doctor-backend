const express = require("express");
const router = express.Router();
const usrerController = require("../controllers/userController");
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me", auth,  userController.getCurrentUser);

module.exports = router