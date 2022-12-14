const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
    {
        userID: String,
        productID: String,
        quantity: Number,
        Price: Number,
        deliveryAddress: String
    }
)
module.exports = mongoose.model('orders', orderSchema);