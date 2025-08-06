const jwt = require('jsonwebtoken');
const Operacao = require('../model/Operacao');
const Usuario = require('../model/Usuario')

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

    const operacoes = await getOperacoes(username);
    const nomesCategorias = await getCategorias(username);

    const categorias = {};

    for (const categoria of nomesCategorias) {
        categorias[categoria] = await getOperacoesByCategoria(username, categoria);
    }

    const mes = await getOperacoesMesAtual(username);

    const usuario = await getUsuarioAtual(username);

    contexto = {
        usuario,
        operacoes,
        categorias,
        mes
    }
    return res.render("painel", contexto);

}

exports.salvaOperacao = async(req, res, next) => {

    const { tipoOperacao, dataOperacao, categoria, valor } = req.body;
    const usernameUsuario = getUsername(req)

    try {
        if (!tipoOperacao || !valor || !categoria || !dataOperacao) {
            throw new Error('Todos os campos são obrigatórios');
        }

        const operacao = new Operacao({
            usernameUsuario,
            tipoOperacao,
            dataOperacao: new Date(dataOperacao),
            categoria,
            valor,
        });

        await operacao.save();
        return res.status(200).json({ msg: 'deu certo' });

    } catch (err) {
        return next(err);
    }

}

const getUsername = (req) => {

    const token = req.cookies.token

    const payload = jwt.decode(token);

    return (username = payload.username);

}

const getOperacoes = async (username) => {

    return await Operacao.find({ usernameUsuario : username})

}

const getOperacoesMesAtual = async (username) => {

    const hoje = new Date();

    const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    console.log('Username:', username);
    console.log('Primeiro dia do mês:', primeiroDiaDoMes.toISOString());

    const resultado = await Operacao.find({
        usernameUsuario : username,
        dataOperacao : { $gte: primeiroDiaDoMes }
    })

    console.log('Operações encontradas:', resultado.length);

    return resultado
}

const getCategorias = async (username) => {
    return await Operacao.distinct("categoria", { usernameUsuario : username })
}

const getOperacoesByCategoria = async (username, categoria) => {

    return await Operacao.find({
        usernameUsuario: username,
        categoria: categoria
    })

}

const getUsuarioAtual = async (username) => {

    return await Usuario.findOne({ username : username})

}