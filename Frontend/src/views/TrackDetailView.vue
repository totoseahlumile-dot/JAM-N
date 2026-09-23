<template>
  <main class="track-page">
    <p v-if="loading" class="status">Loading track and comments…</p>
    <p v-else-if="error" class="status error" role="alert">{{ error }}</p>
    <template v-else-if="track">
      <header class="track-hero">
        <div class="cover"><img v-if="track.coverArt" :src="track.coverArt" :alt="`${track.title} artwork`" /><span v-else aria-hidden="true">♪</span></div>
        <div><p class="eyebrow">THE CONVERSATION</p><h1>{{ track.title }}</h1><p>{{ track.artistName }}</p><p class="plays">{{ Number(track.streamCount || 0).toLocaleString() }} plays</p>
          <button v-if="track.audioUrl" class="play-button" @click="playTrack">▶ Play track</button>
        </div>
      </header>
      <section class="comments-panel">
        <div class="comments-heading"><div><p class="eyebrow">THE CONVERSATION</p><h2>Comments <small>{{ total }}</small></h2></div><span>Share what this track means to you.</span></div>
        <button v-if="!showComposer" class="add-comment" @click="openComposer">✎ Add your comment</button>
        <form v-else class="composer" @submit.prevent="submitComment">
          <label for="new-comment">Add your comment</label>
          <textarea id="new-comment" ref="commentInput" v-model="draft" maxlength="1000" placeholder="What stood out to you?" rows="3"></textarea>
          <div class="composer-bottom"><button type="button" class="emoji-toggle" @click="showEmojiPicker = !showEmojiPicker" aria-label="Choose an emoji">☺ Emoji</button><label><input v-model="attachTime" type="checkbox" /> Attach current time</label><span>{{ draft.length }}/1000</span><button type="button" @click="closeComposer">Cancel</button><button class="post-button" type="submit" :disabled="!draft.trim() || saving">{{ saving ? 'Posting…' : 'Post comment' }}</button></div>
          <div v-if="showEmojiPicker" class="emoji-picker"><button v-for="emoji in emojis" :key="emoji" type="button" @click="insertEmoji(emoji)">{{ emoji }}</button></div>
        </form>
        <p v-if="actionError" class="error" role="alert">{{ actionError }}</p>
        <div v-if="!comments.length" class="empty-comments">No comments yet. Start the conversation.</div>
        <article v-for="comment in comments" :key="comment.id" class="comment">
          <div class="avatar"><img v-if="comment.authorAvatarUrl" :src="imageUrl(comment.authorAvatarUrl)" :alt="`${comment.authorDisplayName || comment.authorUsername} profile picture`" /><span v-else>{{ (comment.authorDisplayName || comment.authorUsername || '?').charAt(0).toUpperCase() }}</span></div>
          <div class="comment-body"><div class="comment-meta"><strong>{{ comment.authorDisplayName || comment.authorUsername }}</strong><span>@{{ comment.authorUsername }}</span><time>{{ new Date(comment.createdAt).toLocaleString() }}</time></div>
            <template v-if="editingId === comment.id"><textarea v-model="editDraft" maxlength="1000" rows="2"></textarea><div class="comment-actions"><button @click="saveEdit(comment)">Save</button><button @click="editingId = null">Cancel</button></div></template>
            <template v-else><p><button v-if="comment.positionSeconds != null" class="timestamp" @click="seekTo(comment.positionSeconds)">{{ formatTime(comment.positionSeconds) }}</button> {{ comment.body }}</p><div v-if="canManage(comment)" class="comment-actions"><button @click="startEdit(comment)">Edit</button><button @click="deleteComment(comment)">Delete</button></div></template>
          </div>
        </article>
        <button v-if="comments.length < total" class="more-comments" @click="loadMore">Load more comments</button>
      </section>
    </template>
  </main>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { API_BASE_URL, apiRequest } from '@/services/api'
