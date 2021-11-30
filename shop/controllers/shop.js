const Product = require('../models/product')
const Order = require('../models/order')
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res) => {
    Product.find()
        .then(products => {
        res.render('shop/product-list',
            {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                isAuthenticated: req.session.isLoggedIn,
            })
    }).catch(err => {
        console.log(err)
    })
}

exports.getIndex = (req, res, next) => {
    const page  = +req.query.page || 1

    let totalItems;

    Product
        .find()
        .countDocuments()
        .then(numberProducts => {
            totalItems = numberProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/index',
                {
                    prods: products,
                    pageTitle: 'Shop',
                    path: '/',
                    currentPage: +page,
                    totalProducts: totalItems,
                    hasNextPage: totalItems > ITEMS_PER_PAGE * page,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            next(err)
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
                products: products,
                isAuthenticated: req.session.isLoggedIn
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
                orders: orders,
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
                    email: req.user.email,
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
        pageTitle: 'Checkout',
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.getProduct = (req, res, next) => {
    const {productId} = req.params
    Product.findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product,
                pageTitle: product.title,
                path: '/products',
                isAuthenticated: req.session.isLoggedIn
            })
        })
};

exports.getInvoice = (req, res, next) => {
    const { orderId } = req.params;
    Order.findOne({id: orderId})
        .then(order => {
            console.log(order)
            if (!order){
                return next(new Error('No order found'));
            }

            if (order.user.userId.toString() === req.user._id.toString()){
                return new Error('Unauthorized')
            }

            return order
        })
        .then(order => {
            const invoiceName = 'Invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);

            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(fs.createWriteStream(invoicePath));

            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            });

            pdfDoc
                .fontSize(14)
                .text('_______________________')
            let totalPrice = 0;
            order.products.forEach(prod => {
                pdfDoc.text(prod.product.title + '-' + prod.quantity + 'x' + '$' + prod.product.price);
                totalPrice += prod.quantity + prod.product.price;
            })

            pdfDoc.text('Total Price $' + totalPrice)

            pdfDoc.end()
            pdfDoc.pipe(res);
        })
        .catch(err => {
            next(err)
        })

    /*
    fs.readFile(invoicePath, (err, data) => {
        if (err){
            return next(err)
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; file="' + invoiceName + '"'); //how content is served
        res.send(data);
    });

    const fileReadStream = fs.createReadStream(invoicePath)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; file="' + invoiceName + '"');
     */
};



