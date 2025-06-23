
import React, { useRef, useState } from 'react';
import './App.css';

const whiteKeys = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
const blackKeys = ['C#4', 'D#4', '', 'F#4', 'G#4', 'A#4', ''];

const freqMap = {
  'C4': 261.63, 'C#4': 277.18,
  'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99,
  'G4': 392.00, 'G#4': 415.30,
  'A4': 440.00, 'A#4': 466.16,
  'B4': 493.88
};

export default function App() {
  const [volume, setVolume] = useState(0.5);
  const [recording, setRecording] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const startTime = useRef(null);
  const audioCtx = useRef(null);

  const playNote = (note) => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();

    const now = audioCtx.current.currentTime;
    const oscillator = audioCtx.current.createOscillator();
    const gainNode = audioCtx.current.createGain();

    oscillator.frequency.setValueAtTime(freqMap[note], now);
    gainNode.gain.setValueAtTime(volume, now);
    oscillator.connect(gainNode).connect(audioCtx.current.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.5);

    if (isRecording) {
      const time = Date.now() - startTime.current;
      setRecording(prev => [...prev, { note, time }]);
    }
  };

  const startRecording = () => {
    setRecording([]);
    startTime.current = Date.now();
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    localStorage.setItem('piano-recording', JSON.stringify(recording));
  };

  const playRecording = () => {
    const saved = JSON.parse(localStorage.getItem('piano-recording') || '[]');
    saved.forEach(({ note, time }) => {
      setTimeout(() => playNote(note), time);
    });
  };

  const downloadRecording = () => {
    const blob = new Blob([JSON.stringify(recording)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'piano-recording.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <h1>Virtual Piano</h1>

      <div className="keyboard-wrapper">
        <div className="keyboard white-keys">
          {whiteKeys.map((note) => (
            <button
              key={note}
              className="piano-key white-key"
              onClick={() => playNote(note)}
              aria-label={`Play note ${note}`}
            >
              {note}
            </button>
          ))}
        </div>
        <div className="keyboard black-keys">
          {blackKeys.map((note, i) =>
            note ? (
              <button
                key={note}
                className="piano-key black-key"
                onClick={() => playNote(note)}
                aria-label={`Play note ${note}`}
                style={{ left: `${(i + 1) * 60 - 15}px` }}
              >
                {note}
              </button>
            ) : (
              <div key={`spacer-${i}`} className="black-key-spacer" />
            )
          )}
        </div>
      </div>

      <div className="controls">
        <label htmlFor="volume">Volume: </label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>

      <div className="recorder">
        <button onClick={startRecording} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop
        </button>
        <button onClick={playRecording}>Play</button>
        <button onClick={downloadRecording}>Download</button>
      </div>
    </div>
  );
}
