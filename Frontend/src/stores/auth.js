// Vuex module for auth state.
// UPDATED: roles is now an array, so a user can be multiple things at once
// (e.g. both "listener" and "artist"), matching the original sign-up design.
// "admin" is a special dev-only role for accessing the Admin Seed/research
// tracking tools - not a real account type a normal user would choose at signup.

const state = {
  user: {
    id: 'usr_101',
    name: 'Maiesha Team',
    email: 'maiesha@jamn.co.za',
    roles: ['admin'] // was: role: 'admin' (single string)
  },
  isAuthenticated: true,
}

const getters = {
  currentUser: (state) => state.user,
  isLoggedIn: (state) => state.isAuthenticated,

  // Checks if "admin" is in the roles array
  isAdmin: (state) => state.user?.roles?.includes('admin') ?? false,

  // New: checks if the user has an artist or producer role (used by AccountView
  // to decide whether to show the "For producers & artists" section)
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