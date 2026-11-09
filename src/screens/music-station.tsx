"use client";

/**
 * Estación de música del jugador · Carga tus canciones, suenan en
 * aleatorio, las pasas, las repites… y acompañan el viaje por el
 * Archipiélago. Todo local: las canciones jamás salen del dispositivo.
 */

import { useEffect, useRef, useState } from "react";
import { useMusicStore, type StationTrack } from "@/services/music-station";
import { useGameStore } from "@/store/game-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { LexicoMascot } from "@/components/game/lexico";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/lib/format-time";
import {
  Disc3,
  ListMusic,
  Music4,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Upload,
  Volume2,
} from "lucide-react";

function fmtSize(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function MusicStationScreen() {
  const station = useMusicStore();
  const stationVolume = useGameStore((s) => s.settings.stationVolume);
  const fileRef = useRef<HTMLInputElement>(null);
  const loadedOnce = useRef(false);

  // Carga la biblioteca del jugador al entrar (una sola vez).
  useEffect(() => {
    if (!loadedOnce.current) {
      loadedOnce.current = true;
      void station.load();
    }
  }, [station]);

  // Volumen persistido de ajustes → estación.
  useEffect(() => {
    station.setVolume(stationVolume);
  }, [stationVolume]);

  const current = station.tracks.find((t) => t.id === station.currentId) ?? null;
  const pct = station.duration > 0 ? station.currentTime / station.duration : 0;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added = await station.addFiles(files);
    if (added > 0) {
      sfx.coins();
      if (!station.currentId && station.tracks.length >= added) {
        // Si era la primera carga, arranca la radio.
        void station.playTrack(station.tracks[0]?.id ?? "");
      }
    }
  };

  return (
    <div>
      <ScreenHeader title="Estación del navegante" subtitle="Tu música, tu viaje" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-28 pt-4">
        {/* ===== Reproductor ===== */}
        <section
          className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5"
          aria-label="Reproductor de la estación"
        >
          <div className="flex items-center gap-4">
            {/* Giradisco */}
            <div className="relative shrink-0" aria-hidden>
              <Disc3
                className={cn("h-24 w-24 text-primary/80 transition-transform duration-700", station.playing && "animate-spin [animation-duration:3.5s]")}
              />
              {station.playing && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-end gap-0.5">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="anim-sound-bar w-1 rounded-full bg-[var(--xp)]"
                        style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.12}s` }}
                      />
                    ))}
                  </span>
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {station.playing ? "Sonando ahora" : station.currentId ? "En pausa" : "Radio apagada"}
              </p>
              <p className="font-display text-lg font-bold leading-tight">
                {current ? current.name : "Carga canciones para zarpar"}
              </p>
              <p className="numeric mt-0.5 text-xs text-muted-foreground">
                {station.tracks.length > 0
                  ? station.tracks.length === 1
                    ? "1 canción en la playlist"
                    : `${station.tracks.length} canciones en la playlist`
                  : "La estación está vacía"}
              </p>
            </div>

            <LexicoMascot
              size={64}
              mood={station.playing ? "cheer" : "idle"}
              className="hidden shrink-0 sm:block"
              aria-hidden
            />
          </div>

          {/* Progreso */}
          {current && (
            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={Math.max(1, station.duration)}
                step={0.5}
                value={station.currentTime}
                onChange={(e) => station.seek(Number(e.target.value))}
                aria-label="Avanzar o retroceder la canción"
                className="groove h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[var(--primary)]"
              />
              <div className="numeric mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>{formatDistanceToNow(station.currentTime * 1000)}</span>
                <span>{station.duration > 0 ? formatDistanceToNow(station.duration * 1000) : "—"}</span>
              </div>
            </div>
          )}

          {/* Controles */}
          <div className="mt-3 flex items-center justify-center gap-2.5">
            <button
              onClick={() => { sfx.tap(); station.setShuffle(!station.shuffle); }}
              aria-pressed={station.shuffle}
              aria-label="Aleatorio"
              className={cn(
                "tap-target flex h-10 w-10 items-center justify-center rounded-2xl border transition",
                station.shuffle ? "gloss border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <Shuffle className="h-4.5 w-4.5" aria-hidden />
            </button>
            <button
              onClick={() => { sfx.tap(); station.prev(); }}
              aria-label="Canción anterior"
              disabled={station.tracks.length === 0}
              className="tap-target flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition hover:border-primary/50 disabled:opacity-40"
            >
              <SkipBack className="h-5 w-5" aria-hidden />
            </button>
            <button
              onClick={() => { sfx.tap(); station.toggle(); }}
              aria-label={station.playing ? "Pausar" : "Reproducir"}
              disabled={station.tracks.length === 0}
              className="tap-target chip-icon flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-[0_5px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)] transition-all hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)] disabled:opacity-40"
            >
              {station.playing ? (
                <Pause className="h-7 w-7" aria-hidden />
              ) : (
                <Play className="ml-1 h-7 w-7" aria-hidden />
              )}
            </button>
            <button
              onClick={() => { sfx.tap(); station.next(); }}
              aria-label="Canción siguiente"
              disabled={station.tracks.length === 0}
              className="tap-target flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition hover:border-primary/50 disabled:opacity-40"
            >
              <SkipForward className="h-5 w-5" aria-hidden />
            </button>
            <button
              onClick={() => { sfx.tap(); station.cycleRepeat(); }}
              aria-label={`Repetición: ${station.repeatMode}`}
              aria-pressed={station.repeatMode !== "off"}
              className={cn(
                "tap-target flex h-10 w-10 items-center justify-center rounded-2xl border transition",
                station.repeatMode !== "off" ? "gloss border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {station.repeatMode === "one" ? <Repeat1 className="h-4.5 w-4.5" aria-hidden /> : <Repeat className="h-4.5 w-4.5" aria-hidden />}
            </button>
          </div>

          {/* Volumen */}
          <div className="mt-4 flex items-center gap-3">
            <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <Slider
              value={[station.volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => station.setVolume(v)}
              aria-label="Volumen de la estación"
            />
            <span className="numeric w-10 shrink-0 text-right text-xs font-bold text-muted-foreground">
              {Math.round(station.volume * 100)}%
            </span>
          </div>

          {station.error && (
            <p className="mt-2 text-center text-xs font-semibold text-destructive" role="alert">
              {station.error}
            </p>
          )}
        </section>

        {/* ===== Añadir música ===== */}
        <section className="card-aurora rounded-3xl border border-dashed bg-card/60 p-5 text-center">
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            aria-hidden
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <p className="flex items-center justify-center gap-2 text-sm font-bold">
            <Music4 className="h-4.5 w-4.5 text-primary" aria-hidden />
            Carga tus canciones (MP3, OGG, WAV…)
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Viven solo en este dispositivo y siguen sonando mientras navegas:
            nada viaja a ningún servidor.
          </p>
          <Button className="mt-3 font-bold" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" aria-hidden />
            Añadir música
          </Button>
        </section>

        {/* ===== Lista de reproducción ===== */}
        <section aria-labelledby="playlist-title">
          <h2 id="playlist-title" className="font-display mb-2.5 flex items-center gap-2 text-lg font-bold">
            <ListMusic className="h-5 w-5 text-primary" aria-hidden />
            Playlist del navegante
          </h2>
          {station.tracks.length === 0 ? (
            <p className="card-aurora rounded-3xl border bg-card p-5 text-center text-sm text-muted-foreground">
              La playlist está vacía: añade canciones y Léxico pinchará la primera.
            </p>
          ) : (
            <ul className="space-y-2">
              {station.tracks.map((t) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  active={t.id === station.currentId}
                  playing={t.id === station.currentId && station.playing}
                  onPlay={() => void station.playTrack(t.id)}
                  onRemove={() => void station.removeTrack(t.id)}
                />
              ))}
            </ul>
          )}
        </section>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          La estación respeta tu privacidad: canciones y progreso viven solo aquí, en tu dispositivo.
          Si la estación suena, la música ambiental del juego se calla para no pisar tu ritmo.
        </p>
      </main>
    </div>
  );
}

function TrackRow({
  track,
  active,
  playing,
  onPlay,
  onRemove,
}: {
  track: StationTrack;
  active: boolean;
  playing: boolean;
  onPlay: () => void;
  onRemove: () => void;
}) {
  return (
    <li
      className={cn(
        "card-aurora group flex items-center gap-3 rounded-2xl border p-3 transition",
        active ? "border-primary/60 bg-primary/5" : "bg-card",
      )}
    >
      <button
        onClick={onPlay}
        className="tap-target chip-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        aria-label={playing ? `Pausar ${track.name}` : `Reproducir ${track.name}`}
      >
        {playing ? <Pause className="h-4.5 w-4.5" aria-hidden /> : <Play className="h-4.5 w-4.5" aria-hidden />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-bold", active && "text-primary")}>{track.name}</p>
        <p className="numeric text-[11px] text-muted-foreground">
          {fmtSize(track.size)} · {new Date(track.addedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
        </p>
      </div>
      {playing && (
        <span className="flex items-end gap-0.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="anim-sound-bar w-1 rounded-full bg-[var(--xp)]"
              style={{ height: `${6 + i * 4}px`, animationDelay: `${i * 0.14}s` }}
            />
          ))}
        </span>
      )}
      <button
        onClick={onRemove}
        className="tap-target text-muted-foreground/60 opacity-0 transition hover:text-destructive group-hover:opacity-100"
        aria-label={`Quitar ${track.name} de la estación`}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </li>
  );
}
