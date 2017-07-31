var mongoose = require('mongoose');

var foodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    createDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    ingredients: [{ type: Schema.Types.ObjectId, ref: 'Ingredient' }]
});

module.exports = mongoose.model('FoodItem', foodItemSchema);