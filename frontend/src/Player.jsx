import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import "./Player.css";

const STEMS = ["vocals", "drums", "bass", "other"];
const BASE_URL = "http://localhost:8001";

export default function Player({ song }) {
    const audioRefs = useRef({});
    const waveRefs = useRef({});
    const waves = useRef({});

    const [playing, setPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [time, setTime] = useState(0);

    const [muted, setMuted] = useState({
        vocals: false,
        drums: false,
        bass: false,
        other: false,
    });

    const [volume, setVolume] = useState({
        vocals: 1,
        drums: 1,
        bass: 1,
        other: 1,
    });

    // 🎵 Clean display name
    const displayName = song
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    // ⏱ Time formatter
    const formatTime = (t) => {
        if (!t || isNaN(t)) return "00:00";
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m.toString().padStart(2, "0")}:${s
            .toString()
            .padStart(2, "0")}`;
    };

    // 🌊 Waveforms (visual only)
    useEffect(() => {
        STEMS.forEach((stem) => {
            if (waves.current[stem]) return;

            const ws = WaveSurfer.create({
                container: waveRefs.current[stem],
                waveColor: "#555",
                progressColor: "#1db954",
                height: 60,
                interact: false,
                cursorWidth: 0,
            });

            ws.load(`${BASE_URL}/audio/${song}/${stem}`);
            waves.current[stem] = ws;
        });

        return () => {
            STEMS.forEach((stem) => {
                waves.current[stem]?.destroy();
                delete waves.current[stem];
            });
        };
    }, [song]);

    // ▶ Play / Pause
    const togglePlay = async () => {
        for (const stem of STEMS) {
            const audio = audioRefs.current[stem];
            if (!audio) continue;

            audio.muted = muted[stem];
            audio.volume = volume[stem];

            playing ? audio.pause() : await audio.play();
        }
        setPlaying(!playing);
    };

    // 🔇 Mute
    const toggleMute = (stem) => {
        const audio = audioRefs.current[stem];
        const next = !muted[stem];
        if (audio) audio.muted = next;

        setMuted((p) => ({ ...p, [stem]: next }));
    };

    // 🎚 Volume
    const changeVolume = (stem, v) => {
        const value = v / 100;
        const audio = audioRefs.current[stem];
        if (audio) audio.volume = value;

        setVolume((p) => ({ ...p, [stem]: value }));
    };

    // ⏱ Sync time + waveforms
    useEffect(() => {
        const interval = setInterval(() => {
            const audio = audioRefs.current.vocals;
            if (!audio || !audio.duration) return;

            setDuration(audio.duration);
            setTime(audio.currentTime);

            STEMS.forEach((stem) => {
                const w = waves.current[stem];
                if (w) w.seekTo(audio.currentTime / audio.duration);
            });
        }, 80);

        return () => clearInterval(interval);
    }, []);

    // ⏭ Seek all
    const seekAll = (v) => {
        const t = (v / 100) * duration;
        STEMS.forEach((stem) => {
            const a = audioRefs.current[stem];
            if (a) a.currentTime = t;
        });
        setTime(t);
    };

    return (
        <div className="player">
            {/* 🎶 FILE NAME */}
            <div style={{ marginBottom: 12, fontSize: 16, opacity: 0.85 }}>
                🎶 {displayName}
            </div>

            {/* ▶ MASTER */}
            <div className="master">
                <button onClick={togglePlay}>
                    {playing ? "Pause" : "Play"}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, opacity: 0.7 }}>
                        {formatTime(time)}
                    </span>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={duration ? (time / duration) * 100 : 0}
                        onChange={(e) => seekAll(e.target.value)}
                        style={{ flex: 1 }}
                    />

                    <span style={{ fontSize: 12, opacity: 0.7 }}>
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* 🎛 STEMS */}
            {STEMS.map((stem) => (
                <div className="stem" key={stem}>
                    <div className="stem-title">{stem.toUpperCase()}</div>

                    <audio
                        ref={(el) => (audioRefs.current[stem] = el)}
                        src={`${BASE_URL}/audio/${song}/${stem}`}
                        preload="auto"
                    />

                    <div
                        ref={(el) => (waveRefs.current[stem] = el)}
                        className="wave"
                    />

                    <div className="controls">
                        <button onClick={() => toggleMute(stem)}>
                            {muted[stem] ? "Unmute" : "Mute"}
                        </button>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume[stem] * 100}
                            onChange={(e) => changeVolume(stem, e.target.value)}
                        />

                        <span>{Math.round(volume[stem] * 100)}%</span>

                        <a
                            href={`${BASE_URL}/download/${song}/${stem}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Download
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}
