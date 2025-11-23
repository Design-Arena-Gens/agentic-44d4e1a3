"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SceneIllustration, type SceneKey } from "./components/SceneIllustration";

type Scene = {
  id: number;
  key: SceneKey;
  title: string;
  duration: number;
  voiceLine: string;
  sensation: string;
};

type SceneCue = Scene & {
  start: number;
  end: number;
};

type AmbientNodes = {
  context: AudioContext;
  baseOsc: OscillatorNode;
  noiseSource: AudioBufferSourceNode;
  lfo: OscillatorNode;
  masterGain: GainNode;
  noiseGain: GainNode;
  lfoGain: GainNode;
};

const SCENES: Scene[] = [
  {
    id: 0,
    key: "hallway",
    title: "The Hallway Breathes",
    duration: 10,
    voiceLine:
      "The hallway to room two-thirteen stretches out longer than I remember. Every step I take echoes back twice, as if something is pacing in sync behind me.",
    sensation: "Footsteps echo around you.",
  },
  {
    id: 1,
    key: "doorThreshold",
    title: "Key in the Lock",
    duration: 10,
    voiceLine:
      "My hand shakes on the brass key. I whisper the number on the plaque—two, one, three—and the door exhales a warm breath of stale perfume and something metallic.",
    sensation: "A warm draft slips past the door.",
  },
  {
    id: 2,
    key: "roomInterior",
    title: "Lights That Won’t Stay",
    duration: 10,
    voiceLine:
      "Inside, the lamp flickers an apology. The bed is made too neatly, as if someone is lying very still beneath the covers, waiting for me to notice.",
    sensation: "The light flickers like a heartbeat.",
  },
  {
    id: 3,
    key: "mirror",
    title: "Eyes in the Glass",
    duration: 10,
    voiceLine:
      "I set my bag down and the mirror ripples. A face leans in from behind my reflection. Its eyes are mine, but hollowed out like someone scooped the color from them.",
    sensation: "The mirror surface bends inward.",
  },
  {
    id: 4,
    key: "whispers",
    title: "Whispers in the Vent",
    duration: 10,
    voiceLine:
      "The vent above the headboard vibrates with whispers. They breathe my name, promise the room has been waiting all night, that I never really checked out.",
    sensation: "Air vibrates with hushed voices.",
  },
  {
    id: 5,
    key: "finale",
    title: "Room 213 Takes Me Back",
    duration: 10,
    voiceLine:
      "The lamp dies. In the dark, the mattress sighs and I feel the weight of someone settling beside me. I can’t move. The last thing I see is the door closing itself.",
    sensation: "Something settles into the mattress.",
  },
];

