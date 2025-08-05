const jwt = require('jsonwebtoken');
const Operacao = require('../model/Operacao');

exports.redireciona = (req, res) => {

    username = getUsername(req)

    res.redirect("/dashboard/"+ username)
}

exports.painel = async (req, res, next) => {

    const usernameByToken = getUsername(req)
    const username = req.params.username

    try {
        if (username !== usernameByToken) {
            throw new Error("Você está tentando logar em um painel que não é o seu")
        }
    } catch (err) {
        return next(err)
    }

    const operacoes = await Operacao.find({ usernameUsuario : username});

    console.log(username)
    res.status(200).json({ operacoes })

}

exports.salvaOperacao = async(req, res, next) => {

    const { tipoOperacao, categoria, valor} = req.body;
    const usernameUsuario = getUsername(req)

    try {
        if (!tipoOperacao || !valor || !categoria) {
            throw new Error('Todos os campos são obrigatórios');
        }

        const operacao = new Operacao({
            usernameUsuario,
            tipoOperacao,
            categoria,
            valor
        })

        await operacao.save();
        return res.status(200).json({ msg: 'deu certo' });

    } catch (err) {
        return next(err);
    }

}

const getUsername = (req) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    const payload = jwt.decode(token);

    return (username = payload.username);

}