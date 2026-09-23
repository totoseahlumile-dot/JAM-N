<template>
  <div class="feed-page">
    <header class="feed-toolbar">
      <div class="toolbar-inner">
        <h1>FEED</h1>
        <div class="filter-group" aria-label="Feed filters">
          <button v-for="filter in filters" :key="filter" class="filter-chip" :class="{ active: activeFilter === filter }" :aria-pressed="activeFilter === filter" @click="activeFilter = filter">{{ activeFilter === filter ? '✓ ' : '' }}{{ filter }}</button>
        </div>
        <label class="feed-search"><span class="sr-only">Search feed</span><input v-model="searchQuery" type="search" placeholder="Finding something new?" /><span aria-hidden="true">⌕</span></label>
        <div class="toolbar-actions"><button class="outline-btn" :aria-pressed="showConnections" @click="showConnections = !showConnections">Connections</button><button class="primary-btn" @click="openComposer">+ Post</button></div>
      </div>
    </header>

    <div class="feed-layout" :class="{ 'sidebar-open': showConnections }">
      <main class="feed-list">
        <p v-if="actionError" class="state error" role="alert">{{ actionError }}</p>
        <p v-if="loading" class="state">Loading your feed…</p>
        <p v-else-if="error" class="state error" role="alert">{{ error }}</p>
        <p v-if="!loading && !filteredItems.length" class="state">No matching posts found.</p>
        <article v-for="item in filteredItems" :key="`${item.category}-${item.id}`" class="feed-card">
          <img v-if="item.image" class="card-cover" :src="item.image" :alt="`${item.title} artwork`" />
          <div class="card-content">
            <div class="card-meta"><span>{{ item.category }}</span><span v-if="item.badge" class="badge">{{ item.badge }}</span></div>
            <h2>{{ item.title }}</h2><p class="artist-line">By {{ item.artist }}</p>
            <p v-if="item.description" class="description">{{ item.description }}</p>
            <div class="card-actions">
              <button v-if="item.category === 'Posts'" :disabled="busyPostId === item.id" @click="toggleLike(item)">{{ item.likedByMe ? '♥ Liked' : '♡ Like' }} · {{ item.likeCount || 0 }}</button>
              <span v-if="item.category === 'Posts'">💬 {{ item.commentCount || 0 }}</span>
              <button v-if="item.category === 'Songs' || item.category === 'Beats'" :disabled="!item.audioUrl" @click="playItem(item)">▶ Play {{ item.category === 'Songs' ? 'song' : 'beat' }}</button>
              <button v-if="item.category === 'Songs'" @click="router.push(`/track/${item.id}`)">Comments</button>
            </div>
          </div>
        </article>
      </main>

      <aside v-if="showConnections" class="connections-sidebar">
        <section><div class="sidebar-heading"><h2>Your Connections ({{ connections.length }})</h2><button @click="openList('connections')">See All</button></div><p v-if="!connections.length" class="empty-sidebar">Follow artists to see them here.</p><div v-for="artist in connections.slice(0, 4)" :key="artist.id" class="person-card"><div class="person-avatar">{{ artist.name?.charAt(0) }}</div><div><strong>{{ artist.name }}</strong><small>Artist</small></div></div></section>
        <section><div class="sidebar-heading"><h2>Follow Suggestions</h2><button @click="openList('suggestions')">See All</button></div><div v-for="artist in suggestions.slice(0, 4)" :key="artist.id" class="person-card"><div class="person-avatar">{{ artist.name?.charAt(0) }}</div><div class="person-info"><strong>{{ artist.name }}</strong><small>{{ artist.genre?.join?.(', ') || 'Artist' }}</small></div><button class="follow-btn" :disabled="busyArtistId === artist.id" @click="toggleFollow(artist)">+ Follow</button></div></section>
      </aside>
    </div>

    <div v-if="showComposer" class="dialog-backdrop" @click.self="showComposer = false"><form class="dialog" @submit.prevent="submitPost"><div class="dialog-header"><h2>Create a post</h2><button type="button" aria-label="Close" @click="showComposer = false">×</button></div><p>Share an update with the JAM’N community.</p><textarea v-model="draft" maxlength="1000" rows="5" placeholder="What have you been making or listening to?" required></textarea><p v-if="actionError" class="error" role="alert">{{ actionError }}</p><div class="dialog-actions"><button type="button" class="outline-btn" @click="showComposer = false">Cancel</button><button type="submit" class="primary-btn" :disabled="!draft.trim() || saving">{{ saving ? 'Posting…' : 'Post update' }}</button></div></form></div>
    <div v-if="showList" class="dialog-backdrop" @click.self="showList = false"><div class="dialog"><div class="dialog-header"><h2>{{ listType === 'connections' ? 'Your Connections' : 'Follow Suggestions' }}</h2><button type="button" aria-label="Close" @click="showList = false">×</button></div><div v-for="artist in listType === 'connections' ? connections : suggestions" :key="artist.id" class="person-card"><div class="person-avatar">{{ artist.name?.charAt(0) }}</div><strong class="person-info">{{ artist.name }}</strong><button v-if="listType === 'suggestions'" class="follow-btn" :disabled="busyArtistId === artist.id" @click="toggleFollow(artist)">+ Follow</button></div><p v-if="listType === 'connections' && !connections.length">No connections yet.</p></div></div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { API_BASE_URL, apiRequest } from '@/services/api'

