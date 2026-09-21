import { apiRequest } from "../services/api";
import { resolveAudioUrl } from "../services/audio";

const state = () => ({ tracks: [], events: [], posts: [], loading: {}, errors: {} });
const mutations = {
  SET_RESOURCE(state, { resource, value }) { state[resource] = value; },
  SET_LOADING(state, { resource, value }) { state.loading = { ...state.loading, [resource]: value }; },
  SET_ERROR(state, { resource, value }) { state.errors = { ...state.errors, [resource]: value }; }
};
const load = (resource, request, select) => async ({ commit }, payload) => {
  commit("SET_LOADING", { resource, value: true }); commit("SET_ERROR", { resource, value: null });
  try { const value = select(await request(payload)); commit("SET_RESOURCE", { resource, value }); return value; }
  catch (error) { commit("SET_ERROR", { resource, value: error.message }); throw error; }
  finally { commit("SET_LOADING", { resource, value: false }); }
};
const actions = {
  fetchTracks: load("tracks", () => apiRequest("/api/tracks?limit=100"), (body) => body.tracks.map((track) => ({
    ...track,
    artist: track.artistName,
    audioUrl: resolveAudioUrl(track.audioUrl, track.artistName, track.title),
    image: `/images/artists/${track.artistName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.jpg`
  }))),
  fetchEvents: load("events", () => apiRequest("/api/events?upcoming=true&limit=100"), (body) => body.events),
  fetchPosts: load("posts", ({ token } = {}) => apiRequest("/api/posts?limit=50", { token }), (body) => body.posts)
};
const getters = {
  popularTracks: (state) => [...state.tracks].sort((a, b) => Number(b.streamCount) - Number(a.streamCount)),
  events: (state) => state.events, posts: (state) => state.posts,
  isLoading: (state) => (resource) => Boolean(state.loading[resource]),
  error: (state) => (resource) => state.errors[resource] || null
};
export default { namespaced: true, state, mutations, actions, getters };
