import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  window.onNuxtReady(() => {
    createPersistedState({        
      paths: ['user',  'cart', 'checkout', 'products']
    })(store)
  })
}