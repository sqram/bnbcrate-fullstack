import user from './modules/user'
import cart from './modules/cart'
import products from './modules/products'
import dialogs from './modules/dialogs'
import checkout from './modules/checkout'

const store = {
  strict: true,
  modules: {
    user,
    cart,
    products,
    dialogs,
    checkout
  },  
}

export default store