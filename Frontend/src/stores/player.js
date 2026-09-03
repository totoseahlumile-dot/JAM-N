export default {
  namespaced: true,
  state: () => ({
    currentTrack: {
      id: 't1',
      title: 'Soft',
      artist: 'Usimamane',
      album: 'Single',
      coverArt: '/images/artists/usimamane.jpg',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 180
    },
    isPlaying: false,
    volume: 80
  }),
  getters: {
    activeTrack: (state) => state.currentTrack,
    isPlaying: (state) => state.isPlaying,
    volumeLevel: (state) => state.volume
  },
  mutations: {
    SET_TRACK(state, track) {
      state.currentTrack = track
      state.isPlaying = true
    },
    TOGGLE_PLAYBACK(state) {
      state.isPlaying = !state.isPlaying
    },
    SET_VOLUME(state, volume) {
      state.volume = volume
    }
  },
  actions: {
    playTrack({ commit }, track) {
      commit('SET_TRACK', track)
    },
    togglePlay({ commit }) {
      commit('TOGGLE_PLAYBACK')
    }
  }
}