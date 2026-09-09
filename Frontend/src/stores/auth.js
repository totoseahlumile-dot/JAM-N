// Vuex module for auth state.
// roles is an array, so a user can be multiple things at once
// (e.g. both "listener" and "artist"), matching the original sign-up design.
// No admin role - dropped the Admin Seed/research tracker feature entirely.

const state = {
  user: {
    id: 'usr_101',
    name: 'Maiesha Team',
    email: 'maiesha@jamn.co.za',
    roles: ['listener', 'artist'], // dev default - logged in as both, for easy testing of role-based UI
  },
  isAuthenticated: true,
}

const getters = {
  currentUser: (state) => state.user,
  isLoggedIn: (state) => state.isAuthenticated,

  // Checks if the user has an artist or producer role (used by AccountView
  // to decide whether to show role-specific content/sections)
  isArtistOrProducer: (state) => {
    const roles = state.user?.roles ?? []
    return roles.includes('artist') || roles.includes('producer')
  },
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
    state.isAuthenticated = !!user
  },
  LOGOUT(state) {
    state.user = null
    state.isAuthenticated = false
  },
}

const actions = {
  login({ commit }, credentials) {
    // Mock login response - defaults to a listener role for now.
    // Real signup flow should let the user pick multiple roles
    // (Listener / Artist / Producer) as originally designed.
    commit('SET_USER', {
      id: 'usr_102',
      name: credentials.email.split('@')[0],
      email: credentials.email,
      roles: ['listener'],
    })
  },
  logout({ commit }) {
    commit('LOGOUT')
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}