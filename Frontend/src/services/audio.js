// The seeded API catalog has metadata but no audio_url values yet. Match only
// the known demo recordings bundled with the frontend; never guess a URL for
// an arbitrary user upload.
const demoRecordings = {
  "a reece|activity": "a-reece-activity.mp3",
  "alice phoebe lou|only when i": "alice-phoebe-lou-only-when-i.mp3",
  "bongeziwe mabandla|jikeleza": "bongeziwe-jikeleza.mp3",
  "bongeziwe mabandla|salanabani": "bongeziwe-salanabani.mp3",
  "hunter rose|fine wine": "hunter-rose-fine-wine.mp3",
  "internet girl|pull up": "internet-girl-pull-up.mp3",
  "moonchild sanelly|falling": "moonchild-sanelly-falling.mp3",
  "the parlotones|colourful": "the-parlotones-colourful.mp3",
  "usimamane|soft": "Soft-usimamane.mp3",
  "usimamane|star": "Star-usimamane.mp3",
  "vigro deep|nomsa": "Vigro Deep, Freddy K - Nomsa.mp3",
  "will linley|quite like us": "Quite Like Us-will-linley.mp3",
};

const keyPart = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function resolveAudioUrl(audioUrl, artist, title) {
  if (audioUrl?.startsWith("/audio/") && !audioUrl.startsWith("/audio/beats/") && !audioUrl.startsWith("/audio/songs/")) {
    return audioUrl.replace("/audio/", "/audio/songs/");
  }
  if (audioUrl) return audioUrl;
  const file = demoRecordings[`${keyPart(artist)}|${keyPart(title)}`];
  return file ? `/audio/songs/${encodeURIComponent(file)}` : null;
}
