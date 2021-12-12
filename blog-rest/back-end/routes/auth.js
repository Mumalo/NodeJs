const express = require('express');
const {check, body} = require('express-validator')
const authController = require('../controllers/auth');
const User = require('../models/user');
const isAuth = require('../middleware/auth/is-auth');

const router = express.Router();

router.put('/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom((val, {req}) => {
                return User.findOne({email: val})
                    .then(userDoc => {
                        if (userDoc){
                            return Promise.reject('E-mail aaddress already exists')
                        }
                    })
            })
            .normalizeEmail(),
        body('password')
            .trim()
            .not()
            .isEmpty()
    ],
    authController.signUp
)

router.post('/login', authController.login)

router.patch('/user/:userId',
    isAuth, [
        body('status')
            .trim()
            .not()
            .isEmpty()
    ],
    authController.updateUserStatus
)

router.patch('/status', isAuth, authController.updateUserStatus)

router.get('/status', isAuth, authController.getUserStatus)


module.exports = router;
