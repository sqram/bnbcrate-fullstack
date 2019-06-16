const state = () => {

  return {

    /**
     * Holds items in the cart, as Objects.
     * { name: "Basic", quantity: 1 }
     */
    items: [],
  }
  
}




const mutations = {

  /**
   * Updates an item in the cart.
   * It searches for the item, and updates its quantity.
   * If item doesn't exist (name not found), push
   * whole object to state (obj should be in {name: qty} format)
   * 
   * @param {Obj} obj an object representing { name: foo, quanity: N, price: N, id: N }
   */
  
  UPDATE_CART_ITEM (state, obj) {
    let item = state.items.filter(o => o.name == obj.name)[0] || null
    if (item) 
    {
      // Product exists in `items` (already in cart). Update the quantity      
      item.quantity = obj.quantity
    }
    else
    {
      // Product does not exist in cart. Add it
      state.items.push(obj)
    }
  }
}

const getters = {

  /**
   * Returns the cart total amount.
   * It multiplies quantity of item in this state,
   * with the price of the product in `crates` module
   */
  cartTotal (state, getters, rootState, rootGetters) {     
    let crates = rootState.products.crates    
    console.log('---')
    console.log(crates)
    if (!state.items.length || !crates.length) {
      
      // Total is 0 if there are no items in cart or products isn't done being fetched
      return 0
    }  
    
    return  state.items.map(item => {    
      let crate = crates.find(crate => crate.name == item.name) 
      if (crate)
      {
        return crate.price * item.quantity 
      }
    })   
   .reduce( (acc, cv) => acc + cv )
  }
}



export default {
  namespaced: true,
  state,
  mutations,
  getters
}

