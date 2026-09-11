const state = () => ({
  artistsList: [
    { 
      id: '1', 
      name: 'Usimamane', 
      handle: 'usimamane',
      genre: 'Hip-Hop/Rap', 
      location: 'Durban', 
      image: null, 
      bio: 'Pioneering new wave rap artist from South Africa.',
      tracks: ['Soft', 'Anthem', 'Wola (feat. Lorx)', 'Star', '21', 'Uphambene']
    },
    { 
      id: 'art_1', 
      name: 'Zola Sounds', 
      handle: 'zolasounds',
      genre: 'Amapiano', 
      location: 'Cape Town', 
      image: null, 
      bio: 'Pioneering new wave Amapiano rhythms.',
      tracks: ['Live Session', 'Studio Demo'] 
    },
    { 
      id: 'art_2', 
      name: 'Kloof Street Collective', 
      handle: 'kloofstreet',
      genre: 'Indie', 
      location: 'Cape Town', 
      image: null, 
      bio: 'Alternative indie band from the Mother City.',
      tracks: ['Session 1'] 
    },
    { 
      id: 'art_3', 
      name: 'Buntu Beats', 
      handle: 'buntubeats',
      genre: 'Hip Hop', 
      location: 'Johannesburg', 
      image: null, 
      bio: 'Gritty underground hip hop producer.',
      tracks: ['Jozi Cypher', 'Beat Tape Vol. 1'] 
    },
    { 
      id: 'art_4', 
      name: 'Nala Soul', 
      handle: 'nalasoul',
      genre: 'R&B', 
      location: 'Durban', 
      image: null, 
      bio: 'Smooth neo-soul vocals and melodies.',
      tracks: ['Midnight Rain', 'Ocean Breeze'] 
    },
  ]
})

const getters = {
  allArtists: (state) => state.artistsList,
  getArtistById: (state) => (id) => {
    return state.artistsList.find(artist => artist.id === id)
  }
}

export default {
  namespaced: true,
  state,
  getters,
}