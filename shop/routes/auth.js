const express = require('express')
const router = express.Router();
const {check, body} = require('express-validator')
const User = require('../models/user')

const authController = require('../controllers/auth')

router.get('/login', authController.getLogin)

router.post(
    '/login', [
        body(
            'password',
            'Please enter an alphanumeric password greater than 5 characters')
            .isLength({min: 5})
            .isAlphanumeric(),
        body(
            'email',
            'Please input a valid email')
            .isEmail()
    ],
    authController.postLogin
)

router.post('/logout', authController.postLogout)

router.get('/signup', authController.getSignup);

router.post(
    '/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail() //sanitizers
            .custom((value, {req}) => {
                User.findOne({email: value})
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject(
                                'E-Mail exists already, please pick a different one'
                            )
                        }
                        return true
                    });
            }),
        body(
            'password',
            'Please enter a password with only numbers and text and at least 5 characters')
            .isLength({min: 5})
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .custom((value, {req}) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match');
                }
                return true;
            })
            .trim()
    ],

    authController.postSignup
);

router.get('/reset', authController.getReset);

router.get('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.get('/reset/new-password', authController.postNewPassword);

module.exports = router