const store = useStore()
const router = useRouter()
const filters = ['All', 'Songs', 'Beats', 'Posts']
const activeFilter = ref('All')
const searchQuery = ref('')
const showConnections = ref(true)
const showComposer = ref(false)
const showList = ref(false)
const listType = ref('connections')
const draft = ref('')
const saving = ref(false)
const busyPostId = ref(null)
const busyArtistId = ref(null)
const actionError = ref('')
const token = computed(() => store.getters['auth/accessToken'])
const posts = computed(() => store.getters['content/posts'] || [])
const tracks = computed(() => store.getters['content/popularTracks'] || [])
const beats = computed(() => store.getters['beats/allBeats'] || [])
const artists = computed(() => store.getters['artists/allArtists'] || [])
const connections = computed(() => store.state.auth.user?.followingList || [])
const suggestions = computed(() => artists.value.filter((artist) => !store.getters['auth/isFollowing'](artist.id)))
const loading = computed(() => ['posts', 'tracks'].some((resource) => store.getters['content/isLoading'](resource)))
const error = computed(() => store.getters['content/error']('posts') || store.getters['content/error']('tracks'))
const mediaUrl = (url) => url?.startsWith('/api/') ? `${API_BASE_URL}${url}` : url

const items = computed(() => [
  ...posts.value.map((post) => ({ ...post, category: 'Posts', title: post.caption?.slice(0, 70) || 'Community update', artist: post.authorDisplayName || post.authorUsername, description: post.caption, image: post.mediaType === 'image' ? mediaUrl(post.mediaUrl) : null, badge: 'COMMUNITY' })),
  ...tracks.value.slice(0, 8).map((track) => ({ ...track, category: 'Songs', title: track.title, artist: track.artistName || track.artist, image: track.image || track.coverArt, badge: 'LISTEN NOW' })),
  ...beats.value.slice(0, 4).map((beat) => ({ ...beat, category: 'Beats', title: beat.title, artist: beat.artist || beat.producer, image: beat.coverArt, badge: 'BEAT STORE' })),
])
const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return items.value.filter((item) => (activeFilter.value === 'All' || item.category === activeFilter.value)
    && (!query || [item.title, item.artist, item.description].some((value) => value?.toLowerCase().includes(query))))
})

watch(token, (value) => { store.dispatch('content/fetchPosts', { token: value }).catch(() => {}) }, { immediate: true })
onMounted(() => { store.dispatch('content/fetchTracks').catch(() => {}); store.dispatch('artists/fetchArtists').catch(() => {}) })
function openComposer() { if (!token.value) { router.push('/login'); return }; actionError.value = ''; showComposer.value = true }
function openList(type) { listType.value = type; showList.value = true }
function playItem(item) { if (item.audioUrl) store.dispatch('player/playTrack', { ...item, coverArt: item.image || item.coverArt }) }
async function toggleFollow(artist) {
  if (!token.value) { router.push('/login'); return }
  busyArtistId.value = artist.id; actionError.value = ''
  try { await store.dispatch('auth/toggleFollowArtist', artist.id) }
  catch (cause) { actionError.value = cause.message }
  finally { busyArtistId.value = null }
}
async function toggleLike(post) {
  if (!token.value) { router.push('/login'); return }
  busyPostId.value = post.id; actionError.value = ''
  try {
    await apiRequest(`/api/posts/${post.id}/like`, { method: post.likedByMe ? 'DELETE' : 'PUT', token: token.value })
    await store.dispatch('content/fetchPosts', { token: token.value })
  } catch (cause) { actionError.value = cause.message }
  finally { busyPostId.value = null }
}
async function submitPost() {
  if (!draft.value.trim()) return
  saving.value = true; actionError.value = ''
  try {
    await apiRequest('/api/posts', { method: 'POST', token: token.value, body: { caption: draft.value.trim() } })
    draft.value = ''; showComposer.value = false
    await store.dispatch('content/fetchPosts', { token: token.value })
  } catch (cause) { actionError.value = cause.message }
  finally { saving.value = false }
}
</script>

