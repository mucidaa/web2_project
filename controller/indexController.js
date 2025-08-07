exports.index = (req, res) => {
    res.render("index", {title: "Titulo"})
}

exports.home = (req, res) => {
    res.render("home", {title: "Titulo"})
}