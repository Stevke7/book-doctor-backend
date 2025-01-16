const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (user) => {
	return jwt.sign(
		{
			userId: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
		},
		process.env.JWT_SECRET,
		{ expiresIn: "1h" }
	);
};

const userController = {
	register: async (req, res) => {
		try {
			const { email, password, name, role } = req.body;

			const existingUser = await User.findOne({ email }).exec();
			if (existingUser) {
				return res.status(400).json({ message: `User already exists` });
			}

			const user = new User({
				email,
				password,
				name,
				role,
			});
			await user.save();

			const token = generateToken(user);
			res.status(201).json({
				user: {
					id: user._id,
					email: user.email,
					name: user.name,
					role: user.role,
				},
				token,
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	login: async (req, res) => {
		try {
			const { email, password } = req.body;

			const user = await User.findOne({ email }).exec();
			if (!user) {
				return res.status(401).json({ message: `Invalid email or password` });
			}
			const checkPassword = await user.comparePassword(password);
			if (!checkPassword) {
				return res.status(401).json({ message: `Invalid password or email` });
			}

			const token = generateToken(user);

			res.json({
				user: {
					id: user._id,
					email: user.email,
					name: user.name,
					role: user.role,
				},
				token,
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	getCurrentUser: async (req, res) => {
		try {
			res.json({
				user: {
					id: req.user._id,
					email: req.user.email,
					name: req.user.name,
					role: req.user.role,
				},
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},
};

module.exports = userController;
