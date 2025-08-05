const Usuario = require('../model/Usuario')

var bcrypt = require('bcrypt');
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

    const salt = await bcrypt.genSalt(12)
    const senhaHash = await bcrypt.hash(senha, salt)

    const usuario = new Usuario({
        nome,
        username,
        email,
        senha: senhaHash
    })

    try {
        await usuario.save()
        return res.status(200).json({ msg : "deu certo"})

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

        const comparaSenhas = await bcrypt.compare(senha, usuario.senha)

        if (!comparaSenhas) {
            throw new Error('Senha incorreta!');
        }

        const token = jwt.sign(
            {
                id: usuario._id,
                username: usuario.username,
            },
            'SENHA_SUPER_SECRETA'
        );
        return res.status(200).json({ msg: 'logou', token: token });

    } catch (err) {
        return next(err);
    }

}