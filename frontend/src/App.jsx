import { useState, useEffect } from "react";
import Upload from "./Upload";
import Player from "./Player";
import "./App.css";


const BASE_URL = "http://localhost:8001";

export default function App() {
    const [song, setSong] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [ready, setReady] = useState(false);

    // 🔄 Poll backend until Demucs output is ready
    useEffect(() => {
        if (!song) return;

        setProcessing(true);
        setReady(false);

        const interval = setInterval(async () => {
            try {
                const res = await fetch(
                    `${BASE_URL}/audio/${song}/vocals`
                );

                if (res.ok) {
                    clearInterval(interval);
                    setProcessing(false);
                    setReady(true);
                }
            } catch {
                // silently retry while processing
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [song]);

    return (
        <div style={{ padding: 30, textAlign: "center" }}>
            {/* 🎵 Title */}
            <h1 className="app-title">Music Decoder</h1>
            <p className="app-subtitle">AI STEM SEPARATION STUDIO</p>

            {/* 📤 Upload */}
            <Upload setSong={setSong} />

            {/* ⏳ Processing */}
            {processing && <LoadingScreen />}

            {/* ▶️ Player */}
            {ready && <Player song={song} />}
        </div>
    );
}

/* 🔥 Loading screen component */
function LoadingScreen() {
    const steps = [
        "🎧 Extracting vocals…",
        "🥁 Separating drums…",
        "🎸 Isolating bass…",
        "🎹 Processing instruments…",
        "🎛 Finalizing tracks…",
    ];

    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const stepTimer = setInterval(() => {
            setStep((s) => (s + 1) % steps.length);
        }, 1800);

        const progressTimer = setInterval(() => {
            setProgress((p) => (p < 95 ? p + Math.random() * 4 : p));
        }, 400);

        return () => {
            clearInterval(stepTimer);
            clearInterval(progressTimer);
        };
    }, []);

    return (
        <div style={{ marginTop: 40, maxWidth: 420, marginInline: "auto" }}>
            <div style={{ fontSize: 20, marginBottom: 12 }}>
                {steps[step]}
            </div>

            {/* Progress bar */}
            <div
                style={{
                    height: 8,
                    background: "#2a2a2a",
                    borderRadius: 6,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${progress}%`,
                        background:
                            "linear-gradient(90deg, #4facfe, #00f2fe)",
                        transition: "width 0.4s ease",
                    }}
                />
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>
                Processing may take 30–90 seconds depending on song length
            </div>
        </div>
    );
}
  