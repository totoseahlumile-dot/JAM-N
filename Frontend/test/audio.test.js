import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolveAudioUrl } from "../src/services/audio.js";

test("seeded artist recordings resolve to bundled audio", () => {
  const examples = [
    ["A-Reece", "Activity"],
    ["Alice Phoebe Lou", "Only When I"],
    ["Bongeziwe Mabandla", "salanabani"],
    ["Bongeziwe Mabandla", "jikeleza"],
    ["Hunter Rose", "Fine Wine"],
    ["Internet Girl", "PULL UP"],
    ["Moonchild Sanelly", "Falling"],
    ["The Parlotones", "Colourful"],
    ["Usimamane", "Soft"],
    ["Usimamane", "Star"],
    ["Vigro Deep", "Nomsa"],
    ["Will Linley", "Quite Like Us..."],
  ];
  for (const [artist, title] of examples) {
    const url = resolveAudioUrl(null, artist, title);
    assert.ok(url, `${artist} - ${title}`);
    const path = fileURLToPath(new URL(`../public${decodeURIComponent(url)}`, import.meta.url));
    assert.ok(existsSync(path), `missing ${path}`);
  }
});

test("legacy demo audio paths and unknown uploads are handled safely", () => {
  assert.equal(resolveAudioUrl("/audio/a-reece-activity.mp3", "A-Reece", "Activity"), "/audio/songs/a-reece-activity.mp3");
  assert.equal(resolveAudioUrl(null, "Unknown artist", "Unknown title"), null);
  assert.equal(resolveAudioUrl("https://cdn.example.test/song.mp3", "Artist", "Song"), "https://cdn.example.test/song.mp3");
});
