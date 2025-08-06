const mongoose = require('mongoose')

const Usuario = mongoose.model('Usuario', {
    nome: String,
    username: String,
    email: String,
    senha: String,
    dataCriacao : {
        type: Date,
        default: Date.now()
    }
});

module.exports = Usuario;