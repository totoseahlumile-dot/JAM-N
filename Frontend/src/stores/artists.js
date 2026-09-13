export default {
  state: () => ({
    artistsList: [
      {
        id: "1",
        name: "Usimamane",
        handle: "usimamane",
        genre: "Hip-Hop/Rap",
        location: "Durban",
        image: null,
        bio: "Pioneering new wave rap artist from South Africa.",
        tracks: [
          { id: "t1-1", title: "Soft", audioUrl: null },
          { id: "t1-2", title: "Anthem", audioUrl: null },
          { id: "t1-3", title: "Wola (feat. Lorx)", audioUrl: null },
          { id: "t1-4", title: "Star", audioUrl: null },
          { id: "t1-5", title: "21", audioUrl: null },
          { id: "t1-6", title: "Uphambene", audioUrl: null },
        ],
      },
      {
        id: "art_1",
        name: "Zola Sounds",
        handle: "zolasounds",
        genre: "Amapiano",
        location: "Cape Town",
        image: null,
        bio: "Pioneering new wave Amapiano rhythms.",
        tracks: [
          { id: "t2-1", title: "Live Session", audioUrl: null },
          { id: "t2-2", title: "Studio Demo", audioUrl: null },
        ],
      },
      {
        id: "art_2",
        name: "Kloof Street Collective",
        handle: "kloofstreet",
        genre: "Indie",
        location: "Cape Town",
        image: null,
        bio: "Alternative indie band from the Mother City.",
        tracks: [{ id: "t3-1", title: "Session 1", audioUrl: null }],
      },
      {
        id: "art_3",
        name: "Buntu Beats",
        handle: "buntubeats",
        genre: "Hip Hop",
        location: "Johannesburg",
        image: null,
        bio: "Gritty underground hip hop producer.",
        tracks: [
          { id: "t4-1", title: "Jozi Cypher", audioUrl: null },
          { id: "t4-2", title: "Beat Tape Vol. 1", audioUrl: null },
        ],
      },
      {
        id: "art_4",
        name: "Nala Soul",
        handle: "nalasoul",
        genre: "R&B",
        location: "Durban",
        image: null,
        bio: "Smooth neo-soul vocals and melodies.",
        tracks: [
          { id: "t5-1", title: "Midnight Rain", audioUrl: null },
          { id: "t5-2", title: "Ocean Breeze", audioUrl: null },
        ],
      },
    ],
  }),

  getters: {
    allArtists: (state) => state.artistsList,
    getArtistById: (state) => (id) => {
      return state.artistsList.find((artist) => artist.id === id);
    },
  },

  namespaced: true,
};
