var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    votes: [{
        food_item: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
        count: { type: Number }
    }]
});

module.exports = mongoose.model('Order', orderSchema);