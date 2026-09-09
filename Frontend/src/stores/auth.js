// Vuex module for auth state.

const state = () => ({
  user: {
    id: 'usr_101',
    name: 'Maiesha Team',
    email: 'maiesha@jamn.co.za',
    roles: ['listener', 'artist'], // dev default
  },
  isAuthenticated: true,
  likedTrackIds: [], // Stores IDs of tracks liked by the user
})

const getters = {
  currentUser: (state) => state.user,
  isLoggedIn: (state) => state.isAuthenticated && !!state.user,

  isArtistOrProducer: (state) => {
    const roles = state.user?.roles ?? []
    return roles.includes('artist') || roles.includes('producer')
  },

  isLiked: (state) => (trackId) => {
    return state.likedTrackIds.includes(trackId)
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

  TOGGLE_LIKE(state, trackId) {
    const index = state.likedTrackIds.indexOf(trackId)
    if (index === -1) {
      state.likedTrackIds.push(trackId)
    } else {
      state.likedTrackIds.splice(index, 1)
    }
  },
}

const actions = {
  login({ commit }, credentials) {
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