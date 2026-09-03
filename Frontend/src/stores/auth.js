export default {
  namespaced: true,
  state: () => ({
    user: {
      id: 'usr_101',
      name: 'Maiesha Team',
      email: 'maiesha@jamn.co.za',
      role: 'admin' // Options: 'admin', 'user', 'artist'
    },
    isAuthenticated: true
  }),
  getters: {
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isLoggedIn: (state) => state.isAuthenticated
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    },
    LOGOUT(state) {
      state.user = null
      state.isAuthenticated = false
    }
  },
  actions: {
    login({ commit }, credentials) {
      // Mock login response
      commit('SET_USER', {
        id: 'usr_102',
        name: credentials.email.split('@')[0],
        email: credentials.email,
        role: 'user'
      })
    },
    logout({ commit }) {
      commit('LOGOUT')
    }
  }
}