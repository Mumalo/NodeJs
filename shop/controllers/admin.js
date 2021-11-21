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
    const product = new Product(title, price, description, imageUrl)
    product
        .save()
        .then(result => {
            console.log("Created Product", result)
            res.redirect('/admin/products')
        })
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if (!editMode) {
        res.redirect('/')
    }
    const {productId} = req.params
    req.user.getProducts({where: {id: productId}})
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
    console.log("Editing products")
    console.log(req.body)
    const {productId, title, price, imageUrl, description} = req.body
    console.log(productId)
    Product.findById(productId)
        .then(product => {
            product.title = title
            product.price = price
            product.imageUrl = imageUrl
            product.description = description
            return product.save()
        })
        .then(result => {
            console.log("Updated Product")
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then((products) => {
            res.render('admin/products',
                {
                    prods: products,
                    pageTitle: 'Admin Products',
                    path: '/admin/products',
                })
        }).catch(err => {
        console.log(err)
    })
}

exports.postDeleteProduct = (req, res, next) => {
    const {productId} = req.body
    Product.findById(productId).then(product => {
        return product.destroy()
    }).then(result => {
        console.log("Deleted product")
        res.redirect('/')
    }).catch(err => {
        console.log(res.redirect('/'))
    })

}
