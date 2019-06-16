
const state = () => {

  return {
    show: false,
    content: 'login',
    // `args` would be something like {form: register} to show
    // register form instead of login
    
    // login: {
    //   show: false,
    // },
    // register: {
    //   show: false
    // },
    // newAddress: {
    //   show: false
    // }
  }
  
}



/**
 * Toggles a dialog (shown/hidden), and changes
 * the content inside
 * 
 * @param {Obj} obj - object representing dialogs state
 * obj.show: true | false
 * obj.content: login | register | newAddress, etc
 */
const mutations = {
  TOGGLE_DIALOG (state, obj)
  {    
    state.show = obj.show
    state.content = obj.content || null
  },
}

export default {
  namespaced: true,
  state,
  mutations
}