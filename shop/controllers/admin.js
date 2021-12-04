const Product = require('../models/product')
const { validationResult } = require('express-validator/check')
const fileHelper = require('../util/file')

exports.getAddProduct = (req, res, next) => {
    /*
    if (!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    Will be hard to do this on all routes
     */
    res.render('admin/edit-product',
        {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: false,
            errorMessage: undefined,
            validationErrors: []
        });
};

exports.postAddProduct = (req, res, next) => {
    console.log("Adding product...")
    const errors = validationResult(res)
    const {title, price, description} = req.body
    const image = req.file
    console.log(req.file)

    if(!image){
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title, description
            },
            errorMessage: 'Attached file is not a valid image.',
            validationErrors: []
        })
    }

    const imageUrl = "/" + image.path

    if (!errors.isEmpty()){
        console.log(errors.array())
        return res.status(422).render('admin/add-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title, description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        })
    }
    const product = new Product({
        title,
        imageUrl,
        price,
        description,
        userId: req.user, //picks id from the object. You can use req.user._id
        isAuthenticated: req.session.isLoggedIn
    });
    product
        .save()
        .then(result => {
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error) //skip all middle wares and move to error handling middle ware
        })
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
                    product,
                    hasError: false,
                    errorMessage: undefined,
                    validationErrors: []
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        })
}

exports.postEditProduct = (req, res, next) => {
    const errors = validationResult(req)
    const {productId, title, price, imageUrl, description} = req.body
    const editMode = req.query.edit
    const image = req.file

    if(!image){
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title, description
            },
            errorMessage: 'Attached file is not a valid image.',
            validationErrors: []
        });
    }

    if (!errors.isEmpty()){
        console.log(errors.array())
        return res
            .status(422)
            .render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: {
                    productId, title, price, description
                },
                hasError: true,
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            })
    }

    Product.findById(productId)
        .then((product) => {
            if (product.userId.toString() !== req.user._id.toString()){
                return res.redirect('/');
            }
            product.title = title;
            product.price = price;
            product.description = description;
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            return product.save().then(() => {
                console.log("Updated Product");
                res.redirect('/admin/products');
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        })
}

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
        //.populate('userId') //You can point at nested paths
        .then((products) => {
            res.render('admin/products',
                {
                    prods: products,
                    pageTitle: 'Admin Products',
                    path: '/admin/products',
                    isAuthenticated: req.session.isLoggedIn
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        })
}

exports.deleteProduct = (req, res, next) => {
    const {productId} = req.params
    console.log(`Deleting product with id ${productId}`)
    Product.findById(productId)
        .then(product => {
            if (!product){
                console.log("Product not found...")
                return next(new Error('Product not found'))
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product
                .deleteOne({id: productId, userId: req.user.id})
        })
        .then(() => {
            console.log("Product deleted successfully!!")
            res.status(200).json({message: "Success!"});
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({message: "Deleting product failed!"})
        })
}
