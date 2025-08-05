const mongoose = require('mongoose')

const Operacao = mongoose.model('Operacao', {
    usernameUsuario: String,
    tipoOperacao: String,
    categoria: String,
    valor: Number,
    dataCadastro : {
        type: Date,
        default: Date.now()
    }
});

module.exports = Operacao;