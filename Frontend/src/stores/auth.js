// Vuex module for auth state.

const state = () => ({
  user: {
    id: 'usr_101',
    name: 'Maiesha Team',
    email: 'maiesha@jamn.co.za',
    roles: ['listener', 'artist'], // dev default
    followingList: [], // Stores followed artist/user objects
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

  isFollowing: (state) => (artistId) => {
    return state.user?.followingList?.some((artist) => artist.id === artistId) ?? false
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

  TOGGLE_FOLLOW(state, artist) {
    if (!state.user) return
    if (!state.user.followingList) {
      state.user.followingList = []
    }

    const index = state.user.followingList.findIndex((a) => a.id === artist.id)
    if (index > -1) {
      state.user.followingList.splice(index, 1) // Unfollow
    } else {
      state.user.followingList.push(artist) // Follow
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
      followingList: [],
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