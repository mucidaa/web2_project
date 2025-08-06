var express = require('express');
var router = express.Router();
var painelController = require('../controller/painelController.js')

router.get('/', painelController.redireciona);
router.get('/:username', painelController.painel);
router.post('/operacao', painelController.salvaOperacao)
router.get('/operacao/:id', painelController.deletaOperacao)

module.exports = router;