import { resolveAudioUrl } from '@/services/audio'

const route = useRoute()
const router = useRouter()
const store = useStore()
const track = ref(null)
const comments = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(true)
const error = ref('')
const actionError = ref('')
const showComposer = ref(false)
const showEmojiPicker = ref(false)
const draft = ref('')
const attachTime = ref(false)
const saving = ref(false)
const commentInput = ref(null)
const editingId = ref(null)
const editDraft = ref('')
const emojis = ['❤️', '🔥', '🎵', '🎧', '👏', '🙌', '😍', '✨', '💜', '😂']
const token = computed(() => store.getters['auth/accessToken'])
const currentUser = computed(() => store.getters['auth/currentUser'])
const path = computed(() => `/api/tracks/${route.params.id}/comments`)
const imageUrl = (url) => url?.startsWith('/api/') ? `${API_BASE_URL}${url}` : url

async function loadComments(nextPage = 1) {
  const result = await apiRequest(`${path.value}?page=${nextPage}`)
  comments.value = nextPage === 1 ? result.comments : [...comments.value, ...result.comments]
  total.value = result.total
  page.value = nextPage
}
async function loadTrack() {
  loading.value = true; error.value = ''; comments.value = []; showComposer.value = false
  try {
    const result = await apiRequest(`/api/tracks/${route.params.id}`)
    const artist = await apiRequest(`/api/artists/${result.track.artistId}`)
    const album = result.track.albumId ? await apiRequest(`/api/albums/${result.track.albumId}`).catch(() => null) : null
    const seededCover = store.state.player.queue?.find((item) =>
      item.title?.toLowerCase() === result.track.title?.toLowerCase()
      && item.artist?.toLowerCase() === artist.artist?.stageName?.toLowerCase()
    )?.coverArt
    const artistSlug = artist.artist?.stageName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    track.value = {
      ...result.track,
      artistName: artist.artist?.stageName || artist.artist?.name || 'Artist',
      audioUrl: resolveAudioUrl(result.track.audioUrl, artist.artist?.stageName, result.track.title),
      coverArt: imageUrl(result.track.coverUrl || album?.album?.coverUrl || seededCover || artist.artist?.avatarUrl || (artistSlug ? `/images/artists/${artistSlug}.jpg` : null)),
    }
    await loadComments()
  } catch (cause) { error.value = cause.message || 'Could not load this track.' }
  finally { loading.value = false }
}
watch(() => route.params.id, loadTrack, { immediate: true })
async function loadMore() { try { await loadComments(page.value + 1) } catch (cause) { actionError.value = cause.message } }
async function openComposer() {
  if (!token.value) { router.push('/login'); return }
  showComposer.value = true
  await nextTick()
  commentInput.value?.focus()
}
function closeComposer() { showComposer.value = false; showEmojiPicker.value = false; draft.value = ''; attachTime.value = false }
function insertEmoji(emoji) { draft.value += emoji; commentInput.value?.focus() }
function formatTime(seconds) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }
function seekTo(seconds) { store.commit('player/SEEK_TO', seconds) }
function playTrack() { store.dispatch('player/playTrack', { ...track.value, artist: track.value.artistName }) }
function canManage(comment) { return currentUser.value && (String(currentUser.value.id) === String(comment.userId) || currentUser.value.role === 'admin') }
async function submitComment() {
  if (!draft.value.trim()) return
  saving.value = true; actionError.value = ''
  try {
    await apiRequest(path.value, { method: 'POST', token: token.value, body: { body: draft.value.trim(), positionSeconds: attachTime.value ? Math.floor(store.state.player.currentTime || 0) : null } })
    closeComposer(); await loadComments()
  } catch (cause) { actionError.value = cause.message }
  finally { saving.value = false }
}
function startEdit(comment) { editingId.value = comment.id; editDraft.value = comment.body }
async function saveEdit(comment) {
  actionError.value = ''
  try { await apiRequest(`${path.value}/${comment.id}`, { method: 'PUT', token: token.value, body: { body: editDraft.value.trim(), positionSeconds: comment.positionSeconds } }); editingId.value = null; await loadComments() }
  catch (cause) { actionError.value = cause.message }
}
async function deleteComment(comment) {
  actionError.value = ''
  try { await apiRequest(`${path.value}/${comment.id}`, { method: 'DELETE', token: token.value }); await loadComments() }
  catch (cause) { actionError.value = cause.message }
}
</script>

