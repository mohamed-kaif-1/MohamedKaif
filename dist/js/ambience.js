/* ==========================================================================
   BACKGROUND AUDIO AMBIENCE MODULE
   Low-volume background audio with safe autoplay, smooth fading,
   continuous looping, page visibility management, and session state.
   ========================================================================== */

const TARGET_VOLUME = 0.07;
const INITIAL_FADE_DURATION = 3200; // 3.2s smooth initial entrance fade
const TOGGLE_FADE_DURATION = 600;   // 600ms responsive toggle fade
const AUDIO_SRC = new URL("assets/audio/binks_sake.mp3", document.baseURI).href;

// Shared singleton Audio instance
let sharedAudio = null;
let fadeAnimationId = null;

function getSharedAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.src = AUDIO_SRC;
    sharedAudio.loop = true;
    sharedAudio.preload = "auto";
    sharedAudio.volume = 0;
  }
  return sharedAudio;
}

function cancelFade() {
  if (fadeAnimationId) {
    cancelAnimationFrame(fadeAnimationId);
    fadeAnimationId = null;
  }
}

function fadeVolume(audio, targetVolume, duration, onComplete) {
  cancelFade();
  const startVolume = audio.volume;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth ease-out curve
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = startVolume + (targetVolume - startVolume) * ease;
    audio.volume = Math.max(0, Math.min(1, current));

    if (progress < 1) {
      fadeAnimationId = requestAnimationFrame(tick);
    } else {
      audio.volume = Math.max(0, Math.min(1, targetVolume));
      fadeAnimationId = null;
      if (onComplete) onComplete();
    }
  }

  fadeAnimationId = requestAnimationFrame(tick);
}

export function GardenAmbience(button) {
  if (!button) return () => {};

  const audio = getSharedAudio();
  const events = new AbortController();
  let enabled = false;

  let preference = null;
  try {
    preference = sessionStorage.getItem("kaif-garden-sound");
  } catch {}

  function remember(value) {
    preference = value ? "on" : "off";
    try {
      sessionStorage.setItem("kaif-garden-sound", preference);
    } catch {}
  }

  function updateButton() {
    button.textContent = enabled ? "Sound on" : "Sound off";
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute(
      "aria-label",
      enabled ? "Mute background audio" : "Enable background audio"
    );
  }

  // Initialize button state
  updateButton();

  // Play with smooth fade-in
  async function startPlayback(duration = TOGGLE_FADE_DURATION) {
    try {
      if (audio.paused) {
        audio.volume = 0;
        await audio.play();
      }
      enabled = true;
      updateButton();
      fadeVolume(audio, TARGET_VOLUME, duration);
    } catch {
      enabled = false;
      updateButton();
    }
  }

  // Pause with smooth fade-out
  function stopPlayback(duration = TOGGLE_FADE_DURATION) {
    enabled = false;
    updateButton();
    fadeVolume(audio, 0, duration, () => {
      audio.pause();
    });
  }

  // Manual button toggle handler
  button.addEventListener(
    "click",
    () => {
      if (enabled) {
        remember(false);
        stopPlayback(TOGGLE_FADE_DURATION);
      } else {
        remember(true);
        startPlayback(TOGGLE_FADE_DURATION);
      }
    },
    { signal: events.signal }
  );

  // Safe first user interaction unlock
  const unlockAudio = (event) => {
    // Ignore clicks directly on the toggle button itself (handled by click listener)
    if (event.target.closest && event.target.closest(".ambient-toggle")) return;

    // If user explicitly muted in this session, do not auto-play
    if (preference === "off" || enabled) return;

    // Start with gentle 3.2s initial fade
    startPlayback(INITIAL_FADE_DURATION);
  };

  // Listen for first interaction
  document.addEventListener("pointerdown", unlockAudio, {
    signal: events.signal,
    passive: true,
  });
  document.addEventListener("keydown", unlockAudio, { signal: events.signal });
  window.addEventListener("scroll", unlockAudio, {
    signal: events.signal,
    passive: true,
    once: true,
  });

  // Page visibility management
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        if (enabled && !audio.paused) {
          // Temporarily mute/pause without overriding user preference
          fadeVolume(audio, 0, 400, () => {
            audio.pause();
          });
        }
      } else {
        // Only resume if user had sound enabled and preference isn't "off"
        if (enabled && preference !== "off") {
          audio.volume = 0;
          audio.play()
            .then(() => {
              fadeVolume(audio, TARGET_VOLUME, TOGGLE_FADE_DURATION);
            })
            .catch(() => {});
        }
      }
    },
    { signal: events.signal }
  );

  return () => {
    events.abort();
    cancelFade();
    if (sharedAudio) {
      sharedAudio.pause();
    }
  };
}
