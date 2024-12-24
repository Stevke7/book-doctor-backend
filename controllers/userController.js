const User = require("../models/user");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
    return jwt.sign({userId: userId}, process.env.JWT_SECRET, {expiresIn: "24h"});
};

const userController = {
    //Register new user
    register: async (req, res) => {
        try {
            const { email, password, name, role } = req.body;

            const existingUser = await User.findOne({email});
            if (existingUser) {
                return res.status(400).json({message: `User already exists`});
            }

            const user = new User({
                email,
                password,
                name,
                role,
            });
            await user.save();

            const token = generateToken(user._id);
            res.status(201).json({user: {
                id: user._id, email: user.email, name: user.name, role: user.role

                }, token
            });
        } catch (error) {
            res.status(400).json({message: error.message});
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({email});
            if (!user) {return res.status(401).json({message: `Invalid email or password`});}

            const token = generateToken(user._id);

            //Todo check why this console log is not logged??
            console.log(`user logged in ${user.email}`);


            res.json({user: {
                id: user._id, email: user.email, name: user.name, role: user.role
                }, token});

        } catch (error) {
            res.status(400).json({message: error.message});
        }
    },

    getCurrentUser: async (req, res) => {
        try {
            res.json({user: {
                id: req.user._id, email: req.user.email, name: req.user.name, role: req.user.role
                }});
        } catch (error) {
            res.status(400).json({message: error.message});
        }
    }
}

module.exports = userController;