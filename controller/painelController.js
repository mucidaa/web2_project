const jwt = require('jsonwebtoken');
const Operacao = require('../model/Operacao');
const Usuario = require('../model/Usuario');

exports.redireciona = (req, res) => {
    username = getUsername(req);

    res.redirect('/dashboard/' + username);
};

exports.painel = async (req, res, next) => {
    const usernameByToken = getUsername(req);
    const username = req.params.username;

    try {
        if (username !== usernameByToken) {
            throw new Error(
                'Você está tentando logar em um painel que não é o seu'
            );
        }
    } catch (err) {
        return next(err);
    }

    const operacoes = await getOperacoes(username);
    const nomesCategorias = await getCategorias(username);

    const categorias = {};

    for (const categoria of nomesCategorias) {
        categorias[categoria] = await getOperacoesByCategoria(
            username,
            categoria
        );
    }

    const operacoesFormatadas = operacoes.map((op) => {
        return {
            ...op.toObject(),
            dataOperacao: new Date(op.dataOperacao).toLocaleDateString('pt-BR'),
            valor: (op.valor / 100).toFixed(2).replace('.', ','),
        };
    });

    const mes = await getOperacoesMesAtual(username);

    const usuario = await getUsuarioAtual(username);

    contexto = {
        usuario,
        operacoes: operacoesFormatadas,
        categorias,
        mes,
    };
    
    return res.render('painel', contexto);
};

exports.salvaOperacao = async (req, res, next) => {
    const { tipoOperacao, descricao, dataOperacao, categoria, valor } =
        req.body;
    const usernameUsuario = getUsername(req);

    try {
        if (
            !tipoOperacao ||
            !descricao ||
            !valor ||
            !categoria ||
            !dataOperacao
        ) {
            throw new Error('Todos os campos são obrigatórios');
        }

        let valorFloat = valor.toString().replace(',', '.');
        valorFloat = parseFloat(valorFloat);
        const valorCentavos = Math.round(valorFloat * 100);

        if (isNaN(valorFloat)) {
            throw new Error('Valor inválido');
        }

        let dataCorrigidaComFuso = new Date(dataOperacao);
        dataCorrigidaComFuso.setHours(dataCorrigidaComFuso.getHours() + 3);

        const operacao = new Operacao({
            usernameUsuario,
            tipoOperacao,
            descricao,
            dataOperacao: dataCorrigidaComFuso,
            categoria,
            valor: valorCentavos,
        });

        await operacao.save();
        return res.redirect('/dashboard');
    } catch (err) {
        return next(err);
    }
};

exports.deletaOperacao = async (req, res, next) => {
    const { id } = req.params;
    const usernameUsuario = getUsername(req);

    try {
        const operacao = await Operacao.findOneAndDelete({
            _id: id,
            usernameUsuario,
        });

        if (!operacao) {
            throw new Error(
                'Operação não encontrada ou não pertence a este usuário'
            );
        }

        return res.redirect('/dashboard');
    } catch (err) {
        return next(err);
    }
};

const getUsername = (req) => {
    const token = req.cookies.token;

    const payload = jwt.decode(token);

    return (username = payload.username);
};

const getOperacoes = async (username) => {
    return await Operacao.find({ usernameUsuario: username });
};

const getOperacoesMesAtual = async (username) => {
    const hoje = new Date();

    const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    console.log('Username:', username);
    console.log('Primeiro dia do mês:', primeiroDiaDoMes.toISOString());

    const resultado = await Operacao.find({
        usernameUsuario: username,
        dataOperacao: { $gte: primeiroDiaDoMes },
    });

    console.log('Operações encontradas:', resultado.length);

    return resultado;
};

const getCategorias = async (username) => {
    return await Operacao.distinct('categoria', { usernameUsuario: username });
};

const getOperacoesByCategoria = async (username, categoria) => {
    return await Operacao.find({
        usernameUsuario: username,
        categoria: categoria,
    });
};

const getUsuarioAtual = async (username) => {
    return await Usuario.findOne({ username: username });
};
