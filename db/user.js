const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
        fullname: String,
        email: {
            type: String,
            required: [true, "User must have an email."],
            unique: true,
            lowercase: true,
        },
        password: String,
        address: String,
        mobile: Number,
        status: Number,
        role: Number

    }
)
module.exports = mongoose.model('users', userSchema);