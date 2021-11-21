const Product = require('../models/product')
const Order = require('../models/order')

exports.getProducts = (req, res) => {
    /*
    console.log(adminData.products)
    res.sendFile(path.join(rootDir, 'views', 'shop.html'))
     */
    Product.fetchAll().then(products => {
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
    Product.fetchAll().then((products) => {
        res.render('shop/index',
            {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
            })
    })
}

exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(cart => {
            console.log(cart)
            return cart.getProducts()
        }).then(cartProducts => {
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: cartProducts
            });
        }).catch(err => {
            console.log(err)
        })
};

exports.postCart = (req, res, next) => {
    const {productId} = req.body
    let fetchCart;
    let newQuantity = 1;
    req.user
       .getCart()
       .then(cart => {
           fetchCart = cart
           return cart.getProducts({where: {id: productId}})
    }).then(products => {
        let product;
        if (products.length > 0){
            product = products[0]
        }

        if (product){
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            return product
        }

        return Product.findByPk(productId);
    }).then((product) => {
        return fetchCart.addProduct(product, {through: {quantity: newQuantity}})
    }).then(() => {
        res.redirect('/cart')
    })
   .catch(err => console.log(err))
};

exports.postCartDeleteProduct = (req, res, next) => {
    const {productId} = req.body
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts({where: {id: productId}})
        })
        .then(products => {
            const product = products[0]
            return product.cartItem.destroy()
        })
        .catch(err => {
            console.log(err)
        })

    res.redirect('/cart')
};

exports.postOrder = (req, res, next) => {
    let orderProducts;
    let fetchCart;
    req.user
        .getCart()
        .then(cart => {
            fetchCart = cart;
            return cart.getProducts()
        })
        .then(products => {
            orderProducts = products;
            return req.user.createOrder()
        })
        .then(order => {
            return order.addProducts(orderProducts.map(product => {
                product.orderItem = {quantity: product.cartItem.quantity}
                return product
            }))
        })
        .then(result => {
            return fetchCart.setProducts(null)

        })
        .then(() => {
            res.redirect('/orders')
        })

        .catch()

}

exports.getOrders = (req, res, next) => {
    console.log("Getting orders...")
    req.user
        .getOrders({include: ['products']})
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            })
        })
        .catch(err => {
            console.log(err)
        })
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



