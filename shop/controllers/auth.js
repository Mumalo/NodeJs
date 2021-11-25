const User = require('../models/user')

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.postLogin = (req, res, next) => {
    User.findById('619c2340f98f670b35743ea6')
        .then(user => {
            req.session.user = user;
            req.session.isLoggedIn = true
            return req.session.save() //be sure if the session has been created
        })
        .then(() => {
            res.redirect('/')
        })
        .catch(err => console.log(err))
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) console.log(err)
        res.redirect('/')
    })
}

