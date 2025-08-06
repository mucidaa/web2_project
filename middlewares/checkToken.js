const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const token = req.cookies.token

    try {
        if (!token) {
            throw new Error('Acesso negado');
        }
    } catch (err) {
        return next(err);
    }

    try {
        
        jwt.verify(token, 'SENHA_SUPER_SECRETA');
        return next()

    } catch (err) {
        return next(err);
    }
};
