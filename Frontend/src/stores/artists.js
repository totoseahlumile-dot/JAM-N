export default {
  namespaced: true,
  state: () => ({
    artists: [
      {
        id: '1',
        name: 'Usimamane',
        genre: 'Hip-Hop/Rap',
        type: 'Solo Artist',
        bio: 'Emerging South African Hip-Hop/Rap artist.',
        image: '/images/artists/usimamane.jpg',
        streamingLinks: {
          spotify: 'https://open.spotify.com/artist/usimamane',
          appleMusic: 'https://music.apple.com/us/artist/usimamane',
          youtubeMusic: 'https://music.youtube.com/channel/usimamane'
        },
        tracks: [
          { id: 't1', title: 'Soft', year: 2025, album: 'Single' },
          { id: 't2', title: 'Anthem', year: 2026, album: 'Single' },
          { id: 't3', title: 'Wola (feat. Lorx)', year: 2026, album: 'Single' },
          { id: 't4', title: 'Star', year: 2024, album: '20th: Days Before Maud' },
          { id: 't5', title: '21', year: 2024, album: '20th: Days Before Maud' },
          { id: 't6', title: 'Uphambene', year: 2024, album: '20th: Days Before Maud' }
        ]
      },
      {
        id: '2',
        name: 'Bongeziwe Mabandla',
        genre: 'Folk',
        type: 'Solo Artist',
        bio: 'Renowned Afro-Folk artist.',
        image: '/images/artists/bongeziwe.jpg',
        streamingLinks: {
          spotify: 'https://open.spotify.com/artist/bongeziwe-mabandla',
          appleMusic: 'https://music.apple.com/us/artist/bongeziwe-mabandla',
          youtubeMusic: 'https://music.youtube.com/channel/bongeziwe-mabandla'
        },
        tracks: [
          { id: 't7', title: 'Ndokulandela', year: 2017, album: 'Mangaliso' },
          { id: 't8', title: 'salanabani', year: 2020, album: 'iimini' },
          { id: 't9', title: 'masiziyekelele', year: 2020, album: 'iimini' },
          { id: 't10', title: 'jikeleza', year: 2020, album: 'iimini' },
          { id: 't11', title: 'Yini', year: 2017, album: 'Mangaliso' }
        ]
      },
      {
        id: '3',
        name: 'Will Linley',
        genre: 'Pop',
        type: 'Solo Artist',
        bio: 'Pop singer-songwriter based in South Africa.',
        image: '/images/artists/willlinley.jpg',
        streamingLinks: {
          spotify: 'https://open.spotify.com/artist/will-linley',
          appleMusic: 'https://music.apple.com/us/artist/will-linley',
          youtubeMusic: 'https://music.youtube.com/channel/will-linley'
        },
        tracks: [
          { id: 't12', title: 'Last Call', year: 2022, album: 'Single' },
          { id: 't13', title: 'Holding The Line', year: 2026, album: 'Single' },
          { id: 't14', title: 'Quite Like Us...', year: 2025, album: "Don't Cry Because It's Over" },
          { id: 't15', title: 'First Love', year: 2026, album: 'Single' }
        ]
      }
    ]
  }),
  getters: {
    allArtists: (state) => state.artists,
    getArtistById: (state) => (id) => state.artists.find(artist => artist.id === id)
  },
  mutations: {
    SET_ARTISTS(state, artists) {
      state.artists = artists
    }
  },
  actions: {
    fetchArtists({ commit }) {
      // Future API integration placeholder
    }
  }
}