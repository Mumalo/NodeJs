const Product = require('../models/product')
const Order = require('../models/order')

exports.getProducts = (req, res) => {
    Product.find()
        .then(products => {
        res.render('shop/product-list',
            {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
            })
    }).catch(err => {
        console.log(err)
    })
}

exports.getIndex = (req, res, next) => {
    Product.find()
        .then((products) => {
        res.render('shop/index',
            {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
            })
    })
}

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
            });
        })
        .catch(err => {
            console.log(err)
        })
};

exports.postCart = (req, res, next) => {
    const {productId} = req.body
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(updateResult => {
            console.log(updateResult)
            res.redirect('/cart')
        })
        .catch(err => console.log(err))
};


exports.postCartDeleteProduct = (req, res, next) => {
    const {productId} = req.body
    req.user
        .removeFromCart(productId)
        .then(() => {
            res.redirect('/cart')
        })
        .catch(err => {
            console.log(err)
        })
};


exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            })
        })
        .catch(err => console.log(err))
}


exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(item => {
                return {quantity: item.quantity, product: {...item.productId._doc}}
            })
            return Order.create({
                user: {
                    name: req.user.name,
                    userId: req.user._id
                },
                products: products
            })

        })
        .then(() => {
            return req.user.clearCart()
        })
        .then(() => {
            res.redirect('/orders')
        })
        .catch(err => console.log(err))
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    })
}

exports.getProduct = (req, res, next) => {
    const {productId} = req.params
    Product.findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product,
                pageTitle: product.title,
                path: '/products'
            })
        })
};



