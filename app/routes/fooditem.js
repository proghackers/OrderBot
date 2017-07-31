var FoodItem = require('../models/fooditem');
var express = require('express');

var router = express.Router();

router.route('/')
    .get(function(req, res) {
        FoodItem.find({}, function(err, foodItems) {
            if (err) {
                res.send(err);
            } else {
                res.json(foodItems);
            }
        });
    });
module.exports = router;