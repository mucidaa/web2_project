var express = require('express');
var router = express.Router();
var receitasController = require('../controller/receitasController')

router.get('/', receitasController.consultaReceitas)

module.exports = router