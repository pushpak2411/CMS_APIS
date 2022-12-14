const { string } = require('joi');
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    address: String,
    mobile:Number,
    status:Number,
    token: {
        type: String,
        default:''
    }

});

module.exports = {
   Admin: mongoose.model('admins', adminSchema)
}