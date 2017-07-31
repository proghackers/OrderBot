var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    votes: [{
        food_item: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
        count: { type: Number }
    }]
});

module.exports = mongoose.model('Order', orderSchema);