import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { formatLimit } from "@/config/plans";

// Usage: const { canUpload, limitMessage, counterLabel, recordUpload, goToUpgrade } = useUploadLimit("beats");
// `type` is "songs" or "beats".
export function useUploadLimit(type) {
  const store = useStore();
  const router = useRouter();

  const singular = type === "songs" ? "song" : "beat";

  const canUpload = computed(() =>
    store.getters["subscription/canUpload"](type),
  );
  const used = computed(() => store.getters["subscription/usageFor"](type));
  const limit = computed(() => store.getters["subscription/limitFor"](type));
  const planName = computed(() => store.getters["subscription/plan"].name);

  // e.g. "3 / 5 song uploads used"
  const counterLabel = computed(
    () =>
      `${used.value} / ${formatLimit(limit.value)} ${singular} uploads used`,
  );

  const limitMessage = computed(
    () =>
      `You've used all ${limit.value} ${singular} uploads on the ${planName.value} plan. Upgrade to upload more.`,
  );

  // Call this after the upload succeeds.
  function recordUpload() {
    return store.dispatch("subscription/recordUpload", type);
  }

  // Change the path if your subscription route is different.
  function goToUpgrade() {
    router.push("/subscription");
  }

  return {
    canUpload,
    used,
    limit,
    planName,
    counterLabel,
    limitMessage,
    recordUpload,
    goToUpgrade,
  };
}
