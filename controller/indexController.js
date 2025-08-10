exports.index = (req, res) => {
    res.cookie('token', "");
    res.render("index", {title: "Titulo"})
};