<style scoped>
.track-page { max-width: 1100px; margin: 0 auto; padding: 32px 20px 120px; color: #202027; }
.track-hero { display: flex; align-items: center; gap: 24px; margin-bottom: 28px; }.cover { display: grid; place-items: center; width: 180px; height: 180px; flex: 0 0 180px; border-radius: 18px; overflow: hidden; background: linear-gradient(140deg, #543579, #d9b9e9); color: #fff; font-size: 72px; }.cover img, .avatar img { width: 100%; height: 100%; object-fit: cover; }.track-hero h1 { font-size: clamp(28px, 4vw, 46px); }.plays { margin: 12px 0; color: #776e80; }.play-button, .post-button { border: 0; border-radius: 100px; padding: 10px 20px; background: #af84d0; color: #16111c; font-weight: 700; cursor: pointer; }
.comments-panel { border: 1px solid #ded9e7; border-radius: 24px; background: #fff; padding: 30px 38px; }.eyebrow { font-size: 12px; font-weight: 800; letter-spacing: .16em; color: #a77bce; }.comments-heading { display: flex; justify-content: space-between; align-items: end; padding-bottom: 22px; border-bottom: 1px solid #e7e1ed; }.comments-heading h2 { font-size: 28px; }.comments-heading small { font-size: 15px; font-weight: 400; }.comments-heading > span { color: #777080; }.add-comment { margin: 20px 0; padding: 12px 18px; border: 1px solid #d7c0eb; border-radius: 12px; background: #f8f3fc; color: #6d399b; font-weight: 700; cursor: pointer; }.composer { margin: 22px 0; padding: 20px; border: 1px solid #e6ddec; border-radius: 16px; background: #fcfaff; }.composer label { font-weight: 700; }.composer textarea, .comment textarea { width: 100%; margin-top: 12px; padding: 12px; border: 1px solid #ddd5e7; border-radius: 10px; font: inherit; }.composer-bottom { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 12px; }.composer-bottom span { margin-left: auto; }.composer-bottom button:not(.post-button), .comment-actions button, .timestamp { border: 0; background: transparent; color: #9c67c5; cursor: pointer; }.emoji-picker button { margin: 8px 4px; border: 0; background: white; font-size: 22px; cursor: pointer; }.comment { display: flex; gap: 16px; padding: 22px 0; border-top: 1px solid #eee8f3; }.avatar { flex: 0 0 50px; height: 50px; display: grid; place-items: center; border-radius: 50%; background: #ad84d0; color: white; }.comment-body { flex: 1; min-width: 0; }.comment-meta { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }.comment-meta span, time { color: #766e7f; font-size: 13px; }time { margin-left: auto; }.comment-body p { margin: 8px 0; white-space: pre-wrap; }.comment-actions { display: flex; gap: 14px; }.empty-comments, .status { padding: 24px 0; color: #756d7d; }.error { color: #bb344e; }.more-comments { padding: 10px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; }
@media (max-width: 650px) { .track-hero { align-items: flex-start; }.cover { width: 90px; height: 90px; flex-basis: 90px; font-size: 36px; }.comments-panel { padding: 20px; }.comments-heading > span { display: none; } }
.avatar { width: 56px; height: 56px; flex: 0 0 56px; padding: 4px; overflow: hidden; border-radius: 50%; background: #eee3f7; }
.avatar img { display: block; width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.comment { align-items: flex-start; gap: 18px; }
</style>
