const state = () => ({
  user: {
    id: "usr_101",
    name: "JAMN Team",
    email: "music@jamn.co.za",
    roles: ["listener", "artist"],
    followingList: [],
    uploads: (() => {
      try {
        return JSON.parse(localStorage.getItem("user_uploads")) || [];
      } catch (e) {
        return [];
      }
    })(),
    playlists: (() => {
      try {
        return JSON.parse(localStorage.getItem("user_playlists")) || [];
      } catch (e) {
        return [];
      }
    })(),
  },
  isAuthenticated: true,
  likedTrackIds: JSON.parse(localStorage.getItem("liked_track_ids")) || [],
});

const getters = {
  currentUser: (state) => state.user,
  isLoggedIn: (state) => state.isAuthenticated && !!state.user,
  isArtistOrProducer: (state) => {
    const roles = state.user?.roles ?? [];
    return roles.includes("artist") || roles.includes("producer");
  },
  isLiked: (state) => (trackId) => {
    return state.likedTrackIds.includes(trackId);
  },
  likedSongIds: (state) => state.likedTrackIds || [],
  isFollowing: (state) => (artistId) => {
    return (
      state.user?.followingList?.some((artist) => artist.id === artistId) ??
      false
    );
  },
  userUploads: (state) => state.user?.uploads ?? [],
  userPlaylists: (state) => state.user?.playlists ?? [],
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
    state.isAuthenticated = !!user;
  },
  LOGOUT(state) {
    state.user = null;
    state.isAuthenticated = false;
  },
  TOGGLE_LIKE(state, trackId) {
    const index = state.likedTrackIds.indexOf(trackId);
    if (index === -1) {
      state.likedTrackIds.push(trackId);
    } else {
      state.likedTrackIds.splice(index, 1);
    }
    localStorage.setItem(
      "liked_track_ids",
      JSON.stringify(state.likedTrackIds),
    );
  },
  TOGGLE_FOLLOW(state, artist) {
    if (!state.user) return;
    if (!state.user.followingList) {
      state.user.followingList = [];
    }
    const index = state.user.followingList.findIndex((a) => a.id === artist.id);
    if (index > -1) {
      state.user.followingList.splice(index, 1);
    } else {
      state.user.followingList.push(artist);
    }
  },
  ADD_UPLOAD(state, newPost) {
    if (!state.user.uploads) {
      state.user.uploads = [];
    }
    state.user.uploads.unshift(newPost);
    localStorage.setItem("user_uploads", JSON.stringify(state.user.uploads));
  },
  DELETE_UPLOAD(state, postId) {
    if (!state.user.uploads) return;
    state.user.uploads = state.user.uploads.filter((p) => p.id !== postId);
    localStorage.setItem("user_uploads", JSON.stringify(state.user.uploads));
  },
  CREATE_PLAYLIST_WITH_OBJECT(state, newPlaylist) {
    if (!state.user.playlists) {
      state.user.playlists = [];
    }
    state.user.playlists.unshift(newPlaylist);
    localStorage.setItem(
      "user_playlists",
      JSON.stringify(state.user.playlists),
    );
  },
  ADD_TRACK_TO_PLAYLIST(state, { playlistId, track }) {
    if (!state.user.playlists) return;
    const playlist = state.user.playlists.find((p) => p.id === playlistId);
    if (playlist) {
      if (!playlist.tracks) playlist.tracks = [];
      // Prevent duplicate entries
      if (!playlist.tracks.some((t) => t.id === track.id)) {
        playlist.tracks.push(track);
        playlist.trackCount = playlist.tracks.length;
        localStorage.setItem(
          "user_playlists",
          JSON.stringify(state.user.playlists),
        );
      }
    }
  },
  UPDATE_PLAYLIST_NAME(state, { playlistId, newName }) {
    if (!state.user.playlists) return;
    const playlist = state.user.playlists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.title = newName;
      localStorage.setItem(
        "user_playlists",
        JSON.stringify(state.user.playlists),
      );
    }
  },
  REMOVE_TRACK_FROM_PLAYLIST(state, { playlistId, trackId }) {
    if (!state.user.playlists) return;
    const playlist = state.user.playlists.find((p) => p.id === playlistId);
    if (playlist && playlist.tracks) {
      playlist.tracks = playlist.tracks.filter((t) => t.id !== trackId);
      playlist.trackCount = playlist.tracks.length;
      localStorage.setItem(
        "user_playlists",
        JSON.stringify(state.user.playlists),
      );
    }
  },
  DELETE_PLAYLIST(state, playlistId) {
    if (!state.user.playlists) return;
    state.user.playlists = state.user.playlists.filter(
      (p) => p.id !== playlistId,
    );
    localStorage.setItem(
      "user_playlists",
      JSON.stringify(state.user.playlists),
    );
  },
  TOGGLE_POST_LIKE(state, postId) {
    const post = state.user?.uploads?.find((p) => p.id === postId);
    if (post) {
      post.isLiked = !post.isLiked;
      post.likesCount = (post.likesCount || 0) + (post.isLiked ? 1 : -1);
      localStorage.setItem("user_uploads", JSON.stringify(state.user.uploads));
    }
  },
  ADD_POST_COMMENT(state, { postId, text }) {
    const post = state.user?.uploads?.find((p) => p.id === postId);
    if (post) {
      if (!post.comments) post.comments = [];
      post.comments.push({
        id: `comment-${Date.now()}`,
        text,
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      localStorage.setItem("user_uploads", JSON.stringify(state.user.uploads));
    }
  },
};

const actions = {
  login({ commit }, credentials) {
    let savedUploads = [];
    let savedPlaylists = [];
    try {
      savedUploads = JSON.parse(localStorage.getItem("user_uploads")) || [];
      savedPlaylists = JSON.parse(localStorage.getItem("user_playlists")) || [];
    } catch (e) {
      savedUploads = [];
      savedPlaylists = [];
    }
    commit("SET_USER", {
      id: "usr_102",
      name: credentials.email.split("@")[0],
      email: credentials.email,
      roles: ["listener"],
      followingList: [],
      uploads: savedUploads,
      playlists: savedPlaylists,
    });
  },
  logout({ commit }) {
    commit("LOGOUT");
  },
  toggleLike({ commit }, trackId) {
    commit("TOGGLE_LIKE", trackId);
  },
  createPost({ commit }, postData) {
    const isText = postData.type === "text";
    const newPost = {
      id: `post-${Date.now()}`,
      title: isText
        ? postData.content?.caption || "Text Update"
        : postData.content?.title || "Untitled Post",
      artist: isText
        ? null
        : postData.content?.genre
          ? `${postData.content.genre} Track`
          : "Original Upload",
      image: isText
        ? null
        : postData.content?.coverImage || postData.content?.mediaUrl || null,
      audioUrl: isText ? null : postData.content?.audioUrl || null,
      caption: postData.content?.caption || "",
      type: postData.type || "track",
      likesCount: 0,
      isLiked: false,
      comments: [],
    };
    commit("ADD_UPLOAD", newPost);
  },
  deleteUpload({ commit }, postId) {
    commit("DELETE_UPLOAD", postId);
  },
  createPlaylist({ commit }, payload) {
    const title = typeof payload === "string" ? payload : payload.title;
    const initialTracks =
      typeof payload === "object" ? payload.tracks || [] : [];

    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      title: title,
      trackCount: initialTracks.length,
      cover: null,
      tracks: initialTracks,
    };
    commit("CREATE_PLAYLIST_WITH_OBJECT", newPlaylist);
    return newPlaylist;
  },
  addTrackToPlaylist({ commit }, payload) {
    commit("ADD_TRACK_TO_PLAYLIST", payload);
  },
  updatePlaylistName({ commit }, payload) {
    commit("UPDATE_PLAYLIST_NAME", payload);
  },
  removeTrackFromPlaylist({ commit }, payload) {
    commit("REMOVE_TRACK_FROM_PLAYLIST", payload);
  },
  deletePlaylist({ commit }, playlistId) {
    commit("DELETE_PLAYLIST", playlistId);
  },
  togglePostLike({ commit }, postId) {
    commit("TOGGLE_POST_LIKE", postId);
  },
  addPostComment({ commit }, payload) {
    commit("ADD_POST_COMMENT", payload);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
