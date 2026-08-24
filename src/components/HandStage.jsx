import { useState } from 'react';
import { gesturePresets } from '../data/content.js';

export default function HandStage({ activeLetter = 'A', onSelectLetter }) {
  const [hovered, setHovered] = useState(false);
  const currentGesture = gesturePresets.find((g) => g.letter === activeLetter) || gesturePresets[0];

  function handleMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 14;
    event.currentTarget.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${-y}deg)`;
  }

  function handleLeave(event) {
    event.currentTarget.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg)';
    setHovered(false);
  }

  const bones = [
    [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],       // Index
    [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
    [9, 13], [13, 14], [14, 15], [15, 16], // Ring
    [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
    [0, 17]                               // Palm base
  ];

  const nodes = currentGesture.nodes;

  return (
    <div className="hand-stage-container">
      <div
        className="hand-stage"
        onMouseMove={(e) => { setHovered(true); handleMove(e); }}
        onMouseLeave={handleLeave}
        aria-label={`Interactive ASL sign landmark visualization for letter ${currentGesture.letter}`}
      >
        <div className="stage-overlay-badge">
          <span className="live-dot" />
          <span className="mono">3D SKELETON TRACKING</span>
        </div>

        <svg viewBox="0 0 320 320" className="hand-svg">
          <defs>
            <linearGradient id="boneGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--blue)" />
              <stop offset="50%" stopColor="var(--rose)" />
              <stop offset="100%" stopColor="var(--maroon)" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Palm Fill Area */}
          <polygon
            points={`${nodes[0][0]},${nodes[0][1]} ${nodes[5][0]},${nodes[5][1]} ${nodes[9][0]},${nodes[9][1]} ${nodes[13][0]},${nodes[13][1]} ${nodes[17][0]},${nodes[17][1]}`}
            fill="rgba(194, 149, 145, 0.08)"
            stroke="none"
          />

          {/* Bone Skeletal Connections */}
          <g className="bones-group">
            {bones.map(([start, end], idx) => {
              const p1 = nodes[start];
              const p2 = nodes[end];
              if (!p1 || !p2) return null;
              return (
                <line
                  key={`bone-${idx}`}
                  x1={p1[0]}
                  y1={p1[1]}
                  x2={p2[0]}
                  y2={p2[1]}
                  className="bone"
                  stroke="url(#boneGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* 21 Landmark Nodes */}
          <g className="nodes-group">
            {nodes.map(([cx, cy], index) => (
              <g key={`node-${index}`}>
                <circle
                  className="node-halo"
                  cx={cx}
                  cy={cy}
                  r={index === 0 ? 8 : 6}
                  fill="rgba(112, 63, 55, 0.15)"
                />
                <circle
                  className="node pulse-node"
                  cx={cx}
                  cy={cy}
                  r={index === 0 ? 4.5 : index % 4 === 0 ? 3.8 : 2.8}
                  fill={index === 0 ? "var(--maroon)" : index % 4 === 0 ? "var(--rose)" : "var(--blue)"}
                />
              </g>
            ))}
          </g>
        </svg>

        <div className="scanline" />

        <div className="hand-hud">
          <div className="hud-metric">
            <span className="hud-label">ACTIVE SIGN</span>
            <strong className="hud-val highlight">ASL &apos;{currentGesture.letter}&apos;</strong>
          </div>
          <div className="hud-metric">
            <span className="hud-label">CONFIDENCE</span>
            <strong className="hud-val">{currentGesture.confidence}%</strong>
          </div>
          <div className="hud-metric">
            <span className="hud-label">POINTS</span>
            <strong className="hud-val">21 3D Nodes</strong>
          </div>
        </div>

        <div className="hand-caption">
          <span className="live"><i className="pulse-i" /> Real-Time Hand Landmarks</span>
          <span className="mono">On-Device ASL Classifier</span>
        </div>
      </div>

      {/* Quick Interactive Gesture Selector Bar */}
      {onSelectLetter && (
        <div className="gesture-mini-bar">
          <span className="mini-bar-lbl">Quick Signs:</span>
          <div className="mini-chips">
            {gesturePresets.map((g) => (
              <button
                key={g.letter}
                type="button"
                className={`mini-chip ${activeLetter === g.letter ? 'active' : ''}`}
                onClick={() => onSelectLetter(g.letter)}
                title={g.name}
              >
                <strong>{g.letter}</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
