import { useState } from 'react';
import { quickstartSteps } from '../data/content.js';
import { CopyIcon, CheckIcon, TerminalIcon } from './Icons.jsx';

export default function QuickstartTerminal() {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const step = quickstartSteps[activeStep];

  function copyCode() {
    navigator.clipboard.writeText(step.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadBatScript() {
    const batContent = `@echo off
title SignSpeak AI Detection Server
echo ========================================================
echo   SignSpeak AI Detection Engine Launcher
echo ========================================================
echo.
cd /d "%USERPROFILE%\\Downloads"
if not exist "Signspeak" (
    echo [*] Cloning SignSpeak extension repository...
    git clone -b extension --single-branch https://github.com/Antony-Ouseppachan/Signspeak.git
)
cd Signspeak
echo [*] Starting Python AI detection server...
python ai_detection_server.py
if errorlevel 1 (
    echo.
    echo [!] Make sure Python and dependencies are installed.
)
pause
`;
    const blob = new Blob([batContent], { type: 'application/bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'run_signspeak.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <span className="terminal-title">
            {activeStep === 0
              ? 'cmd.exe · local-engine-setup'
              : activeStep === 1
              ? 'chrome · extension-loader'
              : 'meet · live-session'}
          </span>
          {activeStep === 0 && (
            <div className="qs-terminal-actions">
              <button
                type="button"
                className="copy-btn bat-download-btn"
                onClick={downloadBatScript}
                title="Download double-clickable Windows CMD script"
              >
                <TerminalIcon size={14} />
                <span>Download .bat Launcher</span>
              </button>
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
          )}
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
