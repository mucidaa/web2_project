exports.index = (req, res) => {
    res.cookie('token', "");
    res.render("index", {title: "MC Finanças"})
};

