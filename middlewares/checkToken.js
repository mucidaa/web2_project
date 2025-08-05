const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    try {
        if (!token) {
            throw new Error('Acesso negado');
        }
    } catch (err) {
        return next(err);
    }

    try {
        
        jwt.verify(token, 'SENHA_SUPER_SECRETA');
        console.log(jwt.decode(token))
        return next()

    } catch (err) {
        return next(err);
    }
};
