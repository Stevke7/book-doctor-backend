const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Prvo definiraj schema
const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['doctor', 'patient'],
        required: true,
    }
}, {
    timestamps: true,
});

//Hashing passwords
userSchema.pre('save', async function (next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

//Check if passwords are correct
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Zatim kreiraj model
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;