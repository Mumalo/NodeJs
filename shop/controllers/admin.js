const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product',
        {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false
        });
};

exports.postAddProduct = (req, res) => {
    const {title, imageUrl, price, description} = req.body
    const product = new Product({
        title,
        imageUrl,
        price,
        description,
        userId: req.user //picks id from the object. You can use req.user._id
    });
    product
        .save()
        .then(result => {
            res.redirect('/admin/products')
        }).catch(err => console.log(err))
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if (!editMode) {
        res.redirect('/')
    }
    const {productId} = req.params
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.redirect('/')
            }

            res.render('admin/edit-product',
                {
                    pageTitle: 'Edit Product',
                    path: '/admin/edit-product',
                    editing: editMode,
                    product
                });
        })
}

exports.postEditProduct = (req, res, next) => {
    const {productId, title, price, imageUrl, description} = req.body
    const product = new Product({
        title,
        price,
        description,
        imageUrl,
        productId
    });

    Product.findById(productId).then((product) => {
        product.title = title
        product.price = price
        product.description = description
        product.imageUrl = imageUrl
        return product.save()
    }).then(() => {
        console.log("Updated Product")
        res.redirect('/admin/products')
    })
}

exports.getProducts = (req, res, next) => {
    Product.find()
        //.populate('userId') //You can point at nested paths
        .then((products) => {
            res.render('admin/products',
                {
                    prods: products,
                    pageTitle: 'Admin Products',
                    path: '/admin/products',
                })
        }).catch(err => {console.log(err)})
}

exports.postDeleteProduct = (req, res, next) => {
    const {productId} = req.body
    Product
        .findByIdAndRemove(productId)
        .then(() => {
            res.redirect('/')
        }).catch(err => {
            console.log(err)
            console.log(res.redirect('/'))
    });

}
