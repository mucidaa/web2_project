const Usuario = require('../model/Usuario')

var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {

    const {nome, email, senha, confirmaSenha} = req.body

    try {

        if (!nome || !email || !senha || !confirmaSenha) {
            throw new Error('Todos os campos são obrigatórios');
        }
        
        if (senha !== confirmaSenha) {
            throw new Error('As senhas não coincidem');
        }

        const usuarioExistente = await Usuario.findOne({ email: email })

        if (usuarioExistente) {
            throw new Error('Usuário já existente, use outro email')
        }

    } catch (err) {
        return next(err);
    }

    const salt = await bcrypt.genSalt(12)
    const senhaHash = await bcrypt.hash(senha, salt)

    const usuario = new Usuario({
        nome,
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

    const {email, senha} = req.body

    try {

        if (!email || !senha) {
            throw new Error('Todos os campos são obrigatórios');
        }

        const usuario = await Usuario.findOne({ email: email });

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
                email: usuario.email,
            },
            'SENHA_SUPER_SECRETA'
        );
        return res.status(200).json({ msg: 'logou', token: token });

    } catch (err) {
        return next(err);
    }

}