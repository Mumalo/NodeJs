
const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement = btn.closest('article')

    fetch(`/admin/product/${prodId}`, {
        method: 'DELETE',
        headers: {
            'CSRF-Token': csrf
        }
    })
        .then(result => {
           return result.json();
        })
        .then(data => {
            console.log(data)
            console.log(productElement)
            return productElement.parentNode.removeChild(productElement);
        })
        .catch(err => {
            console.log(err)
        })
};
