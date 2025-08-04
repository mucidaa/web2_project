var express = require('express');
var router = express.Router();
var receitasController = require('../controller/receitasController')

const checkToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    try {
        if (!token) {
            throw new Error('Acesso negado');
        }
    } catch (err) {
        return next(err);
    }
    next();
};

router.get('/', checkToken, receitasController.consultaReceitas)

module.exports = router