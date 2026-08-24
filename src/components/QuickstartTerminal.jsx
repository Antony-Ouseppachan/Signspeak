import { useState } from 'react';
import { quickstartSteps } from '../data/content.js';
import { CopyIcon, CheckIcon } from './Icons.jsx';

export default function QuickstartTerminal() {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const step = quickstartSteps[activeStep];

  function copyCode() {
    navigator.clipboard.writeText(step.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="quickstart-box">
      <div className="quickstart-nav">
        {quickstartSteps.map((s, idx) => (
          <button
            key={s.step}
            type="button"
            className={`qs-step-btn ${activeStep === idx ? 'active' : ''}`}
            onClick={() => setActiveStep(idx)}
          >
            <span className="qs-num">{s.step}</span>
            <span className="qs-title">{s.title}</span>
          </button>
        ))}
      </div>

      <div className="qs-terminal-card">
        <div className="qs-terminal-top">
          <div className="term-dots">
            <span className="dot-red" />
            <span className="dot-yellow" />
            <span className="dot-green" />
          </div>
          <span className="terminal-title">bash · local-engine-setup</span>
          <button type="button" className="copy-btn" onClick={copyCode}>
            {copied ? (
              <>
                <CheckIcon size={13} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon size={13} />
                <span>Copy Command</span>
              </>
            )}
          </button>
        </div>

        <pre className="qs-code">
          <code>{step.command}</code>
        </pre>

        <div className="qs-tip-bar">
          <span className="tip-badge">ENGINEERING NOTE</span>
          <p>{step.tip}</p>
        </div>
      </div>
    </div>
  );
}
