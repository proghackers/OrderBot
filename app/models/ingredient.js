var mongoose = require('mongoose');

var ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Ingredient', ingredientSchema);