import { useState, useEffect } from 'react';
import { gesturePresets } from '../data/content.js';
import HandStage from './HandStage.jsx';
import { SpeakerIcon, LatencyIcon, InfoIcon } from './Icons.jsx';

export default function InteractiveDemo() {
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [filterGroup, setFilterGroup] = useState('ALL'); // 'ALL' | 'A-G' | 'H-N' | 'O-T' | 'U-Z'
  const [buffer, setBuffer] = useState('HELLO WORLD');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState('sandbox'); // 'sandbox' | 'telemetry'

  const presetPhrases = ['HELLO WORLD', 'THANK YOU', 'SIGN SPEAK', 'GOOD MORNING', 'NICE TO MEET YOU', 'EQUAL ACCESS'];

  const currentGesture = gesturePresets.find((g) => g.letter === selectedLetter) || gesturePresets[0];

  const filteredPresets = gesturePresets.filter((g) => {
    if (filterGroup === 'A-G') return g.letter >= 'A' && g.letter <= 'G';
    if (filterGroup === 'H-N') return g.letter >= 'H' && g.letter <= 'N';
    if (filterGroup === 'O-T') return g.letter >= 'O' && g.letter <= 'T';
    if (filterGroup === 'U-Z') return g.letter >= 'U' && g.letter <= 'Z';
    return true;
  });

  function appendLetter(char) {
    if (buffer.length < 32) {
      setBuffer((prev) => prev + char);
    }
  }

  function handleBackspace() {
    setBuffer((prev) => prev.slice(0, -1));
  }

  function handleSpace() {
    if (buffer.length > 0 && !buffer.endsWith(' ') && buffer.length < 32) {
      setBuffer((prev) => prev + ' ');
    }
  }

  function handleClear() {
    setBuffer('');
  }

  function handleSpeak() {
    if (!buffer.trim()) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(buffer);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div className="demo-sandbox-card">
      <div className="sandbox-header">
        <div className="sandbox-title-area">
          <div className="sandbox-top-pills">
            <span className="sandbox-badge">COMPLETE ASL ALPHABET (A–Z)</span>
            <span className="sandbox-live-pill">
              <span className="pulse-dot" /> LIVE SIMULATION
            </span>
          </div>
          <h3>Sign-to-Meet Audio Sandbox</h3>
          <p className="sandbox-desc">
            Explore the full 26-letter American Sign Language alphabet. Click any letter to observe real-time 3D skeletal landmark tracking, debounce into spoken words, and test meeting voice synthesis.
          </p>
        </div>
        <div className="sandbox-tab-group">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'sandbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('sandbox')}
          >
            Live Simulator
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
            onClick={() => setActiveTab('telemetry')}
          >
            Telemetry &amp; Vectors
          </button>
        </div>
      </div>

      <div className="sandbox-grid">
        {/* Left Column: Visual Hand Landmark Stage & Alphabet Grid */}
        <div className="sandbox-visual-col">
          <HandStage activeLetter={selectedLetter} onSelectLetter={setSelectedLetter} />

          <div className="gesture-selector-box">
            <div className="box-title-row">
              <div>
                <label className="box-title">ASL Alphabet Signs (A–Z)</label>
                <span className="box-sub">Select any letter to morph 3D skeleton &amp; append to speech</span>
              </div>

              {/* Alphabet Range Filter Tabs */}
              <div className="alphabet-filter-tabs">
                {['ALL', 'A-G', 'H-N', 'O-T', 'U-Z'].map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    className={`alpha-filter-btn ${filterGroup === grp ? 'active' : ''}`}
                    onClick={() => setFilterGroup(grp)}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            <div className="gesture-grid full-alphabet-grid">
              {filteredPresets.map((gesture) => (
                <button
                  key={gesture.letter}
                  type="button"
                  className={`gesture-btn ${selectedLetter === gesture.letter ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedLetter(gesture.letter);
                    appendLetter(gesture.letter);
                  }}
                  title={`${gesture.letter}: ${gesture.name}`}
                >
                  <span className="gesture-char">{gesture.letter}</span>
                  <div className="gesture-meta">
                    <strong>{gesture.name}</strong>
                    <span>{gesture.confidence}% match</span>
                  </div>
                  <span className="add-hint">+</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Google Meet Audio HUD & Buffer */}
        <div className="sandbox-hud-col">
          {activeTab === 'sandbox' ? (
            <>
              {/* Virtual Google Meet Call HUD */}
              <div className="meet-hud-panel">
                <div className="meet-hud-bar">
                  <div className="meet-indicator">
                    <span className="meet-dot" />
                    <strong>Google Meet Audio Stream</strong>
                  </div>
                  <span className={`meet-status-tag ${isSpeaking ? 'active' : ''}`}>
                    {isSpeaking ? (
                      <span className="status-live-spk"><SpeakerIcon size={14} /> TRANSMITTING TO CALL...</span>
                    ) : (
                      '● READY TO SPEAK'
                    )}
                  </span>
                </div>

                {/* Quick Presets Bar */}
                <div className="preset-phrases-bar">
                  <span className="preset-lbl">Quick Presets:</span>
                  <div className="preset-chips">
                    {presetPhrases.map((phrase) => (
                      <button
                        key={phrase}
                        type="button"
                        className="preset-chip"
                        onClick={() => setBuffer(phrase)}
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="word-buffer-display">
                  <span className="buffer-label">Spelled Word Buffer (Debounced Hysteresis Stream)</span>
                  <div className="buffer-output">
                    {buffer ? (
                      <span className="buffer-text">{buffer}</span>
                    ) : (
                      <span className="buffer-placeholder">Select letters or gestures to spell...</span>
                    )}
                    <span className="cursor-blink" />
                  </div>
                </div>

                <div className="buffer-actions">
                  <button
                    type="button"
                    className="btn btn-primary speak-btn"
                    onClick={handleSpeak}
                    disabled={!buffer.trim() || isSpeaking}
                  >
                    <span className="btn-icon">{isSpeaking ? <LatencyIcon size={16} /> : <SpeakerIcon size={16} />}</span>
                    <span>{isSpeaking ? 'Speaking into Call Audio...' : 'Speak into Google Meet Call'}</span>
                  </button>

                  <div className="secondary-buffer-btns">
                    <button type="button" className="btn mini-btn" onClick={handleSpace} title="Insert space">
                      Space
                    </button>
                    <button type="button" className="btn mini-btn" onClick={handleBackspace} title="Delete last letter">
                      Backspace
                    </button>
                    <button type="button" className="btn mini-btn" onClick={handleClear} title="Clear buffer">
                      Clear
                    </button>
                  </div>
                </div>

                {isSpeaking && (
                  <div className="audio-wave-box">
                    <span className="wave-lbl">WebRTC Virtual Microphone Injected Audio (Phonemes)</span>
                    <div className="wave-bars">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((n) => (
                        <span key={n} className="wave-bar" style={{ animationDelay: `${n * 0.05}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Real-Time Processing Specs Card */}
              <div className="specs-card">
                <div className="specs-row">
                  <div className="spec-item">
                    <span className="spec-label">Current Sign</span>
                    <span className="spec-val highlight-val">Letter {currentGesture.letter}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Latency</span>
                    <span className="spec-val">14.2 ms</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Inference Engine</span>
                    <span className="spec-val">On-Device ML</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Data Shipped</span>
                    <span className="spec-val success-val">0 KB (Private)</span>
                  </div>
                </div>
                <div className="gesture-desc-banner">
                  <span className="desc-icon"><InfoIcon size={14} /></span>
                  <p><strong>Active Joint Mechanics:</strong> {currentGesture.description}</p>
                </div>
              </div>
            </>
          ) : (
            /* Telemetry & Vector Mathematical Inspection */
            <div className="telemetry-panel">
              <div className="telemetry-header">
                <span className="telemetry-tag">NORMALIZATION VECTOR STREAM</span>
                <h4>63-Dimensional Normalized Coordinate Stream</h4>
                <p>Coordinates normalized to Wrist Node [0] (origin) and scaled relative to hand palm diagonal.</p>
              </div>

              <div className="code-block-viewer">
                <div className="code-block-head">
                  <span>local://landmarks_stream</span>
                  <span className="stream-pill">30 FPS Stream</span>
                </div>
                <pre className="code-pre">
{`{
  "frame_id": 9842,
  "predicted_class": "${currentGesture.letter}",
  "confidence": ${(currentGesture.confidence / 100).toFixed(4)},
  "landmarks_count": 21,
  "wrist_origin": [${currentGesture.nodes[0][0]}, ${currentGesture.nodes[0][1]}],
  "normalized_tensor": ${currentGesture.vectors},
  "debounced_token": "${currentGesture.letter}",
  "routing_target": "Google Meet WebRTC Audio"
}`}
                </pre>
              </div>

              <div className="probability-breakdown">
                <h5>Classification Probabilities</h5>
                <div className="prob-bars">
                  <div className="prob-item">
                    <span className="prob-name">Class &apos;{currentGesture.letter}&apos; (Target)</span>
                    <div className="prob-track">
                      <div className="prob-fill primary" style={{ width: `${currentGesture.confidence}%` }} />
                    </div>
                    <span className="prob-num">{currentGesture.confidence}%</span>
                  </div>
                  <div className="prob-item">
                    <span className="prob-name">Alternate Nearest Class</span>
                    <div className="prob-track">
                      <div className="prob-fill secondary" style={{ width: `${(100 - currentGesture.confidence) * 0.7}%` }} />
                    </div>
                    <span className="prob-num">{((100 - currentGesture.confidence) * 0.7).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
