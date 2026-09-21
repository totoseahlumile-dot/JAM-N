<template>
  <main class="feed-view">
    <header><h1>Community feed</h1><p>Latest posts from JAM'N listeners and artists.</p></header>
    <p v-if="loading" class="state">Loading posts…</p>
    <p v-else-if="error" class="state error">{{ error }}</p>
    <p v-if="actionError" class="state error" role="alert">{{ actionError }}</p>
    <section v-else-if="posts.length" class="feed-list">
      <article v-for="post in posts" :key="post.id" class="post-card">
        <div class="author"><div class="avatar">{{ post.authorUsername?.[0]?.toUpperCase() || "J" }}</div><div><strong>@{{ post.authorUsername }}</strong><time>{{ formatDate(post.createdAt) }}</time></div></div>
        <p v-if="post.caption" class="caption">{{ post.caption }}</p>
        <img v-if="post.mediaUrl && post.mediaType === 'image'" :src="post.mediaUrl" :alt="post.caption || 'Post image'" class="media" />
        <footer><button type="button" :disabled="busyPostId === post.id" @click="toggleLike(post)">{{ post.likedByMe ? '♥ Liked' : '♡ Like' }} · {{ post.likeCount }}</button><span>💬 {{ post.commentCount }}</span></footer>
      </article>
    </section>
    <p v-else class="state">There are no posts yet.</p>
  </main>
</template>
<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { apiRequest } from "@/services/api";
const store = useStore();
const router = useRouter();
const busyPostId = ref(null);
const actionError = ref("");
const posts = computed(() => store.getters["content/posts"] || []);
const loading = computed(() => store.getters["content/isLoading"]("posts"));
const error = computed(() => store.getters["content/error"]("posts"));
const formatDate = (value) => new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
watch(() => store.getters["auth/accessToken"], (token) => {
  store.dispatch("content/fetchPosts", { token }).catch(() => {});
}, { immediate: true });
async function toggleLike(post) {
  if (!store.getters["auth/isLoggedIn"]) { router.push("/login"); return; }
  busyPostId.value = post.id;
  actionError.value = "";
  const id = String(post.id);
  const liked = Boolean(post.likedByMe);
  try {
    await apiRequest(`/api/posts/${id}/like`, { method: liked ? "DELETE" : "PUT", token: store.getters["auth/accessToken"] });
    await store.dispatch("content/fetchPosts", { token: store.getters["auth/accessToken"] });
  } catch (cause) { actionError.value = cause.message; }
  finally { busyPostId.value = null; }
}
</script>
<style scoped>
.post-card footer button{border:0;background:transparent;color:inherit;font:inherit;cursor:pointer}.post-card footer button:disabled{opacity:.6;cursor:wait}
.feed-view{max-width:760px;margin:auto;padding:2rem}.feed-view header{margin-bottom:2rem}.feed-view header p,time{color:var(--text-muted)}.feed-list{display:grid;gap:1rem}.post-card{padding:1.25rem;border:1px solid var(--border-subtle);border-radius:16px;background:var(--bg-surface)}.author{display:flex;align-items:center;gap:.75rem}.author time{display:block;font-size:.8rem;margin-top:.15rem}.avatar{width:42px;height:42px;display:grid;place-items:center;border-radius:50%;background:var(--primary-wisteria);font-weight:800}.caption{margin:1rem 0;white-space:pre-wrap}.media{width:100%;max-height:520px;object-fit:cover;border-radius:12px}.post-card footer{display:flex;gap:1.25rem;padding-top:1rem;color:var(--text-muted)}.state{text-align:center;padding:3rem}.error{color:#a52222}
</style>
