const mailHelper = require('../util/emil')
const User = require('../models/user');
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { validationResult } = require('express-validator/check')

exports.getLogin = (req, res, next) => {
    let message = req.flash('error')
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message.length > 0 ? message[0] : null,
        validationErrors: [{params: 'email'}, {params: 'password'}],
        oldInput: {email: '', password: ''}
    });
};

exports.postLogin = (req, res, next) => {
    const {email, password} = req.body;
    const errors = validationResult(req)

    if (!errors.isEmpty()){
        console.log(errors)
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {email, password},
            validationErrors: [{params: 'email'}, {params: 'password'}]
        })
    }

    User.findOne({email: email})
        .then(user => {
            if (!user){
                console.log("User not found...")
                req.flash('error', 'User not found.')
                return res.status(400).render('/auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    validationErrors: [{params: 'email'}, {params: 'password'}]
                })
            }

            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch){
                        console.log("Passwords match")
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect('/')
                        });
                    }

                    req.flash('error', 'Username or password incorrect.')
                    console.log("Login redirect")
                    res.redirect('/login')
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/')
                });
        })
        .catch(err => console.log(err))
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message.length > 0 ? message[0] : null,
        validationErrors: [{params: 'email'}, {params: 'password'}]
    });
};

exports.postSignup = (req, res, next) => {
    const {email, password, confirmPassword} = req.body;
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        console.log(errors)
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {email, password, confirmPassword: req.body.confirmPassword},
            validationErrors: errors.array()
        })
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            console.log(`Saving user with`)
            return User.create({
                email,
                password: hashedPassword,
                cart: {items: []}
            })
        })
        .then((result) => {
            res.redirect('/login',{
                oldInput: {email, password, confirmPassword},
            });
            const mailOptions = {
                from: 'ticha.mumaj@gmail.com',
                to: email,
                subject: 'Signup succeeded!',
                html: '<h1>You successfully signed up!</h1>'
            }
            mailHelper.sendEmail(mailOptions)
        })
        .catch(err => console.log(err))
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getReset = (req, res, next) => {
    let message = req.flash('error')
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message.length > 0 ? message[0] : null
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err){
            return res.redirect('/reset')
        }

        const token = buffer.toString('hex')
        User.findOne({email: req.body.email})
            .then(user => {
                if (!user){
                    req.flash('error', 'No account with email found!')
                    return res.redirect('/reset')
                }

                user.resetToken = token
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save()
            })
            .then(updatedUser => {
                const mailOptions = {
                    to: req.body.email,
                    from: 'ticha.mumaj@gmail.com',
                    subject: 'Password Reset',
                    html: `
                       <p>You requested a password reset</p>
                       <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                    `
                }
                mailHelper.sendEmail(mailOptions)
            })
            .catch(err => console.log(err))
    })
    let message = req.flash('error')
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message.length > 0 ? message[0] : null
    });
}

exports.getNewPassword = (req, res, next) => {
    const {token} = req.params
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message.length > 0 ? message[0] : null,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => console.log(err))
    let message = req.flash('error')

}

exports.postNewPassword = (req, res, next) => {
    const {password, userId, passwordToken} = req.body;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: {$gt: Date.now()},
        id: userId
    })
        .then(user => {
            resetUser = user
            bcrypt.hash(password, 12)
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined
            resetUser.resetTokenExpiration = undefined
            return resetUser.save()
        })
        .then(() => {
            res.redirect('/login')
        })
        .catch()

    let message = req.flash('error')
    res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message.length > 0 ? message[0] : null
    });
}


