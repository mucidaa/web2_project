exports.index = (req, res) => {
    res.render("index", {title: "Titulo"})
};

//exports.home = (req, res) => {
//    res.render("home", {title: "Titulo"})
//};

exports.recursos = (req, res) => {
    res.render("recursos", {title: "Titulo"})
};

exports.dados = (req, res) => {
    res.render("dados", {title: "Titulo"})
};