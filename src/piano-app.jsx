import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Keyboard, MousePointer2, Music2, Piano, SlidersHorizontal, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WHITE_ORDER = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_AFTER = { C: "C#", D: "D#", F: "F#", G: "G#", A: "A#" };
const ROOT_OPTIONS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_INDEX = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};

const KEYBOARD_MAP = {
  C2: "1",
  "C#2": "2",
  D2: "3",
  "D#2": "4",
  E2: "5",
  F2: "6",
  "F#2": "7",
  G2: "8",
  "G#2": "9",
  A2: "0",
  "A#2": "-",
  B2: "=",
  C3: "Q",
  "C#3": "W",
  D3: "E",
  "D#3": "R",
  E3: "T",
  F3: "Y",
  "F#3": "U",
  G3: "I",
  "G#3": "O",
  A3: "P",
  "A#3": "[",
  B3: "]",
  C4: "A",
  "C#4": "S",
  D4: "D",
  "D#4": "F",
  E4: "G",
  F4: "H",
  "F#4": "J",
  G4: "K",
  "G#4": "L",
  A4: ";",
  "A#4": "'",
  B4: "Enter",
  C5: "\\",
};

const SCALE_INTERVALS = {
  chromatic: { name: "Chromatic", intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  major: { name: "Major", intervals: [0, 2, 4, 5, 7, 9, 11] },
  naturalMinor: { name: "Natural Minor", intervals: [0, 2, 3, 5, 7, 8, 10] },
  pentatonic: { name: "Pentatonic", intervals: [0, 2, 4, 7, 9] },
  blues: { name: "Blues", intervals: [0, 3, 5, 6, 7, 10] },
};

function noteLabel(note) {
  return note.replace("#", "♯");
}

function notePitchClass(noteName) {
  return noteName.replace(/\d+/g, "");
}

function midiFromNote(name, octave) {
  return 12 * (octave + 1) + NOTE_INDEX[name];
}

function freqFromMidi(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function generateNotes() {
  const notes = [];
  let whiteIndex = 0;
  const whiteWidth = 64;
  const blackOffset = 45;

  for (let octave = 2; octave <= 4; octave += 1) {
    for (const whiteName of WHITE_ORDER) {
      const noteName = `${whiteName}${octave}`;
      notes.push({
        note: noteName,
        key: KEYBOARD_MAP[noteName] ?? "",
        freq: freqFromMidi(midiFromNote(whiteName, octave)),
        type: "white",
        left: whiteIndex * whiteWidth,
      });

      const blackName = BLACK_AFTER[whiteName];
      if (blackName) {
        const sharpNoteName = `${blackName}${octave}`;
        notes.push({
          note: sharpNoteName,
          key: KEYBOARD_MAP[sharpNoteName] ?? "",
          freq: freqFromMidi(midiFromNote(blackName, octave)),
          type: "black",
          left: whiteIndex * whiteWidth + blackOffset,
        });
      }

      whiteIndex += 1;
    }
  }

  notes.push({
    note: "C5",
    key: KEYBOARD_MAP.C5,
    freq: freqFromMidi(midiFromNote("C", 5)),
    type: "white",
    left: whiteIndex * whiteWidth,
  });

  return notes;
}

const NOTES = generateNotes();
const NOTE_BY_NAME = Object.fromEntries(NOTES.map((note) => [note.note, note]));
const WHITE_NOTES = NOTES.filter((note) => note.type === "white");
const BLACK_NOTES = NOTES.filter((note) => note.type === "black");
const KEYBOARD_WIDTH = WHITE_NOTES.length * 64;

function runSelfChecks() {
  console.assert(NOTES.length === 37, "Expected 37 keys from C2 to C5.");
  console.assert(NOTE_BY_NAME["C2"]?.key === "1", "C2 should map to 1.");
  console.assert(NOTE_BY_NAME["C#4"]?.type === "black", "C#4 should be a black key.");
  console.assert(notePitchClass("A#3") === "A#", "Pitch class parsing should strip octave numbers.");
}

runSelfChecks();

function PianoKey({
  note,
  isPressed,
  isDisabled,
  isRootNote,
  onPointerStart,
  onPointerEnter,
  onPointerEnd,
}) {
  const isWhite = note.type === "white";

  const whiteClass = isDisabled
    ? "bg-zinc-700/60 opacity-35 cursor-not-allowed"
    : isPressed
      ? "bg-zinc-200 translate-y-1 shadow-inner"
      : isRootNote
        ? "bg-amber-50 ring-2 ring-amber-500/70"
        : "bg-white hover:bg-zinc-100";

  const blackClass = isDisabled
    ? "bg-zinc-900 opacity-30 cursor-not-allowed"
    : isPressed
      ? "bg-zinc-700 translate-y-1 shadow-inner"
      : isRootNote
        ? "bg-zinc-600 ring-2 ring-amber-400/70"
        : "bg-black hover:bg-zinc-900";

  return (
    <button
      type="button"
      data-note={note.note}
      aria-label={note.note}
      aria-disabled={isDisabled}
      className={
        isWhite
          ? `relative shrink-0 w-16 h-[320px] border border-zinc-800 rounded-b-2xl transition-all select-none ${whiteClass}`
          : `absolute top-0 z-10 w-10 h-[190px] rounded-b-xl border border-black transition-all select-none ${blackClass}`
      }
      style={isWhite ? undefined : { left: note.left }}
      onMouseDown={() => onPointerStart(note.note)}
      onMouseEnter={() => onPointerEnter(note.note)}
      onMouseUp={onPointerEnd}
      onTouchStart={(e) => {
        e.preventDefault();
        onPointerStart(note.note);
      }}
      onTouchEnd={onPointerEnd}
    >
      <div
        className={
          isWhite
            ? "absolute bottom-4 inset-x-0 text-center text-zinc-800"
            : "absolute bottom-3 inset-x-0 text-center text-white text-xs"
        }
      >
        <div className="font-semibold">{noteLabel(note.note)}</div>
        {note.key ? <div className="text-xs opacity-70 mt-1">{note.key}</div> : null}
      </div>
    </button>
  );
}

export default function PianoSite() {
  const audioContextRef = useRef(null);
  const activeVoicesRef = useRef(new Map());
  const isPointerDownRef = useRef(false);
  const lastDraggedNoteRef = useRef(null);

  const [enabled, setEnabled] = useState(false);
  const [pressed, setPressed] = useState(new Set());
  const [selectedScale, setSelectedScale] = useState("chromatic");
  const [selectedRoot, setSelectedRoot] = useState("C");

  const allowedNotes = useMemo(() => {
    const scale = SCALE_INTERVALS[selectedScale] ?? SCALE_INTERVALS.chromatic;
    const rootIndex = NOTE_INDEX[selectedRoot] ?? 0;

    return new Set(
      NOTES.filter((note) => {
        const pitchClass = NOTE_INDEX[notePitchClass(note.note)];
        const interval = (pitchClass - rootIndex + 12) % 12;
        return scale.intervals.includes(interval);
      }).map((note) => note.note),
    );
  }, [selectedRoot, selectedScale]);

  const notesByKey = useMemo(() => {
    const map = new Map();
    NOTES.forEach((note) => {
      if (note.key) {
        map.set(note.key.toLowerCase(), note);
      }
    });
    map.set("enter", NOTE_BY_NAME.B4);
    map.set("\\", NOTE_BY_NAME.C5);
    return map;
  }, []);

  const stopAllNotes = () => {
    const ctx = audioContextRef.current;

    if (!ctx) {
      activeVoicesRef.current.clear();
      setPressed(new Set());
      return;
    }

    activeVoicesRef.current.forEach((voice) => {
      try {
        const now = ctx.currentTime;
        voice.gain.gain.cancelScheduledValues(now);
        voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
        voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        voice.oscillator.stop(now + 0.06);
      } catch {
        // ignore already stopped voices
      }
    });

    activeVoicesRef.current.clear();
    setPressed(new Set());
  };

  const stopSpecificNote = (noteObj) => {
    const ctx = audioContextRef.current;
    if (!ctx || !noteObj) return;

    const voice = activeVoicesRef.current.get(noteObj.note);
    if (!voice) return;

    const now = ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    voice.oscillator.stop(now + 0.16);

    activeVoicesRef.current.delete(noteObj.note);
    setPressed((prev) => {
      const next = new Set(prev);
      next.delete(noteObj.note);
      return next;
    });
  };

  const endPointerInteraction = () => {
    isPointerDownRef.current = false;
    lastDraggedNoteRef.current = null;
    stopAllNotes();
  };

  const ensureAudio = async () => {
    if (typeof window === "undefined") return null;

    if (!audioContextRef.current) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      audioContextRef.current = new AudioCtor();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    setEnabled(true);
    return audioContextRef.current;
  };

  const playSingleNote = async (noteObj) => {
    if (!noteObj || !allowedNotes.has(noteObj.note)) return;

    const ctx = await ensureAudio();
    if (!ctx || activeVoicesRef.current.has(noteObj.note)) return;

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(noteObj.freq, now);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2200, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.12);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);

    activeVoicesRef.current.set(noteObj.note, { oscillator, gain });
    setPressed(new Set([noteObj.note]));
  };

  const startDraggedNote = async (noteName) => {
    const noteObj = NOTE_BY_NAME[noteName];
    if (!noteObj || !allowedNotes.has(noteObj.note)) return;
    if (lastDraggedNoteRef.current === noteObj.note) return;

    stopAllNotes();
    lastDraggedNoteRef.current = noteObj.note;
    await playSingleNote(noteObj);
  };

  const handlePointerStart = async (noteName) => {
    isPointerDownRef.current = true;
    await startDraggedNote(noteName);
  };

  const handlePointerEnter = async (noteName) => {
    if (!isPointerDownRef.current) return;
    await startDraggedNote(noteName);
  };

  useEffect(() => {
    const downHandler = async (e) => {
      if (e.repeat) return;
      const noteObj = notesByKey.get(e.key.toLowerCase());
      if (!noteObj) return;

      e.preventDefault();
      const ctx = await ensureAudio();
      if (!ctx || !allowedNotes.has(noteObj.note) || activeVoicesRef.current.has(noteObj.note)) return;

      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(noteObj.freq, now);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2200, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.12);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);

      activeVoicesRef.current.set(noteObj.note, { oscillator, gain });
      setPressed((prev) => new Set(prev).add(noteObj.note));
    };

    const upHandler = (e) => {
      const noteObj = notesByKey.get(e.key.toLowerCase());
      if (!noteObj) return;
      e.preventDefault();
      stopSpecificNote(noteObj);
    };

    const touchMoveHandler = (e) => {
      if (!isPointerDownRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const noteName = element?.closest?.("[data-note]")?.getAttribute("data-note");
      if (noteName) {
        void startDraggedNote(noteName);
      }
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    window.addEventListener("blur", endPointerInteraction);
    window.addEventListener("mouseup", endPointerInteraction);
    window.addEventListener("touchend", endPointerInteraction);
    window.addEventListener("touchcancel", endPointerInteraction);
    window.addEventListener("touchmove", touchMoveHandler, { passive: false });

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
      window.removeEventListener("blur", endPointerInteraction);
      window.removeEventListener("mouseup", endPointerInteraction);
      window.removeEventListener("touchend", endPointerInteraction);
      window.removeEventListener("touchcancel", endPointerInteraction);
      window.removeEventListener("touchmove", touchMoveHandler);
    };
  }, [allowedNotes, notesByKey]);

  useEffect(() => {
    endPointerInteraction();
  }, [selectedScale, selectedRoot]);

  useEffect(() => () => {
    endPointerInteraction();
  }, []);

  const activeScale = SCALE_INTERVALS[selectedScale] ?? SCALE_INTERVALS.chromatic;
  const isRootPitchClass = (noteName) => notePitchClass(noteName) === selectedRoot;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-6 text-white">
      <div className="mx-auto grid max-w-7xl gap-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid gap-6"
        >
          <Card className="rounded-3xl border-white/10 bg-white/5 shadow-2xl backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl font-bold">
                <Piano className="h-8 w-8" />
                Extended Browser Piano
              </CardTitle>
              <p className="text-base leading-relaxed text-zinc-300">
                Clean extended range from C2 to C5, with click-and-drag note gliding and keyboard controls.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                  <Keyboard className="h-5 w-5" /> Keyboard Map
                </div>
                <p className="text-zinc-300">C2–B2: 1 through =</p>
                <p className="text-zinc-300">C3–B3: Q through ]</p>
                <p className="text-zinc-300">C4–C5: A through \</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                  <Music2 className="h-5 w-5" /> Range
                </div>
                <p className="text-zinc-300">Two full octaves below middle C</p>
                <p className="text-zinc-300">Visible range: C2 to C5</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                  <MousePointer2 className="h-5 w-5" /> Pointer Play
                </div>
                <p className="text-zinc-300">Click and drag across keys</p>
                <p className="text-zinc-300">Root notes glow in warm amber</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                  <Volume2 className="h-5 w-5" /> Audio
                </div>
                <p className="text-zinc-300">Runs entirely in your browser</p>
                <Button onClick={ensureAudio} className="mt-3 rounded-2xl" variant="secondary">
                  {enabled ? "Audio Ready" : "Enable Audio"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-white/5 shadow-2xl backdrop-blur">
            <CardContent className="grid gap-4 p-4 md:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-xl font-semibold">
                    <SlidersHorizontal className="h-5 w-5" /> Scale
                  </div>
                  <select
                    value={selectedScale}
                    onChange={(e) => setSelectedScale(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white"
                  >
                    {Object.entries(SCALE_INTERVALS).map(([value, scale]) => (
                      <option key={value} value={value}>
                        {scale.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <div className="text-xl font-semibold">Root</div>
                  <select
                    value={selectedRoot}
                    onChange={(e) => setSelectedRoot(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white"
                  >
                    {ROOT_OPTIONS.map((root) => (
                      <option key={root} value={root}>
                        {noteLabel(root)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-sm text-zinc-400">
                {activeScale.name} in {noteLabel(selectedRoot)}. Disabled notes are dimmed and won’t play. Root notes are highlighted in a warm amber tone.
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/5 shadow-2xl backdrop-blur">
            <CardContent className="p-4 md:p-8">
              <div className="overflow-x-auto pb-2">
                <div className="relative mx-auto min-w-max" style={{ width: KEYBOARD_WIDTH, height: 340 }}>
                  <div className="absolute inset-0 flex">
                    {WHITE_NOTES.map((note) => (
                      <PianoKey
                        key={note.note}
                        note={note}
                        isPressed={pressed.has(note.note)}
                        isDisabled={!allowedNotes.has(note.note)}
                        isRootNote={isRootPitchClass(note.note)}
                        onPointerStart={handlePointerStart}
                        onPointerEnter={handlePointerEnter}
                        onPointerEnd={endPointerInteraction}
                      />
                    ))}
                  </div>
                  {BLACK_NOTES.map((note) => (
                    <PianoKey
                      key={note.note}
                      note={note}
                      isPressed={pressed.has(note.note)}
                      isDisabled={!allowedNotes.has(note.note)}
                      isRootNote={isRootPitchClass(note.note)}
                      onPointerStart={handlePointerStart}
                      onPointerEnter={handlePointerEnter}
                      onPointerEnd={endPointerInteraction}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-white/5 shadow-2xl backdrop-blur">
            <CardContent className="p-4 text-sm leading-relaxed text-zinc-400 md:p-6">
              Dragging is intentionally monophonic for pointer input so it feels smooth instead of muddy. Keyboard input still supports holding multiple notes for chords.
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
