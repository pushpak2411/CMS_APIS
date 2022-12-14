const mongoose = require('mongoose');
const wishListSchema = new mongoose.Schema(
    {
        userID: String,
        productID: String
    }
)
module.exports = mongoose.model('wishlists', wishListSchema);