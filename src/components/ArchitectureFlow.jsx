import { useState } from 'react';
import { pipeline } from '../data/content.js';

export default function ArchitectureFlow() {
  const [selectedStep, setSelectedStep] = useState(0);
  const activeData = pipeline[selectedStep];

  return (
    <div className="pipeline-interactive-section">
      <div className="pipeline-steps-nav">
        {pipeline.map((item, idx) => (
          <button
            key={item.step}
            type="button"
            className={`pipeline-nav-btn ${selectedStep === idx ? 'active' : ''}`}
            onClick={() => setSelectedStep(idx)}
          >
            <span className="step-num">{item.step}</span>
            <div className="step-btn-text">
              <strong>{item.title}</strong>
              <span>{item.summary}</span>
            </div>
            <span className="step-badge-tag">{item.badge}</span>
          </button>
        ))}
      </div>

      <div className="pipeline-detail-card">
        <div className="detail-header">
          <div className="detail-left">
            <span className="kicker-pill">STAGE {activeData.step} / 04</span>
            <h3>{activeData.title}</h3>
            <p className="detail-summary">{activeData.summary}</p>
          </div>
          <div className="detail-tag-box">
            <span className="tech-badge">{activeData.badge}</span>
          </div>
        </div>

        <p className="detail-body-text">{activeData.detail}</p>

        <div className="tensor-terminal">
          <div className="terminal-header">
            <span className="term-dot red" />
            <span className="term-dot yellow" />
            <span className="term-dot green" />
            <span className="term-title">Stream Data Payload · Stage {activeData.step}</span>
          </div>
          <div className="terminal-content">
            <code>{activeData.tensor}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
