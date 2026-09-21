import { useUploadLimit } from "@/composables/useUploadLimit";

// Pass 'songs' or 'beats' to it
const { canUpload, counterLabel, limitMessage, recordUpload, goToUpgrade } =
  useUploadLimit("beats");

function handleUpload() {
  if (!canUpload.value) {
    alert(limitMessage.value);
    goToUpgrade();
    return;
  }

  // ... run your upload logic ...

  // Once successful, increment the counter:
  recordUpload();
}
