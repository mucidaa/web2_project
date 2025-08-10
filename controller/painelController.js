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
            throw new Error('Você está tentando logar em um painel que não é o seu');
        }
    } catch (err) {
        return next(err);
    }

    const operacoes = await getOperacoes(username);

    const operacoesFormatadas = operacoes.map((op) => {
        return {
            ...op.toObject(),
            dataOperacao: new Date(op.dataOperacao).toLocaleDateString('pt-BR'),
            valor: (op.valor / 100).toFixed(2).replace('.', ','),
        };
    });

    const usuario = await getUsuarioAtual(username);
    const receita = await getReceita(username);
    const despesa = await getDespesa(username);
    const saldo = await receita-despesa;
    const categorias = await getCategoriasDetalhadas(username)
    console.log(categorias)
    contexto = {
        title: "MC Finanças",
        usuario,
        operacoes: operacoesFormatadas,
        categorias,
        receita: (receita / 100).toFixed(2).replace('.', ','),
        despesa: (despesa / 100).toFixed(2).replace('.', ','),
        saldo: (saldo / 100).toFixed(2).replace('.', ',')
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
    return await Operacao.find({ usernameUsuario: username }).sort({dataOperacao: -1});
};

const getCategoriasSaida = async (username) => {
    return await Operacao.distinct('categoria', { usernameUsuario: username, tipoOperacao: "Saída" });
};

const getOperacoesSaidaByCategoria = async (username, categoria) => {
    return await Operacao.find({
        usernameUsuario: username,
        categoria: categoria,
        tipoOperacao: 'Saída',
    }).sort({ dataOperacao: -1 });
};

const getUsuarioAtual = async (username) => {
    return await Usuario.findOne({ username: username });
};

const getReceita = async(username) => {
    const opsEntrada = await Operacao.find({
        usernameUsuario: username,
        tipoOperacao: "Entrada"
    });

    return opsEntrada.reduce((soma, op) => {return soma + op.valor}, 0)
}

const getDespesa = async(username) => {
    const opsEntrada = await Operacao.find({
        usernameUsuario: username,
        tipoOperacao: "Saída"
    });

    return opsEntrada.reduce((soma, op) => {return soma + op.valor}, 0)
}

const getCategoriasDetalhadas = async(username) => {

    let categoriasDetalhadas = []
    
    const nomesCategorias = await getCategoriasSaida(username)
    console.log(nomesCategorias)

    const total = await getDespesa(username)

    for (nome of nomesCategorias) {

        categoriasDetalhadas.push({
            nome: nome,
            valor: (await getTotalCategoria(username, nome)/100).toFixed(2).replace(".",","),
            porcentagem: (await getTotalCategoria(username, nome)/total*100).toFixed(2)
        })
    }

    return categoriasDetalhadas
}

const getTotalCategoria = async (username, categoria) => {
    const operacoes = await getOperacoesSaidaByCategoria(username, categoria)
    return operacoes.reduce((soma, op) => {return soma + op.valor}, 0)
}

