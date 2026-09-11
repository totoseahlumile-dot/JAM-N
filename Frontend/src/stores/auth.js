const state = () => ({
  user: {
    id: 'usr_101',
    name: 'JAMN Team',
    email: 'music@jamn.co.za',
    roles: ['listener', 'artist'], // dev default
    followingList: [], // Stores followed artist/user objects
    uploads: (() => {
      try {
        return JSON.parse(localStorage.getItem('user_uploads')) || []
      } catch (e) {
        return []
      }
    })(), // Saved uploads with safe JSON fallback parsing
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

  userUploads: (state) => state.user?.uploads ?? [],
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

  ADD_UPLOAD(state, newPost) {
    if (!state.user.uploads) {
      state.user.uploads = []
    }
    state.user.uploads.unshift(newPost)
    localStorage.setItem('user_uploads', JSON.stringify(state.user.uploads))
  },

  DELETE_UPLOAD(state, postId) {
    if (!state.user.uploads) return
    state.user.uploads = state.user.uploads.filter(p => p.id !== postId)
    localStorage.setItem('user_uploads', JSON.stringify(state.user.uploads))
  },

  TOGGLE_POST_LIKE(state, postId) {
    const post = state.user?.uploads?.find(p => p.id === postId)
    if (post) {
      post.isLiked = !post.isLiked
      post.likesCount = (post.likesCount || 0) + (post.isLiked ? 1 : -1)
      localStorage.setItem('user_uploads', JSON.stringify(state.user.uploads))
    }
  },

  ADD_POST_COMMENT(state, { postId, text }) {
    const post = state.user?.uploads?.find(p => p.id === postId)
    if (post) {
      if (!post.comments) post.comments = []
      post.comments.push({
        id: `comment-${Date.now()}`,
        text,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      localStorage.setItem('user_uploads', JSON.stringify(state.user.uploads))
    }
  },
}

const actions = {
  login({ commit }, credentials) {
    let savedUploads = []
    try {
      savedUploads = JSON.parse(localStorage.getItem('user_uploads')) || []
    } catch (e) {
      savedUploads = []
    }

    commit('SET_USER', {
      id: 'usr_102',
      name: credentials.email.split('@')[0],
      email: credentials.email,
      roles: ['listener'],
      followingList: [],
      uploads: savedUploads,
    })
  },

  logout({ commit }) {
    commit('LOGOUT')
  },

  createPost({ commit }, postData) {
    const isText = postData.type === 'text'
    const newPost = {
      id: `post-${Date.now()}`,
      title: isText 
        ? (postData.content?.caption || 'Text Update') 
        : (postData.content?.title || 'Untitled Post'),
      artist: isText ? null : (postData.content?.genre ? `${postData.content.genre} Track` : 'Original Upload'),
      image: isText ? null : (postData.content?.coverImage || postData.content?.mediaUrl || null),
      audioUrl: isText ? null : (postData.content?.audioUrl || null),
      caption: postData.content?.caption || '',
      type: postData.type || 'track',
      likesCount: 0,
      isLiked: false,
      comments: []
    }
    commit('ADD_UPLOAD', newPost)
  },

  deleteUpload({ commit }, postId) {
    commit('DELETE_UPLOAD', postId)
  },

  togglePostLike({ commit }, postId) {
    commit('TOGGLE_POST_LIKE', postId)
  },

  addPostComment({ commit }, payload) {
    commit('ADD_POST_COMMENT', payload)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}