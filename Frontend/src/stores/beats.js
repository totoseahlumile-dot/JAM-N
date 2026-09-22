export default {
  namespaced: true,

  state: () => ({
    beats: [
      // --- Hip-Hop ---
      {
        id: "beat-1",
        title: "Rap Beat Beats",
        artist: "SolarFLEX",
        genre: "Hip-Hop",
        coverArt: "/images/beats/rap-beat-solarflex.jpg",
        audioUrl: "/audio/beats/rap-beat-beats-solarflex.mp3",
        duration: 155,
        price: 130,
      },
      {
        id: "beat-2",
        title: "Back Home",
        artist: "Pryces",
        genre: "Hip-Hop",
        coverArt: "/images/beats/back-home-pryces.webp",
        audioUrl: "/audio/beats/back-home-pryces.mp3",
        duration: 210,
        price: 105,
      },
      {
        id: "beat-3",
        title: "Club Party Club Beat",
        artist: "Vaitsez",
        genre: "Hip-Hop",
        coverArt: "/images/beats/party-club-vaitsez.jpg",
        audioUrl: "/audio/beats/club-party-club-beat-vaitsez.mp3",
        duration: 170,
        price: 110,
      },

      // --- Trap & Melodic Beat ---
      {
        id: "beat-4",
        title: "Melodic Type Beat | Trap Type Beat",
        artist: "Zharovbeatz",
        genre: "Trap & Melodic Beat",
        coverArt: "/images/beats/melodic-trap-beat-zharovbeatz.jpg",
        audioUrl: "/audio/beats/melodic-trap-type-beat-zharovbeatz.mp3",
        duration: 160,
        price: 115,
      },
      {
        id: "beat-5",
        title: "Rest Assured Interlude",
        artist: "Lutant Savage",
        genre: "Trap & Melodic Beat",
        coverArt: "/images/beats/rest-assured-interlude-lutant-savage.jpg",
        audioUrl: "/audio/beats/rest-assured-interlude-lutant-savage.mp3",
        duration: 120,
        price: 90,
      },
      {
        id: "beat-6",
        title: "Crumbling",
        artist: "Ketsa",
        genre: "Trap & Melodic Beat",
        coverArt: "/images/beats/ketsa.jpg",
        audioUrl: "/audio/beats/crumbling-ketsa.mp3",
        duration: 165,
        price: 100,
      },

      // --- Lo-Fi & R&B / Soul ---
      {
        id: "beat-7",
        title: "Driving Soul",
        artist: "Ketsa",
        genre: "Lo-Fi & R&B / Soul",
        coverArt: "/images/beats/ketsa.jpg",
        audioUrl: "/audio/beats/driving-soul-ketsa.mp3",
        duration: 190,
        price: 120,
      },
      {
        id: "beat-8",
        title: "Hollow",
        artist: "KaizanBlu",
        genre: "Lo-Fi & R&B / Soul",
        coverArt: "/images/beats/hollow-kaizanblu.jpg",
        audioUrl: "/audio/beats/hollow-kaizanblu.mp3",
        duration: 185,
        price: 110,
      },
      {
        id: "beat-9",
        title: "Something Music",
        artist: "Helkimer",
        genre: "Lo-Fi & R&B / Soul",
        coverArt: "/images/beats/helkimer-something-music.jpg",
        audioUrl: "/audio/beats/something-music-helkimer.mp3",
        duration: 170,
        price: 100,
      },

      // --- Electronic & Synth ---
      {
        id: "beat-10",
        title: "Sanctuary",
        artist: "Torus",
        genre: "Electronic & Synth",
        coverArt: "/images/beats/sanctuary-torus.jpg",
        audioUrl: "/audio/beats/sanctuary-torus.mp3",
        duration: 180,
        price: 95,
      },
      {
        id: "beat-11",
        title: "Jaipur",
        artist: "ASHUTOSH",
        genre: "Electronic & Synth",
        coverArt: "/images/beats/BeatCover.png",
        audioUrl: "/audio/beats/jaipur-ashutosh.mp3",
        duration: 200,
        price: 100,
      },
      {
        id: "beat-12",
        title: "Game Over",
        artist: "ASHUTOSH",
        genre: "Electronic & Synth",
        coverArt: "/images/beats/BeatCover.png",
        audioUrl: "/audio/beats/game-over-ashutosh.mp3",
        duration: 165,
        price: 100,
      },

      // --- Ambient & Acoustic ---
      {
        id: "beat-13",
        title: "Beat of Nature",
        artist: "folk_acoustic",
        genre: "Ambient & Acoustic",
        coverArt: "/images/beats/BeatCover.png",
        audioUrl: "/audio/beats/beat-of-nature-folk-acoustic.mp3",
        duration: 150,
        price: 120,
      },
      {
        id: "beat-14",
        title: "Golden Rythm",
        artist: "FSM Team",
        genre: "Ambient & Acoustic",
        coverArt: "/images/beats/fsm-team-golden-rhythm.jpg",
        audioUrl: "/audio/beats/golden-rythm-fsm-team.mp3",
        duration: 175,
        price: 105,
      },
      {
        id: "beat-15",
        title: "Magheda",
        artist: "Punch Deck",
        genre: "Ambient & Acoustic",
        coverArt: "/images/beats/punch-deck-magheda.jpg",
        audioUrl: "/audio/beats/magheda-punch-deck.mp3",
        duration: 195,
        price: 115,
      },
    ],
    likedBeatIds: [], // Tracks IDs of liked items
    customLikedItems: [], // Caches full item objects for custom-uploaded likes
    purchasedBeatIds: [], // Tracks IDs of beats the user has bought
  }),

  getters: {
    allBeats: (state) => state.beats,

    // Combines standard beats and custom liked items to evaluate the liked list
    likedBeats: (state) => {
      const allKnownItems = [...state.beats, ...state.customLikedItems];
      const uniqueItems = Array.from(
        new Map(allKnownItems.map((item) => [item.id, item])).values(),
      );
      return uniqueItems.filter((item) => state.likedBeatIds.includes(item.id));
    },

    isPurchased: (state) => (beatId) => state.purchasedBeatIds.includes(beatId),

    purchasedBeats: (state) =>
      state.beats.filter((b) => state.purchasedBeatIds.includes(b.id)),
  },

  mutations: {
    ADD_BEAT(state, newBeat) {
      state.beats.unshift(newBeat);
    },

    TOGGLE_LIKE_BEAT(state, beatOrId) {
      const beatId = typeof beatOrId === "object" ? beatOrId.id : beatOrId;
      const beatObj = typeof beatOrId === "object" ? beatOrId : null;

      const index = state.likedBeatIds.indexOf(beatId);
      if (index > -1) {
        state.likedBeatIds.splice(index, 1); // Unlike
      } else {
        state.likedBeatIds.push(beatId); // Like

        // Save reference if it's a custom user upload/item not in main array
        if (beatObj && !state.beats.some((b) => b.id === beatId)) {
          if (!state.customLikedItems.some((b) => b.id === beatId)) {
            state.customLikedItems.push(beatObj);
          }
        }
      }
    },

    ADD_PURCHASED_BEAT(state, beatId) {
      if (!state.purchasedBeatIds.includes(beatId)) {
        state.purchasedBeatIds.push(beatId);
      }
    },
  },

  actions: {
    addBeat({ commit }, beatData) {
      const formattedBeat = {
        id: beatData.id || `beat-${Date.now()}`,
        title: beatData.title || "Untitled Beat",
        artist: beatData.artist || beatData.producer || "Unknown Artist",
        genre: beatData.genre || "Hip-Hop",
        coverArt: beatData.coverArt || "/images/beats/BeatCover.png",
        audioUrl: beatData.audioUrl || "",
        duration: beatData.duration || 180,
        price: beatData.price || 100,
      };
      commit("ADD_BEAT", formattedBeat);
    },

    toggleLikeBeat({ commit }, beatPayload) {
      console.log("Toggling like for payload:", beatPayload);
      commit("TOGGLE_LIKE_BEAT", beatPayload);
    },

    purchaseBeats({ commit }, beatIds) {
      // beatIds is an array of beat id strings, e.g. from a completed cart checkout
      beatIds.forEach((id) => commit("ADD_PURCHASED_BEAT", id));
    },
  },
};