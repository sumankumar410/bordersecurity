// Tactical Web Audio API Synthesizer
export function playAlertTone(type = "alarm") {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "alarm") {
      // High-urgency alert siren
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.12);
      osc.frequency.linearRampToValueAtTime(800, now + 0.25);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.38);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // Confirmation chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1760, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    // Non-blocking fallback for browsers blocking audio before user interaction
  }
}
