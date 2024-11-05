// Package imports
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'please provide a username'],
        match: [/[a-zA-Z0-9-_]/, 'please provide a valid username'],
        maxlength: 20,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'please provide a password'],
        minlength: 8,
    }
});

UserSchema.pre('save', async function() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}

UserSchema.methods.createJwt = function () {
    return jwt.sign(
        {userId: this._id, username: this.username},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY + 'd',
        },
    );
}

module.exports = mongoose.model('User', UserSchema);