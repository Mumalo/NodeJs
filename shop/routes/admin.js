const express = require('express')
const adminController = require('../controllers/admin')
const isAuth = require('../middleware/is-auth')
const {body, check} = require('express-validator')

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct)

router.get('/products', isAuth, adminController.getProducts)

router.post(
    '/add-product',
    [
        body('title', 'Invalid title')
            .isAlphanumeric()
            .isLength({min: 3})
            .trim(),
        body('imageUrl')
            .isAlphanumeric()
            .isLength({min: 3})
            .trim(),
        body('price')
            .isFloat(),
        body('imageUrl')
            .isLength({min: 8, max: 400})
            .trim(),
    ],
    isAuth,
    adminController.postAddProduct)

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)

router.post(
    '/edit-product', [
        body('title', 'Invalid title')
            .isString()
            .isLength({min: 3})
            .trim(),
        body('imageUrl')
            .isString()
            .isLength({min: 3})
            .trim(),
        body('price')
            .isFloat(),
        body('imageUrl')
            .isLength({min: 8, max: 400})
            .trim(),
    ],
    isAuth,
    adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct)

module.exports = router;
