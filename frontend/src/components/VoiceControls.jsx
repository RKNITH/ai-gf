import React, { useEffect, useState } from "react";

export default function VoiceControls({ speak, isSpeaking, cancelSpeak, setVoiceSettings }) {
    const [voices, setVoices] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);

    useEffect(() => {
        function loadVoices() {
            const v = window.speechSynthesis.getVoices();
            setVoices(v);
            // pick a default female voice if possible
            const idx = v.findIndex(voice => /female|woman|girl|female/i.test(voice.name)) || 0;
            setSelectedIdx(idx < 0 ? 0 : idx);
        }
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    useEffect(() => {
        setVoiceSettings({ voice: voices[selectedIdx], rate, pitch });
    }, [voices, selectedIdx, rate, pitch]);

    return (
        <div className="w-full flex flex-col gap-2 p-3 border-t">
            <div className="flex items-center justify-between gap-2">
                <select
                    className="flex-1 p-2 rounded-md border"
                    value={selectedIdx}
                    onChange={(e) => setSelectedIdx(Number(e.target.value))}
                >
                    {voices.map((v, i) => (
                        <option key={v.name + i} value={i}>{v.name} {v.lang ? `(${v.lang})` : ""}</option>
                    ))}
                    {voices.length === 0 && <option>Loading voices...</option>}
                </select>

                <button
                    onClick={() => isSpeaking ? cancelSpeak() : speak()}
                    className="ml-2 px-3 py-2 rounded-md bg-indigo-600 text-white"
                >
                    {isSpeaking ? "Stop" : "Speak"}
                </button>
            </div>

            <div className="flex items-center gap-2">
                <label className="text-sm w-12">Rate</label>
                <input type="range" min="0.6" max="1.6" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                <div className="w-10 text-xs">{rate}</div>
                <label className="text-sm w-12">Pitch</label>
                <input type="range" min="0.6" max="2.0" step="0.1" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} />
                <div className="w-10 text-xs">{pitch}</div>
            </div>
        </div>
    );
}
