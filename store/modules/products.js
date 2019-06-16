
const state = () => {

  return {
    crates: []
  }
  
}




const actions = {

  /**
   * Fetches products (crates) from the server,
   * then sets the `crates` state to the value.
   * 
   */
  async getCrates ({ commit })
  {    
    let products = await this.$axios.$get('/api/products')
    products = products.products
    if (Array.isArray(products))
    {
      commit('SET_CRATES', products)
    }
    else
    {
      // In case API returns a string (error), do nothing.
      return []
    }
  } 
}




const mutations = {

  /**
   * Mutates the `crates` data to whatever `crates` param is.
   * 
   * @param {Obj} crates An array of products. Format should be like
   * [ { "id": 1, "name": "Basic", "price": 6.99, "items": [ ... ] }]
   */

  SET_CRATES (state, crates)
  {
    state.crates = crates
  }
}


const getters  = {
  getAllCrates (state)
  {
    return state.crates
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}