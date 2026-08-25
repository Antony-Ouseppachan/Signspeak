import { useState } from 'react';
import { quickstartSteps } from '../data/content.js';
import { CopyIcon, CheckIcon, TerminalIcon, AlertTriangleIcon, CloseIcon, ExternalLinkIcon } from './Icons.jsx';

export default function QuickstartTerminal() {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [overlayDisclaimer, setOverlayDisclaimer] = useState(null); // 'copy' | 'download' | null

  const step = quickstartSteps[activeStep];

  function copyCode() {
    navigator.clipboard.writeText(step.command);
    setCopied(true);
    setOverlayDisclaimer('copy');
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

    setOverlayDisclaimer('download');
  }

  return (
    <div className="quickstart-box">
      {/* 1. Permanent Always-On Screen Disclaimer Banner */}
      <div className="qs-disclaimer-always">
        <div className="qs-disclaimer-left">
          <span className="qs-disclaimer-icon">
            <AlertTriangleIcon size={18} />
          </span>
          <div className="qs-disclaimer-text">
            <strong>Prerequisites Required:</strong>
            <span>
              Please ensure <strong>Python 3.8+</strong> and <strong>Git</strong> are installed and added to your system PATH before running commands or the launcher script.
            </span>
          </div>
        </div>
        <div className="qs-disclaimer-links">
          <a
            href="https://www.python.org/downloads/"
            target="_blank"
            rel="noopener noreferrer"
            className="qs-pill-link"
          >
            <span>Python.org</span>
            <ExternalLinkIcon size={11} />
          </a>
          <a
            href="https://git-scm.com/downloads"
            target="_blank"
            rel="noopener noreferrer"
            className="qs-pill-link"
          >
            <span>Git-SCM</span>
            <ExternalLinkIcon size={11} />
          </a>
        </div>
      </div>

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

      {/* 2. Interactive Overlay Disclaimer Modal */}
      {overlayDisclaimer && (
        <div className="qs-overlay-backdrop" onClick={() => setOverlayDisclaimer(null)}>
          <div
            className="qs-overlay-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qs-modal-title"
          >
            <button
              type="button"
              className="qs-overlay-close-btn"
              onClick={() => setOverlayDisclaimer(null)}
              aria-label="Close disclaimer overlay"
            >
              <CloseIcon size={18} />
            </button>

            <div className="qs-overlay-header">
              <div className="qs-overlay-icon-wrap">
                <AlertTriangleIcon size={28} />
              </div>
              <div className="qs-overlay-status-pill">
                <CheckIcon size={12} />
                <span>
                  {overlayDisclaimer === 'copy'
                    ? 'Command Copied to Clipboard'
                    : 'run_signspeak.bat Downloaded'}
                </span>
              </div>
              <h3 id="qs-modal-title">System Requirements Disclaimer</h3>
              <p className="qs-overlay-subtitle">
                Before executing the script or commands in your terminal, please ensure your system has the following installed:
              </p>
            </div>

            <div className="qs-overlay-requirements">
              <div className="qs-req-card">
                <div className="qs-req-badge">01</div>
                <div className="qs-req-body">
                  <strong>Python 3.8+ Required</strong>
                  <p>
                    Required to execute <code>python ai_detection_server.py</code> and host the on-device MediaPipe landmark detector locally at 30 FPS.
                  </p>
                  <a
                    href="https://www.python.org/downloads/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="qs-req-link"
                  >
                    <span>Download Python (Official)</span>
                    <ExternalLinkIcon size={12} />
                  </a>
                </div>
              </div>

              <div className="qs-req-card">
                <div className="qs-req-badge">02</div>
                <div className="qs-req-body">
                  <strong>Git SCM Required</strong>
                  <p>
                    Required for <code>git clone -b extension</code> to download the Chrome extension files to your machine.
                  </p>
                  <a
                    href="https://git-scm.com/downloads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="qs-req-link"
                  >
                    <span>Download Git (Official)</span>
                    <ExternalLinkIcon size={12} />
                  </a>
                </div>
              </div>
            </div>

            <div className="qs-overlay-footer">
              <button
                type="button"
                className="btn btn-primary qs-overlay-ok-btn"
                onClick={() => setOverlayDisclaimer(null)}
              >
                I Understand &amp; Have Them Installed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
