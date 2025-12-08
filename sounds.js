// sounds.js
import { Audio } from "expo-av";

let workSound;
let breakSound;

async function loadIfNeeded() {
  if (!workSound) {
    const { sound } = await Audio.Sound.createAsync(
      require("./assets/HEE.mp3")   // make sure this file exists
    );
    workSound = sound;
  }

  if (!breakSound) {
    const { sound } = await Audio.Sound.createAsync(
      require("./assets/CHIME.mp3") // make sure this file exists
    );
    breakSound = sound;
  }
}

export async function playWorkStart() {
  try {
    await loadIfNeeded();
    if (workSound) {
      await workSound.replayAsync();
    }
  } catch (e) {
    console.log("playWorkStart error:", e);
  }
}

export async function playBreakEnd() {
  try {
    await loadIfNeeded();
    if (breakSound) {
      await breakSound.replayAsync();
    }
  } catch (e) {
    console.log("playBreakEnd error:", e);
  }
}