<style scoped>
.feed-page { min-height:100vh; background:var(--bg-main,#faf9fc); color:var(--text-main,#24212a); }
.feed-toolbar { padding:20px 32px; border-bottom:1px solid var(--border-subtle,#e7e0ed); background:var(--bg-surface,#fff); }
.toolbar-inner { max-width:1400px; margin:auto; display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
.toolbar-inner h1 { font-size:26px; letter-spacing:.04em; }.filter-group,.toolbar-actions { display:flex; gap:8px; }
.filter-chip,.outline-btn,.primary-btn { padding:10px 16px; border-radius:100px; font:inherit; font-weight:700; cursor:pointer; }
.filter-chip { border:1px solid #e2d8eb; background:#fff; }.filter-chip.active { border-color:#b996d5; background:#b996d5; color:#1c1424; }
.outline-btn { border:1px solid #b996d5; background:#fff; color:#6f488d; }.primary-btn { border:1px solid #aa79c9; background:#aa79c9; color:#21142a; }
.feed-search { margin-left:auto; display:flex; align-items:center; min-width:210px; padding:0 12px; border:1px solid #e2d8eb; border-radius:100px; }.feed-search input { width:100%; padding:10px 0; border:0; background:none; outline:none; font:inherit; }.feed-search span:last-child { font-size:22px; }
.feed-layout { max-width:1400px; margin:auto; padding:30px 32px 120px; display:grid; grid-template-columns:minmax(0,1fr); gap:28px; }.feed-layout.sidebar-open { grid-template-columns:minmax(0,1fr) 300px; }
.feed-list { display:grid; align-content:start; gap:22px; }.feed-card { overflow:hidden; border:1px solid #e4ddea; border-radius:16px; background:#fff; box-shadow:0 5px 18px #3113420a; }.card-cover { display:block; width:100%; height:min(36vw,330px); min-height:180px; object-fit:cover; background:#21152b; }.card-content { padding:22px; }.card-meta { display:flex; align-items:center; gap:10px; color:#8d5cb0; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }.badge { padding:4px 8px; border-radius:6px; background:#f4e9fd; }.card-content h2 { margin:8px 0 4px; font-size:24px; }.artist-line { color:#6d6573; }.description { margin-top:14px; white-space:pre-wrap; }.card-actions { display:flex; align-items:center; gap:14px; margin-top:20px; padding-top:16px; border-top:1px solid #eee8f2; }.card-actions button { border:0; background:none; color:#8055a2; font:inherit; font-weight:700; cursor:pointer; }.card-actions button:disabled { opacity:.5; }.connections-sidebar { display:grid; align-content:start; gap:28px; border-left:1px solid #e7e0ed; padding-left:22px; }.sidebar-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:12px; }.sidebar-heading h2 { font-size:17px; }.sidebar-heading button { border:0; background:none; color:#8658a8; cursor:pointer; }.person-card { display:flex; align-items:center; gap:10px; min-width:0; margin-bottom:8px; padding:10px; border:1px solid #e8e2ed; border-radius:12px; background:#fff; }.person-avatar { flex:0 0 36px; height:36px; display:grid; place-items:center; border-radius:50%; background:#caa7e3; font-weight:800; }.person-card strong,.person-card small { display:block; }.person-card small { color:#716a77; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }.person-info { flex:1; min-width:0; }.follow-btn { flex:0 0 auto; padding:7px 10px; border:0; border-radius:8px; background:#e7d4f5; cursor:pointer; }.empty-sidebar,.state { padding:26px; color:#726b78; text-align:center; }.error { color:#ac2e48; }
.dialog-backdrop { position:fixed; inset:0; z-index:2000; display:grid; place-items:center; padding:20px; background:#1d122ba8; }.dialog { width:min(500px,100%); max-height:85vh; overflow:auto; padding:24px; border-radius:18px; background:#fff; }.dialog-header { display:flex; justify-content:space-between; align-items:center; }.dialog-header button { border:0; background:none; font-size:28px; cursor:pointer; }.dialog p { margin:12px 0; }.dialog textarea { width:100%; padding:12px; border:1px solid #ddd2e6; border-radius:10px; font:inherit; resize:vertical; }.dialog-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:14px; }.sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
@media(max-width:980px) { .feed-layout.sidebar-open { grid-template-columns:minmax(0,1fr); }.connections-sidebar { border-left:0; padding-left:0; grid-row:1; }.feed-search { margin-left:0; } }
@media(max-width:620px) { .feed-toolbar { padding:18px; }.feed-layout { padding:20px 18px 115px; }.filter-group { width:100%; overflow-x:auto; }.filter-chip { flex:0 0 auto; }.feed-search { flex:1; }.connections-sidebar { grid-row:auto; }.card-cover { height:210px; } }
</style>
