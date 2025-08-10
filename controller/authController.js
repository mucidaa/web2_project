const Usuario = require('../model/Usuario')

var jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {

    const {nome, username, email, senha, confirmaSenha} = req.body

    try {

        if (!nome || !username || !email || !senha || !confirmaSenha) {
            throw new Error('Todos os campos são obrigatórios');
        }
        
        if (senha !== confirmaSenha) {
            throw new Error('As senhas não coincidem');
        }

        const emailExistente = await Usuario.findOne({ email: email })
        const usernameExistente = await Usuario.findOne({ username: username})

        if (emailExistente) {
            throw new Error('Email existente');
        }

        if (usernameExistente) {
            throw new Error('Nome de usuário existente');
        }

    } catch (err) {
        return next(err);
    }

    const usuario = new Usuario({
        nome,
        username,
        email,
        senha
    })

    try {
        await usuario.save()
        
        const token = jwt.sign(
            {
                id: usuario._id,
                username: usuario.username,
            },
            'SENHA_SUPER_SECRETA',
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3600000,
        });

        return res.redirect('/dashboard');

    } catch (err) {
        return next(err);
    }

}

exports.login = async (req, res, next) => {

    const {username, senha} = req.body

    try {

        if (!username || !senha) {
            throw new Error('Todos os campos são obrigatórios');
        }

        const usuario = await Usuario.findOne({ username: username });

        if (!usuario) {
            throw new Error('Usuário não existe');
        }

        if (!senha == usuario.senha) {
            throw new Error('Senha incorreta!');
        }

        const token = jwt.sign(
            {
                id: usuario._id,
                username: usuario.username,
            },
            'SENHA_SUPER_SECRETA'
        );

        res.cookie('token', token, {
            maxAge: 3600000,
        });

        return res.redirect("/dashboard");

    } catch (err) {
        return next(err);
    }

}