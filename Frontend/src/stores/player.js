export default {
  namespaced: true,
  state: () => ({
    currentTrack: {
      id: "song-1",
      title: "Maisha",
      artist: "Jamali",
      genre: "Afropop",
      coverArt: "/images/Jamali.png",
      audioUrl: "/audio/songs/maisha.mp3",
      duration: 180,
      price: 150,
    },
    isPlaying: false,
    currentTime: 0,
    volume: 80,
    isExpanded: false, // <-- Added this to control the full-screen modal
    queue: [
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
  }),
  getters: {
    activeTrack: (state) => state.currentTrack,
    isPlaying: (state) => state.isPlaying,
    volumeLevel: (state) => state.volume,
    trackQueue: (state) => state.queue,
  },
  mutations: {
    SET_TRACK(state, track) {
      state.currentTrack = track;
      state.isPlaying = true;
      state.currentTime = 0;
    },
    TOGGLE_PLAYBACK(state) {
      state.isPlaying = !state.isPlaying;
    },
    SET_CURRENT_TIME(state, time) {
      state.currentTime = time;
    },
    SET_VOLUME(state, volume) {
      state.volume = volume;
    },
    ADD_TO_QUEUE(state, track) {
      state.queue.push(track);
    },
    SET_EXPANDED(state, value) {
      state.isExpanded = value; // <-- Added mutation to toggle the expanded modal
    },
  },
  actions: {
    playTrack({ commit }, track) {
      if (!track.audioUrl) {
        console.error("No audio URL provided for track/beat:", track);
        return;
      }

      // --- PERSISTENT HISTORY & PLAY COUNT TRACKING ---
      if (track && track.id) {
        let recentIds = JSON.parse(
          localStorage.getItem("jamn_recent_tracks") || "[]",
        );
        recentIds = [
          track.id,
          ...recentIds.filter((id) => id !== track.id),
        ].slice(0, 10);
        localStorage.setItem("jamn_recent_tracks", JSON.stringify(recentIds));

        let counts = JSON.parse(
          localStorage.getItem("jamn_play_counts") || "{}",
        );
        counts[track.id] = (counts[track.id] || 0) + 1;
        localStorage.setItem("jamn_play_counts", JSON.stringify(counts));
      }

      commit("SET_TRACK", track);
    },
    togglePlay({ commit }) {
      commit("TOGGLE_PLAYBACK");
    },
    updateVolume({ commit }, volume) {
      commit("SET_VOLUME", volume);
    },
    addToQueue({ commit }, track) {
      commit("ADD_TO_QUEUE", track);
    },
  },
};