const SPEECH_OFFSET_SECONDS = 0.4;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const formatTimestamp = (seconds: number) => {
  const whole = Math.floor(seconds);
  const mm = Math.floor(whole / 60)
    .toString()
    .padStart(2, "0");
  const ss = (whole % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function Home() {
  const cues = useMemo<SceneCue[]>(() => {
    return SCENES.reduce<SceneCue[]>((timeline, scene) => {
      const previousEnd = timeline.length
        ? timeline[timeline.length - 1].end
        : 0;
      const end = previousEnd + scene.duration;
      timeline.push({
        ...scene,
        start: previousEnd,
        end,
      });
      return timeline;
    }, []);
  }, []);

  const totalDurationSeconds = cues[cues.length - 1]?.end ?? 0;
  const totalDurationMs = totalDurationSeconds * 1000;

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const speechTimeoutsRef = useRef<number[]>([]);
  const voicesChangedHandlerRef = useRef<(() => void) | null>(null);
  const ambientNodesRef = useRef<AmbientNodes | null>(null);
  const ambientFadeTimeoutRef = useRef<number | null>(null);

  const elapsedSeconds = clamp(elapsedMs / 1000, 0, totalDurationSeconds);

  const currentScene = useMemo(() => {
    return (
      cues.find(
        (cue) => elapsedSeconds >= cue.start && elapsedSeconds < cue.end,
      ) ?? cues[cues.length - 1]
    );
  }, [cues, elapsedSeconds]);

  const sceneProgress = useMemo(() => {
    if (!currentScene) return 0;
    const relative = elapsedSeconds - currentScene.start;
    return clamp(relative / currentScene.duration, 0, 1);
  }, [currentScene, elapsedSeconds]);

  const overallProgress = useMemo(() => {
    if (totalDurationSeconds === 0) return 0;
    return clamp(elapsedSeconds / totalDurationSeconds, 0, 1);
  }, [elapsedSeconds, totalDurationSeconds]);

  const cleanupSpeech = useCallback(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    speechTimeoutsRef.current.forEach((timer) => {
      window.clearTimeout(timer);
    });
    speechTimeoutsRef.current = [];
    synth.cancel();
    if (voicesChangedHandlerRef.current) {
      synth.removeEventListener("voiceschanged", voicesChangedHandlerRef.current);
      voicesChangedHandlerRef.current = null;
    }
  }, []);

  const stopAmbientAudio = useCallback(async () => {
    if (ambientFadeTimeoutRef.current) {
      window.clearTimeout(ambientFadeTimeoutRef.current);
      ambientFadeTimeoutRef.current = null;
    }
    const nodes = ambientNodesRef.current;
    ambientNodesRef.current = null;
    const context = nodes?.context ?? null;
    if (nodes) {
      try {
        nodes.baseOsc.stop();
      } catch {
        // Oscillator may already be stopped.
      }
      try {
        nodes.noiseSource.stop();
      } catch {
        // Source may already be stopped.
      }
      try {
        nodes.lfo.stop();
      } catch {
        // LFO may already be stopped.
      }
      nodes.masterGain.disconnect();
      nodes.noiseGain.disconnect();
      nodes.lfoGain.disconnect();
    }
    if (context) {
      try {
        await context.close();
      } catch {
        // Context might already be closed.
      }
    }
  }, []);

  const fadeOutAmbientAudio = useCallback(() => {
    const nodes = ambientNodesRef.current;
    if (!nodes) return;
    const { context, masterGain } = nodes;
    const now = context.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0.0001, now + 2.4);
    if (ambientFadeTimeoutRef.current) {
      window.clearTimeout(ambientFadeTimeoutRef.current);
    }
    ambientFadeTimeoutRef.current = window.setTimeout(() => {
      ambientFadeTimeoutRef.current = null;
      void stopAmbientAudio();
    }, 2600);
  }, [stopAmbientAudio]);

  const startAmbientAudio = useCallback(async () => {
    if (typeof window === "undefined") return;
    await stopAmbientAudio();
    const context = new AudioContext();

    const masterGain = context.createGain();
    masterGain.gain.value = 0.0001;
    masterGain.connect(context.destination);

    const baseOsc = context.createOscillator();
    baseOsc.type = "triangle";
    baseOsc.frequency.setValueAtTime(48, context.currentTime);
    baseOsc.connect(masterGain);
    baseOsc.start();

    const noiseBuffer = context.createBuffer(
      1,
      context.sampleRate * 3,
      context.sampleRate,
    );
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.18;
    }

    const noiseSource = context.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const noiseGain = context.createGain();
    noiseGain.gain.value = 0.02;
    noiseSource.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start();

    const lfo = context.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.12;
    const lfoGain = context.createGain();
    lfoGain.gain.value = 0.025;
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();

    ambientNodesRef.current = {
      context,
      baseOsc,
      noiseSource,
      lfo,
      masterGain,
      noiseGain,
      lfoGain,
    };

    await context.resume();

    const now = context.currentTime;
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.085, now + 2.2);
  }, [stopAmbientAudio]);

  const queueSpeech = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    cleanupSpeech();
    const synth = window.speechSynthesis;

    const pickVoice = (voices: SpeechSynthesisVoice[]) => {
      const englishVoices = voices.filter((voice) => voice.lang.startsWith("en"));
      const filtered =
        englishVoices.find((voice) =>
          voice.name.toLowerCase().includes("alloy"),
        ) ??
        englishVoices.find((voice) =>
          voice.name.toLowerCase().includes("emma"),
        ) ??
        englishVoices.find((voice) =>
          voice.name.toLowerCase().includes("amy"),
        ) ??
        englishVoices[0];
      return filtered ?? voices[0] ?? null;
    };

    const schedule = () => {
      const voices = synth.getVoices();
      const chosenVoice = pickVoice(voices);
      let offset = SPEECH_OFFSET_SECONDS;
      cues.forEach((scene) => {
        const timeout = window.setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(scene.voiceLine);
          if (chosenVoice) {
            utterance.voice = chosenVoice;
            utterance.lang = chosenVoice.lang;
          }
          utterance.rate = 0.94;
          utterance.pitch = 0.9;
          utterance.volume = 1;
          synth.speak(utterance);
        }, offset * 1000);
        speechTimeoutsRef.current.push(timeout);
        offset += scene.duration;
      });
    };

    if (synth.getVoices().length > 0) {
      schedule();
      return;
    }

    const handleVoicesChanged = () => {
      schedule();
      synth.removeEventListener("voiceschanged", handleVoicesChanged);
      voicesChangedHandlerRef.current = null;
    };
    voicesChangedHandlerRef.current = handleVoicesChanged;
    synth.addEventListener("voiceschanged", handleVoicesChanged, { once: true });
    synth.getVoices();
  }, [cleanupSpeech, cues]);

  const resetTimeline = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
    setElapsedMs(0);
  }, []);

  const handleBegin = useCallback(async () => {
    setHasEnded(false);
    resetTimeline();
    cleanupSpeech();
    await startAmbientAudio();
    queueSpeech();
    setIsPlaying(true);
  }, [cleanupSpeech, queueSpeech, resetTimeline, startAmbientAudio]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    const step = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - (startTimeRef.current ?? timestamp);
      if (elapsed >= totalDurationMs) {
        setElapsedMs(totalDurationMs);
        setIsPlaying(false);
        setHasEnded(true);
        startTimeRef.current = null;
        fadeOutAmbientAudio();
        return;
      }
      setElapsedMs(elapsed);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [fadeOutAmbientAudio, isPlaying, totalDurationMs]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      cleanupSpeech();
      void stopAmbientAudio();
    };
  }, [cleanupSpeech, stopAmbientAudio]);

  const typedSubtitle = useMemo(() => {
    if (!currentScene) return "";
    const text = currentScene.voiceLine;
    if (sceneProgress <= 0) return "";
    const letters = Math.floor(text.length * sceneProgress);
    return text.slice(0, Math.max(1, letters));
  }, [currentScene, sceneProgress]);

  const showIntroOverlay = !isPlaying && elapsedMs === 0 && !hasEnded;
  const showReplayOverlay = !isPlaying && hasEnded;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#030104] px-4 py-10 text-white">
      <div className="flex w-full max-w-[1100px] flex-col gap-8 md:grid md:grid-cols-[1fr_320px] md:items-start">
        <section className="relative mx-auto w-full max-w-[680px] md:mx-0">
          <div className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[#06030c] shadow-[0_40px_130px_rgba(0,0,0,0.55)]">
            <div className="relative mx-auto w-full max-w-full bg-black">
              <div className="mx-auto flex aspect-[9/16] w-full items-center justify-center bg-[#040209]">
                <div className="relative h-full w-full overflow-hidden">
                  {cues.map((scene) => {
                    const active = scene.id === currentScene?.id;
                    return (
                      <div
                        key={scene.id}
                        className="absolute inset-0 transition-opacity duration-1000"
                        style={{ opacity: active ? 1 : 0 }}
                      >
                        <SceneIllustration
                          sceneKey={scene.key}
                          progress={active ? sceneProgress : 0}
                        />
                      </div>
                    );
                  })}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/25" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="space-y-3 rounded-3xl bg-black/45 p-5 backdrop-blur-md">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-[#ff4d6d]/80">
                        <span>Room 213</span>
                        <span>{currentScene?.title}</span>
                      </div>
                      <p className="min-h-[86px] text-lg leading-relaxed text-white/90">
                        {typedSubtitle}
                        <span className="ml-1 inline-block h-[1.1em] w-[2px] animate-pulse bg-white/55 align-middle" />
                      </p>
                      <div className="text-xs text-white/60">
                        {currentScene?.sensation}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 top-0 flex h-24 items-start justify-between p-6 text-xs uppercase tracking-[0.3em] text-white/35">
                    <span>1 minute horror</span>
                    <span>{formatTimestamp(elapsedSeconds)}</span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff2748] via-[#7b1dff] to-[#2d7eff] transition-all duration-[150ms]"
                      style={{ width: `${overallProgress * 100}%` }}
                    />
                  </div>
                  {showIntroOverlay && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur">
                      <div className="max-w-[360px] space-y-6 text-center">
                        <h1 className="text-3xl font-semibold tracking-[0.2em] text-white">
                          ROOM 213 // NIGHT ENTRY
                        </h1>
                        <p className="text-base text-white/80">
                          Click below to experience a first-person descent into the
                          haunted hotel room. Audio narration and ambient design
                          will begin immediately.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            void handleBegin();
                          }}
                          className="w-full rounded-full bg-gradient-to-r from-[#ff2748] via-[#7b1dff] to-[#2d7eff] px-8 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-[0_20px_60px_rgba(77,24,255,0.45)] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2748]"
                        >
                          Start Nightmare
                        </button>
                      </div>
                    </div>
                  )}
                  {showReplayOverlay && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur">
                      <div className="max-w-[360px] space-y-6 text-center">
                        <h2 className="text-3xl font-semibold tracking-[0.2em] text-white">
                          ROOM 213 KEEPS YOU
                        </h2>
                        <p className="text-base text-white/75">
                          The door clicks shut behind you. Replay to relive the
                          whispers and the closing eye.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            void handleBegin();
                          }}
                          className="w-full rounded-full border border-white/20 px-8 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7b1dff]"
                        >
                          Replay Nightmare
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6 text-white/85">
          <header className="space-y-2">
            <p className="text-sm uppercase tracking-[0.4em] text-[#ff2748]/80">
              Narrative Script
            </p>
            <h2 className="text-3xl font-semibold text-white">
              First-Person Account of Room 213
            </h2>
            <p className="text-sm text-white/60">
              Spoken with synthesized human-like narration. Best experienced with
              headphones in a dark room.
            </p>
          </header>
          <div className="space-y-6 rounded-3xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-md">
            {cues.map((scene) => {
              const active = scene.id === currentScene?.id;
              return (
                <div
                  key={scene.id}
                  className="space-y-2 rounded-2xl border border-transparent bg-white/[0.015] p-4 transition hover:bg-white/[0.04]"
                  style={{
                    borderColor: active ? "rgba(255, 39, 72, 0.35)" : undefined,
                    boxShadow: active
                      ? "0 0 28px rgba(123, 29, 255, 0.25)"
                      : undefined,
                  }}
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/55">
                    <span>{scene.title}</span>
                    <span>{formatTimestamp(scene.start)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/85">
                    {scene.voiceLine}
                  </p>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#ff2748]/70">
                    {scene.sensation}
                  </p>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
