var mongoose = require('mongoose');

var restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    createDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    menu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }]
});

module.exports = mongoose.model('Restaurant', restaurantSchema);