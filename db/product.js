const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
    {
        adminID: String,
        productName: String,
        productPrice: String,
        productDescription: String,
    }
)

module.exports = mongoose.model('products', productSchema);