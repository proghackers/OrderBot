var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    facebook_id: {
        type: Number,
        required: true
    },
    createDate: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);