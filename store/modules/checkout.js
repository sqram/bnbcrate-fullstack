const state = () => {

  return {
    email: "",
    guestName: "",
    shipping: {
      // Address ID in datatore, if any
      id: "",
      name: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: 'us'
    }
  }
  
}


const mutations = {

  UPDATE_EMAIL (state, value)
  {
    state.email = value
  },

  UPDATE_GUEST_NAME (state, value)
  {
    state.guestName = value
  },

  // UPDATE_SHIPPING_ID (state, value)
  // {
  //   state.shipping.id = value
  // },

  UPDATE_SHIPPING_NAME (state, value)
  {
    state.shipping.name = value
  },

  UPDATE_SHIPPING_STREET (state, value)
  {
    state.shipping.street = value
  },

  UPDATE_SHIPPING_CITY (state, value)
  {
    state.shipping.city = value
  },

  UPDATE_SHIPPING_STATE (state, value)
  {
    state.shipping.state = value
  },

  UPDATE_SHIPPING_ZIP (state, value)
  {
    state.shipping.zip = value
  }
}




export default {
  namespaced: true,
  state,
  mutations
}

