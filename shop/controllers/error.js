

exports.get404 = (req, res) => {
    // res.status(404).sendFile((path.join(__dirname, 'views', '404.html')))
    res.render('404', {
        pageTitle: 'Page Not Found',
        path: '/404',
        isAuthenticated: req.session.isLoggedIn
    });
}


exports.get500 = (req, res) => {
    // res.status(404).sendFile((path.join(__dirname, 'views', '404.html')))
    res.render('500', {
        pageTitle: 'Internal server error',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
}
