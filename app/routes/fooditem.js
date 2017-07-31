var FoodItem = require('../models/fooditem');
var express = require('express');

var router = express.Router();

// ==============================================================
router.route('/')
    .post(function(req, res) {})
    .get(function(req, res) {});

router.route('/:geodata_id')
    .get(function(req, res) {});

module.exports = router;