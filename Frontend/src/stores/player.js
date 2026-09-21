export default {
  namespaced: true,
  state: () => ({
    currentTrack: {
      id: "t11-1",
      title: "Maisha",
      artist: "Jamali",
      genre: "Afropop",
      coverArt: "/images/artists/jamali.jpg",
      audioUrl: "/audio/jamali-maisha.mp3",
      duration: 180,
      price: 150,
    },
    isPlaying: false,
    currentTime: 0,
    volume: 80,
    isExpanded: false,
    queue: [
      // --- Alice Phoebe Lou ---
      {
        id: "t1-1",
        title: "Witches",
        artist: "Alice Phoebe Lou",
        genre: "Indie Pop",
        coverArt: "/images/artists/alice-phoebe-lou.jpg",
        audioUrl: "/audio/alice-phoebe-lou-witches.mp3",
        duration: 180,
        price: 150,
      },
      {
        id: "t1-2",
        title: "Open My Door",
        artist: "Alice Phoebe Lou",
        genre: "Indie Pop",
        coverArt: "/images/artists/alice-phoebe-lou.jpg",
        audioUrl: "/audio/alice-phoebe-lou-open-my-door.mp3",
        duration: 195,
        price: 150,
      },

      // --- A-Reece ---
      {
        id: "t2-1",
        title: "Four Horsemen",
        artist: "A-Reece",
        genre: "Hip-Hop",
        coverArt: "/images/artists/a-reece.jpg",
        audioUrl: "/audio/a-reece-four-horsemen.mp3",
        duration: 200,
        price: 150,
      },
      {
        id: "t2-2",
        title: "Activity",
        artist: "A-Reece",
        genre: "Hip-Hop",
        coverArt: "/images/artists/a-reece.jpg",
        audioUrl: "/audio/a-reece-activity.mp3",
        duration: 175,
        price: 150,
      },

      // --- Bongeziwe Mabandla ---
      {
        id: "t3-1",
        title: "Ndokulandela",
        artist: "Bongeziwe Mabandla",
        genre: "Folk",
        coverArt: "/images/artists/bongeziwe-mabandla.jpg",
        audioUrl: "/audio/bongeziwe-ndokulandela.mp3",
        duration: 210,
        price: 150,
      },
      {
        id: "t3-2",
        title: "salanabani (13.8.18)",
        artist: "Bongeziwe Mabandla",
        genre: "Folk",
        coverArt: "/images/artists/bongeziwe-mabandla.jpg",
        audioUrl: "/audio/bongeziwe-salanabani.mp3",
        duration: 190,
        price: 150,
      },

      // --- Brendan Peyper ---
      {
        id: "t4-1",
        title: "H2Hart",
        artist: "Brendan Peyper",
        genre: "Pop",
        coverArt: "/images/artists/brendan-peyper.jpg",
        audioUrl: "/audio/brendan-peyper-h2hart.mp3",
        duration: 185,
        price: 150,
      },
      {
        id: "t4-2",
        title: "Sarie Marais",
        artist: "Brendan Peyper",
        genre: "Pop",
        coverArt: "/images/artists/brendan-peyper.jpg",
        audioUrl: "/audio/brendan-peyper-sarie-marais.mp3",
        duration: 165,
        price: 150,
      },

      // --- Civil Twilight ---
      {
        id: "t5-1",
        title: "Quiet In My Town",
        artist: "Civil Twilight",
        genre: "Alternative Rock",
        coverArt: "/images/artists/civil-spotlight.jpg",
        audioUrl: "/audio/civil-twilight-quiet-in-my-town.mp3",
        duration: 220,
        price: 150,
      },
      {
        id: "t5-2",
        title: "Come As You Are",
        artist: "Civil Twilight",
        genre: "Alternative Rock",
        coverArt: "/images/artists/civil-spotlight.jpg",
        audioUrl: "/audio/civil-twilight-come-as-you-are.mp3",
        duration: 215,
        price: 150,
      },

      // --- CrashCarBurn ---
      {
        id: "t6-1",
        title: "Serenade",
        artist: "CrashCarBurn",
        genre: "Pop-punk",
        coverArt: "/images/artists/crashcarburn.jpg",
        audioUrl: "/audio/crashcarburn-serenade.mp3",
        duration: 195,
        price: 150,
      },
      {
        id: "t6-2",
        title: "Long Live Tonight",
        artist: "CrashCarBurn",
        genre: "Pop-punk",
        coverArt: "/images/artists/crashcarburn.jpg",
        audioUrl: "/audio/crashcarburn-long-live-tonight.mp3",
        duration: 180,
        price: 150,
      },

      // --- Da Capo ---
      {
        id: "t7-1",
        title: "Secret ID",
        artist: "Da Capo",
        genre: "Dance/Electronic",
        coverArt: "/images/artists/da-capo.jpg",
        audioUrl: "/audio/da-capo-secret-id.mp3",
        duration: 240,
        price: 150,
      },
      {
        id: "t7-2",
        title: "Afrika",
        artist: "Da Capo",
        genre: "Dance/Electronic",
        coverArt: "/images/artists/da-capo.jpg",
        audioUrl: "/audio/da-capo-afrika.mp3",
        duration: 260,
        price: 150,
      },

      // --- Halo Yagami ---
      {
        id: "t8-1",
        title: "Uyikhokonke",
        artist: "Halo Yagami",
        genre: "Experimental R&B",
        coverArt: "/images/artists/halo-yagami.jpg",
        audioUrl: "/audio/halo-yagami-uyikhokonke.mp3",
        duration: 170,
        price: 150,
      },
      {
        id: "t8-2",
        title: "432",
        artist: "Halo Yagami",
        genre: "Experimental R&B",
        coverArt: "/images/artists/halo-yagami.jpg",
        audioUrl: "/audio/halo-yagami-432.mp3",
        duration: 160,
        price: 150,
      },

      // --- Hunter Rose ---
      {
        id: "t9-1",
        title: "Seaside Dreams",
        artist: "Hunter Rose",
        genre: "Soul",
        coverArt: "/images/artists/hunter-rose.jpg",
        audioUrl: "/audio/hunter-rose-seaside-dreams.mp3",
        duration: 175,
        price: 150,
      },
      {
        id: "t9-2",
        title: "Love Birds",
        artist: "Hunter Rose",
        genre: "Soul",
        coverArt: "/images/artists/hunter-rose.jpg",
        audioUrl: "/audio/hunter-rose-love-birds.mp3",
        duration: 185,
        price: 150,
      },

      // --- Internet Girl ---
      {
        id: "t10-1",
        title: "PULL UP",
        artist: "Internet Girl",
        genre: "Indie",
        coverArt: "/images/artists/internet-girl.jpg",
        audioUrl: "/audio/internet-girl-pull-up.mp3",
        duration: 155,
        price: 150,
      },
      {
        id: "t10-2",
        title: "I CHANGED (I'M UP)",
        artist: "Internet Girl",
        genre: "Indie",
        coverArt: "/images/artists/internet-girl.jpg",
        audioUrl: "/audio/internet-girl-i-changed.mp3",
        duration: 165,
        price: 150,
      },

      // --- Jamali ---
      {
        id: "t11-1",
        title: "Maisha",
        artist: "Jamali",
        genre: "Afropop",
        coverArt: "/images/artists/jamali.jpg",
        audioUrl: "/audio/jamali-maisha.mp3",
        duration: 180,
        price: 150,
      },
      {
        id: "t11-2",
        title: "Incurable",
        artist: "Jamali",
        genre: "Afropop",
        coverArt: "/images/artists/jamali.jpg",
        audioUrl: "/audio/jamali-incurable.mp3",
        duration: 195,
        price: 150,
      },

      // --- Lordkez ---
      {
        id: "t12-1",
        title: "Aweh",
        artist: "Lordkez",
        genre: "R&B",
        coverArt: "/images/artists/lordkez.jpg",
        audioUrl: "/audio/lordkez-aweh.mp3",
        duration: 180,
        price: 150,
      },
      {
        id: "t12-2",
        title: "4SHO",
        artist: "Lordkez",
        genre: "R&B",
        coverArt: "/images/artists/lordkez.jpg",
        audioUrl: "/audio/lordkez-4sho.mp3",
        duration: 170,
        price: 150,
      },

      // --- Moonchild Sanelly ---
      {
        id: "t13-1",
        title: "Demon",
        artist: "Moonchild Sanelly",
        genre: "Future Ghetto Funk",
        coverArt: "/images/artists/moonchild-sanelly.jpg",
        audioUrl: "/audio/moonchild-sanelly-demon.mp3",
        duration: 165,
        price: 150,
      },
      {
        id: "t13-2",
        title: "With Love To An Ex",
        artist: "Moonchild Sanelly",
        genre: "Future Ghetto Funk",
        coverArt: "/images/artists/moonchild-sanelly.jpg",
        audioUrl: "/audio/moonchild-sanelly-with-love-to-an-ex.mp3",
        duration: 190,
        price: 150,
      },

      // --- Springbok Nude Girls ---
      {
        id: "t14-1",
        title: "Blue Eyes",
        artist: "Springbok Nude Girls",
        genre: "Alternative Rock",
        coverArt: "/images/artists/springbok-nude-girls.jpg",
        audioUrl: "/audio/springbok-nude-girls-blue-eyes.mp3",
        duration: 210,
        price: 150,
      },
      {
        id: "t14-2",
        title: "Genie",
        artist: "Springbok Nude Girls",
        genre: "Alternative Rock",
        coverArt: "/images/artists/springbok-nude-girls.jpg",
        audioUrl: "/audio/springbok-nude-girls-genie.mp3",
        duration: 200,
        price: 150,
      },

      // --- The Black Cat Bones ---
      {
        id: "t15-1",
        title: "Hemingway",
        artist: "The Black Cat Bones",
        genre: "Rock",
        coverArt: "/images/artists/the-black-cat-bones.jpg",
        audioUrl: "/audio/the-black-cat-bones-hemingway.mp3",
        duration: 225,
        price: 150,
      },
      {
        id: "t15-2",
        title: "Dearly Beloved",
        artist: "The Black Cat Bones",
        genre: "Rock",
        coverArt: "/images/artists/the-black-cat-bones.jpg",
        audioUrl: "/audio/the-black-cat-bones-dearly-beloved.mp3",
        duration: 215,
        price: 150,
      },

      // --- The Dirty Skirts ---
      {
        id: "t16-1",
        title: "Daddy Don't Disco",
        artist: "The Dirty Skirts",
        genre: "Indie Rock",
        coverArt: "/images/artists/the-dirty-skirts.jpg",
        audioUrl: "/audio/the-dirty-skirts-daddy-dont-disco.mp3",
        duration: 190,
        price: 150,
      },
      {
        id: "t16-2",
        title: "Strike The Match",
        artist: "The Dirty Skirts",
        genre: "Indie Rock",
        coverArt: "/images/artists/the-dirty-skirts.jpg",
        audioUrl: "/audio/the-dirty-skirts-strike-the-match.mp3",
        duration: 185,
        price: 150,
      },

      // --- The Parlotones ---
      {
        id: "t17-1",
        title: "Colourful",
        artist: "The Parlotones",
        genre: "Indie Rock",
        coverArt: "/images/artists/the-parlotones.jpg",
        audioUrl: "/audio/the-parlotones-colourful.mp3",
        duration: 205,
        price: 150,
      },
      {
        id: "t17-2",
        title: "I'll Be There",
        artist: "The Parlotones",
        genre: "Indie Rock",
        coverArt: "/images/artists/the-parlotones.jpg",
        audioUrl: "/audio/the-parlotones-ill-be-there.mp3",
        duration: 215,
        price: 150,
      },

      // --- Usimamane ---
      {
        id: "t18-1",
        title: "Soft",
        artist: "Usimamane",
        genre: "Hip-Hop/Rap",
        coverArt: "/images/artists/usimamane.jpg",
        audioUrl: "/audio/usimamane-soft.mp3",
        duration: 170,
        price: 150,
      },
      {
        id: "t18-2",
        title: "Anthem",
        artist: "Usimamane",
        genre: "Hip-Hop/Rap",
        coverArt: "/images/artists/usimamane.jpg",
        audioUrl: "/audio/usimamane-anthem.mp3",
        duration: 180,
        price: 150,
      },

      // --- Vigro Deep ---
      {
        id: "t19-1",
        title: "Bhampa",
        artist: "Vigro Deep",
        genre: "Amapiano",
        coverArt: "/images/artists/vigro-deep.jpg",
        audioUrl: "/audio/vigro-deep-bhampa.mp3",
        duration: 290,
        price: 150,
      },
      {
        id: "t19-2",
        title: "Ghost Producer",
        artist: "Vigro Deep",
        genre: "Amapiano",
        coverArt: "/images/artists/vigro-deep.jpg",
        audioUrl: "/audio/vigro-deep-ghost-producer.mp3",
        duration: 310,
        price: 150,
      },

      // --- Walk These Skies ---
      {
        id: "t20-1",
        title: "Godforsaken",
        artist: "Walk These Skies",
        genre: "Modern Metalcore",
        coverArt: "/images/artists/walk-these-skies.jpg",
        audioUrl: "/audio/walk-these-skies-godforsaken.mp3",
        duration: 230,
        price: 150,
      },
      {
        id: "t20-2",
        title: "The Bottom",
        artist: "Walk These Skies",
        genre: "Modern Metalcore",
        coverArt: "/images/artists/walk-these-skies.jpg",
        audioUrl: "/audio/walk-these-skies-the-bottom.mp3",
        duration: 220,
        price: 150,
      },

      // --- Will Linley ---
      {
        id: "t21-1",
        title: "Last Call",
        artist: "Will Linley",
        genre: "Pop",
        coverArt: "/images/artists/will-linley.jpg",
        audioUrl: "/audio/will-linley-last-call.mp3",
        duration: 165,
        price: 150,
      },
      {
        id: "t21-2",
        title: "Holding The Line",
        artist: "Will Linley",
        genre: "Pop",
        coverArt: "/images/artists/will-linley.jpg",
        audioUrl: "/audio/will-linley-holding-the-line.mp3",
        duration: 175,
        price: 150,
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
      state.isExpanded = value;
    },
  },
  actions: {
    playTrack({ commit }, track) {
      if (!track.audioUrl) {
        console.error("No audio URL provided for track:", track);
        return;
      }

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
