import { apiRequest } from "../services/api";

const state = () => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  likedTrackIds: JSON.parse(localStorage.getItem("liked_track_ids")) || [],
});

const getters = {
  currentUser: (state) => state.user,
  isLoggedIn: (state) => state.isAuthenticated && !!state.user && !!state.accessToken,
  accessToken: (state) => state.accessToken,
  isArtistOrProducer: (state) => {
    return state.user?.role === "artist" || state.user?.role === "admin";
  },
  isLiked: (state) => (trackId) => {
    return state.likedTrackIds.some((id) => String(id) === String(trackId));
  },
  likedSongIds: (state) => state.likedTrackIds || [],
  isFollowing: (state) => (artistId) => {
    return (
      state.user?.followingList?.some((artist) => String(artist.id) === String(artistId)) ??
      false
    );
  },
  userUploads: (state) => state.user?.uploads ?? [],
  userPlaylists: (state) => state.user?.playlists ?? [],
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
  },
  SET_SESSION(state, { user, accessToken }) {
    state.user = {
      ...user,
      name: user.display_name || user.username,
      roles: [user.role],
      followingList: [],
      uploads: [],
      playlists: [],
    };
    state.accessToken = accessToken;
    state.isAuthenticated = true;
  },
  SET_FOLLOWING(state, artists) {
    if (state.user) state.user.followingList = artists.map((artist) => ({
      id: artist.id, name: artist.stageName, handle: artist.stageName.toLowerCase().replace(/\s+/g, "_"), image: null,
    }));
  },
  LOGOUT(state) {
    state.user = null;
    state.accessToken = null;
    state.isAuthenticated = false;
  },
  TOGGLE_LIKE(state, trackId) {
    const index = state.likedTrackIds.findIndex((id) => String(id) === String(trackId));
    if (index === -1) {
      state.likedTrackIds.push(String(trackId));
    } else {
      state.likedTrackIds.splice(index, 1);
    }
    localStorage.setItem(
      "liked_track_ids",
      JSON.stringify(state.likedTrackIds),
    );
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
  async login({ commit }, credentials) {
    const session = await apiRequest("/api/auth/login", { method: "POST", body: credentials });
    commit("SET_SESSION", session);
    try {
      const { artists } = await apiRequest("/api/follows", { token: session.accessToken });
      commit("SET_FOLLOWING", artists);
    } catch { /* Login still succeeds if follows are temporarily unavailable. */ }
    return session;
  },
  async register({ commit }, details) {
    const session = await apiRequest("/api/auth/register", { method: "POST", body: details });
    commit("SET_SESSION", session);
    return session;
  },
  async restoreSession({ commit }) {
    try {
      const session = await apiRequest("/api/auth/refresh", { method: "POST" });
      commit("SET_SESSION", session);
      try {
        const { artists } = await apiRequest("/api/follows", { token: session.accessToken });
        commit("SET_FOLLOWING", artists);
      } catch { /* Session restoration is independent of the follow list. */ }
      return session;
    } catch {
      commit("LOGOUT");
      commit("subscription/SET_PLAN", "free", { root: true });
      return null;
    }
  },
  async toggleFollowArtist({ state, commit }, artistId) {
    if (!state.accessToken) throw new Error("Sign in to follow artists.");
    const following = state.user?.followingList?.some((artist) => String(artist.id) === String(artistId));
    await apiRequest(`/api/artists/${encodeURIComponent(artistId)}/follow`, {
      method: following ? "DELETE" : "PUT", token: state.accessToken,
    });
    const { artists } = await apiRequest("/api/follows", { token: state.accessToken });
    commit("SET_FOLLOWING", artists);
  },
  async logout({ commit }) {
    try { await apiRequest("/api/auth/logout", { method: "POST" }); } catch { /* Clear local auth even when offline. */ }
    commit("LOGOUT");
    commit("subscription/SET_PLAN", "free", { root: true });
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
